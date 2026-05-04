import { definePage } from '../../../factories/define-page.js';
import { rs3DailySection } from '../sections/dailies/dailies.section.js';

export const rs3DailyPage = definePage({
  id: 'rs3daily',
  title: 'Dailies',
  game: 'rs3',
  displayOrder: 4,
  route: '/tracker/daily',
  aliases: ['daily', 'dailies', 'rs3daily'],
  legacyMode: 'rs3daily',
  navLabel: 'Dailies',
  sections: [rs3DailySection],
});


export default rs3DailyPage;
