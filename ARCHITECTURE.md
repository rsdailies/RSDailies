# Architecture

## Active Runtime

The shipped app is an Astro static build with a hosted client runtime.

- Astro owns routing, page shells, and asset bundling.
- `src/bootstrap/start-hosted-app.ts` starts the browser app.
- `src/lib/runtime/hosted-app-runtime.ts` composes storage, settings, rendering, timers, resets, import/export, and profile controls.
- `src/lib/runtime/render-orchestrator.ts` drives page rendering into the vanilla-compatible shell mounts.

## Source of Truth

- `src/content/pages/*.json` defines canonical pages, navigation metadata, layouts, and supported views.
- `src/content/sections/*.json` defines authored tracker sections, rows, timer groups, and overview content.
- `src/lib/domain/legacy-mode-content.ts` maps canonical Astro routes and views onto the hosted tracker modes without reintroducing archived manifests.

## Storage and State

- `src/lib/shared/storage/storage-service.ts` is the single profile-aware storage contract.
- `src/lib/storage/migrations.ts` applies the active schema migration path.
- `src/lib/features/sections/section-state-service.ts` owns task, timer, cooldown, collapse, and overview-pin state access.
- `src/lib/features/sections/reset-service.ts` applies daily, weekly, and monthly reset rules.

## UI Layers

- `src/layouts/MainLayout.astro` provides the shared document shell and bundled styles.
- `src/app/shell/html/` contains the mounted shell fragments injected into the page.
- `src/lib/widgets/` and `src/lib/renderers/` contain the active row, section, header, overview, and landing renderers.
- `src/styles/` contains the active local stylesheet entrypoints used by the shell.

## Verification

The root verification path is:

1. `npm test`
2. `npm run audit:content`
3. `npm run audit:routes`
4. `npm run audit:timers`
5. `npm run build`
6. `npm run test:e2e`

`npm run verify:full` runs those checks through `tools/verify/run-full.mjs` in isolated steps.

## Cleanup Boundary

Archived material such as `_vanilla_legacy`, `src/legacy-port`, and audit artifacts should remain out of the active runtime. If any future migration utility needs old reference data, it should be recreated from committed history rather than wired back into `src`.
