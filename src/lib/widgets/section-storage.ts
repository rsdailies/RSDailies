import { StorageKeyBuilder } from '../shared/storage/keys-builder.ts';

export function getHiddenRowsForSection(sectionKey: string, context: any) {
	return { ...((context.load?.(StorageKeyBuilder.sectionHiddenRows(sectionKey), {})) || {}) };
}

export function getRemovedRowsForSection(sectionKey: string, context: any) {
	return { ...((context.load?.(StorageKeyBuilder.sectionRemovedRows(sectionKey), {})) || {}) };
}

export function setHiddenRowsForSection(sectionKey: string, nextHiddenRows: Record<string, any>, context: any) {
	context.save?.(StorageKeyBuilder.sectionHiddenRows(sectionKey), nextHiddenRows);
}

export function setRemovedRowsForSection(sectionKey: string, nextRemovedRows: Record<string, any>, context: any) {
	context.save?.(StorageKeyBuilder.sectionRemovedRows(sectionKey), nextRemovedRows);
}

export function clearCompletedEntries(sectionKey: string, taskIds: string[], context: any) {
	const ids = new Set((Array.isArray(taskIds) ? taskIds : []).filter(Boolean));
	const completed = { ...((context.load?.(StorageKeyBuilder.sectionCompletion(sectionKey), {})) || {}) };
	let changed = false;

	ids.forEach((taskId) => {
		if (completed[taskId]) {
			delete completed[taskId];
			changed = true;
		}
	});

	if (changed) {
		context.save?.(StorageKeyBuilder.sectionCompletion(sectionKey), completed);
	}
}

export function resetTaskList(sectionKey: string, tasks: any[], context: any) {
	const taskIds = (Array.isArray(tasks) ? tasks : []).map((task) => task.id).filter(Boolean);

	clearCompletedEntries(sectionKey, taskIds, context);

	const hiddenRows = getHiddenRowsForSection(sectionKey, context);
	const removedRows = getRemovedRowsForSection(sectionKey, context);

	let changedHidden = false;
	let changedRemoved = false;

	taskIds.forEach((taskId) => {
		if (hiddenRows[taskId]) {
			delete hiddenRows[taskId];
			changedHidden = true;
		}
		if (removedRows[taskId]) {
			delete removedRows[taskId];
			changedRemoved = true;
		}
	});

	if (changedHidden) setHiddenRowsForSection(sectionKey, hiddenRows, context);
	if (changedRemoved) setRemovedRowsForSection(sectionKey, removedRows, context);

	context.renderApp?.();
}

export function buildRestoreEntries(sectionKey: string, taskIds: string[], context: any) {
	const hiddenRows = getHiddenRowsForSection(sectionKey, context);
	const removedRows = getRemovedRowsForSection(sectionKey, context);
	const seen = new Set<string>();

	return taskIds
		.filter((taskId) => hiddenRows[taskId] || removedRows[taskId])
		.filter((taskId) => {
			if (seen.has(taskId)) return false;
			seen.add(taskId);
			return true;
		})
		.map((taskId) => ({
			value: taskId,
			label:
				typeof removedRows[taskId] === 'string'
					? removedRows[taskId]
					: typeof hiddenRows[taskId] === 'string'
						? hiddenRows[taskId]
						: taskId,
		}));
}

export function restoreHiddenRow(sectionKey: string, taskId: string, context: any) {
	const nextHiddenRows = getHiddenRowsForSection(sectionKey, context);
	const nextRemovedRows = getRemovedRowsForSection(sectionKey, context);

	delete nextHiddenRows[taskId];
	delete nextRemovedRows[taskId];

	setHiddenRowsForSection(sectionKey, nextHiddenRows, context);
	setRemovedRowsForSection(sectionKey, nextRemovedRows, context);
	context.renderApp?.();
}
