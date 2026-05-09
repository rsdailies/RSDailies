import assert from 'node:assert/strict';

import { TRACKER_PAGES } from '../../src/lib/domain/static-content.ts';

const expectedRoutes = [
	'/rs3/overview',
	'/rs3/tasks',
	'/rs3/gathering',
	'/rs3/timers',
	'/osrs/overview',
	'/osrs/tasks',
];

const actualRoutes = TRACKER_PAGES.map((page) => page.route).sort();

assert.deepEqual(actualRoutes, [...expectedRoutes].sort(), 'Canonical routes do not match the implementation contract.');

for (const page of TRACKER_PAGES) {
	if (page.id.endsWith('tasks')) {
		assert.deepEqual(
			page.availableViews.map((view) => view.id),
			['all', 'daily', 'weekly', 'monthly'],
			`${page.id} must expose consolidated task views.`
		);
	}

	if (page.id === 'rs3-gathering') {
		assert.deepEqual(
			page.availableViews.map((view) => view.id),
			['daily', 'weekly'],
			'rs3-gathering must expose daily and weekly views.'
		);
	}
}

console.log(`Route audit passed for ${actualRoutes.length} canonical routes.`);
