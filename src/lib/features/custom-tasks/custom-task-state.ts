import { StorageKeyBuilder } from '../../shared/storage/keys-builder.ts';
import * as StorageService from '../../shared/storage/storage-service.ts';

export interface CustomTask {
	id: string;
	name: string;
	note?: string;
	reset: 'daily' | 'weekly' | 'monthly' | 'never';
	game: 'rs3' | 'osrs';
}

function sanitizeTask(task: Partial<CustomTask>): CustomTask | null {
	const name = String(task.name || '').trim();
	if (!name) return null;

	return {
		id: String(task.id || `custom-${crypto.randomUUID()}`),
		name,
		note: String(task.note || '').trim(),
		reset: task.reset === 'weekly' || task.reset === 'monthly' || task.reset === 'never' ? task.reset : 'daily',
		game: task.game === 'osrs' ? 'osrs' : 'rs3',
	};
}

export function getCustomTasks() {
	const tasks = StorageService.load<CustomTask[]>(StorageKeyBuilder.customTasks(), []);
	return Array.isArray(tasks) ? tasks.filter(Boolean) : [];
}

export function saveCustomTasks(tasks: CustomTask[]) {
	StorageService.save(StorageKeyBuilder.customTasks(), tasks);
	return tasks;
}

export function upsertCustomTask(task: Partial<CustomTask>) {
	const nextTask = sanitizeTask(task);
	if (!nextTask) return getCustomTasks();

	const tasks = getCustomTasks();
	const index = tasks.findIndex((entry) => entry.id === nextTask.id);

	if (index >= 0) {
		tasks[index] = nextTask;
	} else {
		tasks.push(nextTask);
	}

	return saveCustomTasks(tasks);
}

export function removeCustomTask(taskId: string) {
	const tasks = getCustomTasks().filter((task) => task.id !== taskId);
	return saveCustomTasks(tasks);
}
