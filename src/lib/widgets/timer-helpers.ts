import { getTimerMinutes } from '../features/timers/timer-math.ts';

export function getRenderableHeaderStatus(status: any) {
	if (!status || typeof status !== 'object') return '';
	if (status.state === 'running' || status.state === 'ready') {
		return status.note || '';
	}
	return '';
}

export function formatTimerDurationNote(task: any, { formatDurationMs, getSettingsValue = () => ({}) }: any) {
	if (typeof task?.durationNote === 'string' && task.durationNote.trim()) {
		return task.durationNote.trim();
	}

	const minutes = getTimerMinutes(task, getSettingsValue());
	if (!minutes) return '';
	const ms = minutes * 60 * 1000;
	return `Growth time: ${formatDurationMs(ms)}`;
}

export function buildTimerLocationTask(plot: any, timerTask: any, details: any = {}) {
	const { durationNote = '', statusNote = '' } = typeof details === 'string' ? { durationNote: details } : details;

	const plotNote = plot.note || plot.locationNote || '';
	const detailLines = [];

	if (statusNote) {
		detailLines.push({ kind: 'note', text: statusNote });
	} else if (durationNote) {
		detailLines.push({ kind: 'note', text: durationNote });
	}

	if (statusNote && durationNote && statusNote !== durationNote) {
		detailLines.push({ kind: 'duration', text: durationNote });
	}

	if (plotNote) {
		detailLines.push({ kind: 'location', text: plotNote });
	}

	return {
		...plot,
		note: '',
		locationNote: '',
		durationNote: '',
		detailLines,
		wiki: plot.wiki || timerTask?.wiki || '',
		isChildRow: true,
	};
}

export function makeTimerChildStorageId(timerTaskId: string, plotId: string) {
	return `timers::${timerTaskId}::${plotId}`;
}

export function collectTimerGroupTaskIds(group: any) {
	const ids: string[] = [];
	const subgroups = Array.isArray(group?.subgroups) ? group.subgroups : [];

	subgroups.forEach((subgroup: any) => {
		if (subgroup?.isTimer && subgroup?.timerTask) {
			const timerTaskId = subgroup.timerTask.id;
			const plots = Array.isArray(subgroup.plots) ? subgroup.plots : [];
			plots.forEach((plot: any) => {
				ids.push(makeTimerChildStorageId(timerTaskId, plot.id));
			});
			return;
		}

		if (Array.isArray(subgroup?.tasks)) {
			subgroup.tasks.forEach((task: any) => ids.push(task.id));
		}
	});

	return ids;
}
