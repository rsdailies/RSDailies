import { StorageKeyBuilder } from '../../shared/storage/keys-builder.ts';

export function childStorageKey(sectionKey: string, parentId: string, childId: string) {
	return StorageKeyBuilder.childTaskStorageId(sectionKey, parentId, childId);
}

export function buildPinId(
	sectionKey: string,
	task: any,
	options: { overviewPinId?: string | null; customStorageId?: string | null } = {}
) {
	if (options.overviewPinId) return options.overviewPinId;
	if (typeof options.customStorageId === 'string' && options.customStorageId.includes('::')) return options.customStorageId;
	return StorageKeyBuilder.overviewPinStorageId(sectionKey, task.id);
}
