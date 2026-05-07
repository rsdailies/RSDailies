# Dailyscape Agent Rules

## Table of Contents

1. [Project Intent](#project-intent)
2. [Repo-Native SSoT Protocol](#repo-native-ssot-protocol)
3. [Canonical Owners](#canonical-owners)
4. [Shell And Tracker Boundaries](#shell-and-tracker-boundaries)
5. [Registry And Content Rules](#registry-and-content-rules)
6. [Header And Section Rules](#header-and-section-rules)
7. [Row Composition Rules](#row-composition-rules)
8. [Panel-Control Rules](#panel-control-rules)
9. [Tracker Geometry Rules](#tracker-geometry-rules)
10. [Completed-Task State Rules](#completed-task-state-rules)
11. [Responsive Rules](#responsive-rules)
12. [Asset And Icon Rules](#asset-and-icon-rules)
13. [Figma-to-Code Workflow](#figma-to-code-workflow)
14. [Verification Requirements](#verification-requirements)
15. [Change Guardrails](#change-guardrails)
16. [Architectural Anatomy](#architectural-anatomy)

## Project Intent

- **Preserve content-authored tracker architecture**: The system is designed to be data-driven.
- **RS3 vs. OSRS**: Keep RS3 as the content-rich implementation while ensuring the shell, registry, and runtime stay game-aware and OSRS-compatible.
- **Thin Facades**: Prefer thinning existing facades over adding parallel implementations.
- **AI-Assisted Iteration**: Optimize for predictable iteration: one owner per concept, stable contracts, token reuse, and testable rendering behavior.

## Repo-Native SSoT Protocol

Every concept must have **one authoritative owner**. Ownership depends on the concept type:

| Concept Type | Canonical Owner |
| :--- | :--- |
| **Visual Values** | Design Tokens (`src/theme/tokens/tokens.css`) |
| **DOM Skeletons** | Shared Primitives / HTML Templates |
| **Feature Behavior** | Feature-domain logic/controllers (`src/features/*`) |
| **Authored Content** | Content directory (`src/content/*`) |
| **Routing & Visibility** | Registries and Runtime Orchestration |

### Critical Protocol Rules

- **Stable Facades**: Allowed only when protecting topology, discoverability, or audit expectations.
- **No Duplication**: Duplicate active behavior implementations are strictly forbidden.
- **Extension over Addition**: If a concept already has an owner, extend that owner instead of adding a side path.

## Canonical Owners

- App shell HTML entrypoint: `src/app/shell/html/index.html`
- Global UI tokens: `src/theme/tokens/tokens.css`
- Global foundations: `src/theme/base/base.css`, `src/theme/base/states.css`
- Shell layout chrome: `src/theme/shell/layout.css`, `src/theme/shell/controls.css`, `src/theme/shell/responsive.css`
- Shared panel/control helpers: `src/shared/ui/controls.js`, `src/shared/ui/panel-controls.js`
- Shared header primitives: `src/widgets/headers/*`
- Shared row template flow: `src/widgets/tracker/rows/*`
- Tracker table geometry and subgroup visuals: `src/theme/tracker/table.css`
- Authored game/page/section/task content: `src/content/`
- Content validation and selection: `src/domain/content/*`
- Game-aware registry resolution: `src/app/registries/unified-registry.js`
- Runtime orchestration: `src/app/runtime/*`
- Feature behavior and storage rules: `src/features/*`
- Top-level page renderers: `src/app/renderers/*`
- Cross-cutting utilities (storage, time, ids): `src/shared/lib/*`
- Shared runtime state: `src/shared/state/*`
- UI primitives (tooltips, DOM helpers): `src/shared/ui/*`

## Shell And Tracker Boundaries

- `src/theme/shell/layout.css` owns page/container spacing and outer shell chrome only.
- `src/theme/tracker/table.css` owns tracker row geometry, subgroup gaps, checkbox border, and terminal-row rounding.
- `src/widgets/headers/` owns generic header primitives only.
- Tracker-specific subgroup visuals must live with tracker styles, not shell/header primitives.
- Do not move tracker geometry into shell CSS to solve a local visual problem.
- Do not add tracker behavior to shell renderers when a tracker renderer or helper can own it directly.

## Registry And Content Rules

- **Content Authorship**: All game data must reside in `src/content/`. Use the established schema for tasks (id, name, wiki, reset) and sections (id, kind, tasks/subgroups).
- **Registry Independence**: Do not hardcode RS3-only registry filtering in runtime registry or content resolution files.
- **Dynamic Resolution**: Game-aware lookup belongs in `src/app/registries/unified-registry.js` and `src/app/runtime/`.
- **Storage Scoping**: Page-mode storage must be scoped by game (e.g., `pageMode:rs3`, `pageMode:osrs`) when behavior differs by game.
- **Normalization**: Default page-mode recovery must resolve through registry definitions, not string literals scattered through the shell.
- **OSRS Parity**: OSRS must use the same shell/workspace system as RS3, even when its content is intentionally blank, to maintain architectural consistency.
- **Validation**: Every content change must be validated against the content schemas using the audit tool (`tools/audit/validate-content.mjs`).

## Header And Section Rules

- Use `buildSectionPanelHtml` and `renderSectionPanelHeader` for shell section headers.
- Use `createTableSectionHeader` for tracker subgroup headers.
- `src/widgets/headers/header.frame.js` is the shared header-frame owner for shell and tracker header markup.
- Keep the section engine block contract explicit:
  - row block: `{ id, kind: 'rows', tasks }`
  - subgroup block: `{ id, kind: 'subgroup', title, tasks, headerMode: 'default' | 'attached', rightText?, onResetClick?, restoreOptions?, onRestoreSelect? }`
- `subgroup-attached-header` is the only supported attached-header hook.
- Attached subgroup headers:
  - must not create a top gap
  - must preserve the internal gap below the header before child rows
  - must not force curvature onto the row above
- Tracker render-variant dispatch belongs in `src/app/renderers/tracker-section-renderer.js` through the renderer map, not a growing switch tree.

## Row Composition Rules

- **Stable Facades**: Keep the audit-facing row facade files (`row.render.js`) stable to protect external consumers.
- **The Standard Row Flow**:
    1. **Hydration**: Load the row shell/template from `src/widgets/tracker/rows/templates/`.
    2. **Population**: Inject content (name, notes, wiki links) into the DOM.
    3. **Attachment**: Attach action handlers (checkbox click, timer reset) via `src/widgets/tracker/rows/factory/base-row.behaviors.js`.
    4. **Status Sync**: Apply visibility and completion states based on `dataset.completed`.
    5. **Augmentation**: Add specialized overlays (timers, custom task controls) without breaking the base template.
    6. **Responsive Adjustments**: Ensure the row adapts to mobile/desktop layouts via CSS tokens.
- **Minimal Branches**: If row behavior changes, modify the shared row flow before adding a special-case renderer branch.
- **Thin Surfaces**: Parent/subparent surfaces must stay thin and route through shared subgroup/row behavior. Bespoke renderer logic at the row level is forbidden.

## Panel-Control Rules

- Views, Profiles, and Settings must share the same floating-panel toggle lifecycle through `src/shared/ui/panel-controls.js`.
- Button replacement and panel open-state behavior should not be re-implemented per feature.
- Surface-specific work is allowed for:
  - pre-open hydration
  - list/form rendering
  - action commit behavior
- Import/export may keep modal-specific logic, but button handling and shell wiring should still reuse shared control helpers where practical.

## Tracker Geometry Rules

- Always use tokens for tracker geometry.
- Required tracker tokens:
  - `--ds-section-gap`
  - `--ds-row-height`
  - `--ds-rounding-radius`
  - `--ds-checkbox-border`
- Never hardcode tracker gap, row-height, or rounding values in component CSS or JS.
- The canonical tracker row height is `var(--ds-row-height)`.
- The canonical subgroup gap is `var(--ds-section-gap)`.
- Terminal row rounding must use semantic classes such as `block-end-row`, not positional selectors.
- When a row or subgroup is hidden via task state, rounding must move to the next visible terminal surface automatically.

## Completed-Task State Rules

- The current tracker state model is string-based.
- Valid row states include:
  - `'true'`
  - `'false'`
  - `'hide'`
  - `'idle'`
  - `'running'`
  - `'ready'`
- Row rendering and terminal-row calculation must key off `dataset.completed`.
- New/default behavior is hide-on-complete:
  - `showCompletedTasks: false` for new settings
  - if enabled, completed rows remain visible and green
- Preserve explicit stored user preferences; do not silently overwrite saved settings.

## Responsive Rules

- Responsive styles may adjust widths, typography, and shell control layout.
- Responsive styles must not hardcode alternate tracker geometry that conflicts with tracker tokens.
- If mobile needs a geometry change, introduce or reuse a token instead of patching row height directly in `src/theme/shell/responsive.css`.

## Asset And Icon Rules

- Reuse existing assets from `assets/`.
- Do not introduce new icon packages for tracker/header controls.
- Prefer existing glyph/text button conventions unless a broader design-system change is being made intentionally.

## Figma-to-Code Workflow

- Analyze the codebase before implementing any Figma-derived change.
- Reuse existing tracker, header, row, panel, and shell primitives before creating new UI structures.
- Treat Figma output as design intent, not final code style.
- Map Figma spacing, rounding, and colors onto the tokens in `src/theme/tokens/tokens.css`.
- Do not hardcode new tracker geometry values from a design file.
- If attached subgroup behavior or tracker section hierarchy appears in a design, implement it through the section engine contract rather than bespoke renderer conditionals.
- When adding new UI, prefer extending existing widgets in `src/widgets/` over creating parallel structures.

## Verification Requirements

- Minimum required checks for shell/tracker UI changes:
  - `npm test`
  - `npm run audit`
  - `npm run build`
- For changes affecting tracker rendering, settings behavior, registries, or page modes, add or update Node tests for:
  - header markup expectations
  - settings normalization/defaults
  - terminal-row selection under hidden rows
  - attached subgroup header behavior where applicable
  - game-aware registry resolution
  - page-mode normalization/storage across games
  - render-variant map coverage
  - panel-control lifecycle behavior
- For visual shell or tracker changes, verify RS3 and OSRS workspaces manually or through browser inspection.

## Change Guardrails

- **Extend, Don't Parallel**: Prefer extending current primitives over introducing parallel implementations.
- **Protect Worktree**: Do not revert unrelated user changes in a dirty worktree.
- **No Hardcoding**: Do not add new hardcoded tracker geometry values.
- **Loose Coupling**: Do not couple shell layout code to tracker row internals.
- **Boundary First**: If a visual fix requires cross-layer ownership changes, fix the ownership boundary first and the styling second.
- **Purge Strategy**: Purge or archive only files that create duplicate active owners or obsolete runtime paths.

---

## Architectural Anatomy

The codebase is structured into clear, purpose-driven layers. Each layer has a singular responsibility and strict import direction rules.

### Import Direction

```
content  ←  domain  ←  features  ←  app
                    ←  widgets   ←  app
shared   ←  (everyone except content)
theme    ←  (HTML only, via <link> tags in index.html)
```

### 1. The App Layer (`src/app/`)

- **Boot** (`src/app/boot/`): Entry points — `main.js`, `bootstrap.js`, init loops and run loops.
- **Shell** (`src/app/shell/`): The HTML shell (`index.html`), layout loader, and app-shell runtime that injects HTML partials.
- **Registries** (`src/app/registries/`): The "brain" of the app. Maps sections, timers, and pages via `unified-registry.js`.
- **Runtime** (`src/app/runtime/`): Orchestrates the boot process and render loops via `render-orchestrator.js` and `composition-root.js`.
- **Renderers** (`src/app/renderers/`): Top-level page renderer dispatch — `landing-renderer.js`, `tracker-section-renderer.js`.

### 2. The Content Layer (`src/content/`)

- **SSoT for Data**: All game tasks, section definitions, and page layouts live here as authored JS objects.
- **Factories** (`src/content/factories/`): `define-task.js`, `define-section.js`, `define-page.js`, `define-timer-group.js` — helper factories for authoring.
- **Games** (`src/content/games/rs3/`, `src/content/games/osrs/`): Game-specific pages, sections, and task files.
- **Schemas** (`src/content/schemas/`): JSON schemas for content validation (e.g., `cadence.schema.json`).

### 3. The Domain Layer (`src/domain/`)

- **Content Resolution**: Business rules that operate on `src/content/` to produce runtime-ready structures.
- **Content Loader** (`src/domain/content/content-loader.js`): Loads and validates authored pages.
- **Resolvers**: Custom task resolver, penguin resolver, timer resolver.

### 4. The Features Layer (`src/features/`)

- **Modularized Logic**: Each feature (Tasks, Timers, Sections, Profiles, Settings, Cooldowns, Notifications) owns its domain logic and state.
- **State Management**: Features maintain their own internal state and normalization rules.
- **No cross-feature imports**: Features communicate through the app layer, not directly.

### 5. The Shared Layer (`src/shared/`)

- **`lib/storage/`**: `storage-service.js`, `keys-builder.js`, `migrations.js`, `namespace.js`.
- **`lib/time/`**: `boundaries.js`, `countdowns.js`, `formatters.js`.
- **`lib/timers/`**: `timer-registry.js`.
- **`lib/ids/`**: `section-ids.js`.
- **`lib/calculators/`**: Efficiency, XP, and gold calculation utilities.
- **`lib/utils/`**: `arrays.js`, `objects.js`, `strings.js`.
- **`state/`**: `game-context.js`, `task-state-manager.js`, `task-state-machine.js`.
- **`ui/`**: `controls.js`, `panel-controls.js`, `primitives/tooltips/tooltip-engine.js`.

### 6. The Theme Layer (`src/theme/`)

- **Token-Driven CSS**: No JS logic. Loaded exclusively via `<link>` tags in `src/app/shell/html/index.html`.
- **`tokens/`**: `tokens.css` — all design tokens (colors, spacing, rounding, row height, etc.).
- **`base/`**: `base.css`, `states.css` — global resets and state modifiers.
- **`components/`**: `button.css`, `modal.css`, `header.css`.
- **`shell/`**: `layout.css`, `controls.css`, `responsive.css`, `index.css`.
- **`tracker/`**: `row.css`, `column.css`, `table.css`, `farming.css`.
- **`pages/`**: `overview.css`.

### 7. The Widgets Layer (`src/widgets/`)

- **Self-Contained UI**: Each widget is a cohesive unit of markup + behavior. Receives dependencies via injection.
- **`headers/`**: `header.frame.js`, `header.render.js`, `header.logic.js`, section panel header, table section header.
- **`tracker/rows/`**: Row factory, column types, row behaviors, base-row shell, templates.
- **`tracker/sections/`**: Section engine, standard renderer, timer group renderer, section control bindings.
- **`tracker/tables/`**: Table geometry utilities.
- **`overview/`**: Overview panel DOM and collection logic.
- **`custom-tasks/`**: Custom task modal controller.
- **`import-export/`**: Import/export UI and logic.
- **`profiles/`**: Profile switcher view.
- **`settings/`**: Settings menu.
