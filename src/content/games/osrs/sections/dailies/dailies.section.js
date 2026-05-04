import { defineSection } from '../../../../factories/define-section.js';
import { osrsDailyTasks } from './tasks/dailies.tasks.js';

export const osrsDailySection = defineSection({
  id: 'osrsdaily',
  label: 'Dailies',
  game: 'osrs',
  displayOrder: 101,
  legacySectionId: 'osrsdaily',
  containerId: 'osrsdaily-container',
  tableId: 'osrsdaily-table',
  includedInAllMode: true,
  supportsTaskNotifications: false,
  shell: {
    columns: ['activity_col_name', 'activity_col_notes', 'activity_col_status'],
    countdownId: 'countdown-osrsdaily',
  },
  items: osrsDailyTasks,
});


export default osrsDailySection;
