# RSDailies / Dailyscape

RSDailies is a static **Astro + Svelte** RuneScape daily tracker. Astro owns page routing, layout composition, and validated JSON content loading. Svelte owns the interactive tracker UI: navbar state, overview pins, task rows, collapsible sections, reset controls, and farming/timer rows.

This checkpoint is the cleaned migration baseline after removing the old active imperative renderer. There is no legacy table renderer, no injected shell HTML runtime, and no widget-renderer tree competing with Svelte.

## Current app contract

| Route | Status | Purpose |
|---|---|---|
| `/` | Active | Game-selection landing page for RS3 or OSRS. |
| `/rs3/tasks` | Active | RS3 daily, weekly, and monthly task tracker. |
| `/rs3/gathering` | Active | RS3 gathering tracker. |
| `/rs3/timers` | Active | RS3 farming/timer tracker with nested timer/plot rows. |
| `/osrs/tasks` | Active shell | Empty OSRS Daily, Weekly, and Monthly sections by design. |

## What changed in this checkpoint

- Removed the old runtime renderer from the active project.
- Removed old injected shell HTML fragments.
- Removed old widget/render helper files.
- Consolidated content under `src/content/games/`.
- Normalized page ids to dashed canonical ids.
- Fixed the RS3 timers/farming page so timer parents and plot/location rows render correctly.
- Preserved OSRS as a visible empty shell, per project decision.
- Added project documentation under `/docs/` for future AI/human maintenance.
- Added an npm `overrides` rule for `yaml` so `npm audit` reports zero known vulnerabilities with the current lockfile.

## Install and run

```bash
npm install
npm run dev
```

The dev server serves the Astro app locally. Open the URL printed by Astro, then check:

```text
/rs3/tasks
/rs3/gathering
/rs3/timers
/osrs/tasks
```

## Verification commands

```bash
npm run check
npm test
npm run audit:content
npm run audit:routes
npm run audit:timers
npm audit
npm run build
npm run verify:full
```

`npm run verify:full` runs the non-browser gate: Astro check, unit tests, content audit, route audit, timer audit, npm audit, and production build.

Browser smoke tests are separate because Playwright browsers are large machine-level assets:

```bash
npx playwright install
npm run test:e2e
```

## Project tree

```text
src/
├─ bootstrap/              Browser bootstrap. Bootstrap JS only; no renderer startup.
├─ components/
│  ├─ layout/              Navbar and footer.
│  ├─ modals/              Import/export and custom task modal shell.
│  └─ tracker/             Dashboard, overview, sections, rows, and timers.
├─ content.config.ts       Astro content collection schemas.
├─ content/games/          JSON source of truth for pages and sections.
├─ layouts/                Astro document shell and global CSS imports.
├─ lib/                    Pure domain/services/storage/timer helpers.
├─ pages/                  Astro routes.
├─ stores/                 Svelte browser state.
└─ styles/                 Global visual system and tracker CSS.
```

## Ownership rules

### Astro owns

- `src/pages/**`
- `src/layouts/**`
- `src/content.config.ts`
- static route generation
- content collection loading

### Svelte owns

- tracker dashboard rendering
- task row rendering
- farming/timer hierarchy rendering
- row completion/hidden/pin state
- section/group collapse and reset controls
- navbar/modal UI rendering

### Services own

- local storage namespacing
- reset-boundary math
- timer math
- settings normalization
- content and route audits

## Forbidden architecture

Do not reintroduce:

- a global `renderApp()` table renderer
- imperative dashboard row injection
- old shell HTML fragments as active UI
- a second tracker renderer beside Svelte
- duplicate content folders outside `src/content/games/`
- hidden legacy bridge logic controlling page rendering

## Content model

All page and section content lives under:

```text
src/content/games/
├─ rs3/
│  ├─ pages/
│  └─ sections/
└─ osrs/
   ├─ pages/
   └─ sections/
```

Canonical page ids:

```text
rs3-tasks
rs3-gathering
rs3-timers
osrs-tasks
```

OSRS intentionally has empty `items` arrays until real OSRS task data is authored.

## Timers/farming model

The RS3 timers page supports:

```text
Timer section
└─ group: Herbs / Trees / Specialty
   ├─ timer parent: Regular Trees / Fruit Trees / Crystal Tree
   └─ plot/location rows: Falador / Catherby / etc.
```

Timer locations are real task rows, not fake subgroup headers. This is important for preserving old visual structure while keeping Svelte as the only renderer.

## Security/dependency policy

- Keep `package-lock.json` committed.
- Run `npm audit` before final review.
- The project currently uses an npm `overrides` rule to force a patched `yaml` version for transitive tooling dependencies.
- Avoid `npm audit fix --force` unless you have reviewed the breaking dependency downgrade/upgrade it proposes.

## Documentation map

Start with:

- `docs/PROJECT_OVERVIEW.md`
- `docs/architecture/OWNERSHIP.md`
- `docs/architecture/FILE_TREE.md`
- `docs/architecture/NO_LEGACY_POLICY.md`
- `docs/features/CONTENT.md`
- `docs/features/TIMERS.md`
- `docs/features/OSRS.md`
- `docs/framework/ASTRO.md`
- `docs/framework/SVELTE.md`
- `docs/testing/VERIFICATION.md`
- `docs/maintenance/DEPENDENCIES_SECURITY.md`
- `docs/agents/REQUEST_SCOPING.md`
- `docs/sources/SOURCES.md`

## Visual checkpoint

The public legacy site remains the visual checkpoint:

```text
https://rsdailies.github.io/RSDailies/
```

Use it for visual comparison only. Do not restore its old runtime architecture.

## Windows npm install troubleshooting

This project intentionally ships without `node_modules`. Install dependencies with:

```bash
npm install
```

The project includes `.npmrc` to force the public npm registry:

```text
registry=https://registry.npmjs.org/
engine-strict=false
```

If an install is interrupted on Windows and you see `EPERM` cleanup warnings, close running editors/terminals that may be locking files, delete `node_modules`, and run `npm install` again. If npm reports a stale or private registry URL, run:

```bash
npm config get registry
npm config set registry https://registry.npmjs.org/
```

Node `22.12.0` or newer is supported. Node `24.x` is accepted by the `engines` range.

