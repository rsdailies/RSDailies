import { defineSection } from '../../../../factories/define-section.js';
import { rs3WeeklyTasks } from './tasks/weeklies.tasks.js';

export const rs3WeeklySection = defineSection({
  id: 'rs3weekly',
  label: 'Weeklies',
  game: 'rs3',
  displayOrder: 4,
  legacySectionId: 'rs3weekly',
  resetFrequency: 'weekly',
  renderVariant: 'parent-children',
  containerId: 'rs3weekly-container',
  tableId: 'rs3weekly-table',
  includedInAllMode: true,
  supportsTaskNotifications: true,
  shell: {
    columns: ['activity_col_name', 'activity_col_notes', 'activity_col_status'],
    countdownId: 'countdown-rs3weekly',
  },
  items: rs3WeeklyTasks,
});


export default rs3WeeklySection;
