# Content Authoring Model

This document describes the current authoring model for the Dailyscape framework.

## Table of Contents

1. [Source of Truth Layers](#source-of-truth-layers)
2. [Page Definitions](#page-definitions)
3. [Section Definitions](#section-definitions)
4. [Render Variants](#render-variants)
5. [Runtime Resolution](#runtime-resolution)
6. [Shell Rendering](#shell-rendering)
7. [Storage and Migration](#storage-and-migration)
8. [Timers](#timers)
9. [Adding New Content — Step-by-Step](#adding-new-content--step-by-step)
10. [Compatibility Fields](#compatibility-fields)
11. [Verification](#verification)

---

## Source of Truth Layers

The tracker has three primary authority layers:

| Layer | Path | Responsibility |
|---|---|---|
| **Authored Content** | `src/content/` | All game task, section, and page definitions. The SSoT. |
| **Registry** | `src/app/registries/unified-registry.js` | Canonical section/page-mode metadata for runtime navigation, shell rendering, and storage-aware UI behavior. |
| **Shared Infrastructure** | `src/shared/lib/` | Storage keys, migrations, timer registry, time utilities. |

Content resolution and validation live in `src/domain/content/`, bridging the authored layer to the runtime.

---

## Page Definitions

Current authored tracker pages live under:

- `src/content/games/rs3/pages/`
- `src/content/games/osrs/pages/`

Each page definition exports an object with:

```js
{
  id: 'rs3-daily',         // Canonical page ID
  title: 'Daily Tasks',    // Display name
  game: 'rs3',             // Game scope
  route: 'daily',          // URL route segment
  layout: 'tracker',       // Shell layout to use
  legacyMode: 'daily',     // Migration backfill for old localStorage keys
  sections: [ /* ... */ ]  // Array of section definitions
}
```

Page definitions are created using the `definePage` factory in `src/content/factories/define-page.js`.

---

## Section Definitions

Each page contains section definitions. A section defines:

```js
{
  id: 'rs3-dailies',               // Canonical section ID
  label: 'Daily Activities',       // Display name
  legacySectionId: 'daily',        // Migration backfill
  renderVariant: 'standard',       // Renderer type (see below)
  items: [ /* tasks */ ]           // Or 'groups' for subgroup variants
}
```

Section definitions are created using `defineSection` from `src/content/factories/define-section.js`.

---

## Render Variants

| Variant | Description | Used For |
|---|---|---|
| `standard` | Flat list of rows with checkboxes | Dailies, Weeklies, Monthlies |
| `grouped-sections` | Tasks organized into named subgroups with headers | Gathering (Daily/Weekly) |
| `parent-children` | Parent task row with indented child rows | Weeklies with subtasks |
| `timer-groups` | Real-time countdown timer clusters | Farming timers |

---

## Runtime Resolution

Raw page definitions are loaded and validated by:

- `src/domain/content/content-loader.js` — loads the page manifest and applies defaults
- `src/domain/content/validate-content.js` — validates every task/section against schemas in `src/content/schemas/`

Runtime hydration happens through resolvers in `src/domain/content/resolvers/`:

| Resolver | Responsibility |
|---|---|
| `custom.resolver.js` | Hydrates user-created custom tasks from `localStorage` |
| `penguin.resolver.js` | Merges penguin child-row overrides from the World 60 Penguins API |
| `timer.resolver.js` | Normalizes farming timer groups into renderer-ready structures |

---

## Shell Rendering

The dashboard shell is generated dynamically from registry metadata. Static HTML panels no longer exist.

Shell generation lives in:

- `src/app/shell/runtime/render-app-shell.js` — builds section panel markup from registry entries
- `src/app/shell/runtime/section-panel.js` — creates individual section panel DOM nodes
- `src/app/shell/runtime/layout-loader.js` — injects HTML partials into the DOM on boot

Section shell metadata lives in `unified-registry.js` under each section's `shell` field.

---

## Storage and Migration

Storage keys must always be authored through:

- `src/shared/lib/storage/keys-builder.js` — `StorageKeyBuilder` class, generates scoped key strings

Schema migration and versioning live in:

- `src/shared/lib/storage/migrations.js` — handles version upgrades for `localStorage` schema

Storage namespace/prefix utilities:

- `src/shared/lib/storage/namespace.js`
- `src/shared/lib/storage/storage-service.js`

### Current Migration Guarantees

- Profile-local schema version stamping
- Legacy `viewMode` → `pageMode` backfill
- Versioned export payload metadata

---

## Timers

Shared timer definitions live in:

- `src/shared/lib/timers/timer-registry.js`

The timer registry maps timer group IDs to their growth-stage intervals and farming math constants. The farming timer set is extracted from the authored groups under:

- `src/content/games/rs3/sections/timers/tasks/farming/groups/`

Each group file (e.g., `herbs.group.js`, `trees.group.js`) exports an array of timer task objects.

---

## Adding New Content — Step-by-Step

### Adding a New Daily Task to RS3

1. Open `src/content/games/rs3/sections/dailies/tasks/dailies.tasks.js`
2. Add a new task object using the `defineTask` factory:
   ```js
   defineTask({
     id: 'my-new-task',
     name: 'My New Task',
     wiki: 'https://runescape.wiki/w/My_New_Task',
     reset: 'daily',
     note: 'Optional tooltip note'
   })
   ```
3. Run `npm run audit` to validate schema compliance
4. Run `npm test` and `npm run build` to confirm no regressions

### Adding a New Section

1. Create `src/content/games/rs3/sections/<name>/<name>.section.js`
2. Create `src/content/games/rs3/sections/<name>/tasks/<name>.tasks.js`
3. Use `defineSection` factory to build the section definition
4. Import the section into the relevant page file under `src/content/games/rs3/pages/`
5. Register the section in `src/app/registries/unified-registry.js`
6. Run the full verification suite

---

## Compatibility Fields

Some authored definitions still carry compatibility fields:

- `legacyMode` — used during `viewMode` → `pageMode` migration backfill
- `legacySectionId` — used to map old `localStorage` keys to new section IDs

These exist **only** for migration and backfill behavior. New runtime features must use canonical page IDs, section IDs, and registry metadata.

---

## Verification

All content changes must pass the full quality gate:

```bash
npm test           # Unit tests
npm run audit      # Import, topology, content, and timer validation
npm run build      # Vite production build
```

### Audit Suite Coverage

| Check | Command | What It Validates |
|---|---|---|
| Import audit | `npm run audit` | No circular deps, no cross-layer violations |
| Topology audit | `npm run audit` | No files in wrong directories |
| Content validation | `npm run audit` | Every task/section schema-compliant |
| Timer validation | `npm run audit` | All farming durations and math constants valid |

### E2E Coverage

The Playwright suite (`tests/e2e/app-smoke.spec.js`) validates:

- RS3 game-selection to tracker-shell render flow
- Page navigation between Tasks, Gathering, and Timers
- OSRS game-selection to empty-state shell flow
