import {
	renderStandardSection,
	renderWeekliesWithChildren,
	renderGroupedGathering,
	renderGroupedTimers,
	formatTimerDurationNote,
	buildTimerLocationTask,
} from '../widgets/tracker-sections.ts';
import { createHeaderRow } from '../widgets/header-index.ts';
import { createRow, createRightSideChildRow } from '../widgets/tracker-rows.ts';
import { applyOrderingAndSort } from '../shared/table-utils.ts';
import { formatDurationMs as formatDurationMsCore } from '../shared/time/formatters.ts';
import { nextDailyBoundary, nextWeeklyBoundary, nextMonthlyBoundary } from '../shared/time/boundaries.ts';
import { appendCustomEmptyPlaceholder, getGroupCountdown } from '../runtime/render-orchestrator/panel-helpers.ts';
import { getSettings } from '../features/settings/settings-state.ts';

function createRendererContext(sectionDefinition: any, sectionTasks: any, deps: any) {
	const { key, load, uiContext, isCollapsedBlock, getTimerHeaderStatus } = deps;

	const sortedTasks =
		sectionDefinition.renderVariant === 'timer-groups' ? [] : applyOrderingAndSort(key, Array.isArray(sectionTasks) ? sectionTasks : [], { load });

	return {
		key,
		load,
		uiContext,
		isCollapsedBlock,
		getTimerHeaderStatus,
		sectionDefinition,
		sectionTasks,
		sortedTasks,
	};
}

function renderTimerGroupsSection(tbody: HTMLElement, context: any) {
	const { sectionTasks, isCollapsedBlock, getTimerHeaderStatus, uiContext, load } = context;

	renderGroupedTimers(tbody, sectionTasks, {
		isCollapsedBlock,
		getTimerHeaderStatus,
		formatTimerDurationNote,
		buildTimerLocationTask,
		createHeaderRow,
		createRow,
		createRightSideChildRow,
		formatDurationMs: formatDurationMsCore,
		context: { ...uiContext, getSettingsValue: () => getSettings({ load }) },
	});
}

function renderGroupedSectionsSection(tbody: HTMLElement, context: any) {
	const { sortedTasks, isCollapsedBlock, uiContext } = context;

	renderGroupedGathering(tbody, sortedTasks, {
		isCollapsedBlock,
		createHeaderRow,
		createRow,
		context: uiContext,
		getGroupCountdown: (groupName: string) =>
			getGroupCountdown(groupName, {
				formatDurationMsCore,
				nextDailyBoundary,
				nextWeeklyBoundary,
				nextMonthlyBoundary,
			}),
	});
}

function renderParentChildrenSection(tbody: HTMLElement, context: any) {
	const { sortedTasks, isCollapsedBlock, uiContext } = context;

	renderWeekliesWithChildren(tbody, sortedTasks, {
		isCollapsedBlock,
		createHeaderRow,
		createRow,
		createRightSideChildRow,
		context: uiContext,
	});
}

function renderStandardTrackerSection(tbody: HTMLElement, context: any) {
	const { key, sortedTasks, uiContext } = context;
	renderStandardSection(tbody, key, sortedTasks, { createRow, context: uiContext });
}

export const TRACKER_SECTION_RENDERERS = Object.freeze({
	'timer-groups': renderTimerGroupsSection,
	'grouped-sections': renderGroupedSectionsSection,
	'parent-children': renderParentChildrenSection,
	standard: renderStandardTrackerSection,
});

export function renderTrackerSection(tbody: HTMLElement, sectionDefinition: any, sectionTasks: any, deps: any) {
	const { key } = deps;

	if (!sectionTasks) {
		if (key === 'custom') {
			appendCustomEmptyPlaceholder(tbody);
		}
		return;
	}

	const rendererContext = createRendererContext(sectionDefinition, sectionTasks, deps);
	const renderSection = TRACKER_SECTION_RENDERERS[sectionDefinition.renderVariant as keyof typeof TRACKER_SECTION_RENDERERS] || TRACKER_SECTION_RENDERERS.standard;
	renderSection(tbody, rendererContext);
}
