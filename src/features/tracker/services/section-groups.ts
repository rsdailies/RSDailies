import type { TaskDetailLine, TaskGroup, TrackerSection, TrackerTask } from '@entities/task/types';
import { getSettings } from '@features/settings/settings-service';
import { getTimerPlotTaskId } from '@features/timers/services/timer-ids.ts';
import { getTimerMinutes } from '@features/timers/services/timer-math.ts';

function formatMinutes(minutes: number) {
	if (!Number.isFinite(minutes) || minutes <= 0) return '';
	if (minutes < 60) return `${minutes} min`;
	const hours = Math.floor(minutes / 60);
	const rest = minutes % 60;
	return rest ? `${hours}h ${rest}m` : `${hours}h`;
}

function buildTimerDetailLines(task: TrackerTask): TaskDetailLine[] {
	const minutes = getTimerMinutes(task, getSettings()) || 0;
	const detailLines: TaskDetailLine[] = [];

	if (minutes > 0) {
		detailLines.push({
			kind: 'duration',
			text: `Growth: ${formatMinutes(minutes)}`,
		});
	}

	return detailLines;
}

function mapTimerGroupTasks(section: TrackerSection) {
	return (section.groups || []).map((group) => ({
		id: `timer-group-${group.id}`,
		name: group.label || group.name || group.id,
		tasks: (group.plots || []).map(
			(plot) =>
				({
					id: getTimerPlotTaskId(plot.id),
					name: plot.name,
					wiki: plot.wiki,
					note: plot.locationNote || plot.note || '',
					detailLines: buildTimerDetailLines({
						...plot,
						note: plot.locationNote || plot.note || '',
					}),
					cooldownMinutes: getTimerMinutes(plot, getSettings()),
					timerId: plot.id,
				}) satisfies TrackerTask,
		),
	})) satisfies TaskGroup[];
}

export function buildSectionTaskGroups(section: TrackerSection, tasks: TrackerTask[] = []) {
	if (section.renderVariant === 'timer-groups') {
		return mapTimerGroupTasks(section);
	}

	if (section.renderVariant === 'grouped-sections' || section.id === 'gathering') {
		const dailies = tasks.filter((task) => task.reset === 'daily');
		const weeklies = tasks.filter((task) => task.reset === 'weekly');
		return [
			{ id: `${section.id}-daily`, name: 'Daily', tasks: dailies },
			{ id: `${section.id}-weekly`, name: 'Weekly', tasks: weeklies },
		].filter((group) => group.tasks.length > 0);
	}

	return [{ id: 'default', name: '', tasks }];
}
