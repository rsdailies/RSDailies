import { TRACKER_SECTIONS } from '../domain/static-content.ts';
import { getCustomTasks } from '../features/custom-tasks/custom-task-service.ts';
import { StorageKeyBuilder } from '../shared/storage/keys-builder.ts';

export interface StorageDeps {
	load: <T = any>(key: string, fallback?: T) => T;
	save: (key: string, value: any) => void;
	removeKey?: (key: string) => void;
}

function clearMapEntries(map: Record<string, any>, ids: Set<string>) {
	let changed = false;

	for (const key of Object.keys(map)) {
		if (ids.has(key)) {
			delete map[key];
			changed = true;
		}
	}

	return changed;
}

export function getSectionTaskIds(sectionKey: string) {
	if (sectionKey === 'custom') {
		return getCustomTasks().map((task) => task.id);
	}

	const section = TRACKER_SECTIONS.find((entry) => entry.id === sectionKey);
	if (!section) return [];

	if (section.renderVariant === 'timer-groups') {
		return (section.groups || []).flatMap((group) =>
			(group.timers || []).flatMap((timer) => [
				timer.id,
				...((group.plots || []).map((plot) => `${timer.id}::${plot.id}`)),
				...((timer.plots || []).map((plot) => `${timer.id}::${plot.id}`)),
			])
		);
	}

	return (section.items || []).flatMap((task) => [
		task.id,
		...((task.children || []).map((child) => child.id)),
		...((task.childRows || []).map((child) => child.id)),
	]);
}

export function clearCooldownsForTaskIds(taskIds: string[], { load, save }: StorageDeps) {
	const ids = new Set((Array.isArray(taskIds) ? taskIds : []).filter(Boolean));
	if (ids.size === 0) return false;

	const cooldowns = { ...(load<Record<string, any>>(StorageKeyBuilder.cooldowns(), {}) || {}) };
	const changed = clearMapEntries(cooldowns, ids);

	if (changed) {
		save(StorageKeyBuilder.cooldowns(), cooldowns);
	}

	return changed;
}

export function clearSpecificTaskCompletions(sectionKey: string, taskIds: string[], { load, save }: StorageDeps) {
	const ids = new Set((Array.isArray(taskIds) ? taskIds : []).filter(Boolean));
	if (ids.size === 0) return false;

	const completed = { ...(load<Record<string, boolean>>(StorageKeyBuilder.sectionCompletion(sectionKey), {}) || {}) };
	const hiddenRows = { ...(load<Record<string, boolean>>(StorageKeyBuilder.sectionHiddenRows(sectionKey), {}) || {}) };
	const removedRows = { ...(load<Record<string, boolean>>(StorageKeyBuilder.sectionRemovedRows(sectionKey), {}) || {}) };

	const changed =
		clearMapEntries(completed, ids) ||
		clearMapEntries(hiddenRows, ids) ||
		clearMapEntries(removedRows, ids);

	clearCooldownsForTaskIds([...ids], { load, save });

	if (changed) {
		save(StorageKeyBuilder.sectionCompletion(sectionKey), completed);
		save(StorageKeyBuilder.sectionHiddenRows(sectionKey), hiddenRows);
		save(StorageKeyBuilder.sectionRemovedRows(sectionKey), removedRows);
	}

	return changed;
}
