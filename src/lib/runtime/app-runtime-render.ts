import { getTrackerSectionIds } from '../features/sections/section-registry.ts';
import { syncPenguinWeeklyData, isPenguinSyncEnabled } from '../features/penguins/penguin-sync.ts';
import { bindRuntimeSections } from './app-section-bindings.ts';
import { clearSectionCompletionsOnly as clearSectionCompletionsOnlyFeature, resetSectionView } from '../features/sections/reset-view.ts';
import { bindSectionControls } from '../features/sections/section-controls.ts';
import {
	load,
	save,
	removeKey,
	getHostedSectionState,
	saveSectionValue,
} from './app-runtime-state.ts';

export function setupSectionBindings() {
	bindRuntimeSections({
		getTrackerSectionIds,
		bindSectionControls,
		getSectionState: getHostedSectionState,
		saveSectionValue,
		resetSectionView,
		clearSectionCompletionsOnly: clearSectionCompletionsOnlyFeature,
		load,
		save,
		removeKey,
	});
}

export const startPenguinSync = () => syncPenguinWeeklyData({ load, save });
export const canStartPenguinSync = () => isPenguinSyncEnabled();
