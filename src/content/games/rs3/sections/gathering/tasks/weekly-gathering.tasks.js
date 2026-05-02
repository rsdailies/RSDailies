import { createRs3Task, withResetDefaults } from '../../tasks/task-factory.js';

export const rs3WeeklyGatheringTasks = withResetDefaults([
  createRs3Task('feather-shop-run', 'Feather Shop Run', 'https://runescape.wiki/w/Money_making_guide/Buying_feathers', 'Weekly stock'),
  createRs3Task('meat-packs', 'Meat Packs', 'https://runescape.wiki/w/Money_making_guide/Buying_Meat_from_Oo%27glog', 'Only buy packs'),
  createRs3Task('vial-of-water-packs', 'Vial of Water Packs', 'https://runescape.wiki/w/Money_making_guide/Buying_vials_of_water', 'Weekly stock'),
  createRs3Task('yak-hide', 'Yak Hide', 'https://runescape.wiki/w/Money_making_guide/Buying_yak-hide', 'Weekly stock'),
  createRs3Task('bandit-duty-free', 'Bandit Duty Free', 'https://runescape.wiki/w/Money_making_guide/Buying_construction_materials_from_Bandit_Duty_Free', 'Wilderness shop'),
  createRs3Task('seaweed-and-pineapples', 'Seaweed and Pineapples', 'https://runescape.wiki/w/Money_making_guide/Buying_seaweed_and_pineapples_from_Arhein', 'Weekly stock'),
  createRs3Task('bert-sand', 'Sand from Bert', 'https://runescape.wiki/w/Bert', 'Weekly stock'),
  createRs3Task('dellmonti-pineapples', 'Dell Monti Fruit', 'https://runescape.wiki/w/Dell_Monti', 'Weekly stock'),
  createRs3Task('coeden-logs', 'Logs from Coeden', 'https://runescape.wiki/w/Coeden', 'Weekly stock'),
  createRs3Task('lupe', 'Soul Supplies', 'https://runescape.wiki/w/Lupe#Underworld_achievement_rewards', 'Lupe weekly supplies'),
  createRs3Task('feathers-of-maat', "Feathers of Ma'at", 'https://runescape.wiki/w/Money_making_guide/Buying_feathers_of_Ma%27at', 'Weekly stock'),
  createRs3Task('broad-arrowheads', 'Broad Arrowheads', 'https://runescape.wiki/w/Money_making_guide/Buying_broad_arrowheads', 'Weekly stock'),
  createRs3Task('potato-cactus', 'Potato Cactus', 'https://runescape.wiki/w/Weird_Old_Man', 'Weird Old Man stock'),
  createRs3Task('razmire-planks', 'Planks (Razmire)', 'https://runescape.wiki/w/Razmire_Keelgan', 'Weekly stock'),
  createRs3Task('geoffrey-flax', 'Flax (Geoffrey)', 'https://runescape.wiki/w/Geoffrey', 'Weekly flax stock'),
  createRs3Task('cromperty-pure-essence', 'Pure Essence (Wizard Cromperty)', 'https://runescape.wiki/w/Wizard_Cromperty', 'Weekly stock'),
  createRs3Task('rune-shop-run', 'Rune Shop Run', 'https://runescape.wiki/w/Money_making_guide/Buying_runes', 'Weekly shop sweep'),
], { reset: 'weekly', alertDaysBeforeReset: 0 });

export default rs3WeeklyGatheringTasks;
