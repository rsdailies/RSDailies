import assert from 'node:assert/strict';

import { TRACKER_SECTIONS } from '../../src/lib/domain/static-content.ts';
import { TimerRegistry } from '../../src/lib/shared/timers/timer-registry.ts';

const timerSection = TRACKER_SECTIONS.find((section) => section.id === 'timers');
assert.ok(timerSection, 'Timer section is missing.');
assert.ok(Array.isArray(timerSection.groups) && timerSection.groups.length > 0, 'Timer section must define timer groups.');

const registry = new TimerRegistry(timerSection.groups);
const timers = registry.getAllTimerDefinitions();

assert.ok(timers.length > 0, 'Timer registry must expose timers.');

for (const timer of timers) {
	assert.ok(timer.id, 'Timer must have an id.');
	assert.ok(timer.name, `Timer ${timer.id} must have a name.`);
	assert.ok((timer.cycleMinutes || timer.timerMinutes || timer.growthMinutes) > 0, `Timer ${timer.id} must have a positive duration source.`);
}

console.log(`Timer audit passed for ${timers.length} timer definitions.`);
