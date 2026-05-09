import {
	getCustomTasks,
	getOverviewPins,
	saveCustomTasks,
	saveOverviewPins,
} from '../sections/section-state-service.ts';
import { StorageKeyBuilder } from '../../shared/storage/keys-builder.ts';
import { buildPinId } from './row-ids.ts';

function getHiddenRows(sectionKey: string, load: <T = any>(key: string, fallback?: T) => T) {
	return { ...(load(StorageKeyBuilder.sectionHiddenRows(sectionKey), {}) || {}) };
}

function saveHiddenRows(sectionKey: string, value: any, save: (key: string, value: any) => void) {
	save(StorageKeyBuilder.sectionHiddenRows(sectionKey), value);
}

function getRemovedRows(sectionKey: string, load: <T = any>(key: string, fallback?: T) => T) {
	return { ...(load(StorageKeyBuilder.sectionRemovedRows(sectionKey), {}) || {}) };
}

function saveRemovedRows(sectionKey: string, value: any, save: (key: string, value: any) => void) {
	save(StorageKeyBuilder.sectionRemovedRows(sectionKey), value);
}

function removeRowViaX(sectionKey: string, taskId: string, task: any, { load, save }: any) {
	const hiddenRows = getHiddenRows(sectionKey, load);
	const removedRows = getRemovedRows(sectionKey, load);
	hiddenRows[taskId] = task?.name || taskId;
	removedRows[taskId] = task?.name || taskId;
	saveHiddenRows(sectionKey, hiddenRows, save);
	saveRemovedRows(sectionKey, removedRows, save);
}

export function bindHideButton(
	hideBtn: HTMLElement | null,
	sectionKey: string,
	taskId: string,
	task: any,
	{ isCustom, isOverviewPanel, customStorageId, load, save, hideTask, renderApp }: any
) {
	if (!hideBtn) return;
	if (isOverviewPanel) {
		hideBtn.style.display = 'none';
		return;
	}

	hideBtn.addEventListener('click', (event) => {
		event.preventDefault();
		event.stopPropagation();
		if (isCustom) {
			if (!confirm(`Delete custom task "${task.name}"?`)) return;
			const next = getCustomTasks({ load }).filter((customTask) => customTask.id !== task.id);
			saveCustomTasks(next, { save });

			const completed = load(StorageKeyBuilder.sectionCompletion('custom'), {});
			const hiddenRows = load(StorageKeyBuilder.sectionHiddenRows('custom'), {});
			const removedRows = load(StorageKeyBuilder.sectionRemovedRows('custom'), {});
			const notified = load('notified:custom', {});

			delete completed[task.id];
			delete hiddenRows[task.id];
			delete removedRows[task.id];
			delete notified[task.id];

			save(StorageKeyBuilder.sectionCompletion('custom'), completed);
			save(StorageKeyBuilder.sectionHiddenRows('custom'), hiddenRows);
			save(StorageKeyBuilder.sectionRemovedRows('custom'), removedRows);
			save('notified:custom', notified);

			const pins = { ...getOverviewPins({ load }) };
			delete pins[StorageKeyBuilder.overviewPinStorageId('custom', task.id)];
			saveOverviewPins(pins, { save });
		} else {
			hideTask(sectionKey, taskId, { load, save });
			removeRowViaX(sectionKey, taskId, task, { load, save });
			const pins = { ...getOverviewPins({ load }) };
			delete pins[buildPinId(sectionKey, task, { customStorageId })];
			saveOverviewPins(pins, { save });
		}

		renderApp();
	});
}
