# Verification guide

## Daily local gate

Run this after normal code/content changes:

```bash
npm run verify:full
```

This runs:

1. `npm run check`
2. `npm test`
3. `npm run audit:content`
4. `npm run audit:routes`
5. `npm run audit:timers`
6. `npm audit`
7. `npm run build`

## Browser smoke gate

Playwright browser binaries are intentionally not bundled in the source zip. Install them on your machine when you want browser checks:

```bash
npx playwright install
npm run test:e2e
```

Use browser smoke tests after changing:

- navbar behavior
- section collapse/reset behavior
- row click behavior
- timers/farming rendering
- global CSS/layout
- routes

## Manual visual route checklist

Open these routes locally:

```text
/rs3/tasks
/rs3/gathering
/rs3/timers
/osrs/tasks
```

Check that:

- there is only one dashboard renderer
- farming/timer locations render as rows
- tree/specialty timers do not become empty subgroup headers
- OSRS is visible but intentionally empty
- navbar links point to the canonical routes
