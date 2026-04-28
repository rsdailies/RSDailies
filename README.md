# Dailyscape3

Dailyscape3 is a configuration-first RuneScape task tracker refactor. The current goal is to preserve the working RS3 tracker experience while keeping internals clean, granular, and easy to edit through focused micro-passes.

Live target path: `/RSDailies/`

## Current application model

The app is a Vite-powered static site. The visual HTML shell lives under `src/ui/app-shell/html`, and Vite outputs a static `dist/` bundle suitable for GitHub Pages.

```text
Dailyscape3/
├── assets/                         # Static public assets served by Vite
├── docs/                           # Current audits, reference notes, and checkpoint docs
├── src/
│   ├── app/                        # Boot, composition, orchestration, runtime coordination
│   ├── core/                       # Non-visual shared logic
│   ├── data/                       # Game data/configuration, not rendering logic
│   ├── features/                   # Domain behavior without UI rendering
│   └── ui/                         # All visual/UI code lives here
│       ├── app-shell/              # HTML partials, shell runtime, and shell CSS
│       ├── components/             # Composed UI components
│       ├── pages/                  # Game selection, RS3 page, OSRS page, page shell
│       ├── primitives/             # Small reusable UI atoms
│       └── styles/                 # Global UI tokens, foundations, modal styles
├── tools/                          # Developer/audit tooling
├── vite.config.js                  # Vite root, build, asset, and proxy config
├── package.json                    # npm scripts and dependencies
└── package-lock.json               # Locked dependency graph
```

## Source boundaries

- `src/app/` owns bootstrapping, composition, runtime orchestration, scheduling, and storage bridges.
- `src/core/` owns non-visual utilities such as API adapters, calculators, DOM helpers, IDs, state, storage, time, and pure helpers.
- `src/data/` owns game data/configuration shells for RS3 and OSRS.
- `src/features/` owns domain behavior only. Feature folders may expose models, state, controllers, calculations, and configuration, but not visual implementation.
- `src/ui/` owns all visual rendering, page shell code, components, primitives, and styles.
- `tools/audit/` owns verification scripts that prevent removed paths and misplaced boundaries from returning.

## Organization rules

1. UI belongs in `src/ui/`. Visual renderers, HTML partials, UI controllers, CSS, button logic, row builders, headers, modals, and table markup must stay in the UI tree.
2. Core logic belongs in `src/core/`. Time math, storage, ID registries, calculators, API adapters, and pure helpers must not live under UI folders.
3. Domain behavior belongs in `src/features/`. These modules expose behavior, models, state, controllers, adapters, and calculations, but not visual implementation.
4. Configuration belongs in `src/data/` or feature `config/` folders. Configuration should be easier to edit than rendering code.
5. Static images belong in `assets/`. They are served by Vite as public assets.
6. Documentation belongs in `docs/`. Keep only current, useful audit/reference material.
7. Developer scripts belong in `tools/`. Build checks and topology checks should not sit inside runtime folders.
8. File size should stay small. Split files before they become difficult to reason about.

## UI layering

- `src/ui/primitives/` contains reusable atoms such as buttons, row base behavior, runtime resolvers, and tooltips.
- `src/ui/components/` contains composed visual blocks such as headers, tracker sections, tracker rows, profiles, settings, import/export, overview, and view menus.
- `src/ui/app-shell/` contains the page shell, HTML partials, shell runtime, and layout CSS.
- `src/ui/pages/` contains top-level page decisions such as game selection and RS3/OSRS routing.
- `src/ui/styles/` contains global tokens and base CSS.

## Tracker granularity

Tracker rendering is split by responsibility so rows and columns remain easy to inspect:

```text
src/ui/components/tracker/rows/
├── row.constants.js
├── row.logic.js
├── row.render.js
├── row.styles.css
├── columns/
│   ├── column.constants.js
│   ├── column.logic.js
│   ├── column.render.js
│   ├── column.styles.css
│   ├── hooks/
│   ├── types/
│   └── utils/
├── factory/
└── templates/
```

Column rules:

- Icon code should not own timer logic.
- Timer code should not own gold/profit logic.
- Gold/profit display should call calculator/service logic rather than hard-code math inside visual rendering.
- Action controls should report user intent upward instead of mutating unrelated column internals.

## Styling and jitter rule

Button and hover behavior should be fixed at the primitive/component layer that owns the affected UI, not scattered across unrelated feature files.

```text
src/ui/primitives/buttons/
├── PrimaryBtn.js
├── ToggleBtn.js
└── button.css
```

Jitter prevention rules:

- Use stable box models.
- Keep borders reserved with transparent default borders when needed.
- Prefer `outline` or `box-shadow` for hover emphasis instead of changing border thickness.
- Avoid feature-local hover CSS when a primitive/component-level fix can cover the behavior safely.

## Multi-game structure

- `src/core/state/GameContext.js` owns the selected game value.
- The selected game persists in LocalStorage.
- RS3 loads the current tracker behavior and data.
- OSRS has a configuration path under `src/data/osrs/` so it can be filled without rewriting RS3 code.
- Switching games should not require a full page refresh.

## Development commands

```bash
npm install
npm run dev
npm run build
npm run preview
```

Production output is written to:

```text
dist/
```

## Verification commands

Run the topology/import audit tools before committing:

```bash
npm run audit
npm run build
```

`npm run audit` expands to:

```bash
node tools/audit/check-imports.mjs
node tools/audit/verify-topology.mjs
```

## Adding new RS3 tasks

Use configuration-first edits. Add or update task definitions in the appropriate data/config file, then let the tracker renderers consume the configuration.

Recommended order:

1. Add task metadata/config.
2. Add reset/cooldown values if needed.
3. Add profit item IDs or quantity metadata if needed.
4. Reuse existing table/row/column components.
5. Run the audit and build commands.

## Adding OSRS support

OSRS should be added by filling `src/data/osrs/` and any OSRS-specific domain adapters. The tracker shell should remain reusable. Avoid copying RS3 UI files unless the OSRS layout truly diverges.

## External services and API notes

RuneScape Wiki and related community APIs should be wrapped through `src/core/api/` services. UI files should call an app/domain service, not fetch external endpoints directly.

## GitHub Pages notes

The Vite base path is currently configured for:

```js
base: '/RSDailies/'
```

Change this only if the GitHub Pages repository path changes.

## Legal note

RuneScape is a trademark of Jagex Ltd. This is a community project and is not affiliated with or endorsed by Jagex.
