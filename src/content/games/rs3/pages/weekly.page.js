import { definePage } from '../../../factories/define-page.js';
import { rs3WeeklySection } from '../sections/weeklies/weeklies.section.js';

export const rs3WeeklyPage = definePage({
  id: 'rs3weekly',
  title: 'Weeklies',
  game: 'rs3',
  displayOrder: 6,
  route: '/tracker/weekly',
  aliases: ['weekly', 'weeklies', 'rs3weekly'],
  legacyMode: 'rs3weekly',
  navLabel: 'Weeklies',
  sections: [rs3WeeklySection],
});


export default rs3WeeklyPage;
