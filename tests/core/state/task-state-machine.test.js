import test from 'node:test';
import assert from 'node:assert/strict';
import { determineTaskState } from '../../../src/core/state/task-state-machine.js';

test('Task State Machine', async (t) => {
  await t.test('should return hide if task is in hiddenRows', () => {
    const state = determineTaskState('task-1', {}, {
      hiddenRows: { 'task-1': true }
    });
    assert.strictEqual(state, 'hide');
  });

  await t.test('should return running if task has an active cooldown', () => {
    const now = 1000;
    const state = determineTaskState('task-1', { cooldownMinutes: 10 }, {
      cooldowns: { 'task-1': { readyAt: 2000 } },
      now
    });
    assert.strictEqual(state, 'running');
  });

  await t.test('should return idle for a timer parent with no active timer', () => {
    const state = determineTaskState('timer-1', { isTimerParent: true }, {
      sectionKey: 'timers',
      timers: {}
    });
    assert.strictEqual(state, 'idle');
  });

  await t.test('should return running for a timer parent with active timer', () => {
    const now = 1000;
    const state = determineTaskState('timer-1', { isTimerParent: true }, {
      sectionKey: 'timers',
      timers: { 'timer-1': { readyAt: 2000 } },
      now
    });
    assert.strictEqual(state, 'running');
  });

  await t.test('should return ready for a timer parent with finished timer', () => {
    const now = 3000;
    const state = determineTaskState('timer-1', { isTimerParent: true }, {
      sectionKey: 'timers',
      timers: { 'timer-1': { readyAt: 2000 } },
      now
    });
    assert.strictEqual(state, 'ready');
  });

  await t.test('should return hide if completed and showCompletedTasks is false', () => {
    const state = determineTaskState('task-1', {}, {
      completed: { 'task-1': true },
      settings: { showCompletedTasks: false }
    });
    assert.strictEqual(state, 'hide');
  });

  await t.test('should return true if completed and showCompletedTasks is true', () => {
    const state = determineTaskState('task-1', {}, {
      completed: { 'task-1': true },
      settings: { showCompletedTasks: true }
    });
    assert.strictEqual(state, 'true');
  });

  await t.test('should return false if not completed', () => {
    const state = determineTaskState('task-1', {}, {
      completed: {},
      settings: { showCompletedTasks: false }
    });
    assert.strictEqual(state, 'false');
  });
});
