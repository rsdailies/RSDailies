import { definePage } from '../../../factories/define-page.js';
import { rs3CustomSection } from '../sections/custom/custom.section.js';

export const rs3CustomPage = definePage({
  id: 'custom',
  title: 'Custom Tasks',
  game: 'rs3',
  displayOrder: 2,
  route: '/tracker/custom',
  aliases: ['custom'],
  legacyMode: 'custom',
  navLabel: 'Custom Tasks',
  sections: [rs3CustomSection],
});


export default rs3CustomPage;
