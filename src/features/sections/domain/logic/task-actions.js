import { getSectionState as getSectionStateFeature, saveSectionValue as saveSectionValueFeature, saveTimers as saveTimersFeature } from '../state.js';
import { StorageKeyBuilder } from '../../../../core/storage/keys-builder.js';
import { TIMER_SECTION_KEY } from '../../../timers/domain/timers.js';

export function setTaskCompleted(sectionKey, taskId, completed, { load, save }) {
  const section = getSectionStateFeature(sectionKey, load);
  if (section.hiddenRows[taskId] && !section.completed[taskId]) return;
  if (completed) section.completed[taskId] = true;
  else delete section.completed[taskId];
  saveSectionValueFeature(sectionKey, 'completed', section.completed, save);
}

export function hideTask(sectionKey, taskId, { load, save }) {
  const section = getSectionStateFeature(sectionKey, load);

  section.hiddenRows[taskId] = true;
  delete section.completed[taskId];

  saveSectionValueFeature(sectionKey, 'completed', section.completed, save);
  saveSectionValueFeature(sectionKey, 'hiddenRows', section.hiddenRows, save);

  const order = load(StorageKeyBuilder.sectionOrder(sectionKey), []);
  if (Array.isArray(order)) {
    const filtered = order.filter((id) => id !== taskId);
    save(StorageKeyBuilder.sectionOrder(sectionKey), filtered);
  }

  const removedRows = load(StorageKeyBuilder.sectionRemovedRows(sectionKey), {});
  if (removedRows[taskId]) {
    delete removedRows[taskId];
    save(StorageKeyBuilder.sectionRemovedRows(sectionKey), removedRows);
  }

  if (sectionKey === TIMER_SECTION_KEY) saveTimersFeature({}, save);
}
