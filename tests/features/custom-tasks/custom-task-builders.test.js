import assert from 'node:assert/strict';
import test from 'node:test';

import { buildCustomTask, isValidOptionalUrl } from '../../../src/features/custom-tasks/builders.ts';

test('buildCustomTask defaults invalid reset values to daily', () => {
	const task = buildCustomTask({
		rawName: 'Test Task',
		rawNote: '',
		rawWiki: '',
		rawReset: 'bad-reset',
		rawAlertDaysBeforeReset: '2',
		rawTimerMinutes: '60',
	});

	assert.equal(task.reset, 'daily');
	assert.equal(task.alertDaysBeforeReset, 2);
});

test('buildCustomTask timer tasks normalize cooldown data into the note', () => {
	const task = buildCustomTask({
		rawName: 'Farm Run',
		rawNote: 'Check patches',
		rawWiki: '',
		rawReset: 'timer',
		rawAlertDaysBeforeReset: '9',
		rawTimerMinutes: '45',
	});

	assert.equal(task.reset, 'timer');
	assert.equal(task.cooldownMinutes, 45);
	assert.equal(task.alertDaysBeforeReset, 0);
	assert.match(task.note || '', /Repeating timer: 45m/);
});

test('isValidOptionalUrl accepts blank values and rejects non-http protocols', () => {
	assert.equal(isValidOptionalUrl(''), true);
	assert.equal(isValidOptionalUrl('https://runescape.wiki'), true);
	assert.equal(isValidOptionalUrl('ftp://example.com'), false);
});
