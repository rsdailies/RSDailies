import assert from 'node:assert/strict';

import { TRACKER_SECTIONS } from '../../src/entities/task/section-definitions.ts';

const timerSections = TRACKER_SECTIONS.filter((section) => section.renderVariant === 'timer-groups');
assert.ok(timerSections.length > 0, 'At least one timer section must exist.');

let entryCount = 0;

for (const section of timerSections) {
	assert.ok(
		Array.isArray(section.groups) && section.groups.length > 0,
		`Timer section ${section.id} must define groups.`,
	);

	for (const group of section.groups) {
		const plots = Array.isArray(group.plots) ? group.plots : [];
		const timers = Array.isArray(group.timers) ? group.timers : [];
		assert.ok(
			plots.length > 0 || timers.length > 0,
			`Timer group ${group.id} in ${section.id} must define plots or timers.`,
		);

		for (const plot of plots) {
			entryCount += 1;
			assert.ok(plot.id, `Plot in ${section.id}/${group.id} must have an id.`);
			assert.ok(plot.name, `Plot ${plot.id} in ${section.id}/${group.id} must have a name.`);
			assert.ok(
				(plot.cycleMinutes || plot.timerMinutes || plot.growthMinutes) > 0,
				`Plot ${plot.id} in ${section.id}/${group.id} must have a positive duration source.`,
			);
		}

		for (const timer of timers) {
			entryCount += 1;
			assert.ok(timer.id, `Timer in ${section.id}/${group.id} must have an id.`);
			assert.ok(timer.name, `Timer ${timer.id} in ${section.id}/${group.id} must have a name.`);
			assert.ok(
				(timer.cycleMinutes || timer.timerMinutes || timer.growthMinutes) > 0,
				`Timer ${timer.id} in ${section.id}/${group.id} must have a positive duration source.`,
			);
		}
	}
}

assert.ok(entryCount > 0, 'Timer sections must expose at least one timer or plot entry.');
console.log(`Timer audit passed for ${entryCount} timer entries across ${timerSections.length} timer sections.`);
