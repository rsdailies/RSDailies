import {
  getSectionElements,
  setSectionHiddenState,
  setSectionModeVisibility
} from './section-helpers.js';
import { renderSectionPanelHeader as renderSectionHeader } from '../../../ui/components/headers/section-panel-header.js';
import { appendCustomEmptyPlaceholder } from './panel-helpers.js';
import { getTrackerSections } from '../../registries/unified-registry.js';
import { renderTrackerSection } from '../../../ui/renderers/tracker-section-renderer.js';
import { StorageKeyBuilder } from '../../../core/storage/keys-builder.js';

/**
 * Iterates over all tracker sections and renders them based on current state and mode.
 */
export function renderTrackerSections(sections, visibleSectionIds, deps, uiContext) {
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
    resetSectionView
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

    console.log(`[SectionOrchestrator] Section: ${key}`, {
      hasTasks: !!sectionTasks,
      taskCount: Array.isArray(sectionTasks) ? sectionTasks.length : 0,
      visibleByMode,
      hidden
    });

    if (!visibleByMode) return;

    const sectionState = getSectionState(key, { load });
    const colspan = table?.querySelector('colgroup')?.children?.length || 3;

    if (thead) {
      thead.innerHTML = renderSectionHeader(sectionDefinition, colspan, {
        hiddenRows: sectionState.hiddenRows,
        sectionTasks: sectionTasks || []
      });
    }

    setSectionHiddenState(key, hidden, showHidden);
    if (hidden) {
      bindSectionControls(key, { sortable: false }, {
        renderApp,
        getSectionState: (k) => getSectionState(k, { load }),
        saveSectionValue: (k, n, v) => saveSectionValue(k, n, v, { save }),
        resetSectionView: (k) => resetSectionView(k, { load, save, removeKey }),
      });
      return;
    }

    renderTrackerSection(tbody, sectionDefinition, sectionTasks, {
      key,
      load,
      uiContext,
      isCollapsedBlock,
      getTimerHeaderStatus,
    });

    if (key === 'custom' && tbody.children.length === 0) {
      // Helper check if placeholder is needed
      if (typeof appendCustomEmptyPlaceholder === 'function') {
        appendCustomEmptyPlaceholder(tbody);
      }
    }
    bindSectionControls(key, { sortable: false }, {
      renderApp,
      getSectionState: (k) => getSectionState(k, { load }),
      saveSectionValue: (k, n, v) => saveSectionValue(k, n, v, { save }),
      resetSectionView: (k) => resetSectionView(k, { load, save, removeKey }),
    });
  });
}
