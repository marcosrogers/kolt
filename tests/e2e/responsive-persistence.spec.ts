import { expect, test } from '@playwright/test';
import { loadFixtureDb, resetKoltStorage } from './helpers';

test.beforeEach(async ({ page }) => {
    await resetKoltStorage(page);
});

test('responsive: labels/inputs reflow for both panels in narrow layout', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 900 });
    await loadFixtureDb(page);
    await page.keyboard.press('Escape');

    const selectors = [
        { label: '#koha-panel label[for="checkin-barcode"]', input: '#checkin-barcode' },
        { label: '#koha-panel label[for="patron-cardnumber"]', input: '#patron-cardnumber' },
        { label: '#patron-panel label[for="patron-search-cardnumber"]', input: '#patron-search-cardnumber' },
    ];

    for (const { label, input } of selectors) {
        const labelLoc = page.locator(label);
        const inputLoc = page.locator(input);

        await expect(labelLoc).toBeVisible();
        await expect(inputLoc).toBeVisible();

        const textAlign = await labelLoc.evaluate((el) => getComputedStyle(el).textAlign);
        expect(textAlign).toBe('left');

        const afterContent = await labelLoc.evaluate(
            (el) => getComputedStyle(el, '::after').content,
        );
        expect(afterContent).not.toContain(':');

        const labelBox = await labelLoc.boundingBox();
        const inputBox = await inputLoc.boundingBox();
        expect(labelBox).not.toBeNull();
        expect(inputBox).not.toBeNull();
        if (!labelBox || !inputBox) {
            return;
        }

        expect(inputBox.y).toBeGreaterThan(labelBox.y + 2);
    }
});

test('responsive: undo/redo button group moves to second line when koha panel is constrained', async ({ page }) => {
    await page.setViewportSize({ width: 900, height: 800 });
    await page.goto('/kolt.html');

    await page.evaluate(() => {
        const panel = document.getElementById('koha-panel');
        if (!panel) {
            return;
        }
        panel.style.flexBasis = '360px';
        panel.style.width = '360px';
    });

    const spanStyles = await page.locator('#koha-panel h2 span').last().evaluate((el) => {
        const styles = getComputedStyle(el);
        return {
            flexBasis: styles.flexBasis,
            display: styles.display,
        };
    });

    expect(spanStyles.flexBasis).toBe('100%');
    expect(spanStyles.display).toBe('flex');

    const heading = page.locator('#koha-panel h2', { hasText: 'Pending Circulations' });
    const undo = page.locator('#undo-button');

    const headingBox = await heading.boundingBox();
    const undoBox = await undo.boundingBox();
    expect(headingBox).not.toBeNull();
    expect(undoBox).not.toBeNull();
    if (!headingBox || !undoBox) {
        return;
    }

    expect(undoBox.y).toBeGreaterThan(headingBox.y + 10);

    await page.evaluate(() => {
        const panel = document.getElementById('koha-panel');
        if (!panel) {
            return;
        }
        panel.style.flexBasis = '520px';
        panel.style.width = '520px';
    });

    const wideFlexBasis = await page.locator('#koha-panel h2 span').last().evaluate((el) => {
        return getComputedStyle(el).flexBasis;
    });
    expect(wideFlexBasis).not.toBe('100%');
});

test('persistence: settings are saved across refreshes', async ({ page }) => {
    await page.goto('/kolt.html');

    await page.getByRole('button', { name: /open settings/i }).click();
    const partialSearch = page.locator('#partial-patron-cardnumber-search');

    await expect(partialSearch).not.toBeChecked();
    await partialSearch.check();
    await expect(partialSearch).toBeChecked();

    await page.reload();
    await page.getByRole('button', { name: /open settings/i }).click();
    await expect(page.locator('#partial-patron-cardnumber-search')).toBeChecked();
});

test('persistence: pending circulations are saved across refreshes', async ({ page }) => {
    await page.goto('/kolt.html');

    const checkin = page.locator('#checkin-barcode');
    await checkin.fill('RET-100');
    await checkin.press('Enter');
    await checkin.blur();

    await page.locator('#patron-cardnumber').fill('PATRON-9');
    await page.locator('#patron-cardnumber').blur();

    const checkout = page.locator('#checkout-barcode');
    await expect(checkout).toBeEnabled();
    await checkout.fill('ISS-200');
    await checkout.press('Enter');
    await checkout.blur();

    const table = page.locator('#stage-table tbody');
    await expect(table).toContainText('return');
    await expect(table).toContainText('RET-100');
    await expect(table).toContainText('issue');
    await expect(table).toContainText('PATRON-9');
    await expect(table).toContainText('ISS-200');

    await page.reload();

    const reloadedTable = page.locator('#stage-table tbody');
    await expect(reloadedTable).toContainText('return');
    await expect(reloadedTable).toContainText('RET-100');
    await expect(reloadedTable).toContainText('issue');
    await expect(reloadedTable).toContainText('PATRON-9');
    await expect(reloadedTable).toContainText('ISS-200');
});
