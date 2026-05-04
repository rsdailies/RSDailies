import { definePage } from '../../../factories/define-page.js';

export const rs3OverviewPage = definePage({
  id: 'overview',
  title: 'Overview',
  game: 'rs3',
  displayOrder: 0,
  route: '/tracker/overview',
  aliases: ['overview'],
  legacyMode: 'overview',
  menuGroup: 'Home',
  includeInViewsPanel: true,
  sections: [],
});


export default rs3OverviewPage;
