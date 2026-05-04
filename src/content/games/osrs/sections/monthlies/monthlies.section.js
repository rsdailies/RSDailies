import { defineSection } from '../../../../factories/define-section.js';
import { osrsMonthlyTasks } from './tasks/monthlies.tasks.js';

export const osrsMonthlySection = defineSection({
  id: 'osrsmonthly',
  label: 'Monthlies',
  game: 'osrs',
  displayOrder: 103,
  legacySectionId: 'osrsmonthly',
  resetFrequency: 'monthly',
  containerId: 'osrsmonthly-container',
  tableId: 'osrsmonthly-table',
  includedInAllMode: true,
  supportsTaskNotifications: false,
  shell: {
    columns: ['activity_col_name', 'activity_col_notes', 'activity_col_status'],
    countdownId: 'countdown-osrsmonthly',
  },
  items: osrsMonthlyTasks,
});


export default osrsMonthlySection;
