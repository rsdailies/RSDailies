import { expect, test } from '@playwright/test';

async function expectFirstColumnLabelLeftAligned(page) {
	return page
		.locator('.activity_table tbody tr[data-task-id] td.activity_name')
		.first()
		.evaluate((cell) => {
			const label = cell.querySelector('a, .activity_name_text');
			if (!(label instanceof HTMLElement)) {
				throw new Error('Expected tracker row label.');
			}

			const cellRect = cell.getBoundingClientRect();
			const labelRect = label.getBoundingClientRect();
			const styles = getComputedStyle(label);

			return {
				offsetLeft: labelRect.left - cellRect.left,
				justifyContent: styles.justifyContent,
				display: styles.display,
				textAlign: styles.textAlign,
			};
		});
}

function taskRow(page, taskId) {
	return page.locator(`tr[data-task-id="${taskId}"]`);
}

async function hoverRow(page, taskId) {
	await taskRow(page, taskId).hover();
}

async function openProfileMenu(page) {
	const panel = page.locator('#profile-control');
	if ((await panel.count()) === 0) {
		await page.getByRole('button', { name: /Profiles/i }).click();
	}
	await expect(panel).toBeVisible();
}

async function openSettingsMenu(page) {
	await page.getByRole('button', { name: /Settings/i }).click();
	await expect(page.locator('#settings-control')).toBeVisible();
}

async function openImportExport(page) {
	await page.getByRole('button', { name: /Import \/ Export/i }).click();
	await expect(page.locator('#token-modal')).toBeVisible();
}

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
	await expect(page.getByText('Herbs')).toBeVisible();
	await expect(page.getByText('Falador').first()).toBeVisible();
	await expect(page.getByRole('heading', { level: 1, name: 'Timers' })).toBeVisible();
});

test('osrs canonical tasks route renders the current osrs task, weekly, and timer sections', async ({ page }) => {
	await page.goto('/osrs/tasks');
	await expect(page.locator('#dashboard-root')).toBeVisible();
	await expect(page.locator('#osrsdaily-container')).toBeVisible();
	await expect(page.locator('#osrsweekly-container')).toBeVisible();
	await expect(page.locator('#osrsmonthly-container')).toBeVisible();
	await expect(page.locator('#osrstimers-container')).toBeVisible();
	await expect(page.locator('#rs3daily-container')).toHaveCount(0);
	await expect(page.getByRole('heading', { level: 1, name: 'Daily Tasks' })).toBeVisible();
	await expect(page.getByText('OSRS tracker is being built.')).toBeVisible();
});

test('topbar and modal controls work without legacy framework hooks', async ({ page }) => {
	await page.goto('/rs3/tasks');

	await openProfileMenu(page);
	await page.keyboard.press('Escape');
	await expect(page.locator('#profile-control')).toHaveCount(0);
	await expect(page.locator('#profile-button')).toBeFocused();

	await openSettingsMenu(page);
	await page.locator('main').click();
	await expect(page.locator('#settings-control')).toHaveCount(0);

	await openImportExport(page);
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

	await openSettingsMenu(page);
	await page.locator('#setting-density-mode').selectOption('comfortable');
	await page.locator('#save-settings-button').click();
	await expect(page.locator('html')).toHaveAttribute('data-density', 'comfortable');

	const comfortableHeight = await firstRow.evaluate((row) => row.getBoundingClientRect().height);
	expect(comfortableHeight).toBeGreaterThan(compactHeight);

	await page.reload();
	await expect(page.locator('html')).toHaveAttribute('data-density', 'comfortable');
});

test('speedy growth persists beyond a reload', async ({ page }) => {
	await page.goto('/rs3/timers');

	await openSettingsMenu(page);
	await page.locator('#speedy-growth').check();
	await page.locator('#save-settings-button').click();
	await page.reload();

	await openSettingsMenu(page);
	await expect(page.locator('#speedy-growth')).toBeChecked();
});

test('tracker pages share the same header and row action framework', async ({ page }) => {
	for (const route of ['/rs3/tasks', '/rs3/gathering', '/rs3/timers', '/osrs/tasks']) {
		await page.goto(route);
		await expect(page.locator('.section-panel-header').first()).toBeVisible();
		await expect(page.locator('.section-panel-reset-button').first()).toBeVisible();
		await expect(page.locator('.section-panel-toggle-button').first()).toBeVisible();
		await expect(page.locator('.activity_table .row-actions').first()).toBeVisible();
	}
});

test('canonical tracker pages keep first-column labels left aligned', async ({ page }) => {
	for (const route of ['/rs3/tasks', '/rs3/gathering', '/rs3/timers', '/osrs/tasks']) {
		await page.goto(route);
		const metrics = await expectFirstColumnLabelLeftAligned(page);
		expect(metrics.display).toBe('flex');
		expect(metrics.justifyContent).toBe('flex-start');
		expect(metrics.textAlign).toBe('start');
		expect(metrics.offsetLeft).toBeLessThan(40);
	}
});

