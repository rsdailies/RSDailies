import type { TimerDefinition, TimerGroup, TimerPlot } from '@entities/task/types';

type TimerGroupInput = TimerGroup & {
	note?: string;
};

export type ResolvedTimerSubgroup =
	| {
			id: string;
			name: string;
			isTimer: true;
			timerTask: TimerDefinition & { isTimerParent: true; vanishOnStart: boolean; plots: TimerPlot[] };
			plots: TimerPlot[];
	  }
	| {
			id: string;
			name: string;
			isTimer: false;
			tasks: TimerPlot[];
	  };

export type ResolvedTimerGroup = {
	id: string;
	name: string;
	note: string;
	subgroups: ResolvedTimerSubgroup[];
};

function normalizeTimerEntry(timer: TimerDefinition, group: TimerGroupInput, index: number) {
	const timerId = timer?.id || `${group.id}-timer-${index}`;

	return {
		...timer,
		id: timerId,
		isTimerParent: true as const,
		vanishOnStart: timer?.vanishOnStart ?? true,
		plots: Array.isArray(timer?.plots) ? timer.plots : [],
	};
}

function normalizeStandalonePlots(group: TimerGroupInput): ResolvedTimerSubgroup[] {
	if (!Array.isArray(group?.plots) || group.plots.length === 0) {
		return [];
	}

	if (Array.isArray(group?.timers) && group.timers.length > 0) {
		return [];
	}

	return [
		{
			id: `${group.id}-plots`,
			name: group.label || group.name || group.id,
			isTimer: false,
			tasks: group.plots.map((plot) => ({
				...plot,
				id: plot.id,
			})),
		},
	];
}

export function resolveTimerGroups(groups: TimerGroupInput[] = []): ResolvedTimerGroup[] {
	return Array.isArray(groups)
		? groups.map((group) => {
				const timerSubgroups = Array.isArray(group?.timers)
					? group.timers.map((timer, index) => {
							const timerTask = normalizeTimerEntry(timer, group, index);
							const plots = Array.isArray(timer?.plots) ? timer.plots : Array.isArray(group?.plots) ? group.plots : [];

							return {
								id: timerTask.id,
								name: timerTask.name || group.label || group.name || group.id,
								isTimer: true as const,
								timerTask,
								plots: plots.map((plot) => ({
									...plot,
									id: plot.id,
								})),
							};
						})
					: [];

				return {
					id: group.id,
					name: group.label || group.name || group.id,
					note: group.note || '',
					subgroups: [...timerSubgroups, ...normalizeStandalonePlots(group)],
				};
			})
		: [];
}
