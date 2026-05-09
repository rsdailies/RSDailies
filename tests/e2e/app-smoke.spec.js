import { test, expect } from '@playwright/test';

test('landing page routes into rs3 canonical tasks view', async ({ page }) => {
	await page.goto('/');

	await expect(page.getByRole('heading', { name: 'Select Your Game' })).toBeVisible();
	await expect(page.getByRole('button', { name: 'RuneScape 3' })).toBeVisible();
	await expect(page.getByRole('button', { name: 'OSRS' })).toBeVisible();

	await page.getByRole('button', { name: 'RuneScape 3' }).click();

	await expect(page).toHaveURL(/\/rs3\/tasks\?view=all$/);
	await expect(page.locator('#dashboard-container')).toBeVisible();
	await expect(page.locator('#rs3daily-container')).toBeVisible();
	await expect(page.locator('#rs3weekly-container')).toBeVisible();
	await expect(page.locator('#rs3monthly-container')).toBeVisible();
	await expect(page.locator('#views-button-panel')).toBeVisible();
	await expect(page.locator('#profile-button')).toBeVisible();
	await expect(page.locator('#token-button')).toBeVisible();
});

test('rs3 canonical routes render tracker sections on direct load', async ({ page }) => {
	await page.goto('/rs3/gathering');

	await expect(page.locator('#dashboard-container')).toBeVisible();
	await expect(page.locator('#gathering-container')).toBeVisible();
	await expect(page.getByRole('link', { name: 'Tasks' })).toBeVisible();
	await expect(page.getByRole('link', { name: 'Gathering' })).toBeVisible();
	await page.getByRole('button', { name: 'Timers' }).click();
	await expect(page.getByRole('link', { name: 'Farming' })).toBeVisible();

	await page.goto('/rs3/timers');
	await expect(page.locator('#timers-container')).toBeVisible();

	await page.goto('/rs3/overview');
	await expect(page.locator('#overview-mount')).toBeVisible();
	await expect(page.locator('#overview-content')).toBeVisible();
});

test('osrs canonical tasks routes render osrs sections only', async ({ page }) => {
	await page.goto('/osrs/tasks?view=all');

	await expect(page.locator('#dashboard-container')).toBeVisible();
	await expect(page.locator('#osrsdaily-container')).toBeVisible();
	await expect(page.locator('#osrsweekly-container')).toBeVisible();
	await expect(page.locator('#osrsmonthly-container')).toBeVisible();
	await expect(page.locator('#rs3daily-container')).not.toBeVisible();

	await page.goto('/osrs/overview');
	await expect(page.locator('#overview-mount')).toBeVisible();
	await expect(page.locator('#overview-content')).toBeVisible();
});
