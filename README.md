# Dailyscape

Dailyscape is a static Astro-based RuneScape tracker for RS3 and OSRS. The active app uses JSON-authored content, a hosted browser runtime, profile-scoped local storage, reset logic, timers, import/export, and a verification pipeline that covers content, routes, timer definitions, and browser smoke behavior.

This repository is the current base project. Migration-era compatibility layers, duplicate asset roots, and alternate host configs have already been removed.

## Production

- Live site: `https://rsdailies.vercel.app`
- Host target: `Vercel`
- Vercel project: `rsdailies`
- Framework preset: `Astro`
- Build command: `npm run build`
- Output directory: `dist`
- Node version: `22.x`

Vercel notes:

1. Keep the project on Node `22.x`.
2. Use `npm run build` as the deploy command.
3. Do not use `verify:full` as the Vercel build command.
4. Only set public env vars when explicitly needed, such as `PUBLIC_PENGUIN_API_URL`.

## Canonical Routes

- `/`
- `/rs3/overview`
- `/rs3/tasks?view=all|daily|weekly|monthly`
- `/rs3/gathering?view=daily|weekly`
- `/rs3/timers`
- `/osrs/overview`
- `/osrs/tasks?view=all|daily|weekly|monthly`

## Requirements

- Node `22.12.0` or newer in the `22.x` line
- npm

Version pins live in:

- `.nvmrc`
- `.node-version`
- `package.json`

## Fresh Setup

From a clean clone:

```bash
npm install
```

That restores `node_modules/`, which is required for:

- `npm run dev`
- `npm run build`
- `npm test`
- `npm run test:e2e`
- `npm run verify:full`

`node_modules/` is local install output and should not be committed.

## Daily Commands

```bash
# local dev server
npm run dev

# production build
npm run build

# unit and feature tests
npm test

# validation scripts
npm run audit:content
npm run audit:routes
npm run audit:timers

# browser smoke tests against a built app
npm run test:e2e

# full local verification gate
npm run verify:full
```

## Verification Model

`npm run verify:full` is the main local quality gate. It runs:

1. unit and feature tests
2. content audit
3. route audit
4. timer audit
5. production build
6. Playwright smoke coverage against the built app

Current verification structure:

- `tests/features/`
  - settings normalization
  - reset and storage behavior
  - timer math
  - tracker content and view resolution
- `tests/e2e/`
  - canonical route smoke coverage
- `tools/audit/`
  - content completeness and schema assumptions
  - route contract validation
  - timer definition validation
- `tools/e2e/`
  - local static serving for Playwright
  - Playwright runner against the built app
- `tools/verify/`
  - cross-platform full verification runner

The verification pipeline is intentionally part of the base project and should not be reduced to "build only."

## Runtime Architecture

The shipped app is an Astro static build with a hosted client runtime.

High-level runtime ownership:

- `src/bootstrap/`
  browser startup and shell bootstrap
- `src/layouts/`
  document shell and style imports
- `src/pages/`
  Astro route entrypoints
- `src/content/`
  JSON source of truth for page and section content
- `src/app/shell/html/`
  injected shell fragments such as navbar, footer, overview, and modals
- `src/lib/`
  active domain, runtime, storage, feature logic, rendering, and UI helpers
- `src/widgets/`
  template fragments used by the hosted runtime
- `public/`
  static assets

Runtime conventions:

- public assets use the canonical `/img` path
- Astro JSON content under `src/content` is the authored source of truth
- the current runtime does not depend on `_vanilla_legacy` or `src/legacy-port`
- the repo is intentionally Vercel-only
- `PUBLIC_PENGUIN_API_URL` is optional and opt-in

## `src/` Simplification Direction

The next architecture step is **not** a broad rewrite. The correct path is an inspection-led refactor by vertical feature slices.

Best-practice target shape:

- not one giant file per feature
- not dozens of abstract micro-files
- recommended: one feature folder with a small number of clearly owned files inside it

Why:

- one folder to inspect for a feature
- one obvious coordinator file
- state, actions, render helpers, and DOM bindings colocated
- fewer cross-layer scavenger hunts across `domain/`, `runtime/`, `widgets/`, and `ui/`

Primary hotspot files identified in the inspection:

1. `src/lib/domain/legacy-mode-content.ts`
2. `src/lib/widgets/tracker-row-factory.ts`
3. `src/lib/runtime/hosted-app-runtime.ts`
4. `src/lib/runtime/view-controller.ts`
5. `src/lib/features/sections/reset-service.ts`
6. `src/lib/runtime/render-orchestrator.ts` and its submodules

Observed problems:

- large files mixing multiple responsibilities
- feature logic split across broad layer folders
- runtime orchestration files acting as feature coordinators and implementation owners at the same time
- naming that still reflects migration history more than current ownership

Forward target layout:

- `features/navigation/`
- `features/overview/`
- `features/sections/`
- `features/rows/`
- `features/timers/`
- `features/settings/`
- `features/profiles/`
- `features/custom-tasks/`
- `features/import-export/`
- `features/penguins/`

Recommended refactor order:

1. route, view, and navigation ownership
2. row rendering and section rendering
3. reset and section state behavior
4. timers
5. overview and custom tasks
6. app assembly cleanup

Refactor rule:

- a developer should be able to answer "where does this feature live?" with one folder, not five top-level directories

## Generated and Local-Only Paths

These are local or generated paths and should stay out of git:

- `node_modules/`
- `dist/`
- `.astro/`
- `.vercel/`
- `test-results/`
- `playwright-report/`

If you delete them intentionally for a clean workspace:

- run `npm install` to restore dependencies
- run `npm run build` or `npm run dev` to regenerate app output as needed

## Root Files

- `package.json`
  scripts, dependency declarations, and Node engine contract
- `package-lock.json`
  locked dependency graph
- `astro.config.mjs`
  Astro config and integrations
- `tsconfig.json`
  TypeScript config
- `vercel.json`
  committed Vercel project build settings
- `.github/workflows/verify.yml`
  CI verification workflow

## Base Project Notes

- Keep the repo source clean; generated outputs are recreated locally.
- Reinstall dependencies with `npm install` whenever `node_modules/` is removed.
- Use `npm run verify:full` as the pre-change or pre-push local confidence gate once dependencies are installed.
