import assert from 'node:assert/strict';

import { TRACKER_PAGES } from '../../src/entities/task/page-definitions.ts';
import { TRACKER_SECTIONS } from '../../src/entities/task/section-definitions.ts';

function flattenItems(items = []) {
	return items.flatMap((item) => [
		item.id,
		...(Array.isArray(item.children) ? item.children.map((child) => child.id) : []),
		...(Array.isArray(item.childRows) ? item.childRows.map((child) => child.id) : []),
	]);
}

assert.equal(TRACKER_PAGES.length, 4, 'Expected 4 canonical pages.');
assert.equal(TRACKER_SECTIONS.length, 9, 'Expected 9 canonical sections.');

for (const page of TRACKER_PAGES) {
	assert.ok(page.route.startsWith('/'), `Page ${page.id} must have an absolute route.`);
	assert.ok(Array.isArray(page.sections), `Page ${page.id} must define sections.`);
	page.sections.forEach((sectionId) => {
		assert.ok(
			TRACKER_SECTIONS.some((section) => section.id === sectionId),
			`Page ${page.id} references missing section ${sectionId}.`,
		);
	});

	if (page.availableViews.some((view) => view.id === 'monthly')) {
		const monthlySections = page.sections.filter((sectionId) =>
			TRACKER_SECTIONS.some(
				(section) => section.id === sectionId && String(section.resetFrequency || '').toLowerCase() === 'monthly',
			),
		);
		assert.ok(monthlySections.length > 0, `Page ${page.id} exposes a monthly view but no monthly section.`);
	}
}

for (const section of TRACKER_SECTIONS) {
	assert.ok(section.id, 'Section must have an id.');
	assert.ok(section.label, `Section ${section.id} must have a label.`);

	if (section.renderVariant === 'timer-groups') {
		assert.ok(
			Array.isArray(section.groups) && section.groups.length > 0,
			`Timer section ${section.id} must define groups.`,
		);
		continue;
	}

	const taskIds = flattenItems(section.items || []);
	assert.equal(taskIds.length, new Set(taskIds).size, `Section ${section.id} has duplicate task ids.`);
}

console.log(`Content audit passed for ${TRACKER_PAGES.length} pages and ${TRACKER_SECTIONS.length} sections.`);
