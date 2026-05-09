import { getTrackerSectionIds } from '../domain/legacy-mode-content.ts';

export function bindRuntimeSections({
	bindSectionControls,
	renderApp,
	getSectionState,
	saveSectionValue,
	resetSectionView,
	clearSectionCompletionsOnly,
	load,
	save,
	removeKey,
}: any) {
	getTrackerSectionIds().forEach((sectionKey: string) =>
		bindSectionControls(sectionKey, { sortable: true }, {
			renderApp,
			getSectionState: (key: string) => getSectionState(key, { load }),
			saveSectionValue: (key: string, name: string, value: any) => saveSectionValue(key, name, value, { save }),
			resetSectionView: (key: string) => resetSectionView(key, { load, save, removeKey }),
			clearSectionCompletionsOnly: (key: string) => clearSectionCompletionsOnly(key, { load, save }),
			load,
			save,
		})
	);
}
