import { test, expect } from '@playwright/test';
import { loadFixtureDb } from './helpers';

test.beforeEach(async ({ page }) => {
  await page.goto('/kolt.html');
});

test('loads basic UI', async ({ page }) => {
  await expect(page.getByRole('heading', { name: /koha offline library tool/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /download data/i })).toBeVisible();
});

test('check-in adds a return row', async ({ page }) => {
  const checkin = page.locator('#checkin-barcode');
  await checkin.fill('ITEM-123');
  await checkin.press('Enter'); // triggers change on blur/enter in most browsers
  await checkin.blur();

  const table = page.locator('#stage-table tbody');
  await expect(table).toContainText('return');
  await expect(table).toContainText('ITEM-123');
});

test('check-out disabled until patron card entered (no DB case)', async ({ page }) => {
  const checkoutBarcode = page.locator('#checkout-barcode');
  await expect(checkoutBarcode).toBeDisabled();

  await page.locator('#patron-cardnumber').fill('PATRON-1');
  await page.locator('#patron-cardnumber').blur();

  await expect(checkoutBarcode).toBeEnabled();
});

test('check-out adds an issue row', async ({ page }) => {
  await page.locator('#patron-cardnumber').fill('PATRON-1');
  await page.locator('#patron-cardnumber').blur();

  const checkoutBarcode = page.locator('#checkout-barcode');
  await checkoutBarcode.fill('ITEM-999');
  await checkoutBarcode.press('Enter');
  await checkoutBarcode.blur();

  const table = page.locator('#stage-table tbody');
  await expect(table).toContainText('issue');
  await expect(table).toContainText('PATRON-1');
  await expect(table).toContainText('ITEM-999');
});

test('undo/redo works', async ({ page }) => {
  const checkin = page.locator('#checkin-barcode');

  await checkin.fill('A1');
  await checkin.press('Enter');
  await checkin.blur();

  await checkin.fill('A2');
  await checkin.press('Enter');
  await checkin.blur();

  const rows = page.locator('#stage-table tbody tr');
  const table = page.locator('#stage-table tbody');

  await expect(rows).toHaveCount(2);
  await expect(table).toContainText('A1');
  await expect(table).toContainText('A2');

  await page.locator('#undo-button').click();
  await expect(rows).toHaveCount(1);
  await expect(table).toContainText('A1');
  await expect(table).not.toContainText('A2');

  await page.locator('#redo-button').click();
  await expect(rows).toHaveCount(2);
  await expect(table).toContainText('A1');
  await expect(table).toContainText('A2');
});

test('raw data view toggles and shows header', async ({ page }) => {
  await page.locator('#toggle-stage-button').click();
  await expect(page.locator('#stage-file')).toBeVisible();
  await expect(page.locator('#stage-file div')).toContainText('Version=1.0');
});

test('partial card with multiple matches keeps checkout disabled', async ({ page }) => {
  await page.goto('/kolt.html');
  await loadFixtureDb(page);
  await page.locator('#partial-patron-cardnumber-search').check();
  await page.keyboard.press('Escape'); // close settings

  await page.locator('#patron-cardnumber').focus();
  await page.locator('#patron-cardnumber').fill('123');
  await page.locator('#patron-cardnumber').blur();

  await expect(page.locator('#patron-name')).toBeVisible();
  await expect(page.locator('#patron-name')).toContainText(/found 2 patrons/i);
  await expect(page.locator('#checkout-barcode')).toBeDisabled();
});

test('partial card with unique match tab-completes and enables checkout', async ({ page }) => {
  await page.goto('/kolt.html');
  await loadFixtureDb(page);

  await page.locator('#partial-patron-cardnumber-search').check();

  const patronCard = page.locator('#patron-cardnumber');
  await patronCard.fill('777');
  await expect(page.locator('#patron-name')).toBeVisible();
  await patronCard.press('Tab');

  await expect(patronCard).toHaveValue('77777');
  await expect(page.locator('#patron-name')).toContainText(/brown, amy/i);
  await expect(page.locator('#checkout-barcode')).toBeEnabled();
});