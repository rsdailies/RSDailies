import { TRACKER_SECTIONS } from '../../entities/task/section-definitions.ts';
import type { TrackerSection, TrackerTask } from '../../entities/task/types.ts';
import { StorageKeyBuilder } from '../../shared/storage/keys-builder.ts';
import { getCustomTasks } from '../custom-tasks/custom-task-state.ts';
import { type LoadFn, type RemoveFn, type SaveFn, reader, writer } from './reset-internals.ts';

export function getResettableSectionsForFrequency(frequency: string) {
	if (frequency === 'rolling') {
		return ['timers'];
	}
	return (TRACKER_SECTIONS as TrackerSection[])
		.filter((section) => section.resetFrequency === frequency)
		.map((section) => section.id);
}

function collectTaskIds(tasks: TrackerTask[] = [], frequency = '') {
	const normalizedFrequency = String(frequency || '').toLowerCase();
	const ids: string[] = [];

	for (const task of tasks) {
		if (String(task?.reset || '').toLowerCase() === normalizedFrequency) {
			ids.push(task.id);
		}

		const children = Array.isArray(task?.childRows)
			? task.childRows
			: Array.isArray(task?.children)
				? task.children
				: [];

		for (const child of children) {
			if (String(child?.reset || task?.reset || '').toLowerCase() === normalizedFrequency) {
				ids.push(child.id);
			}
		}
	}

	return ids;
}

function getSection(sectionKey: string) {
	return (TRACKER_SECTIONS as TrackerSection[]).find((section) => section.id === sectionKey) || null;
}

export function clearGatheringCompletions(
	frequency: string,
	{ load, save }: { load?: LoadFn; save?: SaveFn; removeKey?: RemoveFn },
) {
	const taskIds = getSectionTaskIds('gathering', frequency);
	if (taskIds.length === 0) return;

	const read = reader(load);
	const write = writer(save);
	const completionKey = StorageKeyBuilder.sectionCompletion('gathering');
	const current = { ...(read<Record<string, boolean>>(completionKey, {}) || {}) };
	let changed = false;

	for (const taskId of taskIds) {
		if (current[taskId]) {
			delete current[taskId];
			changed = true;
		}
	}

	if (changed) {
		write(completionKey, current);
	}
}

export function resetCustomCompletions(
	frequency: string,
	{ save }: { load?: LoadFn; save?: SaveFn; removeKey?: RemoveFn },
) {
	if (getCustomTasks().some((task) => task.reset === frequency)) {
		writer(save)(StorageKeyBuilder.sectionCompletion('custom'), {});
	}
}

export function getSectionTaskIds(sectionKey: string, frequency: string, _deps: { load?: LoadFn } = {}) {
	const section = getSection(sectionKey);
	if (!section) return [];
	return collectTaskIds(section.items || [], frequency);
}
