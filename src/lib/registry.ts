// Master Registry of Section Metadata - Ported from legacy content-loader.js
export const SECTIONS = [
  { id: 'rs3-dailies', game: 'rs3', frequency: 'daily' },
  { id: 'rs3-weeklies', game: 'rs3', frequency: 'weekly' },
  { id: 'rs3-monthlies', game: 'rs3', frequency: 'monthly' },
  { id: 'gathering', game: 'rs3', frequency: 'daily' },
  { id: 'osrs-dailies', game: 'osrs', frequency: 'daily' },
  { id: 'osrs-weeklies', game: 'osrs', frequency: 'weekly' },
  { id: 'osrs-monthlies', game: 'osrs', frequency: 'monthly' },
];

export function getResettableSectionsForFrequency(frequency: string) {
  return SECTIONS.filter(s => s.frequency === frequency).map(s => s.id);
}
