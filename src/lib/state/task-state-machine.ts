export function determineTaskState(
	taskId: string,
	task: any,
	{
		sectionKey,
		hiddenRows = {},
		completed = {},
		cooldowns = {},
		timers = {},
		settings = {},
		timerSectionKey = 'timers',
		now = Date.now(),
		gameContext = null,
	}: any
) {
	// PRE-CHECK: If the task belongs to a different game, hide it immediately to prevent leakage.
	if (gameContext && task?.game && task.game !== gameContext) {
		return 'hide';
	}

	if (hiddenRows[taskId]) {
		return 'hide';
	}

	// ABSOLUTE DEFENSIVE CHECK: If the user wants to see completed tasks, we MUST not return 'hide' below.
	// We check multiple truthy formats (true, 'true', 'on', 1) to be 100% resilient.
	const rawValue = settings?.showCompletedTasks;
	const isShowCompletedEnabled = rawValue === true || rawValue === 'true' || rawValue === 'on' || rawValue === 1;

	if (task?.cooldownMinutes && cooldowns[taskId]?.readyAt > now) {
		// Persistent timers (Farming) always stay visible
		if (sectionKey === timerSectionKey || !!task.isTimerParent) {
			return 'running';
		}
		
		// Other tasks (Gathering/Daily) vanish UNLESS showCompleted is enabled
		return isShowCompletedEnabled ? 'running' : 'hide';
	}

	if (sectionKey === timerSectionKey && task?.isTimerParent) {
		const activeTimer = timers[taskId];
		if (!activeTimer) return 'idle';
		return activeTimer.readyAt > now ? 'running' : 'ready';
	}

	const isCompleted = !!completed[taskId];

	// FINAL VISIBILITY CHECK: If it's finished but we want to show completed, it must NOT be 'hide'.
	if (isCompleted || (task?.cooldownMinutes && cooldowns[taskId]?.readyAt > now)) {
		if (isShowCompletedEnabled) {
			return isCompleted ? 'true' : 'running';
		}
		return 'hide';
	}

	return 'false';
}
