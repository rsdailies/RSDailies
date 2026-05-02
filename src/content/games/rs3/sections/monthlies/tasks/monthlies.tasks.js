import { createRs3Task, withResetDefaults } from '../../tasks/task-factory.js';

export const rs3MonthlyTasks = withResetDefaults([
  createRs3Task('solomons-store', "Solomon's Store", 'https://secure.runescape.com/m=mtxn_rs_shop/index?jptg=ia&jptv=sgs_page#category/FreeItem', 'Free cosmetics and loyalty checks'),
  createRs3Task('giant-oyster', 'Giant Oyster', 'https://runescape.wiki/w/Giant_Oyster', 'Fishing and Farming XP, clue chest'),
  createRs3Task('god-statues', 'God Statues', 'https://runescape.wiki/w/God_Statues', 'Construction and Prayer / Slayer XP. Often worth doing near the end of the month.', { alertDaysBeforeReset: 1 }),
  createRs3Task('effigy-incubator', 'Effigy Incubator', 'https://runescape.wiki/w/Effigy_Incubator', 'Monthly effigy run'),
  createRs3Task('troll-invasion', 'Troll Invasion', 'https://runescape.wiki/w/Troll_Invasion', 'XP book and reward'),
  createRs3Task('dream-of-iaia-xp', 'Dream of Iaia (XP)', 'https://runescape.wiki/w/Dream_of_Iaia', 'Use stored XP in stations'),
  createRs3Task('monthly-dnd-check', 'Monthly D&D Sweep', 'https://runescape.wiki/w/Distractions_and_Diversions', 'Check monthly-limited activities'),
], { reset: 'monthly', alertDaysBeforeReset: 0 });

export default rs3MonthlyTasks;
