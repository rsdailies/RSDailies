import { StorageKeyBuilder } from '@shared/storage/keys-builder';
import { getSectionState, saveSectionValue } from './section-state-service.ts';
type LoadFn = <T = any>(key: string, fallback?: T) => T;
type SaveFn = (key: string, value: any) => void;
export function setTaskCompleted(sectionKey: string, taskId: string, completed: boolean, { load, save }: { load?: LoadFn; save?: SaveFn }) { const section = getSectionState(sectionKey, { load }); if (completed) section.completed[taskId] = true; else delete section.completed[taskId]; saveSectionValue(sectionKey, 'completed', section.completed, { save }); }
export function hideTask(sectionKey: string, taskId: string, { load, save }: { load?: LoadFn; save?: SaveFn }) { const section = getSectionState(sectionKey, { load }); section.hiddenRows[taskId] = true; saveSectionValue(sectionKey, 'hiddenRows', section.hiddenRows, { save }); }
export function restoreTask(sectionKey: string, taskId: string, { load, save }: { load?: LoadFn; save?: SaveFn }) { const section = getSectionState(sectionKey, { load }); delete section.hiddenRows[taskId]; saveSectionValue(sectionKey, 'hiddenRows', section.hiddenRows, { save }); }
export function restoreAllTasks(sectionKey: string, { save }: { save?: SaveFn }) { saveSectionValue(sectionKey, 'hiddenRows', {}, { save }); }
export function clearCompletions(sectionKey: string, { save }: { save?: SaveFn }) { saveSectionValue(sectionKey, 'completed', {}, { save }); }
export { StorageKeyBuilder };
