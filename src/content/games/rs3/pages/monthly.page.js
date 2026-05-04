import { definePage } from '../../../factories/define-page.js';
import { rs3MonthlySection } from '../sections/monthlies/monthlies.section.js';

export const rs3MonthlyPage = definePage({
  id: 'rs3monthly',
  title: 'Monthlies',
  game: 'rs3',
  displayOrder: 7,
  route: '/tracker/monthly',
  aliases: ['monthly', 'monthlies', 'rs3monthly'],
  legacyMode: 'rs3monthly',
  navLabel: 'Monthlies',
  sections: [rs3MonthlySection],
});


export default rs3MonthlyPage;
