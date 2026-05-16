import { StorageKeyBuilder } from '@shared/storage/keys-builder';
import { writer, type LoadFn, type RemoveFn, type SaveFn } from './reset-internals.ts';
export function resetSectionView(sectionKey: string, { save }: { load?: LoadFn; save?: SaveFn; removeKey?: RemoveFn }) {
	const write = writer(save);
	write(StorageKeyBuilder.sectionCompletion(sectionKey), {});
	write(StorageKeyBuilder.sectionHiddenRows(sectionKey), {});
	write(StorageKeyBuilder.sectionRemovedRows(sectionKey), {});
	write(StorageKeyBuilder.sectionOrder(sectionKey), []);
	write(StorageKeyBuilder.sectionSort(sectionKey), 'default');
	write(StorageKeyBuilder.sectionShowHidden(sectionKey), false);
	write(StorageKeyBuilder.sectionHidden(sectionKey), false);
	if (sectionKey === 'timers') write(StorageKeyBuilder.timers(), {});
}
export function clearSectionCompletionsOnly(sectionKey: string, { save }: { save?: SaveFn }) { writer(save)(StorageKeyBuilder.sectionCompletion(sectionKey), {}); }
