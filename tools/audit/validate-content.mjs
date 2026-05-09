import assert from 'node:assert/strict';

import { TRACKER_PAGES, TRACKER_SECTIONS } from '../../src/lib/domain/static-content.ts';

function flattenItems(items = []) {
	return items.flatMap((item) => [
		item.id,
		...(Array.isArray(item.children) ? item.children.map((child) => child.id) : []),
		...(Array.isArray(item.childRows) ? item.childRows.map((child) => child.id) : []),
	]);
}

assert.equal(TRACKER_PAGES.length, 6, 'Expected 6 canonical pages.');
assert.equal(TRACKER_SECTIONS.length, 8, 'Expected 8 canonical sections.');

for (const page of TRACKER_PAGES) {
	assert.ok(page.route.startsWith('/'), `Page ${page.id} must have an absolute route.`);
	assert.ok(Array.isArray(page.sections), `Page ${page.id} must define sections.`);
	page.sections.forEach((sectionId) => {
		assert.ok(TRACKER_SECTIONS.some((section) => section.id === sectionId), `Page ${page.id} references missing section ${sectionId}.`);
	});
}

for (const section of TRACKER_SECTIONS) {
	assert.ok(section.id, 'Section must have an id.');
	assert.ok(section.label, `Section ${section.id} must have a label.`);

	if (section.renderVariant === 'timer-groups') {
		assert.ok(Array.isArray(section.groups) && section.groups.length > 0, `Timer section ${section.id} must define groups.`);
		continue;
	}

	const taskIds = flattenItems(section.items || []);
	assert.equal(taskIds.length, new Set(taskIds).size, `Section ${section.id} has duplicate task ids.`);
}

console.log(`Content audit passed for ${TRACKER_PAGES.length} pages and ${TRACKER_SECTIONS.length} sections.`);
