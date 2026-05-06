import { getTrackerSectionIdMaps } from '../../app/registries/unified-registry.js';

export const SECTION_CONTAINER_IDS = new Proxy({}, {
  get(target, prop) {
    return getTrackerSectionIdMaps().containerIds[prop];
  }
});

export const SECTION_TABLE_IDS = new Proxy({}, {
  get(target, prop) {
    return getTrackerSectionIdMaps().tableIds[prop];
  }
});
