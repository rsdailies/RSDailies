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
	await expect(page.getByRole('heading', { level: 1, name: 'Gathering' })).toBeVisible();

	await page.goto('/rs3/timers');
	await expect(page.locator('#timers-container')).toBeVisible();
	await expect(page.getByText('Regular Trees')).toBeVisible();
	await expect(page.getByText('Gnome Stronghold').first()).toBeVisible();
	await expect(page.getByRole('heading', { level: 1, name: 'Timers' })).toBeVisible();
});

test('osrs canonical tasks route renders empty osrs section shells only', async ({ page }) => {
	await page.goto('/osrs/tasks');
	await expect(page.locator('#dashboard-root')).toBeVisible();
	await expect(page.locator('#osrsdaily-container')).toBeVisible();
	await expect(page.locator('#osrsweekly-container')).toBeVisible();
	await expect(page.locator('#osrsmonthly-container')).toBeVisible();
	await expect(page.locator('#rs3daily-container')).toHaveCount(0);
	await expect(page.getByRole('heading', { level: 1, name: 'Daily Tasks' })).toBeVisible();
	await expect(page.getByText('OSRS tracker is being built.')).toBeVisible();
});

test('topbar and modal controls work without legacy framework hooks', async ({ page }) => {
	await page.goto('/rs3/tasks');

	await page.getByRole('button', { name: /Profiles/i }).click();
	await expect(page.locator('#profile-control')).toBeVisible();
	await page.keyboard.press('Escape');
	await expect(page.locator('#profile-control')).toHaveCount(0);
	await expect(page.locator('#profile-button')).toBeFocused();

	await page.getByRole('button', { name: /Settings/i }).click();
	await expect(page.locator('#settings-control')).toBeVisible();
	await page.locator('main').click();
	await expect(page.locator('#settings-control')).toHaveCount(0);

	await page.getByRole('button', { name: /Import \/ Export/i }).click();
	await expect(page.locator('#token-modal')).toBeVisible();
	await page.keyboard.press('Escape');
	await expect(page.locator('#token-modal')).toHaveCount(0);
	await expect(page.locator('#token-button')).toBeFocused();
});

test('mobile topbar toggle opens and closes tracker navigation', async ({ page }) => {
	await page.setViewportSize({ width: 640, height: 900 });
	await page.goto('/rs3/tasks');

	const toggle = page.getByRole('button', { name: 'Toggle navigation' });
	await toggle.click();
	await expect(page.locator('#main-nav-panel')).toHaveClass(/is-open/);
	await expect(toggle).toHaveAttribute('aria-expanded', 'true');

	await page.keyboard.press('Escape');
	await expect(toggle).toHaveAttribute('aria-expanded', 'false');
	await expect(toggle).toBeFocused();
});

test('density mode persists and changes tracker row spacing', async ({ page }) => {
	await page.goto('/rs3/tasks');

	const firstRow = page.locator('#rs3daily-table tbody tr').first();
	const compactHeight = await firstRow.evaluate((row) => row.getBoundingClientRect().height);

	await page.getByRole('button', { name: /Settings/i }).click();
	await page.locator('#setting-density-mode').selectOption('comfortable');
	await page.locator('#save-settings-button').click();
	await expect(page.locator('html')).toHaveAttribute('data-density', 'comfortable');

	const comfortableHeight = await firstRow.evaluate((row) => row.getBoundingClientRect().height);
	expect(comfortableHeight).toBeGreaterThan(compactHeight);

	await page.reload();
	await expect(page.locator('html')).toHaveAttribute('data-density', 'comfortable');
});

test('canonical routes stay free of console errors', async ({ page }) => {
	const errors = [];
	page.on('console', (message) => {
		if (message.type() === 'error') errors.push(message.text());
	});

	for (const route of ['/rs3/tasks', '/rs3/gathering', '/rs3/timers', '/osrs/tasks']) {
		await page.goto(route);
	}

	expect(errors).toEqual([]);
});
