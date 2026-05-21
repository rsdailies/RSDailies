import assert from 'node:assert/strict';
import test from 'node:test';

import { TRACKER_PAGES } from '../../../src/entities/task/page-definitions.ts';
import { TRACKER_SECTIONS } from '../../../src/entities/task/section-definitions.ts';
import {
	getTrackerPage,
	getTrackerSectionsForPage,
	normalizeTrackerView,
} from '../../../src/entities/task/tracker-content.ts';
import { mapPinnedTasks } from '../../../src/features/tracker/services/pins-manager.ts';
import { resolveWikiHref } from '../../../src/shared/utils/wiki.ts';

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

test('osrs task page retains a monthly section when monthly view is advertised', () => {
	const page = getTrackerPage('osrs', 'osrs-tasks', TRACKER_PAGES);

	assert.ok(page);
	assert.ok(page.availableViews.some((view) => view.id === 'monthly'));
	assert.ok(page.sections.includes('osrs-monthly'));
});

test('pinned timer rows use the same task id format as the tracker timer renderer', () => {
	const pinnedTasks = mapPinnedTasks(
		TRACKER_SECTIONS.map((data) => ({ data })),
		{ 'timers::timers::herb-falador': true },
	);

	assert.equal(pinnedTasks.length, 1);
	assert.equal(pinnedTasks[0].id, 'timers::herb-falador');
	assert.equal(pinnedTasks[0].sectionKey, 'timers');
});

test('wiki href resolution supports both slugs and full URLs', () => {
	assert.equal(resolveWikiHref('Vis_wax'), 'https://runescape.wiki/w/Vis_wax');
	assert.equal(resolveWikiHref('https://runescape.wiki/w/Vis_wax'), 'https://runescape.wiki/w/Vis_wax');
});
