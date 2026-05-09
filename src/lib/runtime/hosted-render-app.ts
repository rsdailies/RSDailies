import { GAMES, getSelectedGame } from './game-context.ts';
import { resolveTrackerSections } from '../domain/legacy-mode-content.ts';
import { createRenderAppRunner } from './render-app-runner.ts';

export function createRuntimeRenderApp({
	renderAppCore,
	load,
	save,
	getSectionState,
	getCustomTasks,
	saveCustomTasks,
	getCooldowns,
	getTimers,
	cleanupReadyTimers,
	cleanupReadyCooldowns,
	hideTooltip,
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
	saveSectionValue,
	resetSectionView,
	getPageMode,
	getOverviewPins,
	removeKey,
}: any) {
	let renderApp = () => {};

	renderApp = createRenderAppRunner(renderAppCore, {
		load,
		save,
		getSectionState: (sectionKey: string) => getSectionState(sectionKey, { load }),
		getCustomTasks: () => getCustomTasks({ load }),
		saveCustomTasks: (tasks: any[]) => saveCustomTasks(tasks, { save }),
		getCooldowns: () => getCooldowns({ load }),
		getTimers: () => getTimers({ load }),
		cleanupReadyTimers: () => cleanupReadyTimers({ load, save }),
		cleanupReadyCooldowns: () => cleanupReadyCooldowns({ load, save }),
		hideTooltip: () => hideTooltip(document),
		getResolvedSections: (game: string | null = null) =>
			resolveTrackerSections({
				game: game || (getSelectedGame() === GAMES.OSRS ? GAMES.OSRS : GAMES.RS3),
				getCustomTasks: () => getCustomTasks({ load }),
				getPenguinWeeklyData: () => load('penguinWeeklyData', {}),
			}),
		getTimerHeaderStatus: (task: any) => getTimerHeaderStatus(task, { load }),
		hideTask: (sectionKey: string, taskId: string) => hideTask(sectionKey, taskId, { load, save }),
		setTaskCompleted: (sectionKey: string, taskId: string, completed: boolean) =>
			setTaskCompleted(sectionKey, taskId, completed, { load, save }),
		clearTimer: (taskId: string) => clearTimer(taskId, { load, save }),
		startTimer: (task: any) => startTimer(task, { load, save }),
		startCooldown: (taskId: string, minutes: number) => startCooldown(taskId, minutes, { load, save }),
		isCollapsedBlock: (blockId: string) => isCollapsedBlock(blockId, { load }),
		setCollapsedBlock: (blockId: string, collapsed: boolean) => setCollapsedBlock(blockId, collapsed, { load, save }),
		fetchProfits,
		updateProfileHeader,
		maybeNotifyTaskAlert: (task: any, sectionKey: string) => maybeNotifyTaskAlert(task, sectionKey, { load, save }),
		bindSectionControls: (sectionKey: string, opts: any) =>
			bindSectionControls(sectionKey, opts, {
				renderApp,
				getSectionState: (key: string) => getSectionState(key, { load }),
				saveSectionValue: (key: string, name: string, value: any) => saveSectionValue(key, name, value, { save }),
				resetSectionView: (key: string) => resetSectionView(key, { load, save, removeKey }),
			}),
		getPageMode,
		getOverviewPins: () => getOverviewPins({ load }),
	});

	return renderApp;
}
