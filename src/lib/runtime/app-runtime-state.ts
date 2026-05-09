import { getPageMode } from '../features/navigation/index.ts';
import { startTimer, clearTimer, cleanupReadyTimers as cleanupReadyTimersFeature, getTimerHeaderStatus } from '../features/timers/timer-runtime.ts';
import { startCooldown, cleanupReadyCooldowns as cleanupReadyCooldownsFeature } from '../features/cooldowns/cooldown-service.ts';
import { hideTask, setTaskCompleted } from '../features/sections/task-actions.ts';
import {
	getSectionState,
	isCollapsedBlock,
	setCollapsedBlock,
	getCustomTasks,
	saveCustomTasks,
	getTimers,
	getCooldowns,
	getOverviewPins,
	saveSectionValue,
} from '../features/sections/section-state-service.ts';
import { load, save, remove as removeKey } from '../shared/storage/storage-service.ts';

export { load, save, removeKey, getPageMode, getTimerHeaderStatus, saveSectionValue };

export const getStorageDeps = () => ({ load, save, removeKey });

export const getHostedSectionState = (sectionKey: string) => getSectionState(sectionKey, { load });
export const getHostedCustomTasks = () => getCustomTasks({ load });
export const saveHostedCustomTasks = (tasks: any[]) => saveCustomTasks(tasks, { save });
export const getHostedTimers = () => getTimers({ load });
export const getHostedCooldowns = () => getCooldowns({ load });
export const getHostedOverviewPins = () => getOverviewPins({ load });
export const isHostedCollapsedBlock = (blockId: string) => isCollapsedBlock(blockId, { load });
export const setHostedCollapsedBlock = (blockId: string, collapsed: boolean) => setCollapsedBlock(blockId, collapsed, { load, save });
export const hideHostedTask = (sectionKey: string, taskId: string) => hideTask(sectionKey, taskId, { load, save });
export const setHostedTaskCompleted = (sectionKey: string, taskId: string, completed: boolean) =>
	setTaskCompleted(sectionKey, taskId, completed, { load, save });
export const clearHostedTimer = (taskId: string) => clearTimer(taskId, { load, save });
export const startHostedTimer = (task: any) => startTimer(task, { load, save });
export const startHostedCooldown = (taskId: string, minutes: number) => startCooldown(taskId, minutes, { load, save });
export const cleanupReadyTimersHosted = () => cleanupReadyTimersFeature({ load, save });
export const cleanupReadyCooldownsHosted = () => cleanupReadyCooldownsFeature({ load, save });
