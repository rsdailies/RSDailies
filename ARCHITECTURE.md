# Dailyscape — Framework Architecture

## Guiding Principle
**One owner per concept.** Every file lives in exactly one place, and its location tells you what it does and who can import it.

---

## `src/` Directory Map

```
src/
├── app/          → Orchestration layer (wires everything together)
├── content/      → Authored game data (SSoT — never import into content)
├── domain/       → Top-level business rules and content resolution
├── features/     → Vertical feature slices (self-contained behavior units)
├── shared/       → Cross-cutting utilities (lib, state, ui primitives)
├── theme/        → Token-driven CSS (no JS logic, no business rules)
└── widgets/      → Self-contained UI components (consume shared + theme)
```

---

## Layer Responsibilities

### `src/app/`
The orchestration brain. Boots the application, wires up features, manages the shell HTML entry, handles routing and renderers.

- `boot/` — Entry point (`bootstrap.js`, `main.js`)
- `shell/` — HTML shell, layout loader, app-shell runtime
- `registries/` — Unified section/page/timer registry
- `runtime/` — Render orchestrator and composition root
- `renderers/` — Top-level page renderer dispatch
- `styles/` — App-wide CSS entry (`main.css`)

### `src/content/`
Pure authored data. Game tasks, section definitions, page layouts. **No imports from `app`, `features`, or `widgets` are allowed here.** This is the SSoT for all game content.

- `games/rs3/` — RS3 task and section definitions
- `games/osrs/` — OSRS task and section definitions

### `src/domain/`
Top-level resolution and business logic that operates on `content`. Resolves content to runtime representations.

- `content/` — Content loader and resolvers
- `resolution/` — Runtime resolver utilities

### `src/features/`
Vertical slices of isolated behavior. Each feature owns its own state, storage keys, and domain logic. Features do **not** import from other features.

- `cooldowns/`, `notifications/`, `penguins/`, `profiles/`
- `sections/`, `settings/`, `timers/`, `view-controller/`

### `src/shared/`
Cross-cutting utilities consumed by multiple layers. Has no knowledge of game content or features.

- `lib/storage/` — Storage service, key builder, migrations
- `lib/time/` — Boundaries, countdowns, formatters
- `lib/calculators/` — XP, gold, efficiency calculations
- `lib/ids/` — Section ID helpers
- `lib/timers/` — Timer registry
- `state/` — Shared runtime state (game context, task state machine)
- `ui/` — Shared UI primitives (tooltips, panel controls, DOM helpers)

### `src/theme/`
Token-driven CSS architecture. **No JS imports.** Loaded via `<link>` tags in `index.html`.

- `tokens/` — Design tokens (colors, spacing, rounding, etc.)
- `base/` — Global resets and foundation styles
- `components/` — Buttons, modals, headers
- `shell/` — Layout, controls, responsive overrides
- `tracker/` — Row, column, table, farming section styles
- `pages/` — Page-level styles (overview panel, etc.)

### `src/widgets/`
Self-contained UI components. Each widget is a cohesive unit of markup + behavior. Widgets can import from `shared/` and `theme/` but **not from `app/` or `features/`** directly — they receive data via dependency injection.

- `headers/` — Section panel headers, table section headers
- `tracker/` — Tracker rows, columns, sections, tables
- `custom-tasks/` — Custom task modal and controller
- `import-export/` — Import/export UI and logic
- `overview/` — Overview panel
- `profiles/` — Profile switcher view
- `settings/` — Settings menu

---

## Import Direction Rules

```
content  ←  domain  ←  features  ←  app
                    ←  widgets   ←  app
shared   ←  (everyone except content)
theme    ←  (HTML only, via <link> tags)
```

- `content` imports nothing from `src/`
- `domain` imports only from `content` and `shared`
- `features` imports from `domain` and `shared`
- `widgets` imports from `shared` only; receives feature deps via injection
- `app` imports from everything; it is the only layer allowed to do so

---

## Adding New Files — Decision Tree

| What are you building? | Where does it go? |
|---|---|
| New game task or section data | `src/content/games/<game>/` |
| New business rule operating on content | `src/domain/` |
| New isolated feature (state + behavior) | `src/features/<feature-name>/` |
| Reusable utility (time, storage, math) | `src/shared/lib/` |
| Reusable UI component | `src/widgets/<widget-name>/` |
| CSS styling | `src/theme/<layer>/` |
| App wiring / boot / routing | `src/app/` |

---

## Build Entrypoint

- **HTML Shell**: `src/app/shell/html/index.html`
- **JS Entry**: `src/app/boot/main.js` (via inline `<script type="module">` in shell)
- **CSS**: All stylesheets loaded as `<link>` tags from `src/theme/**`
- **Build Tool**: Vite 5 (`vite.config.js`)
- **Output**: `dist/`
