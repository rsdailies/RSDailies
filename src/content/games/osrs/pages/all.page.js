import { definePage } from '../../../factories/define-page.js';
import { osrsDailySection } from '../sections/dailies/dailies.section.js';
import { osrsWeeklySection } from '../sections/weeklies/weeklies.section.js';
import { osrsMonthlySection } from '../sections/monthlies/monthlies.section.js';

export const osrsAllTasksPage = definePage({
  id: 'osrsall',
  title: 'Tasks',
  game: 'osrs',
  displayOrder: 101,
  route: '/tracker/osrs/tasks',
  aliases: ['osrs', 'all', 'tasks', 'osrsall'],
  legacyMode: 'osrsall',
  menuGroup: 'Tasks',
  includeInViewsPanel: true,
  includeInPrimaryNav: true,
  sections: [osrsDailySection, osrsWeeklySection, osrsMonthlySection],
});


export default osrsAllTasksPage;
