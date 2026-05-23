import type { GameId, TrackerTask } from './types.ts';

type TaskState = 'hide' | 'running' | 'idle' | 'ready' | 'true' | 'false';

type TaskStateContext = {
	sectionKey: string;
	hiddenRows?: Record<string, boolean>;
	completed?: Record<string, boolean>;
	cooldowns?: Record<string, { readyAt?: number }>;
	timers?: Record<string, { readyAt?: number }>;
	settings?: { showCompletedTasks?: boolean | string | number };
	timerSectionKey?: string;
	now?: number;
	gameContext?: GameId | null;
};

export function determineTaskState(
	taskId: string,
	task: TrackerTask & { isTimerParent?: boolean },
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
	}: TaskStateContext,
): TaskState {
	const cooldownReadyAt = cooldowns[taskId]?.readyAt ?? 0;

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

	if (task?.cooldownMinutes && cooldownReadyAt > now) {
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
		return (activeTimer.readyAt ?? 0) > now ? 'running' : 'ready';
	}

	const isCompleted = !!completed[taskId];

	// FINAL VISIBILITY CHECK: If it's finished but we want to show completed, it must NOT be 'hide'.
	if (isCompleted || (task?.cooldownMinutes && cooldownReadyAt > now)) {
		if (isShowCompletedEnabled) {
			return isCompleted ? 'true' : 'running';
		}
		return 'hide';
	}

	return 'false';
}
