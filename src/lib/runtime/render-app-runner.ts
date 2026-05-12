import { getSettings } from '../features/settings/settings-state.ts';
import { determineTaskState } from '../state/task-state-machine.ts';

export const TIMER_SECTION_KEY = 'timers';

export function createRenderAppRunner(renderAppCore: any, deps: any) {
	const {
		load,
		save,
		getSectionState,
		getCustomTasks,
		saveCustomTasks,
		getCooldowns,
		getTimers,
		getResolvedSections,
		getTimerHeaderStatus,
		hideTask,
		setTaskCompleted,
		clearTimer,
		startTimer,
		startCooldown,
		isCollapsedBlock,
		setCollapsedBlock,
		fetchProfits,
		updateProfileHeader,
		maybeNotifyTaskAlert,
		bindSectionControls,
		getPageMode,
		getOverviewPins,
	} = deps;

	function renderApp() {
		renderAppCore({
			load,
			save,
			getSectionState: (sectionKey: string) => getSectionState(sectionKey),
			getCustomTasks,
			saveCustomTasks,
			cleanupReadyTimers: deps.cleanupReadyTimers,
			cleanupReadyCooldowns: deps.cleanupReadyCooldowns,
			hideTooltip: deps.hideTooltip,
			getTaskState: (sectionKey: string, taskId: string, task: any) => {
				const section = getSectionState(sectionKey, { load });
				const gameContext = deps.getPageMode()?.game || (typeof window !== 'undefined' && window.location.pathname.includes('/osrs/') ? 'osrs' : 'rs3');

				return determineTaskState(taskId, task, {
					sectionKey,
					hiddenRows: section.hiddenRows || {},
					completed: section.completed || {},
					cooldowns: getCooldowns(),
					timers: getTimers(),
					settings: getSettings({ load: deps.load }),
					timerSectionKey: TIMER_SECTION_KEY,
					now: Date.now(),
					gameContext,
				});
			},
			getResolvedSections,
			getTimerHeaderStatus,
			hideTask,
			setTaskCompleted,
			clearTimer,
			startTimer,
			startCooldown,
			isCollapsedBlock,
			setCollapsedBlock,
			fetchProfits,
			updateProfileHeader: () => updateProfileHeader?.(),
			maybeNotifyTaskAlert,
			bindSectionControls,
			getPageMode,
			getOverviewPins,
		});
	}

	return renderApp;
}
