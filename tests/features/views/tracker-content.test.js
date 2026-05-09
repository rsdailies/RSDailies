import test from 'node:test';
import assert from 'node:assert/strict';

import { TRACKER_PAGES, TRACKER_SECTIONS } from '../../../src/lib/domain/static-content.ts';
import { getTrackerPage, getTrackerSectionsForPage, normalizeTrackerView } from '../../../src/lib/domain/tracker-content.ts';

test('tracker page lookup resolves canonical pages', () => {
	const page = getTrackerPage('rs3', 'rs3-tasks', TRACKER_PAGES);

	assert.ok(page);
	assert.equal(page.route, '/rs3/tasks');
});

test('task views normalize invalid values to the first supported view', () => {
	const page = getTrackerPage('rs3', 'rs3-tasks', TRACKER_PAGES);

	assert.equal(normalizeTrackerView(page, 'bad-value'), 'all');
	assert.equal(normalizeTrackerView(page, 'weekly'), 'weekly');
});

test('gathering daily view filters weekly tasks out of the section items', () => {
	const [section] = getTrackerSectionsForPage('rs3', 'rs3-gathering', 'daily', TRACKER_PAGES, TRACKER_SECTIONS);

	assert.ok(section);
	assert.ok(section.items.length > 0);
	assert.ok(section.items.every((task) => task.reset === 'daily'));
});
