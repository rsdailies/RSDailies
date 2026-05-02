import { getTrackerSectionIds } from '../../../registries/unified-registry.js';

export function bindRuntimeSections({
  bindSectionControls,
  renderApp,
  getSectionState,
  saveSectionValue,
  resetSectionView,
  load,
  save,
  removeKey,
}) {
  getTrackerSectionIds().forEach((sectionKey) => bindSectionControls(sectionKey, { sortable: true }, {
    renderApp,
    getSectionState: (key) => getSectionState(key, load),
    saveSectionValue: (key, name, value) => saveSectionValue(key, name, value, save),
    resetSectionView: (key) => resetSectionView(key, { load, save, removeKey }),
  }));
}
