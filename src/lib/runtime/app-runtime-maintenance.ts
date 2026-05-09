import {
	applySettingsToDom as applySettingsToDomFeature,
	getSettings,
} from './settings-controller.ts';
import { checkAutoReset as checkAutoResetFeature } from '../features/sections/auto-reset.ts';
import { clearSectionCompletionsOnly as clearSectionCompletionsOnlyFeature } from '../features/sections/reset-view.ts';
import { createRuntimeMaintenance } from './app-maintenance.ts';
import { getStorageDeps, cleanupReadyTimersHosted, cleanupReadyCooldownsHosted, save } from './app-runtime-state.ts';

const maintenance = createRuntimeMaintenance({
	applySettingsToDomFeature,
	getSettings,
	checkAutoResetFeature,
	getStorageDeps,
	documentRef: document,
});

export const applySettingsToDom = maintenance.applySettingsToDom;
export const checkAutoReset = maintenance.checkAutoReset;
export const updateCountdowns = maintenance.updateCountdowns;
export { cleanupReadyTimersHosted, cleanupReadyCooldownsHosted };
export const cleanupReadyTimers = cleanupReadyTimersHosted;
export const cleanupReadyCooldowns = cleanupReadyCooldownsHosted;
export const clearSectionCompletionsOnlyHosted = (key: string, deps?: { save?: typeof save }) =>
	clearSectionCompletionsOnlyFeature(key, deps);
export const clearSectionCompletionsOnly = clearSectionCompletionsOnlyHosted;
export const clearSectionCompletionsOnlyRuntime = clearSectionCompletionsOnlyHosted;
