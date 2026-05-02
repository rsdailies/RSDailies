import { createRs3Task, withResetDefaults } from '../../tasks/task-factory.js';

export const rs3DailyGatheringTasks = withResetDefaults([
  createRs3Task('bloodwood-tree', 'Bakriminel Bolts (Bloodwood Tree)', 'https://runescape.wiki/w/Money_making_guide/Fletching_bakriminel_bolts', 'Fletch bakriminel bolts roughly every 6 hours.', { cooldownMinutes: 360 }),
  createRs3Task('miscellania', 'Miscellania', 'https://runescape.wiki/w/Calculator:Other/Miscellania', 'Check approval rating and funds in coffer'),
  createRs3Task('zaff-battlestaves', 'Zaff Battlestaves', 'https://runescape.wiki/w/Zaff', 'Collect daily battlestaves if unlocked'),
  createRs3Task('bert-sand-daily', 'Bert Sand', 'https://runescape.wiki/w/Bert', 'Collect daily sand if part of your route'),
  createRs3Task('meat-shop-check', 'Meat / Utility Shop Check', 'https://runescape.wiki/w/Shop', 'Optional gathering-related shop pass'),
  createRs3Task('rune-shop-touchpoint', 'Rune / Essence Shop Touchpoint', 'https://runescape.wiki/w/Runes', 'Optional rune or essence stock pass'),
  createRs3Task('herb-run-reminder', 'Herb Run', 'https://runescape.wiki/w/Farming', 'Use the Farming section for the actual timer tracking'),
], { reset: 'daily', alertDaysBeforeReset: 0 });

export default rs3DailyGatheringTasks;
