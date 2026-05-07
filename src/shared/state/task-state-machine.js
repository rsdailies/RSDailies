/**
 * Task State Machine
 * 
 * Authoritatively determines the state of a task based on section data, 
 * timers, cooldowns, and settings.
 * 
 * Possible states:
 * - 'hide': Task should not be rendered.
 * - 'running': Task is in progress (cooldown or active timer).
 * - 'idle': Farming timer is not started.
 * - 'ready': Farming timer is finished but not yet cleared.
 * - 'true': Task is completed.
 * - 'false': Task is not completed.
 */

export function determineTaskState(taskId, task, {
  sectionKey,
  hiddenRows = {},
  completed = {},
  cooldowns = {},
  timers = {},
  settings = {},
  timerSectionKey = 'timers',
  now = Date.now()
}) {
  // 1. Check if explicitly hidden
  if (hiddenRows[taskId]) {
    return 'hide';
  }

  // 2. Check Cooldowns
  if (task?.cooldownMinutes && cooldowns[taskId]?.readyAt > now) {
    return 'running';
  }

  // 3. Check Farming Timers (Timer Section Parents)
  if (sectionKey === timerSectionKey && task?.isTimerParent) {
    const activeTimer = timers[taskId];
    if (!activeTimer) {
      return 'idle';
    }
    return activeTimer.readyAt > now ? 'running' : 'ready';
  }

  // 4. Check Completion
  const isCompleted = !!completed[taskId];
  
  // If completed and settings say don't show completed, hide it
  if (isCompleted && !settings.showCompletedTasks) {
    return 'hide';
  }

  return isCompleted ? 'true' : 'false';
}
