import {
  getSectionElements,
  setSectionHiddenState,
  setSectionModeVisibility
} from './section-helpers.js';
import { appendCustomEmptyPlaceholder } from './panel-helpers.js';
import { getTrackerSections } from '../../registries/unified-registry.js';
import { renderTrackerSection } from '../../../ui/renderers/tracker-section-renderer.js';
import { StorageKeyBuilder } from '../../../core/storage/keys-builder.js';

/**
 * Iterates over all tracker sections and renders them based on current state and mode.
 */
export function renderTrackerSections(sections, visibleSectionIds, deps, uiContext) {
  const { load, bindSectionControls, isCollapsedBlock, getTimerHeaderStatus } = deps;
  const allSectionDefinitions = getTrackerSections();

  allSectionDefinitions.forEach((sectionDefinition) => {
    const key = sectionDefinition.id;
    const { tbody } = getSectionElements(key);
    if (!tbody) return;

    const sectionTasks = sections[key];
    const hidden = !!load(StorageKeyBuilder.sectionHidden(key), false);
    const showHidden = !!load(StorageKeyBuilder.sectionShowHidden(key), false);
    const visibleByMode = setSectionModeVisibility(key, visibleSectionIds);
    if (!visibleByMode) return;

    setSectionHiddenState(key, hidden, showHidden);
    if (hidden) {
      bindSectionControls(key, { sortable: false });
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
    bindSectionControls(key, { sortable: false });
  });
}
