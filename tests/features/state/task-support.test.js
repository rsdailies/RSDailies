import assert from 'node:assert/strict';
import test from 'node:test';

import { determineTaskState } from '../../../src/entities/task/task-state.ts';

test('determineTaskState keeps cross-game tasks hidden', () => {
	const state = determineTaskState(
		'vis-wax',
		{ id: 'vis-wax', name: 'Vis Wax', game: 'rs3' },
		{
			sectionKey: 'osrsdaily',
			gameContext: 'osrs',
		},
	);

	assert.equal(state, 'hide');
});

test('determineTaskState keeps completed tasks visible when showCompletedTasks is enabled', () => {
	const state = determineTaskState(
		'vis-wax',
		{ id: 'vis-wax', name: 'Vis Wax' },
		{
			sectionKey: 'rs3daily',
			completed: { 'vis-wax': true },
			settings: { showCompletedTasks: true },
		},
	);

	assert.equal(state, 'true');
});

test('determineTaskState marks timer parent rows as running when their timer is active', () => {
	const state = determineTaskState(
		'herb-run',
		{ id: 'herb-run', name: 'Herb Run', isTimerParent: true },
		{
			sectionKey: 'timers',
			timers: {
				'herb-run': {
					readyAt: Date.now() + 60_000,
				},
			},
		},
	);

	assert.equal(state, 'running');
});
