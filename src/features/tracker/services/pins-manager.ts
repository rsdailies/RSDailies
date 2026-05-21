import type { PinnedTask, TrackerSection } from '@entities/task/types';
import { load } from '../../../shared/storage/storage-service.ts';
import { getTimerPlotTaskId } from '../../timers/services/timer-ids.ts';
import { getTimerMinutes } from '../../timers/services/timer-math.ts';

export function mapPinnedTasks(allSections: any[], pins: Record<string, boolean>): PinnedTask[] {
	const rows: PinnedTask[] = [];
	const settings = load('settings', {});

	for (const entry of allSections) {
		const section: TrackerSection = entry.data;

		// Standard Items
		for (const task of section.items || []) {
			const key = `${section.id}::${task.id}`;
			if (pins[key]) {
				rows.push({
					...task,
					sectionKey: section.id,
					note: task.note || section.label,
				} as PinnedTask);
			}
		}

		// Timer Groups (Flattened)
		for (const group of section.groups || []) {
			for (const plot of group.plots || []) {
				const taskId = getTimerPlotTaskId(plot.id);
				const key = `${section.id}::${taskId}`;

				if (pins[key]) {
					const minutes = getTimerMinutes(plot, settings);
					const duration = minutes > 0 ? `Growth: ${minutes} min` : group.label;

					rows.push({
						id: taskId,
						name: plot.name,
						wiki: plot.wiki,
						note: plot.note || duration,
						sectionKey: section.id,
					} as PinnedTask);
				}
			}
		}
	}
	return rows;
}
