import { defineTask } from '../../../../../factories/define-task.js';

export const rs3DailyGatheringTasks = [
  defineTask({ id: 'bloodwood-tree', name: 'Bakriminel Bolts (Bloodwood Tree)', wiki: 'https://runescape.wiki/w/Money_making_guide/Fletching_bakriminel_bolts', note: 'Fletch bakriminel bolts roughly every 6 hours.', reset: 'daily', cooldownMinutes: 360 }),
  defineTask({ id: 'miscellania', name: 'Miscellania', wiki: 'https://runescape.wiki/w/Calculator:Other/Miscellania', note: 'Check approval rating and funds in coffer', reset: 'daily' }),
  defineTask({ id: 'zaff-battlestaves', name: 'Zaff Battlestaves', wiki: 'https://runescape.wiki/w/Zaff', note: 'Collect daily battlestaves if unlocked', reset: 'daily' }),
  defineTask({ id: 'bert-sand-daily', name: 'Bert Sand', wiki: 'https://runescape.wiki/w/Bert', note: 'Collect daily sand if part of your route', reset: 'daily' }),
  defineTask({ id: 'meat-shop-check', name: 'Meat / Utility Shop Check', wiki: 'https://runescape.wiki/w/Shop', note: 'Optional gathering-related shop pass', reset: 'daily' }),
  defineTask({ id: 'rune-shop-touchpoint', name: 'Rune / Essence Shop Touchpoint', wiki: 'https://runescape.wiki/w/Runes', note: 'Optional rune or essence stock pass', reset: 'daily' }),
  defineTask({ id: 'herb-run-reminder', name: 'Herb Run', wiki: 'https://runescape.wiki/w/Farming', note: 'Use the Farming section for the actual timer tracking', reset: 'daily' }),
];

export default rs3DailyGatheringTasks;

