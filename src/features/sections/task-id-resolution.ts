import { getTrackerSection } from './section-registry.ts';

function flattenTaskIds(tasks: any[] = []) {
	return tasks.flatMap((task) => {
		const childRows = Array.isArray(task.childRows) ? task.childRows.map((child: any) => child.id) : [];
		const children = Array.isArray(task.children) ? task.children.map((child: any) => child.id) : [];
		return [task.id, ...childRows, ...children].filter(Boolean);
	});
}

function flattenGroupTaskIds(sectionId: string, groups: any[] = []) {
	return groups.flatMap((group) => {
		const timers = Array.isArray(group.timers) ? group.timers : [];
		const plots = Array.isArray(group.plots) ? group.plots : [];
		const timerChildIds = timers.flatMap((timer: any) => plots.map((plot: any) => `${sectionId}::${timer.id}::${plot.id}`));
		const plotIdsWithoutTimers = timers.length === 0 ? plots.map((plot: any) => plot.id) : [];
		return [...timerChildIds, ...plotIdsWithoutTimers].filter(Boolean);
	});
}

export function getContentSectionTaskIds(sectionId: string, options: { customTasks?: any[] } = {}) {
	if (sectionId === 'custom') {
		return (options.customTasks || []).map((task: any) => task.id).filter(Boolean);
	}

	const section = getTrackerSection(sectionId) as any;
	if (!section) return [];

	if (Array.isArray(section.items) && section.items.length > 0) {
		return flattenTaskIds(section.items);
	}

	if (Array.isArray(section.groups) && section.groups.length > 0) {
		return flattenGroupTaskIds(sectionId, section.groups);
	}

	return [];
}

export function getContentSectionTaskIdsByCadence(sectionId: string, cadence: string) {
	const section = getTrackerSection(sectionId) as any;
	if (!section || !Array.isArray(section.items)) {
		return [];
	}

	const normalizedCadence = String(cadence || '').toLowerCase();
	const topLevelTasks = section.items.filter((task: any) => String(task?.reset || 'daily').toLowerCase() === normalizedCadence);
	
	return flattenTaskIds(topLevelTasks);
}
