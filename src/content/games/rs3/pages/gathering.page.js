import { definePage } from '../../../factories/define-page.js';
import { rs3GatheringSection } from '../sections/gathering/gathering.section.js';

export const rs3GatheringPage = definePage({
  id: 'gathering',
  title: 'Gathering',
  game: 'rs3',
  displayOrder: 5,
  route: '/tracker/gathering',
  aliases: ['gathering'],
  legacyMode: 'gathering',
  navLabel: 'Gathering',
  menuGroup: 'Gathering',
  includeInViewsPanel: true,
  includeInPrimaryNav: true,
  sections: [rs3GatheringSection],
});


export default rs3GatheringPage;
