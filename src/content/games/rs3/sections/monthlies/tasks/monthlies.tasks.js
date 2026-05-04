import { defineTask } from '../../../../../factories/define-task.js';

export const rs3MonthlyTasks = [
  defineTask({ id: 'solomons-store', name: "Solomon's Store", wiki: 'https://secure.runescape.com/m=mtxn_rs_shop/index?jptg=ia&jptv=sgs_page#category/FreeItem', note: 'Free cosmetics and loyalty checks', reset: 'monthly' }),
  defineTask({ id: 'giant-oyster', name: 'Giant Oyster', wiki: 'https://runescape.wiki/w/Giant_Oyster', note: 'Fishing and Farming XP, clue chest', reset: 'monthly' }),
  defineTask({ id: 'god-statues', name: 'God Statues', wiki: 'https://runescape.wiki/w/God_Statues', note: 'Construction and Prayer / Slayer XP. Often worth doing near the end of the month.', reset: 'monthly', alertDaysBeforeReset: 1 }),
  defineTask({ id: 'effigy-incubator', name: 'Effigy Incubator', wiki: 'https://runescape.wiki/w/Effigy_Incubator', note: 'Monthly effigy run', reset: 'monthly' }),
  defineTask({ id: 'troll-invasion', name: 'Troll Invasion', wiki: 'https://runescape.wiki/w/Troll_Invasion', note: 'XP book and reward', reset: 'monthly' }),
  defineTask({ id: 'dream-of-iaia-xp', name: 'Dream of Iaia (XP)', wiki: 'https://runescape.wiki/w/Dream_of_Iaia', note: 'Use stored XP in stations', reset: 'monthly' }),
  defineTask({ id: 'monthly-dnd-check', name: 'Monthly D&D Sweep', wiki: 'https://runescape.wiki/w/Distractions_and_Diversions', note: 'Check monthly-limited activities', reset: 'monthly' }),
];

export default rs3MonthlyTasks;

