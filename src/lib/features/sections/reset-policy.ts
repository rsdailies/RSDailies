import { TRACKER_SECTIONS } from '../../domain/static-content.ts';
import { getContentSectionTaskIds, getContentSectionTaskIdsByCadence } from './task-id-resolution.ts';
import { getCustomTasks } from './section-state-service.ts';
import { clearSpecificTaskCompletions } from './reset-storage.ts';
import type { LoadFn, RemoveFn, SaveFn } from './reset-internals.ts';

export function getResettableSectionsForFrequency(frequency: string) {
	return TRACKER_SECTIONS.filter((section) => section.resetFrequency === frequency).map((section) => section.id);
}

export function getSectionTaskIds(sectionKey: string, { load }: { load?: LoadFn } = {}) {
	return getContentSectionTaskIds(sectionKey, {
		customTasks: sectionKey === 'custom' ? getCustomTasks({ load }) : [],
	});
}

export function clearGatheringCompletions(
	kind: string,
	deps: { load?: LoadFn; save?: SaveFn; removeKey?: RemoveFn }
) {
	const ids = getContentSectionTaskIdsByCadence('gathering', kind);
	return clearSpecificTaskCompletions('gathering', ids, deps);
}

export function resetCustomCompletions(
	kind: string,
	{ load, save, removeKey }: { load?: LoadFn; save?: SaveFn; removeKey?: RemoveFn }
) {
	const tasks = getCustomTasks({ load });
	const ids = tasks.filter((task) => String(task?.reset || 'daily').toLowerCase() === kind).map((task) => task.id);
	return clearSpecificTaskCompletions('custom', ids, { load, save, removeKey });
}
