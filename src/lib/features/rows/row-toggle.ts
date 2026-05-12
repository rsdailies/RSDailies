import { TIMER_SECTION_KEY } from '../timers/timer-runtime.ts';
import { shouldIgnoreToggleClick } from './row-layout.ts';
import { tracker } from '../../../stores/tracker.svelte';

export function createToggleTaskHandler(
	sectionKey: string,
	taskId: string,
	task: any,
	{ load, save, getTaskState, setTaskCompleted, clearTimer, startTimer, startCooldown }: any
) {
	return function toggleTask(event?: any) {
		if (event && shouldIgnoreToggleClick(event)) return;

		const state = getTaskState(sectionKey, taskId, task);
		const isCompleted = state === 'true' || state === 'hide';
		const cooldownMinutes = Number.isFinite(task?.cooldownMinutes)
			? task.cooldownMinutes
			: Number.isFinite(task?.cooldown)
				? task.cooldown
				: parseInt(task?.cooldownMinutes ?? task?.cooldown, 10);

		if (isCompleted) {
			setTaskCompleted(sectionKey, taskId, false, { load, save });
		} else {
			setTaskCompleted(sectionKey, taskId, true, { load, save });

			if (sectionKey === TIMER_SECTION_KEY) {
				clearTimer(taskId, { load, save });
				startTimer(task, { load, save });
			}

			if (Number.isFinite(cooldownMinutes) && cooldownMinutes > 0) {
				startCooldown(taskId, cooldownMinutes, { load, save });
			}
		}

		tracker.reloadAll();
	};
}
