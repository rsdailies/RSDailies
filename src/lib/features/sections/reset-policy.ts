import { getCustomTasks } from '../custom-tasks/custom-task-state.ts';
import { StorageKeyBuilder } from '../../shared/storage/keys-builder.ts';
import { writer, type LoadFn, type RemoveFn, type SaveFn } from './reset-internals.ts';
export function getResettableSectionsForFrequency(frequency: string) { return frequency === 'daily' ? ['rs3daily', 'osrsdaily'] : frequency === 'weekly' ? ['rs3weekly', 'osrsweekly'] : frequency === 'monthly' ? ['rs3monthly', 'osrsmonthly'] : frequency === 'rolling' ? ['timers'] : []; }
export function clearGatheringCompletions(_frequency: string, { save }: { load?: LoadFn; save?: SaveFn; removeKey?: RemoveFn }) { writer(save)(StorageKeyBuilder.sectionCompletion('gathering'), {}); }
export function resetCustomCompletions(frequency: string, { save }: { load?: LoadFn; save?: SaveFn; removeKey?: RemoveFn }) { if (getCustomTasks().some((task) => task.reset === frequency)) writer(save)(StorageKeyBuilder.sectionCompletion('custom'), {}); }
export function getSectionTaskIds(_sectionKey: string, _deps: { load?: LoadFn } = {}) { return []; }
