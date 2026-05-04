import { definePage } from '../../../factories/define-page.js';
import { osrsWeeklySection } from '../sections/weeklies/weeklies.section.js';

export const osrsWeeklyPage = definePage({
  id: 'osrsweekly',
  title: 'Weeklies',
  game: 'osrs',
  displayOrder: 103,
  route: '/tracker/osrs/weekly',
  aliases: ['weekly', 'weeklies', 'osrsweekly'],
  legacyMode: 'osrsweekly',
  navLabel: 'Weeklies',
  sections: [osrsWeeklySection],
});


export default osrsWeeklyPage;
