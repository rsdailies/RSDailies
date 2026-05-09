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
	}: any
) {
	if (hiddenRows[taskId]) {
		return 'hide';
	}

	if (task?.cooldownMinutes && cooldowns[taskId]?.readyAt > now) {
		return 'running';
	}

	if (sectionKey === timerSectionKey && task?.isTimerParent) {
		const activeTimer = timers[taskId];
		if (!activeTimer) {
			return 'idle';
		}
		return activeTimer.readyAt > now ? 'running' : 'ready';
	}

	const isCompleted = !!completed[taskId];

	if (isCompleted && !settings.showCompletedTasks) {
		return 'hide';
	}

	return isCompleted ? 'true' : 'false';
}
