import { defineSection } from '../../../../factories/define-section.js';
import { osrsWeeklyTasks } from './tasks/weeklies.tasks.js';

export const osrsWeeklySection = defineSection({
  id: 'osrsweekly',
  label: 'Weeklies',
  game: 'osrs',
  displayOrder: 102,
  legacySectionId: 'osrsweekly',
  resetFrequency: 'weekly',
  containerId: 'osrsweekly-container',
  tableId: 'osrsweekly-table',
  includedInAllMode: true,
  supportsTaskNotifications: false,
  shell: {
    columns: ['activity_col_name', 'activity_col_notes', 'activity_col_status'],
    countdownId: 'countdown-osrsweekly',
  },
  items: osrsWeeklyTasks,
});


export default osrsWeeklySection;
