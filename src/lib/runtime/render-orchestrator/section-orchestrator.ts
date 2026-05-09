import { getTrackerSections } from '../../features/sections/section-registry.ts';
import { StorageKeyBuilder } from '../../shared/storage/keys-builder.ts';
import { getSectionElements, setSectionHiddenState, setSectionModeVisibility } from './section-helpers.ts';
import { appendCustomEmptyPlaceholder } from './panel-helpers.ts';
import { renderSectionPanelHeader as renderSectionHeader } from '../../widgets/section-panel-header.ts';
import { renderTrackerSection } from '../../renderers/tracker-section-renderer.ts';

export function renderTrackerSections(sections: Record<string, any>, visibleSectionIds: Set<string>, deps: any, uiContext: any) {
	const {
		load,
		save,
		removeKey,
		bindSectionControls,
		isCollapsedBlock,
		getTimerHeaderStatus,
		renderApp,
		getSectionState,
		saveSectionValue,
		resetSectionView,
	} = deps;
	const allSectionDefinitions = getTrackerSections();

	allSectionDefinitions.forEach((sectionDefinition) => {
		const key = sectionDefinition.id;
		const { thead, tbody, table } = getSectionElements(key);
		if (!tbody) return;

		const sectionTasks = sections[key];
		const hidden = !!load(StorageKeyBuilder.sectionHidden(key), false);
		const showHidden = !!load(StorageKeyBuilder.sectionShowHidden(key), false);
		const visibleByMode = setSectionModeVisibility(key, visibleSectionIds);

		if (!visibleByMode) return;

		const sectionState = getSectionState(key, { load });
		const colspan = table?.querySelector('colgroup')?.children?.length || 3;

		if (thead) {
			thead.innerHTML = renderSectionHeader(sectionDefinition, colspan, {
				hiddenRows: sectionState.hiddenRows,
				completed: sectionState.completed,
				sectionTasks: sectionTasks || [],
			});
		}

		setSectionHiddenState(key, hidden, showHidden);
		if (hidden) {
			bindSectionControls(key, { sortable: false }, {
				renderApp,
				getSectionState: (sectionKey: string) => getSectionState(sectionKey, { load }),
				saveSectionValue: (sectionKey: string, name: string, value: any) => saveSectionValue(sectionKey, name, value, { save }),
				resetSectionView: (sectionKey: string) => resetSectionView(sectionKey, { load, save, removeKey }),
			});
			return;
		}

		renderTrackerSection(tbody as HTMLElement, sectionDefinition, sectionTasks, {
			key,
			load,
			uiContext,
			isCollapsedBlock,
			getTimerHeaderStatus,
		});

		if (key === 'custom' && tbody.children.length === 0) {
			appendCustomEmptyPlaceholder(tbody as HTMLElement);
		}

		bindSectionControls(key, { sortable: false }, {
			renderApp,
			getSectionState: (sectionKey: string) => getSectionState(sectionKey, { load }),
			saveSectionValue: (sectionKey: string, name: string, value: any) => saveSectionValue(sectionKey, name, value, { save }),
			resetSectionView: (sectionKey: string) => resetSectionView(sectionKey, { load, save, removeKey }),
		});
	});
}
