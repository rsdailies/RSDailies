import { defineSection } from '../../../../factories/define-section.js';
import { rs3DailyTasks } from './tasks/dailies.tasks.js';

export const rs3DailySection = defineSection({
  id: 'rs3daily',
  label: 'Dailies',
  game: 'rs3',
  displayOrder: 3,
  legacySectionId: 'rs3daily',
  containerId: 'rs3daily-container',
  tableId: 'rs3daily-table',
  includedInAllMode: true,
  supportsTaskNotifications: true,
  shell: {
    columns: ['activity_col_name', 'activity_col_notes', 'activity_col_status'],
    countdownId: 'countdown-rs3daily',
  },
  items: rs3DailyTasks,
});


export default rs3DailySection;
