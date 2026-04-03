import path from 'path';
import { expect, type Page } from '@playwright/test';

export async function loadFixtureDb(page: Page): Promise<void> {
    await page.getByRole('button', { name: /open settings/i }).click();
    const dbPath = path.resolve(process.cwd(), 'tests/fixtures/patrons.db');
    await page.locator('#db-file').setInputFiles(dbPath);
    await expect(page.locator('#db-status-message')).toContainText(/loaded/i);
}

export async function resetKoltStorage(page: Page): Promise<void> {
    await page.goto('/kolt.html');
    await page.evaluate(() => {
        localStorage.removeItem('kolt_entries');
        localStorage.removeItem('kolt_settings');
    });
    await page.reload();
}
