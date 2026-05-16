import { StorageKeyBuilder } from '@shared/storage/keys-builder';
type LoadFn = <T = any>(key: string, fallback?: T) => T;
type SaveFn = (key: string, value: any) => void;
function safeObject<T>(value: T, fallback: T): T { return value && typeof value === 'object' ? value : fallback; }
function safeArray<T>(value: T[], fallback: T[] = []) { return Array.isArray(value) ? value : fallback; }
function reader(load?: LoadFn) { return load || ((_: string, fallback: any) => fallback); }
function writer(save?: SaveFn) { return save || (() => {}); }
export function getCollapsedBlocks({ load }: { load?: LoadFn } = {}) { return safeObject<Record<string, boolean>>(reader(load)(StorageKeyBuilder.collapsedBlocks(), {}), {}); }
export function isCollapsedBlock(blockId: string, { load }: { load?: LoadFn } = {}) { return !!getCollapsedBlocks({ load })[blockId]; }
export function setCollapsedBlock(blockId: string, collapsed: boolean, { load, save }: { load?: LoadFn; save?: SaveFn } = {}) {
	const next = { ...getCollapsedBlocks({ load }) }; if (collapsed) next[blockId] = true; else delete next[blockId]; writer(save)(StorageKeyBuilder.collapsedBlocks(), next);
}
export function getSectionState(sectionKey: string, { load }: { load?: LoadFn } = {}) {
	const read = reader(load);
	return { completed: safeObject<Record<string, boolean>>(read(StorageKeyBuilder.sectionCompletion(sectionKey), {}), {}), hiddenRows: safeObject<Record<string, boolean>>(read(StorageKeyBuilder.sectionHiddenRows(sectionKey), {}), {}), removedRows: safeObject<Record<string, boolean>>(read(StorageKeyBuilder.sectionRemovedRows(sectionKey), {}), {}), hidden: !!read(StorageKeyBuilder.sectionHidden(sectionKey), false), hideSection: !!read(StorageKeyBuilder.sectionHidden(sectionKey), false), showHidden: !!read(StorageKeyBuilder.sectionShowHidden(sectionKey), false), sort: read(StorageKeyBuilder.sectionSort(sectionKey), 'default'), order: safeArray<string>(read(StorageKeyBuilder.sectionOrder(sectionKey), []), []) };
}
export function saveSectionValue(sectionKey: string, key: string, value: any, { save }: { save?: SaveFn } = {}) { writer(save)(StorageKeyBuilder.sectionValue(sectionKey, key), value); }
export function saveTimers(timers: Record<string, any>, { save }: { save?: SaveFn } = {}) { writer(save)(StorageKeyBuilder.timers(), timers || {}); }
export function resetSectionState(sectionKey: string, { save }: { save?: SaveFn } = {}) { const write = writer(save); write(StorageKeyBuilder.sectionCompletion(sectionKey), {}); write(StorageKeyBuilder.sectionHiddenRows(sectionKey), {}); write(StorageKeyBuilder.sectionRemovedRows(sectionKey), {}); write(StorageKeyBuilder.sectionOrder(sectionKey), []); write(StorageKeyBuilder.sectionSort(sectionKey), 'default'); write(StorageKeyBuilder.sectionShowHidden(sectionKey), false); write(StorageKeyBuilder.sectionHidden(sectionKey), false); }
export function getCustomTasks({ load }: { load?: LoadFn } = {}) { return safeArray(reader(load)(StorageKeyBuilder.customTasks(), []), []); }
export function saveCustomTasks(tasks: any[], { save }: { save?: SaveFn } = {}) { writer(save)(StorageKeyBuilder.customTasks(), safeArray(tasks, [])); return tasks; }
export function getOverviewPins({ load }: { load?: LoadFn } = {}) { return safeObject<Record<string, any>>(reader(load)(StorageKeyBuilder.overviewPins(), {}), {}); }
export function saveOverviewPins(pins: Record<string, any>, { save }: { save?: SaveFn } = {}) { writer(save)(StorageKeyBuilder.overviewPins(), safeObject(pins, {})); return pins; }
export function getTimers({ load }: { load?: LoadFn } = {}) { return safeObject<Record<string, any>>(reader(load)(StorageKeyBuilder.timers(), {}), {}); }
export function getCooldowns({ load }: { load?: LoadFn } = {}) { return safeObject<Record<string, any>>(reader(load)(StorageKeyBuilder.cooldowns(), {}), {}); }
