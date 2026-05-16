import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const canonicalRoutes = ['/rs3/tasks', '/rs3/gathering', '/rs3/timers', '/osrs/tasks'];

test('canonical routes have no critical axe violations', async ({ page }) => {
	for (const route of canonicalRoutes) {
		await page.goto(route);
		const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
		const criticalViolations = accessibilityScanResults.violations.filter((violation) => violation.impact === 'critical');
		expect(criticalViolations, `Critical accessibility violations found on ${route}`).toEqual([]);
		await expect(page.locator('h1')).toHaveCount(1);
	}
});

test('import export dialog is labeled and has no critical axe violations', async ({ page }) => {
	await page.goto('/rs3/tasks');
	await page.getByRole('button', { name: /Import \/ Export/i }).click();
	await expect(page.locator('#token-modal [role="dialog"]')).toHaveAttribute('aria-labelledby', 'token-modal-title');

	const accessibilityScanResults = await new AxeBuilder({ page }).include('#token-modal').analyze();
	const criticalViolations = accessibilityScanResults.violations.filter((violation) => violation.impact === 'critical');
	expect(criticalViolations).toEqual([]);
});
