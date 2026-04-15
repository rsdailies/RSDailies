(function () {
  'use strict';

  function f(id, name, wiki, note, extra) {
    return Object.assign(
      {
        id,
        name,
        wiki,
        note
      },
      extra || {}
    );
  }

  window.FARMING_CONFIG = {
    tasks: [
      f(
        'farm-herbs',
        'Herbs',
        'https://runescape.wiki/w/Herb_patch',
        'Primary herb patch timer. Uses your 3-tick herb setting automatically.',
        {
          category: 'patch-runs',
          cycleMinutes: 20,
          stages: 4,
          useHerbSetting: true,
          alertOnReady: true,
          autoClearOnReady: true
        }
      ),
      f(
        'farm-allotments',
        'Allotments',
        'https://runescape.wiki/w/Allotment_patch',
        'Typical allotment growth timer.',
        {
          category: 'patch-runs',
          cycleMinutes: 10,
          stages: 4,
          alertOnReady: true,
          autoClearOnReady: true
        }
      ),
      f(
        'farm-hops',
        'Hops',
        'https://runescape.wiki/w/Hops_patch',
        'Typical hops growth timer.',
        {
          category: 'patch-runs',
          cycleMinutes: 10,
          stages: 4,
          alertOnReady: true,
          autoClearOnReady: true
        }
      ),
      f(
        'farm-bushes',
        'Bushes',
        'https://runescape.wiki/w/Bush_patch',
        'Bush patch timer.',
        {
          category: 'patch-runs',
          cycleMinutes: 20,
          stages: 4,
          alertOnReady: true,
          autoClearOnReady: true
        }
      ),
      f(
        'farm-cactus',
        'Cactus',
        'https://runescape.wiki/w/Cactus_patch',
        'Cactus patch reminder timer.',
        {
          category: 'patch-runs',
          cycleMinutes: 80,
          stages: 1,
          alertOnReady: true,
          autoClearOnReady: true
        }
      ),
      f(
        'farm-mushrooms',
        'Mushrooms',
        'https://runescape.wiki/w/Mushroom_patch',
        'Mushroom patch timer.',
        {
          category: 'patch-runs',
          cycleMinutes: 40,
          stages: 6,
          alertOnReady: true,
          autoClearOnReady: true
        }
      ),
      f(
        'farm-potato-cactus-pick',
        'Potato Cactus Pick',
        'https://runescape.wiki/w/Potato_cactus',
        'Simple re-check reminder for harvesting cactus patches.',
        {
          category: 'harvest-reminders',
          cycleMinutes: 80,
          stages: 1,
          alertOnReady: true,
          autoClearOnReady: true
        }
      ),
      f(
        'farm-poison-ivy-berries',
        'Poison Ivy Berries',
        'https://runescape.wiki/w/Poison_ivy_berries',
        'Re-harvest reminder for poison ivy berry bushes.',
        {
          category: 'harvest-reminders',
          cycleMinutes: 80,
          stages: 1,
          alertOnReady: true,
          autoClearOnReady: true
        }
      ),
      f(
        'farm-fruit-trees-standard',
        'Fruit Trees (standard)',
        'https://runescape.wiki/w/Fruit_Tree_Patch',
        'Standard fruit tree growth timer.',
        {
          category: 'trees',
          cycleMinutes: 160,
          stages: 6,
          alertOnReady: true,
          autoClearOnReady: true
        }
      ),
      f(
        'farm-fruit-trees-high',
        'Fruit Trees (higher tier)',
        'https://runescape.wiki/w/Fruit_Tree_Patch',
        'Higher-tier fruit tree growth timer.',
        {
          category: 'trees',
          cycleMinutes: 160,
          stages: 5,
          alertOnReady: true,
          autoClearOnReady: true
        }
      ),
      f(
        'farm-regular-trees',
        'Regular Trees',
        'https://runescape.wiki/w/Tree_patch',
        'Tree patch growth timer.',
        {
          category: 'trees',
          cycleMinutes: 40,
          stages: 8,
          alertOnReady: true,
          autoClearOnReady: true
        }
      ),
      f(
        'farm-spirit-tree',
        'Spirit Tree',
        'https://runescape.wiki/w/Spirit_tree_patch',
        'Spirit tree growth timer.',
        {
          category: 'trees',
          cycleMinutes: 40,
          stages: 8,
          alertOnReady: true,
          autoClearOnReady: true
        }
      ),
      f(
        'farm-calquat',
        'Calquat',
        'https://runescape.wiki/w/Calquat_patch',
        'Calquat growth reminder.',
        {
          category: 'trees',
          cycleMinutes: 160,
          stages: 6,
          alertOnReady: true,
          autoClearOnReady: true
        }
      ),
      f(
        'farm-elder-tree',
        'Elder Tree',
        'https://runescape.wiki/w/Elder_tree_patch',
        'Long elder tree growth reminder.',
        {
          category: 'trees',
          cycleMinutes: 320,
          stages: 7,
          alertOnReady: true,
          autoClearOnReady: true
        }
      ),
      f(
        'farm-belladonna',
        'Belladonna',
        'https://runescape.wiki/w/Belladonna_patch',
        'Belladonna patch timer.',
        {
          category: 'specialty',
          cycleMinutes: 20,
          stages: 4,
          alertOnReady: true,
          autoClearOnReady: true
        }
      ),
      f(
        'farm-celastrus',
        'Celastrus',
        'https://runescape.wiki/w/Celastrus_patch',
        'Celastrus patch growth reminder.',
        {
          category: 'specialty',
          cycleMinutes: 80,
          stages: 6,
          alertOnReady: true,
          autoClearOnReady: true
        }
      ),
      f(
        'farm-redwood',
        'Redwood',
        'https://runescape.wiki/w/Redwood_tree_patch',
        'Redwood growth reminder.',
        {
          category: 'specialty',
          cycleMinutes: 320,
          stages: 7,
          alertOnReady: true,
          autoClearOnReady: true
        }
      ),
      f(
        'farm-crystal-tree',
        'Crystal Tree',
        'https://runescape.wiki/w/Crystal_tree',
        'Crystal tree re-check reminder.',
        {
          category: 'specialty',
          cycleMinutes: 240,
          stages: 1,
          alertOnReady: true,
          autoClearOnReady: true
        }
      ),
      f(
        'farm-anima-patch',
        'Anima Patch',
        'https://runescape.wiki/w/Anima_patch',
        'Anima patch timer.',
        {
          category: 'specialty',
          cycleMinutes: 20,
          stages: 4,
          alertOnReady: true,
          autoClearOnReady: true
        }
      ),
      f(
        'farm-bloodweed',
        'Bloodweed',
        'https://runescape.wiki/w/Bloodweed_patch',
        'Bloodweed patch timer.',
        {
          category: 'specialty',
          cycleMinutes: 20,
          stages: 4,
          alertOnReady: true,
          autoClearOnReady: true
        }
      )
    ]
  };
})();