test('overview reset menu renders above lower sections without clipping', async ({ page }) => {
	await page.goto('/rs3/tasks');

	const trigger = page.locator('#overview .section-panel-reset-button');
	await trigger.click();

	const menu = page.locator('.tracker-header-menu').last();
	await expect(menu).toBeVisible();

	const menuBox = await menu.boundingBox();
	const overviewBox = await page.locator('#overview-table').boundingBox();

	expect(menuBox).not.toBeNull();
	expect(overviewBox).not.toBeNull();

	expect(menuBox.x).toBeGreaterThanOrEqual(0);
	expect(menuBox.y).toBeGreaterThanOrEqual(0);
	expect(menuBox.x + menuBox.width).toBeLessThanOrEqual(page.viewportSize().width);
	expect(menuBox.y + menuBox.height).toBeGreaterThan(overviewBox.y + overviewBox.height);
});

test('profile lifecycle isolates tracker state across profiles', async ({ page }) => {
	await page.goto('/rs3/tasks');

	await openProfileMenu(page);
	await page.locator('#profile-form input').fill('alt-profile');
	await page.locator('#profile-form').getByRole('button').click();
	await expect(page.locator('#profile-name')).toHaveText('alt-profile');

	await taskRow(page, 'daily-challenge')
		.getByRole('button', { name: /Mark task complete/i })
		.click();
	await expect(taskRow(page, 'daily-challenge')).toHaveAttribute('data-completed', 'true');

	await openProfileMenu(page);
	await page.getByRole('button', { name: 'default' }).click();
	await expect(page.locator('#profile-name')).toHaveText('default');
	await expect(taskRow(page, 'daily-challenge')).toHaveAttribute('data-completed', 'false');

	await openProfileMenu(page);
	await page.getByRole('button', { name: 'alt-profile' }).click();
	await expect(page.locator('#profile-name')).toHaveText('alt-profile');
	await expect(taskRow(page, 'daily-challenge')).toHaveAttribute('data-completed', 'true');

	await openProfileMenu(page);
	await page.locator('.profile-row', { hasText: 'alt-profile' }).getByRole('button', { name: '×' }).click();
	await expect(page.locator('#profile-name')).toHaveText('default');
	await expect(page.getByRole('button', { name: 'alt-profile' })).toHaveCount(0);
});

test('import export round trip restores profile state', async ({ page }) => {
	await page.goto('/rs3/tasks');

	await taskRow(page, 'daily-challenge')
		.getByRole('button', { name: /Mark task complete/i })
		.click();
	await taskRow(page, 'daily-challenge')
		.getByRole('button', { name: /Pin to overview/i })
		.click();

	await openImportExport(page);
	await page.getByRole('button', { name: 'Generate Export' }).click();
	const token = await page.locator('#export-token').inputValue();
	expect(token.length).toBeGreaterThan(10);
	await page.locator('#token-modal .ds-modal-footer').getByRole('button', { name: 'Close' }).click();

	await openProfileMenu(page);
	await page.locator('#profile-form input').fill('transfer-profile');
	await page.locator('#profile-form').getByRole('button').click();
	await expect(page.locator('#profile-name')).toHaveText('transfer-profile');
	await expect(taskRow(page, 'daily-challenge')).toHaveAttribute('data-completed', 'false');

	await openImportExport(page);
	await page.locator('#import-token').fill(token);
	await expect(page.getByText('Preview:')).toBeVisible();
	await page.getByRole('button', { name: 'Confirm Import' }).click();
	await page.reload();

	await expect(page.locator('#profile-name')).toHaveText('default');
	await expect(page.locator('#rs3daily-table tr[data-task-id="daily-challenge"]')).toHaveAttribute(
		'data-completed',
		'true',
	);
	await expect(page.locator('#overview-table tr[data-task-id="daily-challenge"]')).toBeVisible();
});

test('pinned and hidden row state survives a reload', async ({ page }) => {
	await page.goto('/rs3/tasks');

	await hoverRow(page, 'daily-challenge');
	await taskRow(page, 'daily-challenge')
		.getByRole('button', { name: /Pin to overview/i })
		.click();
	await hoverRow(page, 'vis-wax');
	await taskRow(page, 'vis-wax')
		.getByRole('button', { name: /Hide task/i })
		.click();

	await expect(page.locator('#overview-table tr[data-task-id="daily-challenge"]')).toBeVisible();
	await expect(taskRow(page, 'vis-wax')).toHaveCount(0);

	await page.reload();

	await expect(page.locator('#overview-table tr[data-task-id="daily-challenge"]')).toBeVisible();
	await expect(taskRow(page, 'vis-wax')).toHaveCount(0);
});

test('disabled server sync is surfaced in the UI and API', async ({ page, request }) => {
	await page.goto('/rs3/tasks');

	await openImportExport(page);
	await expect(
		page.getByText('Server backup is disabled for this build. Use Import / Export to move or back up data.'),
	).toBeVisible();

	const profileResponse = await request.get('/api/profile?profileName=preview-smoke');
	expect(profileResponse.status()).toBe(503);
	const profilePayload = await profileResponse.json();
	expect(profilePayload.success).toBeFalsy();
	expect(profilePayload.message).toContain('disabled');

	const penguinResponse = await request.get('/api/penguins');
	expect(penguinResponse.status()).not.toBe(404);
	const penguinPayload = await penguinResponse.json();
	expect(
		Boolean(penguinPayload?.Activepenguin?.length) || Array.isArray(penguinPayload?.failures) || penguinPayload?.error,
	).toBeTruthy();
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
