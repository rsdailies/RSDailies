import { StorageKeyBuilder } from '@shared/storage/keys-builder';
import * as StorageService from '@shared/storage/storage-service';

export interface CustomTask { id: string; name: string; note?: string; reset: 'daily' | 'weekly' | 'monthly' | 'never'; game: 'rs3' | 'osrs' }
function uuid() { return typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`; }
function sanitizeTask(task: Partial<CustomTask>): CustomTask | null {
	const name = String(task.name || '').trim();
	if (!name) return null;
	return { id: String(task.id || `custom-${uuid()}`), name, note: String(task.note || '').trim(), reset: task.reset === 'weekly' || task.reset === 'monthly' || task.reset === 'never' ? task.reset : 'daily', game: task.game === 'osrs' ? 'osrs' : 'rs3' };
}
export function getCustomTasks(game: string | null = null) {
	const tasks = StorageService.load<CustomTask[]>(StorageKeyBuilder.customTasks(), []);
	const list = Array.isArray(tasks) ? tasks.filter(Boolean) : [];
	return game ? list.filter((task) => task.game === game) : list;
}
export function saveCustomTasks(tasks: CustomTask[]) { StorageService.save(StorageKeyBuilder.customTasks(), tasks); return tasks; }
export function upsertCustomTask(task: Partial<CustomTask>) {
	const nextTask = sanitizeTask(task);
	if (!nextTask) return getCustomTasks();
	const tasks = getCustomTasks();
	const index = tasks.findIndex((entry) => entry.id === nextTask.id);
	if (index >= 0) tasks[index] = nextTask; else tasks.push(nextTask);
	return saveCustomTasks(tasks);
}
export function removeCustomTask(taskId: string) { return saveCustomTasks(getCustomTasks().filter((task) => task.id !== taskId)); }
