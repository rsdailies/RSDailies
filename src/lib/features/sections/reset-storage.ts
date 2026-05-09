import { StorageKeyBuilder } from '../../shared/storage/keys-builder.ts';
import { reader, writer } from './reset-internals.ts';
import type { LoadFn, RemoveFn, SaveFn } from './reset-internals.ts';

function cleanupTaskNotificationsForReset(sectionKey: string, { removeKey }: { removeKey?: RemoveFn }) {
	removeKey?.(`notified:${sectionKey}`);
}

export function clearCooldownsForTaskIds(taskIds: string[], { load, save }: { load?: LoadFn; save?: SaveFn }) {
	const ids = new Set((Array.isArray(taskIds) ? taskIds : []).filter(Boolean));
	if (ids.size === 0) return false;

	const read = reader(load);
	const write = writer(save);
	const cooldowns = { ...(read<Record<string, any>>(StorageKeyBuilder.cooldowns(), {}) || {}) };
	let changed = false;

	ids.forEach((taskId) => {
		if (cooldowns[taskId]) {
			delete cooldowns[taskId];
			changed = true;
		}
	});

	if (changed) {
		write(StorageKeyBuilder.cooldowns(), cooldowns);
	}

	return changed;
}

export function clearSpecificTaskCompletions(
	sectionKey: string,
	taskIds: string[],
	{ load, save, removeKey }: { load?: LoadFn; save?: SaveFn; removeKey?: RemoveFn }
) {
	const ids = new Set((Array.isArray(taskIds) ? taskIds : []).filter(Boolean));
	if (ids.size === 0) return false;

	const read = reader(load);
	const write = writer(save);
	const completed = { ...(read<Record<string, boolean>>(StorageKeyBuilder.sectionCompletion(sectionKey), {}) || {}) };
	const hiddenRows = { ...(read<Record<string, boolean>>(StorageKeyBuilder.sectionHiddenRows(sectionKey), {}) || {}) };
	const removedRows = { ...(read<Record<string, boolean>>(StorageKeyBuilder.sectionRemovedRows(sectionKey), {}) || {}) };
	let changed = false;

	ids.forEach((taskId) => {
		if (completed[taskId]) {
			delete completed[taskId];
			changed = true;
		}
		if (hiddenRows[taskId]) {
			delete hiddenRows[taskId];
			changed = true;
		}
		if (removedRows[taskId]) {
			delete removedRows[taskId];
			changed = true;
		}
	});

	clearCooldownsForTaskIds([...ids], { load, save });

	if (changed) {
		write(StorageKeyBuilder.sectionCompletion(sectionKey), completed);
		write(StorageKeyBuilder.sectionHiddenRows(sectionKey), hiddenRows);
		write(StorageKeyBuilder.sectionRemovedRows(sectionKey), removedRows);
		cleanupTaskNotificationsForReset(sectionKey, { removeKey });
	}

	return changed;
}

export function clearCompletionFor(
	sectionKey: string,
	{ load, save, removeKey }: { load?: LoadFn; save?: SaveFn; removeKey?: RemoveFn }
) {
	const read = reader(load);
	const write = writer(save);
	const completed = { ...(read<Record<string, boolean>>(StorageKeyBuilder.sectionCompletion(sectionKey), {}) || {}) };
	const hiddenRows = { ...(read<Record<string, boolean>>(StorageKeyBuilder.sectionHiddenRows(sectionKey), {}) || {}) };
	const removedRows = { ...(read<Record<string, boolean>>(StorageKeyBuilder.sectionRemovedRows(sectionKey), {}) || {}) };
	const completedIds = Object.keys(completed);
	const hiddenIds = Object.keys(hiddenRows);
	const removedIds = Object.keys(removedRows);
	let changed = false;

	if (completedIds.length > 0) {
		write(StorageKeyBuilder.sectionCompletion(sectionKey), {});
		changed = true;
	}
	if (hiddenIds.length > 0) {
		write(StorageKeyBuilder.sectionHiddenRows(sectionKey), {});
		changed = true;
	}
	if (removedIds.length > 0) {
		write(StorageKeyBuilder.sectionRemovedRows(sectionKey), {});
		changed = true;
	}

	clearCooldownsForTaskIds([...new Set([...completedIds, ...hiddenIds, ...removedIds])], { load, save });

	if (changed) {
		cleanupTaskNotificationsForReset(sectionKey, { removeKey });
	}
}

export function clearSectionCompletionsOnly(sectionKey: string, { save }: { save?: SaveFn }) {
	writer(save)(StorageKeyBuilder.sectionCompletion(sectionKey), {});
}

export function cleanupSectionNotifications(sectionKey: string, { removeKey }: { removeKey?: RemoveFn }) {
	cleanupTaskNotificationsForReset(sectionKey, { removeKey });
}
