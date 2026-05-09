import { StorageKeyBuilder } from '../../shared/storage/keys-builder.ts';
import {
	getCustomTasks as getStoredCustomTasks,
	saveCustomTasks as saveStoredCustomTasks,
	type CustomTask,
} from '../custom-tasks/custom-task-service.ts';
import {
	getTimers as getStoredTimers,
	saveTimers as saveStoredTimers,
	type ActiveTimer,
} from '../timers/timer-service.ts';

type LoadFn = <T = any>(key: string, fallback?: T) => T;
type SaveFn = (key: string, value: any) => void;

function safeObject<T>(value: T, fallback: T): T {
	return value && typeof value === 'object' ? value : fallback;
}

function safeArray<T>(value: T[], fallback: T[] = []) {
	return Array.isArray(value) ? value : fallback;
}

function buildLoad(load?: LoadFn) {
	return load || ((key: string, fallback: any) => fallback);
}

function buildSave(save?: SaveFn) {
	return save || (() => {});
}

export function getOverviewPins({ load }: { load?: LoadFn } = {}) {
	const reader = buildLoad(load);
	return safeObject<Record<string, boolean | number>>(reader(StorageKeyBuilder.overviewPins(), {}), {});
}

export function saveOverviewPins(nextPins: Record<string, boolean | number>, { save }: { save?: SaveFn } = {}) {
	const writer = buildSave(save);
	writer(StorageKeyBuilder.overviewPins(), safeObject(nextPins, {}));
}

export function getCustomTasks({ load }: { load?: LoadFn } = {}) {
	if (load) {
		return safeArray(load<CustomTask[]>(StorageKeyBuilder.customTasks(), []), []);
	}

	return safeArray(getStoredCustomTasks(), []);
}

export function saveCustomTasks(tasks: CustomTask[], { save }: { save?: SaveFn } = {}) {
	const normalized = safeArray(tasks, []);
	if (save) {
		save(StorageKeyBuilder.customTasks(), normalized);
		return normalized;
	}

	return saveStoredCustomTasks(normalized);
}

export function getTimers({ load }: { load?: LoadFn } = {}) {
	if (load) {
		return safeObject<Record<string, ActiveTimer>>(load(StorageKeyBuilder.timers(), {}), {});
	}

	return safeObject<Record<string, ActiveTimer>>(getStoredTimers(), {});
}

export function saveTimers(timers: Record<string, ActiveTimer>, { save }: { save?: SaveFn } = {}) {
	const normalized = safeObject<Record<string, ActiveTimer>>(timers, {});
	if (save) {
		save(StorageKeyBuilder.timers(), normalized);
		return normalized;
	}

	saveStoredTimers(normalized);
	return normalized;
}

export function getCooldowns({ load }: { load?: LoadFn } = {}) {
	const reader = buildLoad(load);
	return safeObject<Record<string, { readyAt: number; minutes: number }>>(reader(StorageKeyBuilder.cooldowns(), {}), {});
}

export function saveCooldowns(
	cooldowns: Record<string, { readyAt: number; minutes: number }>,
	{ save }: { save?: SaveFn } = {}
) {
	const writer = buildSave(save);
	writer(StorageKeyBuilder.cooldowns(), safeObject(cooldowns, {}));
}

export function getCollapsedBlocks({ load }: { load?: LoadFn } = {}) {
	const reader = buildLoad(load);
	return safeObject<Record<string, boolean>>(reader(StorageKeyBuilder.collapsedBlocks(), {}), {});
}

export function isCollapsedBlock(blockId: string, { load }: { load?: LoadFn } = {}) {
	const collapsedBlocks = getCollapsedBlocks({ load });
	return !!collapsedBlocks[blockId];
}

export function setCollapsedBlock(blockId: string, collapsed: boolean, { load, save }: { load?: LoadFn; save?: SaveFn } = {}) {
	const collapsedBlocks = { ...getCollapsedBlocks({ load }) };

	if (collapsed) {
		collapsedBlocks[blockId] = true;
	} else {
		delete collapsedBlocks[blockId];
	}

	buildSave(save)(StorageKeyBuilder.collapsedBlocks(), collapsedBlocks);
}

export function getSectionState(sectionKey: string, { load }: { load?: LoadFn } = {}) {
	const reader = buildLoad(load);

	return {
		completed: safeObject<Record<string, boolean>>(reader(StorageKeyBuilder.sectionCompletion(sectionKey), {}), {}),
		hiddenRows: safeObject<Record<string, boolean>>(reader(StorageKeyBuilder.sectionHiddenRows(sectionKey), {}), {}),
		removedRows: safeObject<Record<string, boolean>>(reader(StorageKeyBuilder.sectionRemovedRows(sectionKey), {}), {}),
		hidden: !!reader(StorageKeyBuilder.sectionHidden(sectionKey), false),
		hideSection: !!reader(StorageKeyBuilder.sectionHidden(sectionKey), false),
		showHidden: !!reader(StorageKeyBuilder.sectionShowHidden(sectionKey), false),
		sort: reader(StorageKeyBuilder.sectionSort(sectionKey), 'default'),
		order: safeArray<string>(reader(StorageKeyBuilder.sectionOrder(sectionKey), []), []),
	};
}

export function saveSectionValue(sectionKey: string, key: string, value: any, { save }: { save?: SaveFn } = {}) {
	buildSave(save)(StorageKeyBuilder.sectionValue(sectionKey, key), value);
}

export function resetSectionState(sectionKey: string, { save }: { save?: SaveFn } = {}) {
	const writer = buildSave(save);
	writer(StorageKeyBuilder.sectionCompletion(sectionKey), {});
	writer(StorageKeyBuilder.sectionHidden(sectionKey), false);
	writer(StorageKeyBuilder.sectionShowHidden(sectionKey), false);
	writer(StorageKeyBuilder.sectionSort(sectionKey), 'default');
	writer(StorageKeyBuilder.sectionOrder(sectionKey), []);
	writer(StorageKeyBuilder.sectionHiddenRows(sectionKey), {});
	writer(StorageKeyBuilder.sectionRemovedRows(sectionKey), {});
}
