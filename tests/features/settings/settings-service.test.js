import test from 'node:test';
import assert from 'node:assert/strict';

import { normalizeSettings } from '../../../src/lib/features/settings/settings-service.ts';

test('settings normalize hides completed tasks by default', () => {
	const settings = normalizeSettings({});

	assert.equal(settings.showCompletedTasks, false);
	assert.equal(settings.densityMode, 'compact');
	assert.equal(settings.herbTicks, 4);
	assert.equal(settings.growthOffsetMinutes, 0);
});

test('settings normalize applies speedy growth and webhook cleanup', () => {
	const settings = normalizeSettings({
		herbTicks: 3,
		webhookUrl: ' https://discord.test/webhook ',
		webhookUserId: 'user-1234',
	});

	assert.equal(settings.herbTicks, 3);
	assert.equal(settings.growthOffsetMinutes, 20);
	assert.equal(settings.webhookUrl, 'https://discord.test/webhook');
	assert.equal(settings.webhookUserId, '1234');
});

test('settings normalize preserves comfortable density when requested', () => {
	const settings = normalizeSettings({
		densityMode: 'comfortable',
	});

	assert.equal(settings.densityMode, 'comfortable');
});
