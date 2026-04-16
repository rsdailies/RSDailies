(function () {
  'use strict';

  function timer(id, name, wiki, note, extra) {
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

  function plot(id, name, wiki, extra) {
    return Object.assign(
      {
        id,
        name,
        wiki
      },
      extra || {}
    );
  }

  window.FARMING_CONFIG = {
    groups: [
      {
        id: 'herbs',
        label: 'Herbs',
        note: 'Main herb run timer with individual patch checklist rows.',
        timers: [
          timer(
            'farm-herbs',
            'Herb Run',
            'https://runescape.wiki/w/Herb_patch',
            'Primary herb timer. Uses your Speedy Growth upgrade setting automatically.',
            {
              cycleMinutes: 20,
              stages: 4,
              durationNote: 'Growth: 80 min base / 60 min with Speedy Growth',
              useHerbSetting: true,
              alertOnReady: true,
              autoClearOnReady: false,
              vanishOnStart: true,
              timerKind: 'run'
            }
          )
        ],
        plots: [
          plot('herb-falador', 'Falador', 'https://runescape.wiki/w/Herb_patch'),
          plot('herb-catherby', 'Catherby', 'https://runescape.wiki/w/Herb_patch'),
          plot('herb-ardougne', 'Ardougne', 'https://runescape.wiki/w/Herb_patch'),
          plot('herb-port-phasmatys', 'Port Phasmatys', 'https://runescape.wiki/w/Herb_patch'),
          plot('herb-troll-stronghold', 'Troll Stronghold', 'https://runescape.wiki/w/Herb_patch'),
          plot('herb-prifddinas', 'Prifddinas', 'https://runescape.wiki/w/Herb_patch'),
          plot('herb-wilderness', 'Wilderness', 'https://runescape.wiki/w/Herb_patch'),
          plot('herb-garden-of-kharid', 'Garden of Kharid', 'https://runescape.wiki/w/Herb_patch')
        ]
      },

      {
        id: 'allotments',
        label: 'Allotments',
        note: 'Allotment run timer with patch checklist rows.',
        timers: [
          timer(
            'farm-allotments',
            'Allotment Run',
            'https://runescape.wiki/w/Allotment_patch',
            'Typical allotment growth timer.',
            {
              cycleMinutes: 10,
              stages: 4,
              durationNote: 'Growth: 40 minutes',
              alertOnReady: true,
              autoClearOnReady: false,
              vanishOnStart: true,
              timerKind: 'run'
            }
          )
        ],
        plots: [
          plot('allotment-falador', 'Falador', 'https://runescape.wiki/w/Allotment_patch'),
          plot('allotment-catherby', 'Catherby', 'https://runescape.wiki/w/Allotment_patch'),
          plot('allotment-ardougne', 'Ardougne', 'https://runescape.wiki/w/Allotment_patch'),
          plot('allotment-port-phasmatys', 'Port Phasmatys', 'https://runescape.wiki/w/Allotment_patch'),
          plot('allotment-havenhythe', 'Havenhythe', 'https://runescape.wiki/w/Allotment_patch', {
            locationNote: 'Havenhythe allotment patch.'
          })
        ]
      },

      {
        id: 'hops',
        label: 'Hops',
        note: 'Hop run timer with patch checklist rows.',
        timers: [
          timer(
            'farm-hops',
            'Hop Run',
            'https://runescape.wiki/w/Hops_patch',
            'Typical hops growth timer.',
            {
              cycleMinutes: 10,
              stages: 4,
              durationNote: 'Growth: 40 minutes',
              alertOnReady: true,
              autoClearOnReady: false,
              vanishOnStart: true,
              timerKind: 'run'
            }
          )
        ],
        plots: [
          plot('hops-yanille', 'Yanille', 'https://runescape.wiki/w/Hops_patch'),
          plot('hops-lumbridge', 'Lumbridge', 'https://runescape.wiki/w/Hops_patch'),
          plot('hops-seers', "Seers' Village", 'https://runescape.wiki/w/Hops_patch'),
          plot('hops-entrana', 'Entrana', 'https://runescape.wiki/w/Hops_patch')
        ]
      },

      {
        id: 'trees',
        label: 'Trees',
        note: 'Tree timers broken into compact child groups.',
        timers: [
          timer(
            'farm-regular-trees',
            'Regular Trees',
            'https://runescape.wiki/w/Tree_patch',
            'Regular tree growth timer.',
            {
              cycleMinutes: 40,
              stages: 8,
              durationNote: 'Growth: 320 minutes',
              alertOnReady: true,
              autoClearOnReady: false,
              vanishOnStart: true,
              timerKind: 'growth',
              plots: [
                plot('tree-lumbridge', 'Lumbridge', 'https://runescape.wiki/w/Tree_patch'),
                plot('tree-falador', 'Falador', 'https://runescape.wiki/w/Tree_patch'),
                plot('tree-taverley', 'Taverley', 'https://runescape.wiki/w/Tree_patch'),
                plot('tree-varrock', 'Varrock', 'https://runescape.wiki/w/Tree_patch'),
                plot('tree-gnome-stronghold', 'Gnome Stronghold', 'https://runescape.wiki/w/Tree_patch')
              ]
            }
          ),
          timer(
            'farm-fruit-trees',
            'Fruit Trees',
            'https://runescape.wiki/w/Fruit_Tree_Patch',
            'Fruit tree growth timer.',
            {
              cycleMinutes: 160,
              stages: 6,
              durationNote: 'Growth: 960 minutes',
              alertOnReady: true,
              autoClearOnReady: false,
              vanishOnStart: true,
              timerKind: 'growth',
              plots: [
                plot('fruit-gnome-stronghold', 'Gnome Stronghold', 'https://runescape.wiki/w/Fruit_Tree_Patch'),
                plot('fruit-gnome-village', 'Tree Gnome Village', 'https://runescape.wiki/w/Fruit_Tree_Patch'),
                plot('fruit-catherby', 'Catherby', 'https://runescape.wiki/w/Fruit_Tree_Patch'),
                plot('fruit-herblore-habitat', 'Herblore Habitat', 'https://runescape.wiki/w/Fruit_Tree_Patch'),
                plot('fruit-lletya', 'Lletya', 'https://runescape.wiki/w/Fruit_Tree_Patch'),
                plot('fruit-meilyr', 'Meilyr', 'https://runescape.wiki/w/Fruit_Tree_Patch')
              ]
            }
          ),
          timer(
            'farm-spirit-tree',
            'Spirit Tree',
            'https://runescape.wiki/w/Spirit_tree_patch',
            'Spirit tree growth timer.',
            {
              cycleMinutes: 40,
              stages: 8,
              durationNote: 'Growth: 320 minutes',
              alertOnReady: true,
              autoClearOnReady: false,
              vanishOnStart: true,
              timerKind: 'growth',
              plots: [
                plot('spirit-port-sarim', 'Port Sarim', 'https://runescape.wiki/w/Spirit_tree_patch'),
                plot('spirit-etceteria', 'Etceteria', 'https://runescape.wiki/w/Spirit_tree_patch'),
                plot('spirit-brimhaven', 'Brimhaven', 'https://runescape.wiki/w/Spirit_tree_patch'),
                plot('spirit-miscellania', 'Miscellania', 'https://runescape.wiki/w/Spirit_tree_patch')
              ]
            }
          ),
          timer(
            'farm-calquat',
            'Calquat',
            'https://runescape.wiki/w/Calquat_patch',
            'Calquat growth reminder.',
            {
              cycleMinutes: 160,
              stages: 6,
              durationNote: 'Growth: 960 minutes',
              alertOnReady: true,
              autoClearOnReady: false,
              vanishOnStart: true,
              timerKind: 'growth',
              plots: [
                plot('calquat-brimhaven', 'Brimhaven', 'https://runescape.wiki/w/Calquat_patch')
              ]
            }
          ),
          timer(
            'farm-elder-tree',
            'Elder Tree',
            'https://runescape.wiki/w/Elder_tree_patch',
            'Long elder tree growth reminder.',
            {
              cycleMinutes: 320,
              stages: 7,
              durationNote: 'Growth: 2240 minutes',
              alertOnReady: true,
              autoClearOnReady: false,
              vanishOnStart: true,
              timerKind: 'growth',
              plots: [
                plot('elder-gnome-stronghold', 'Gnome Stronghold', 'https://runescape.wiki/w/Elder_tree_patch'),
                plot('elder-falador', 'Falador', 'https://runescape.wiki/w/Elder_tree_patch')
              ]
            }
          )
        ],
        plots: []
      },

      {
        id: 'specialty',
        label: 'Specialty',
        note: 'Specialty farming timers with compact location checklists.',
        timers: [
          timer(
            'farm-bushes',
            'Bushes',
            'https://runescape.wiki/w/Bush_patch',
            'Bush patch timer.',
            {
              cycleMinutes: 20,
              stages: 4,
              durationNote: 'Growth: 80 minutes',
              alertOnReady: true,
              autoClearOnReady: false,
              vanishOnStart: true,
              timerKind: 'growth',
              plots: [
                plot('bush-rimmington', 'Rimmington', 'https://runescape.wiki/w/Bush_patch'),
                plot('bush-ardougne', 'Ardougne', 'https://runescape.wiki/w/Bush_patch'),
                plot('bush-etceteria', 'Etceteria', 'https://runescape.wiki/w/Bush_patch'),
                plot('bush-farming-guild', 'Farming Guild / Manor Farm area', 'https://runescape.wiki/w/Bush_patch')
              ]
            }
          ),
          timer(
            'farm-cactus',
            'Cactus',
            'https://runescape.wiki/w/Cactus_patch',
            'Cactus patch reminder timer.',
            {
              cycleMinutes: 80,
              stages: 1,
              durationNote: 'Growth: 80 minutes',
              alertOnReady: true,
              autoClearOnReady: false,
              vanishOnStart: true,
              timerKind: 'harvest',
              plots: [
                plot('cactus-al-kharid', 'Al Kharid', 'https://runescape.wiki/w/Cactus_patch'),
                plot('cactus-menaphos', 'Menaphos', 'https://runescape.wiki/w/Cactus_patch')
              ]
            }
          ),
          timer(
            'farm-mushrooms',
            'Mushrooms',
            'https://runescape.wiki/w/Mushroom_patch',
            'Mushroom patch timer.',
            {
              cycleMinutes: 40,
              stages: 6,
              durationNote: 'Growth: 240 minutes',
              alertOnReady: true,
              autoClearOnReady: false,
              vanishOnStart: true,
              timerKind: 'growth',
              plots: [
                plot('mushroom-canifis', 'Canifis', 'https://runescape.wiki/w/Mushroom_patch')
              ]
            }
          ),
          timer(
            'farm-belladonna',
            'Belladonna',
            'https://runescape.wiki/w/Belladonna_patch',
            'Belladonna patch timer.',
            {
              cycleMinutes: 20,
              stages: 4,
              durationNote: 'Growth: 80 minutes',
              alertOnReady: true,
              autoClearOnReady: false,
              vanishOnStart: true,
              timerKind: 'growth',
              plots: [
                plot('belladonna-draynor', 'Draynor Manor', 'https://runescape.wiki/w/Belladonna_patch')
              ]
            }
          ),
          timer(
            'farm-celastrus',
            'Celastrus',
            'https://runescape.wiki/w/Celastrus_patch',
            'Celastrus patch growth reminder.',
            {
              cycleMinutes: 80,
              stages: 6,
              durationNote: 'Growth: 480 minutes',
              alertOnReady: true,
              autoClearOnReady: false,
              vanishOnStart: true,
              timerKind: 'growth',
              plots: [
                plot('celastrus-anachronia', 'Anachronia', 'https://runescape.wiki/w/Celastrus_patch')
              ]
            }
          ),
          timer(
            'farm-redwood',
            'Redwood',
            'https://runescape.wiki/w/Redwood_tree_patch',
            'Redwood growth reminder.',
            {
              cycleMinutes: 320,
              stages: 7,
              durationNote: 'Growth: 2240 minutes',
              alertOnReady: true,
              autoClearOnReady: false,
              vanishOnStart: true,
              timerKind: 'growth',
              plots: [
                plot('redwood-farming-guild', 'Farming Guild / Manor Farm area', 'https://runescape.wiki/w/Redwood_tree_patch')
              ]
            }
          ),
          timer(
            'farm-crystal-tree',
            'Crystal Tree',
            'https://runescape.wiki/w/Crystal_tree',
            'Crystal tree re-check reminder.',
            {
              cycleMinutes: 240,
              stages: 1,
              durationNote: 'Growth: 240 minutes',
              alertOnReady: true,
              autoClearOnReady: false,
              vanishOnStart: true,
              timerKind: 'harvest',
              plots: [
                plot('crystal-prifddinas', 'Prifddinas', 'https://runescape.wiki/w/Crystal_tree')
              ]
            }
          ),
          timer(
            'farm-anima-patch',
            'Anima Patch',
            'https://runescape.wiki/w/Anima_patch',
            'Anima patch timer.',
            {
              cycleMinutes: 20,
              stages: 4,
              durationNote: 'Growth: 80 minutes',
              alertOnReady: true,
              autoClearOnReady: false,
              vanishOnStart: true,
              timerKind: 'growth',
              plots: [
                plot('anima-anachronia', 'Anachronia', 'https://runescape.wiki/w/Anima_patch')
              ]
            }
          ),
          timer(
            'farm-bloodweed',
            'Bloodweed',
            'https://runescape.wiki/w/Bloodweed_patch',
            'Bloodweed patch timer.',
            {
              cycleMinutes: 20,
              stages: 4,
              durationNote: 'Growth: 80 minutes',
              alertOnReady: true,
              autoClearOnReady: false,
              vanishOnStart: true,
              timerKind: 'growth',
              plots: [
                plot('bloodweed-wilderness', 'Wilderness', 'https://runescape.wiki/w/Bloodweed_patch')
              ]
            }
          )
        ],
        plots: []
      }
    ]
  };
})();
