---
title: Verification
description: The canonical local verification workflow for linting, checks, audits, builds, and E2E tests.
---

# Verification guide

## Daily local gate

Run this after normal code/content changes:

```bash
npm run verify:full
```

This runs:

1. `npm run lint`
2. `npm run check`
3. `npm test`
4. `npm run audit:content`
5. `npm run audit:routes`
6. `npm run audit:timers`
7. `npm run audit:no-mojibake`
8. `npm audit`
9. `npm run build`
10. `npm run test:e2e`

Notes:

- `npm run lint` uses the repo-managed Biome dependency from `devDependencies`; no global install is required after `npm install`.
- `npm audit` remains a zero-vulnerability gate when the audit service is reachable.
- If the npm audit endpoint is unavailable, `verify:full` logs an explicit warning and continues, but the security check is incomplete and must be rerun later.

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
