import { definePage } from '../../../factories/define-page.js';
import { osrsDailySection } from '../sections/dailies/dailies.section.js';

export const osrsDailyPage = definePage({
  id: 'osrsdaily',
  title: 'Dailies',
  game: 'osrs',
  displayOrder: 102,
  route: '/tracker/osrs/daily',
  aliases: ['daily', 'dailies', 'osrsdaily'],
  legacyMode: 'osrsdaily',
  navLabel: 'Dailies',
  sections: [osrsDailySection],
});


export default osrsDailyPage;
