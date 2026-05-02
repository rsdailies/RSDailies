import { createRs3Task, withResetDefaults } from '../../tasks/task-factory.js';

export const rs3DailyTasks = withResetDefaults([
  createRs3Task('daily-challenge', 'Daily Challenge', 'https://runescape.wiki/w/Challenge_System', 'Get XP and daily progress'),
  createRs3Task('vis-wax', 'Vis Wax', 'https://runescape.wiki/w/Vis_wax', 'Use the rune combination for daily vis wax'),
  createRs3Task('wicked-hood', 'Wicked Hood', 'https://runescape.wiki/w/Wicked_hood', 'Claim daily pure essence / rune utility'),
  createRs3Task('jack-of-trades', 'Jack of Trades', 'https://runescape.wiki/w/Jack_of_trades_aura/Routines', 'Get XP in a range of skills to earn an XP book'),
  createRs3Task('soul-reaper', 'Soul Reaper', 'https://runescape.wiki/w/Soul_Reaper', 'Kill assigned bosses'),
  createRs3Task('player-owned-port', 'Player-owned Ports', 'https://runescape.wiki/w/Player-owned_port', 'Manage your port. Buy resources from the Black Marketeer.'),
  createRs3Task('player-owned-farm', 'Player-owned Farm', 'https://runescape.wiki/w/Player-owned_farm', 'Manage your farm'),
  createRs3Task('crystal-tree-blossom', 'Crystal Tree Blossom', 'https://runescape.wiki/w/Crystal_tree_blossom', 'Collect blossom for perfect plus potions'),
  createRs3Task('invention-machines', 'Invention Machines', 'https://runescape.wiki/w/Machines', 'Fill and collect from machines'),
  createRs3Task('divine-locations', 'Divine Locations', 'https://runescape.wiki/w/Divine_location', 'Gather resources from divine locations'),
  createRs3Task('archaeology-research', 'Archaeology Research', 'https://runescape.wiki/w/Research', 'Send out research teams for XP and resources'),
  createRs3Task('nemi-forest', 'Nemi Forest', 'https://runescape.wiki/w/Nemi_Forest', 'Daily map route and rewards'),
  createRs3Task('sinkholes', 'Sinkholes', 'https://runescape.wiki/w/Sinkholes', 'Dungeoneering XP lamps and tokens (2x/day)'),
  createRs3Task('goebie-bands', 'Goebie Supply Run', 'https://runescape.wiki/w/Supply_run', 'Daily goebie run'),
  createRs3Task('menaphos-obelisk', 'Menaphos Obelisk / Scarabs', 'https://runescape.wiki/w/Soul_obelisk_(Menaphos)', 'Soul obelisk and Menaphos reputation'),
  createRs3Task('big-chinchompa', 'Big Chinchompa', 'https://runescape.wiki/w/Big_Chinchompa', 'Hunter D&D rewards'),
  createRs3Task('fixate', 'Fixate Charges', 'https://runescape.wiki/w/Fixate', 'Use fixate charges for guaranteed artefacts'),
  createRs3Task('arc-contracts', 'Arc Contracts', 'https://runescape.wiki/w/Contract', 'Complete up to 7 Arc contracts'),
  createRs3Task('rapid-growth', 'Rapid Growth', 'https://runescape.wiki/w/Rapid_Growth', 'Use daily growth charges'),
  createRs3Task('runesphere', 'Runesphere', 'https://runescape.wiki/w/Runesphere', 'Hand in rune dust for XP'),
  createRs3Task('book-of-char', 'Book of Char', 'https://runescape.wiki/w/The_Book_of_Char', 'Fast Firemaking XP'),
  createRs3Task('travelling-merchant', 'Travelling Merchant', 'https://runescape.wiki/w/Travelling_Merchant%27s_Shop', 'Check stock if it matters to your route'),
  createRs3Task('motherlode-maw', 'Motherlode Maw', 'https://runescape.wiki/w/Motherlode_Maw', 'Claim maw reward if available'),
  createRs3Task('wildy-flash-events', 'Wilderness Flash Events', 'https://runescape.wiki/w/Wilderness_Flash_Events', 'Check event timing / utility'),
  createRs3Task('sandstone-red-sandstone', 'Sandstone / Red Sandstone', 'https://runescape.wiki/w/Red_sandstone', 'Daily sandstone collection'),
], { reset: 'daily', alertDaysBeforeReset: 0 });

export default rs3DailyTasks;
