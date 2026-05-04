import { definePage } from '../../../factories/define-page.js';
import { osrsMonthlySection } from '../sections/monthlies/monthlies.section.js';

export const osrsMonthlyPage = definePage({
  id: 'osrsmonthly',
  title: 'Monthlies',
  game: 'osrs',
  displayOrder: 104,
  route: '/tracker/osrs/monthly',
  aliases: ['monthly', 'monthlies', 'osrsmonthly'],
  legacyMode: 'osrsmonthly',
  navLabel: 'Monthlies',
  sections: [osrsMonthlySection],
});


export default osrsMonthlyPage;
