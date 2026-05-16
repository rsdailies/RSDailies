function normalizeTimerEntry(timer: any, group: any, index: number) {
	const timerId = timer?.id || `${group.id}-timer-${index}`;

	return {
		...timer,
		id: timerId,
		isTimerParent: true,
		vanishOnStart: timer?.vanishOnStart ?? true,
		plots: Array.isArray(timer?.plots) ? timer.plots : [],
	};
}

function normalizeStandalonePlots(group: any) {
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
			tasks: group.plots.map((plot: any) => ({
				...plot,
				id: plot.id,
			})),
		},
	];
}

export function resolveTimerGroups(groups: any[]) {
	return Array.isArray(groups)
		? groups.map((group) => {
				const timerSubgroups = Array.isArray(group?.timers)
					? group.timers.map((timer: any, index: number) => {
							const timerTask = normalizeTimerEntry(timer, group, index);
							const plots = Array.isArray(timer?.plots)
								? timer.plots
								: Array.isArray(group?.plots)
									? group.plots
									: [];

							return {
								id: timerTask.id,
								name: timerTask.name || group.label || group.name || group.id,
								isTimer: true,
								timerTask,
								plots: plots.map((plot: any) => ({
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
