import { test, expect } from '@playwright/test';

test('root renders game selection landing page and opens rs3 canonical tasks view', async ({ page }) => {
	await page.goto('/');
	await expect(page.locator('#game-selection-title')).toBeVisible();
	await page.getByRole('link', { name: 'Open RS3 Tracker' }).click();
	await expect(page).toHaveURL(/\/rs3\/tasks$/);
	await expect(page.locator('#dashboard-root')).toBeVisible();
	await expect(page.locator('#rs3daily-container')).toBeVisible();
	await expect(page.locator('#rs3weekly-container')).toBeVisible();
	await expect(page.locator('#rs3monthly-container')).toBeVisible();
	await expect(page.locator('#token-button')).toBeVisible();
});

test('rs3 canonical routes render tracker sections on direct load', async ({ page }) => {
	await page.goto('/rs3/gathering');
	await expect(page.locator('#dashboard-root')).toBeVisible();
	await expect(page.locator('#gathering-container')).toBeVisible();
	await expect(page.locator('#main-nav').getByRole('link', { name: 'Tasks' })).toBeVisible();
	await expect(page.locator('#main-nav').getByRole('link', { name: 'Gathering' })).toBeVisible();
	await expect(page.locator('#main-nav').getByRole('link', { name: 'Timers' })).toBeVisible();

	await page.goto('/rs3/timers');
	await expect(page.locator('#timers-container')).toBeVisible();
	await expect(page.getByText('Regular Trees')).toBeVisible();
	await expect(page.getByText('Gnome Stronghold').first()).toBeVisible();
});

test('osrs canonical tasks route renders empty osrs section shells only', async ({ page }) => {
	await page.goto('/osrs/tasks');
	await expect(page.locator('#dashboard-root')).toBeVisible();
	await expect(page.locator('#osrsdaily-container')).toBeVisible();
	await expect(page.locator('#osrsweekly-container')).toBeVisible();
	await expect(page.locator('#osrsmonthly-container')).toBeVisible();
	await expect(page.locator('#rs3daily-container')).toHaveCount(0);
});
