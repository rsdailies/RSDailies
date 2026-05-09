function buildSectionValueKey(sectionKey: string, key: string) {
  return `${key}:${sectionKey}`;
}

export const StorageKeyBuilder = Object.freeze({
  schemaVersion() {
    return 'schemaVersion';
  },

  settings() {
    return 'settings';
  },

  lastVisit() {
    return 'lastVisit';
  },

  overviewPins() {
    return 'overviewPins';
  },

  customTasks() {
    return 'customTasks';
  },

  timers() {
    return 'timers';
  },

  cooldowns() {
    return 'cooldowns';
  },

  collapsedBlocks() {
    return 'collapsedBlocks';
  },

  sectionValue(sectionKey: string, key: string) {
    return buildSectionValueKey(sectionKey, key);
  },

  sectionCompletion(sectionKey: string) {
    return buildSectionValueKey(sectionKey, 'completed');
  },

  sectionHiddenRows(sectionKey: string) {
    return buildSectionValueKey(sectionKey, 'hiddenRows');
  },

  sectionSort(sectionKey: string) {
    return buildSectionValueKey(sectionKey, 'sort');
  },

  sectionOrder(sectionKey: string) {
    return buildSectionValueKey(sectionKey, 'order');
  },

  sectionRemovedRows(sectionKey: string) {
    return buildSectionValueKey(sectionKey, 'removedRows');
  },

  sectionHidden(sectionKey: string) {
    return buildSectionValueKey(sectionKey, 'hideSection');
  },

  sectionShowHidden(sectionKey: string) {
    return buildSectionValueKey(sectionKey, 'showHidden');
  },

  childTaskStorageId(sectionKey: string, parentId: string, childId: string) {
    return `${sectionKey}::${parentId}::${childId}`;
  },

  overviewPinStorageId(sectionKey: string, taskId: string) {
    return `${sectionKey}::${taskId}`;
  },
});

export function getSectionStorageKeys(sectionKey: string) {
  return {
    completion: StorageKeyBuilder.sectionCompletion(sectionKey),
    hiddenRows: StorageKeyBuilder.sectionHiddenRows(sectionKey),
    removedRows: StorageKeyBuilder.sectionRemovedRows(sectionKey),
    hidden: StorageKeyBuilder.sectionHidden(sectionKey),
    showHidden: StorageKeyBuilder.sectionShowHidden(sectionKey),
    sort: StorageKeyBuilder.sectionSort(sectionKey),
    order: StorageKeyBuilder.sectionOrder(sectionKey),
  };
}
