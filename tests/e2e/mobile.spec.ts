import { test, expect, devices } from '@playwright/test';
import { loadFixtureDb } from './helpers';

test.use({ ...devices['iPhone 13'] });

test('mobile: patron panel is below koha panel and clear-results stays above footer', async ({ page }) => {
  await page.goto('/kolt.html');
  await loadFixtureDb(page);
  await page.keyboard.press('Escape'); // close settings

  const kohaPanel = page.locator('#koha-panel');
  const patronPanel = page.locator('#patron-panel');
  const footer = page.locator('footer');

  await expect(kohaPanel).toBeVisible();
  await expect(patronPanel).toBeVisible();

  const kohaBox = await kohaPanel.boundingBox();
  const patronBox = await patronPanel.boundingBox();

  expect(kohaBox).not.toBeNull();
  expect(patronBox).not.toBeNull();
  if (!kohaBox || !patronBox) return;

  // In mobile stacked layout, patron panel should start below koha panel.
  expect(patronBox.y).toBeGreaterThanOrEqual(kohaBox.y + kohaBox.height - 1);

  // Run a broad surname search to get many results if fixture has them.
  const surnameInput = page.locator('#patron-search-surname');
  await surnameInput.fill('s');
  await page.locator('#run-patron-query-button').click();

  const resultRows = page.locator('#query-result-table tbody tr');
  await expect(resultRows.first()).toBeVisible();

  expect(await resultRows.count()).toBeGreaterThanOrEqual(3);

  const clearButton = page.locator('#clear-results-button');
  await clearButton.scrollIntoViewIfNeeded();
  await expect(clearButton).toBeVisible();
  await clearButton.click({ trial: true });

  const clearBox = await clearButton.boundingBox();
  const footerBox = await footer.boundingBox();

  expect(clearBox).not.toBeNull();
  expect(footerBox).not.toBeNull();
  if (!clearBox || !footerBox) return;

  // Button should be above footer; no overlap.
  expect(clearBox.y + clearBox.height).toBeLessThanOrEqual(footerBox.y);
});