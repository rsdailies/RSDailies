import {
	clearCompletedEntries,
	getHiddenRowsForSection,
	getRemovedRowsForSection,
	setHiddenRowsForSection,
	setRemovedRowsForSection,
} from './section-storage.ts';
import { tracker } from '../../stores/tracker.svelte';

const TIMER_SECTION_KEY = 'timers';

export function resetTimerRows(taskIds: string[], context: any, timerIds: string[] = []) {
	clearCompletedEntries(TIMER_SECTION_KEY, taskIds, context);

	const hiddenRows = getHiddenRowsForSection(TIMER_SECTION_KEY, context);
	const removedRows = getRemovedRowsForSection(TIMER_SECTION_KEY, context);

	taskIds.forEach((taskId) => {
		delete hiddenRows[taskId];
		delete removedRows[taskId];
	});

	timerIds.forEach((timerId) => context.clearTimer?.(timerId));

	setHiddenRowsForSection(TIMER_SECTION_KEY, hiddenRows, context);
	setRemovedRowsForSection(TIMER_SECTION_KEY, removedRows, context);
	tracker.reloadAll();
}
