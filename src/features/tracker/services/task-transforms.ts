import type { TrackerTask } from '@entities/task/types.ts';
import { load } from '@shared/storage/storage-service';

/**
 * Injects dynamic sub-data into specific tasks (e.g., Penguin Hide and Seek locations for RS3 Weekly).
 */
export function transformTasks(tasks: TrackerTask[], sectionId: string): TrackerTask[] {
	if (sectionId === 'rs3weekly') {
		return injectPenguinData(tasks);
	}
	return tasks;
}

function injectPenguinData(sourceTasks: TrackerTask[]) {
	// Note: We check window inside load(), but we keep the logic consistent with the original.
	const penguinData = load<Record<string, Partial<TrackerTask>>>('penguinWeeklyData', {});

	return sourceTasks.map((task) => {
		if (task.id !== 'penguins' || !task.childRows) return task;
		return {
			...task,
			childRows: task.childRows.map((child) => ({
				...child,
				name: penguinData?.[child.id]?.name || child.name,
				note: penguinData?.[child.id]?.note || child.note,
			})),
		};
	});
}
