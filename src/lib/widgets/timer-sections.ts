import { appendRows, centeredHeaderLabel, finalizeSubgroupBlock } from './section-common.ts';
import { collectTimerGroupTaskIds, getRenderableHeaderStatus, makeTimerChildStorageId } from './timer-helpers.ts';
import { buildRestoreEntries, resetTaskList, restoreHiddenRow } from './section-storage.ts';
import { resetTimerRows } from './timer-reset-logic.ts';
import { buildTimerPlotRows } from './timer-row-builder.ts';
import { renderSingleTimerGroup } from './timer-group-renderer.ts';

const TIMER_SECTION_KEY = 'timers';

export function renderGroupedTimers(tbody: HTMLElement, groups: any[], deps: any) {
	const {
		isCollapsedBlock,
		getTimerHeaderStatus,
		createHeaderRow,
		createRow,
		createRightSideChildRow,
		formatDurationMs,
		context,
	} = deps;
	if (!tbody) return;

	groups.forEach((group, groupIndex, allGroups) => {
		const subgroups = Array.isArray(group.subgroups) ? group.subgroups : [];

		if (subgroups.length === 1 && subgroups[0]?.isTimer && subgroups[0]?.timerTask) {
			renderSingleTimerGroup(tbody, group, subgroups[0], deps);
			return;
		}

		const groupBlockId = `group-collapse-timers-parent-${group.id}`;
		const groupCollapsed = isCollapsedBlock(groupBlockId);
		const groupTaskIds = collectTimerGroupTaskIds(group);
		const groupRestoreOptions = buildRestoreEntries(TIMER_SECTION_KEY, groupTaskIds, context);

		const groupRows: HTMLElement[] = [];

		subgroups.forEach((subgroup: any, subgroupIndex: number) => {
			if (subgroup.isTimer && subgroup.timerTask) {
				const timerTask = subgroup.timerTask;
				const blockId = `group-collapse-timers-${group.id}-${timerTask.id}`;
				const collapsed = isCollapsedBlock(blockId);
				const plotIds = (Array.isArray(subgroup.plots) ? subgroup.plots : []).map((plot: any) =>
					makeTimerChildStorageId(timerTask.id, plot.id)
				);
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

				const subgroupHeader = createHeaderRow(centeredHeaderLabel(subgroup.name), blockId, {
					className: 'farming-subgroup-row farming-subheader-row farming-timer-subgroup-row',
					rightText: getRenderableHeaderStatus(headerStatus),
					onResetClick: () => resetTimerRows(plotIds, context, [timerTask.id]),
					restoreOptions,
					onRestoreSelect: (taskId: string) => restoreHiddenRow(TIMER_SECTION_KEY, taskId, context),
					context,
				});

				const isLastSubgroup = groupIndex === allGroups.length - 1 && subgroupIndex === subgroups.length - 1;
				finalizeSubgroupBlock(subgroupHeader, plotRows, { collapsed, skipEdgeClasses: !isLastSubgroup });
				groupRows.push(subgroupHeader, ...plotRows);
				return;
			}

			if (Array.isArray(subgroup.tasks) && subgroup.tasks.length > 0) {
				const blockId = `group-collapse-timers-${group.id}-${subgroup.id}`;
				const collapsed = isCollapsedBlock(blockId);
				const taskIds = subgroup.tasks.map((task: any) => task.id);
				const restoreOptions = buildRestoreEntries(TIMER_SECTION_KEY, taskIds, context);
				const rows: HTMLElement[] = [];
				if (!collapsed) {
					subgroup.tasks.forEach((task: any) => {
						const row = createRow(TIMER_SECTION_KEY, task, { context });
						if (row) rows.push(row);
					});
				}

				const subgroupHeader = createHeaderRow(centeredHeaderLabel(subgroup.name), blockId, {
					className: 'farming-subgroup-row farming-subheader-row farming-plain-subgroup-row',
					onResetClick: () => resetTaskList(TIMER_SECTION_KEY, subgroup.tasks, context),
					restoreOptions,
					onRestoreSelect: (taskId: string) => restoreHiddenRow(TIMER_SECTION_KEY, taskId, context),
					context,
				});

				const isLastSubgroup = groupIndex === allGroups.length - 1 && subgroupIndex === subgroups.length - 1;
				finalizeSubgroupBlock(subgroupHeader, rows, { collapsed, skipEdgeClasses: !isLastSubgroup });
				groupRows.push(subgroupHeader, ...rows);
			}
		});

		const groupHeader = createHeaderRow(centeredHeaderLabel(group.name), groupBlockId, {
			className: 'farming-group-row farming-parent-row',
			onResetClick: () => {
				const timerIds = subgroups
					.filter((subgroup: any) => subgroup?.isTimer && subgroup?.timerTask?.id)
					.map((subgroup: any) => subgroup.timerTask.id);
				resetTimerRows(groupTaskIds, context, timerIds);
			},
			restoreOptions: groupRestoreOptions,
			onRestoreSelect: (taskId: string) => restoreHiddenRow(TIMER_SECTION_KEY, taskId, context),
			context,
		});

		finalizeSubgroupBlock(groupHeader, groupRows, { collapsed: groupCollapsed });
		tbody.appendChild(groupHeader);
		if (!groupCollapsed) appendRows(tbody, groupRows);
	});
}
