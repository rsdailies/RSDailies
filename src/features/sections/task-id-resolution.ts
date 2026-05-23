import type { TimerGroup, TrackerSection, TrackerTask } from '@entities/task/types.ts';
import { getTrackerSection } from './section-registry.ts';

function flattenTaskIds(tasks: TrackerTask[] = []) {
	return tasks.flatMap((task) => {
		const childRows = Array.isArray(task.childRows) ? task.childRows.map((child) => child.id) : [];
		const children = Array.isArray(task.children) ? task.children.map((child) => child.id) : [];
		return [task.id, ...childRows, ...children].filter(Boolean);
	});
}

function flattenGroupTaskIds(sectionId: string, groups: TimerGroup[] = []) {
	return groups.flatMap((group) => {
		const timers = Array.isArray(group.timers) ? group.timers : [];
		const plots = Array.isArray(group.plots) ? group.plots : [];
		const timerChildIds = timers.flatMap((timer) => plots.map((plot) => `${sectionId}::${timer.id}::${plot.id}`));
		const plotIdsWithoutTimers = timers.length === 0 ? plots.map((plot) => plot.id) : [];
		return [...timerChildIds, ...plotIdsWithoutTimers].filter(Boolean);
	});
}

export function getContentSectionTaskIds(sectionId: string, options: { customTasks?: TrackerTask[] } = {}) {
	if (sectionId === 'custom') {
		return (options.customTasks || []).map((task) => task.id).filter(Boolean);
	}

	const section = getTrackerSection(sectionId) as TrackerSection | null;
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
	const section = getTrackerSection(sectionId) as TrackerSection | null;
	if (!section || !Array.isArray(section.items)) {
		return [];
	}

	const normalizedCadence = String(cadence || '').toLowerCase();
	const topLevelTasks = section.items.filter(
		(task) => String(task?.reset || 'daily').toLowerCase() === normalizedCadence,
	);

	return flattenTaskIds(topLevelTasks);
}
