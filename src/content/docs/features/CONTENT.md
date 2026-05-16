# Content model

The content source of truth is `src/content/games/`.

## Page ids

Canonical page ids are dashed:

- `rs3-tasks`
- `rs3-gathering`
- `rs3-timers`
- `osrs-tasks`

Older aliases such as `rs3tasks` may be recognized in helper code, but new content should use dashed ids.

## OSRS state

OSRS is intentionally visible and empty. Keep these section files with empty `items` arrays until real OSRS content is authored:

- `src/content/games/osrs/sections/daily.json`
- `src/content/games/osrs/sections/weekly.json`
- `src/content/games/osrs/sections/monthly.json`
