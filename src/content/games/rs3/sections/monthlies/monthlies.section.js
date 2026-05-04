import { defineSection } from '../../../../factories/define-section.js';
import { rs3MonthlyTasks } from './tasks/monthlies.tasks.js';

export const rs3MonthlySection = defineSection({
  id: 'rs3monthly',
  label: 'Monthlies',
  game: 'rs3',
  displayOrder: 5,
  legacySectionId: 'rs3monthly',
  resetFrequency: 'monthly',
  containerId: 'rs3monthly-container',
  tableId: 'rs3monthly-table',
  includedInAllMode: true,
  supportsTaskNotifications: true,
  shell: {
    columns: ['activity_col_name', 'activity_col_notes', 'activity_col_status'],
    countdownId: 'countdown-rs3monthly',
  },
  items: rs3MonthlyTasks,
});


export default rs3MonthlySection;
