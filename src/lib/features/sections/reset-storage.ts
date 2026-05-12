import { StorageKeyBuilder } from '../../shared/storage/keys-builder.ts';
import { writer, type LoadFn, type RemoveFn, type SaveFn } from './reset-internals.ts';
export function clearCompletionFor(sectionKey: string, { save }: { load?: LoadFn; save?: SaveFn; removeKey?: RemoveFn }) { writer(save)(StorageKeyBuilder.sectionCompletion(sectionKey), {}); }
export function cleanupSectionNotifications(_sectionKey: string, _deps: { removeKey?: RemoveFn } = {}) {}
export function clearCooldownsForTaskIds(_taskIds: string[], _deps: { load?: LoadFn; save?: SaveFn } = {}) {}
export function clearSectionCompletionsOnly(sectionKey: string, { save }: { save?: SaveFn }) { writer(save)(StorageKeyBuilder.sectionCompletion(sectionKey), {}); }
