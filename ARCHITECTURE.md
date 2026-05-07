# Dailyscape — Framework Architecture

## Table of Contents

1. [Guiding Principle](#guiding-principle)
2. [Directory Map](#directory-map)
3. [Layer Responsibilities](#layer-responsibilities)
   - [src/app](#srcapp--orchestration)
   - [src/content](#srccontent--authored-data)
   - [src/domain](#srcdomain--business-rules)
   - [src/features](#srcfeatures--vertical-feature-slices)
   - [src/shared](#srcshared--cross-cutting-utilities)
   - [src/theme](#srctheme--css-architecture)
   - [src/widgets](#srcwidgets--ui-components)
4. [Import Direction Rules](#import-direction-rules)
5. [Adding New Files — Decision Tree](#adding-new-files--decision-tree)
6. [Build Entrypoint](#build-entrypoint)
7. [Common Mistakes to Avoid](#common-mistakes-to-avoid)

---

## Guiding Principle

**One owner per concept.** Every file lives in exactly one place, and its location tells you what it does, what it can import, and who can import it.

No file ever "reaches sideways" into a sibling layer. Data flows in one direction: **content → domain → features → app**. The `shared` layer is a utility foundation available to all non-content layers. The `theme` layer is CSS-only and has no JS imports.

---

## Directory Map

```
src/
├── app/          → Orchestration layer (wires everything together)
│   ├── boot/         → Entry points: main.js, bootstrap.js, run-loops.js
│   ├── shell/        → HTML shell, layout loader, app-shell runtime
│   ├── registries/   → unified-registry.js — section/page/timer mappings
│   ├── runtime/      → render-orchestrator.js, composition-root.js
│   ├── renderers/    → landing-renderer.js, tracker-section-renderer.js
│   └── styles/       → main.css (app-level style entry)
│
├── content/      → Authored game data (SSoT — no imports allowed here)
│   ├── factories/    → defineTask, defineSection, definePage helpers
│   ├── games/
│   │   ├── rs3/      → RS3 pages, sections, and task files
│   │   └── osrs/     → OSRS pages, sections, and task files
│   └── schemas/      → JSON schemas for content validation
│
├── domain/       → Top-level business rules and content resolution
│   └── content/      → content-loader.js, validate-content.js, resolvers/
│
├── features/     → Vertical feature slices (self-contained behavior units)
│   ├── cooldowns/
│   ├── notifications/
│   ├── penguins/
│   ├── profiles/
│   ├── sections/
│   ├── settings/
│   ├── timers/
│   └── view-controller/
│
├── shared/       → Cross-cutting utilities (no knowledge of features or content)
│   ├── lib/
│   │   ├── storage/    → storage-service, keys-builder, migrations, namespace
│   │   ├── time/       → boundaries, countdowns, formatters
│   │   ├── timers/     → timer-registry
│   │   ├── ids/        → section-ids
│   │   ├── calculators/→ Efficiency, GoldCalc, XpCalc
│   │   └── utils/      → arrays, objects, strings
│   ├── state/          → game-context, task-state-manager, task-state-machine
│   └── ui/             → controls.js, panel-controls.js, primitives/tooltips/
│
├── theme/        → Token-driven CSS (no JS imports — HTML <link> tags only)
│   ├── tokens/       → tokens.css (colors, spacing, rounding, row heights)
│   ├── base/         → base.css, states.css
│   ├── components/   → button.css, modal.css, header.css
│   ├── shell/        → layout.css, controls.css, responsive.css, index.css
│   ├── tracker/      → row.css, column.css, table.css, farming.css
│   └── pages/        → overview.css
│
└── widgets/      → Self-contained UI components (inject deps, don't reach)
    ├── headers/      → header.frame, header.render, section-panel-header
    ├── tracker/
    │   ├── rows/         → factory/, columns/, templates/, row.render.js
    │   ├── sections/     → renderers/, controls/, section engine
    │   └── tables/       → table geometry utils
    ├── overview/     → overview DOM, panel, collect logic
    ├── custom-tasks/ → modal controller, form, builders
    ├── import-export/→ import/export menu and logic
    ├── profiles/     → profile-view.js
    └── settings/     → settings-menu.js
```

---

## Layer Responsibilities

### `src/app/` — Orchestration

The **only** layer allowed to import from all other layers. It wires features, content, domain, and widgets together into a running application.

- **`boot/`** — App entry point. `main.js` → `bootstrap.js` → runtime init. Do not put business logic here.
- **`shell/`** — The HTML shell lives here. `index.html` is the Vite entry. `layout-loader.js` injects partials.
- **`registries/`** — `unified-registry.js` is the authoritative map of all pages, sections, and page modes per game.
- **`runtime/`** — `render-orchestrator.js` drives the render loop. `composition-root.js` wires all dependencies.
- **`renderers/`** — `tracker-section-renderer.js` dispatches to the correct widget renderer based on `renderVariant`.

### `src/content/` — Authored Data

**Nothing imports into here from `src/`.** This layer is pure authored JS objects. If a file inside `src/content/` has an import from another `src/` layer, that is a boundary violation.

- **`factories/`** — Helper builders so authoring is concise and validated. Use these, not raw objects.
- **`games/`** — Game-specific content. Adding OSRS support means adding files here, not changing runtime logic.
- **`schemas/`** — JSON schemas that the audit tool validates against.

### `src/domain/` — Business Rules

Bridges authored content to runtime representations. Contains the only code that "reads" `src/content/` and produces something the runtime can use.

- **`content/content-loader.js`** — Loads page manifests, applies defaults, runs validation.
- **`content/resolvers/`** — Custom task hydration, penguin merges, timer group normalization.

### `src/features/` — Vertical Feature Slices

Each feature is a completely isolated vertical — its own state, storage keys, and domain logic. **Features do not import from each other.** They communicate through the app layer.

### `src/shared/` — Cross-Cutting Utilities

Available to `domain`, `features`, `widgets`, and `app`. Has **no knowledge of game content or feature behavior.** If something belongs here, it must be genuinely reusable with zero business logic.

### `src/theme/` — CSS Architecture

Entirely decoupled from JS. All token-driven values. Loaded via `<link>` tags in `src/app/shell/html/index.html`. **Never imported in a JS file.**

The single source of truth for:
- Design tokens (`--ds-*` CSS custom properties)
- Row geometry (`--ds-row-height`, `--ds-section-gap`, `--ds-rounding-radius`)
- Color palette, typography, and state modifiers

### `src/widgets/` — UI Components

Self-contained UI units. A widget knows how to render itself but receives all its data and behavior dependencies via injection (function arguments / constructor params). Widgets import from `src/shared/` but **never directly from `src/features/`**.

---

## Import Direction Rules

```
src/content/     ← (no imports from src/)
      ↑
src/domain/      ← imports: content, shared
      ↑
src/features/    ← imports: domain, shared
      ↑                        ↑
src/widgets/     ← imports: shared (features injected from app)
      ↑
src/app/         ← imports: everything (orchestration hub)

src/shared/      ← imported by: domain, features, widgets, app
src/theme/       ← loaded by HTML <link> tags only
```

**Violations to watch for:**
- A `src/content/` file importing from `src/shared/` → ❌ boundary violation
- A `src/widgets/` file importing directly from `src/features/` → ❌ should be injected
- A `src/features/` file importing from `src/app/` → ❌ circular dependency risk
- CSS hardcoded in a `.js` file instead of a `src/theme/` file → ❌ breaks token system

---

## Adding New Files — Decision Tree

| What are you building? | Where does it go? |
|---|---|
| New game task or section data | `src/content/games/<game>/sections/<name>/` |
| New business rule operating on content | `src/domain/` |
| New isolated feature (state + behavior) | `src/features/<feature-name>/` |
| Reusable utility (time, storage, math) | `src/shared/lib/<category>/` |
| Reusable UI component | `src/widgets/<widget-name>/` |
| CSS styling (any layer) | `src/theme/<appropriate-sublayer>/` |
| App wiring, boot logic, or routing | `src/app/` |

---

## Build Entrypoint

| Item | Path |
|---|---|
| HTML Shell | `src/app/shell/html/index.html` |
| JS Entry | `src/app/boot/main.js` (via `<script type="module">` in index.html) |
| CSS | All `<link>` tags in `index.html` pointing to `src/theme/**` |
| Build Config | `vite.config.js` |
| Output | `dist/` |

---

## Common Mistakes to Avoid

| Mistake | Correct Approach |
|---|---|
| Hardcoding pixel values for row height or spacing | Use `var(--ds-row-height)` and `--ds-section-gap` tokens |
| Adding game data to a `.js` file in `src/features/` | Author it in `src/content/games/<game>/` |
| Importing from `src/features/` inside a widget | Inject the feature dependency from `src/app/` |
| Writing `@import` in a CSS file that imports from outside `src/theme/` | All CSS is loaded from `index.html` — no cross-layer CSS imports |
| Creating a new file in `src/app/` for something that's reusable | Put reusable code in `src/shared/` |
| Storing state in a `src/widgets/` file | State belongs in `src/shared/state/` or `src/features/<name>/domain/state.js` |
