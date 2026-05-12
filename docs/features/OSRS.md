# OSRS shell

OSRS is intentionally visible but empty in this checkpoint.

## Current behavior

`/osrs/tasks` renders three empty sections:

- Daily
- Weekly
- Monthly

This is not considered a bug. The route exists so the project architecture can support OSRS without pretending incomplete content exists.

## Add OSRS content later

Add rows to:

```text
src/content/games/osrs/sections/daily.json
src/content/games/osrs/sections/weekly.json
src/content/games/osrs/sections/monthly.json
```

Keep the route definition in:

```text
src/content/games/osrs/pages/tasks.json
```

After editing, run:

```bash
npm run audit:content
npm run build
```
