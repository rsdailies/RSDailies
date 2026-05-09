import { buildTimerLocationTask, formatTimerDurationNote } from './timer-helpers.ts';

const TIMER_SECTION_KEY = 'timers';

export function buildTimerPlotRows(
	timerTask: any,
	subgroup: any,
	createRightSideChildRow: any,
	formatDurationMs: (diff: number) => string,
	statusNote: string,
	context: any
) {
	const durationNote = formatTimerDurationNote(timerTask, {
		formatDurationMs,
		getSettingsValue: context.getSettingsValue,
	});
	const plots = Array.isArray(subgroup.plots) ? subgroup.plots : [];
	const rows: HTMLElement[] = [];

	plots.forEach((plot: any) => {
		const childTask = buildTimerLocationTask(plot, timerTask, { durationNote, statusNote });
		const childRow = createRightSideChildRow(TIMER_SECTION_KEY, childTask, timerTask.id, {
			extraClass: 'farming-child-row',
			context,
		});
		if (childRow) rows.push(childRow);
	});

	return rows;
}
