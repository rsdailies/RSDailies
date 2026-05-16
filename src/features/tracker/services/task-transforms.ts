import { load } from '@shared/storage/storage-service';

/**
 * Injects dynamic sub-data into specific tasks (e.g., Penguin Hide and Seek locations for RS3 Weekly).
 */
export function transformTasks(tasks: any[], sectionId: string): any[] {
	if (sectionId === 'rs3weekly') {
		return injectPenguinData(tasks);
	}
	return tasks;
}

function injectPenguinData(sourceTasks: any[]) {
	// Note: We check window inside load(), but we keep the logic consistent with the original.
	const penguinData = load('penguinWeeklyData', {} as Record<string, any>);
	
	return sourceTasks.map((task) => {
		if (task.id !== 'penguins' || !task.childRows) return task;
		return {
			...task,
			childRows: task.childRows.map((child: any) => ({
				...child,
				name: penguinData?.[child.id]?.name || child.name,
				note: penguinData?.[child.id]?.note || child.note,
			})),
		};
	});
}
