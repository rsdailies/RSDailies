import { StorageKeyBuilder } from '../../shared/storage/keys-builder.ts';
import { getSectionState, saveSectionValue } from './section-state-service.ts';

type LoadFn = <T = any>(key: string, fallback?: T) => T;
type SaveFn = (key: string, value: any) => void;

const TIMER_SECTION_KEY = 'timers';

export function setTaskCompleted(sectionKey: string, taskId: string, completed: boolean, { load, save }: { load?: LoadFn; save?: SaveFn }) {
	const section = getSectionState(sectionKey, { load });
	if (section.hiddenRows[taskId] && !section.completed[taskId]) return;

	if (completed) {
		section.completed[taskId] = true;
	} else {
		delete section.completed[taskId];
	}

	saveSectionValue(sectionKey, 'completed', section.completed, { save });
}

export function hideTask(sectionKey: string, taskId: string, { load, save }: { load?: LoadFn; save?: SaveFn }) {
	const section = getSectionState(sectionKey, { load });
	section.hiddenRows[taskId] = true;
	saveSectionValue(sectionKey, 'hiddenRows', section.hiddenRows, { save });

	const reader = load || ((_: string, fallback: any) => fallback);
	const writer = save || (() => {});

	const order = reader<string[]>(StorageKeyBuilder.sectionOrder(sectionKey), []);
	if (Array.isArray(order)) {
		writer(StorageKeyBuilder.sectionOrder(sectionKey), order.filter((id) => id !== taskId));
	}

	const removedRows = reader<Record<string, boolean>>(StorageKeyBuilder.sectionRemovedRows(sectionKey), {});
	if (removedRows[taskId]) {
		delete removedRows[taskId];
		writer(StorageKeyBuilder.sectionRemovedRows(sectionKey), removedRows);
	}

	if (sectionKey === TIMER_SECTION_KEY) {
		writer(StorageKeyBuilder.timers(), {});
	}
}

export function restoreTask(sectionKey: string, taskId: string, { load, save }: { load?: LoadFn; save?: SaveFn }) {
	const section = getSectionState(sectionKey, { load });
	const writer = save || (() => {});
	const reader = load || ((_: string, fallback: any) => fallback);

	if (section.hiddenRows[taskId]) {
		delete section.hiddenRows[taskId];
		saveSectionValue(sectionKey, 'hiddenRows', section.hiddenRows, { save });
	}

	const removedRows = reader<Record<string, boolean>>(StorageKeyBuilder.sectionRemovedRows(sectionKey), {});
	if (removedRows[taskId]) {
		delete removedRows[taskId];
		writer(StorageKeyBuilder.sectionRemovedRows(sectionKey), removedRows);
	}
}

export function restoreAllTasks(sectionKey: string, { save }: { save?: SaveFn }) {
	saveSectionValue(sectionKey, 'hiddenRows', {}, { save });
	(save || (() => {}))(StorageKeyBuilder.sectionRemovedRows(sectionKey), {});
}
