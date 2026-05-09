import { appendRows, centeredHeaderLabel, finalizeSubgroupBlock } from './section-common.ts';
import { buildRestoreEntries, restoreHiddenRow } from './section-storage.ts';
import { getRenderableHeaderStatus, makeTimerChildStorageId } from './timer-helpers.ts';
import { resetTimerRows } from './timer-reset-logic.ts';
import { buildTimerPlotRows } from './timer-row-builder.ts';

const TIMER_SECTION_KEY = 'timers';

export function renderSingleTimerGroup(tbody: HTMLElement, group: any, subgroup: any, deps: any) {
	const { isCollapsedBlock, getTimerHeaderStatus, createHeaderRow, createRightSideChildRow, formatDurationMs, context } = deps;

	const timerTask = subgroup.timerTask;
	const blockId = `group-collapse-timers-${group.id}-${timerTask.id}`;
	const collapsed = isCollapsedBlock(blockId);
	const plotIds = (Array.isArray(subgroup.plots) ? subgroup.plots : []).map((plot: any) => makeTimerChildStorageId(timerTask.id, plot.id));
	const restoreOptions = buildRestoreEntries(TIMER_SECTION_KEY, plotIds, context);
	const headerStatus = getTimerHeaderStatus?.(timerTask) || { note: '', state: 'idle' };

	const plotRows = collapsed
		? []
		: buildTimerPlotRows(
				timerTask,
				subgroup,
				createRightSideChildRow,
				formatDurationMs,
				getRenderableHeaderStatus(headerStatus),
				context
		  );

	const headerRow = createHeaderRow(centeredHeaderLabel(group.name), blockId, {
		className: 'farming-group-row farming-parent-row',
		rightText: getRenderableHeaderStatus(headerStatus),
		onResetClick: () => resetTimerRows(plotIds, context, [timerTask.id]),
		restoreOptions,
		onRestoreSelect: (taskId: string) => restoreHiddenRow(TIMER_SECTION_KEY, taskId, context),
		context,
	});

	finalizeSubgroupBlock(headerRow, plotRows, { collapsed });
	tbody.appendChild(headerRow);
	if (!collapsed) appendRows(tbody, plotRows);
}
