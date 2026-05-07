![Dailyscape Banner](../assets/img/banner.png)

# 🌌 Dailyscape: The Definitive RuneScape Task Ecosystem

**Dailyscape** is a premium, configuration-first task management ecosystem for RuneScape players. Engineered for architectural purity and visual excellence, it transforms the concept of a "tracker" into a dynamic, content-driven runtime engine — where every task, section, and page is authored data, not hardcoded UI.

---

## 📑 Table of Contents

1. [Project Overview](#-project-overview)
2. [Architectural Anatomy — The 7-Layer Framework](#️-architectural-anatomy--the-7-layer-framework)
3. [The Core Engine Mechanics](#-the-core-engine-mechanics)
   - [Data → Runtime Pipeline](#data--runtime-pipeline)
   - [CSS Architecture](#css-architecture)
4. [Technical Implementation Detail](#️-technical-implementation-detail)
   - [Data Schemas](#data-schemas)
   - [State and Persistence](#state-and-persistence)
   - [Reset Orchestration](#reset-orchestration)
5. [Feature Deep-Dive](#-feature-deep-dive)
   - [Precision Timers](#️-precision-timers)
   - [Section Engine](#-section-engine)
   - [Custom Tasks](#-custom-tasks)
   - [Profile System](#-profile-system)
6. [Verification and Quality Assurance](#️-verification-and-quality-assurance)
7. [Developer Guide](#️-developer-guide)
   - [Setup](#setup)
   - [Where Does My File Go?](#where-does-my-file-go)
   - [Adding New Game Content](#adding-new-game-content)
   - [Figma-to-Code Workflow](#figma-to-code-workflow)
8. [Legal and Credits](#️-legal-and-credits)

---

## 🏛️ Project Overview

Dailyscape is built on the philosophy that **Content is Logic**. Unlike traditional trackers that hardcode UI elements, Dailyscape treats every task, section, and page as authored data that feeds into a content-driven runtime engine.

### Core Concept: The Runtime Content Engine

The application acts as a "shell" that hydrates itself from a centralized repository of game data at boot time. This decoupling of **Content (The What)** from **Runtime (The How)** and **UI (The Look)** allows for:

- **Instant Scaling**: Adding a new game (like OSRS) is a matter of adding content files — no new UI logic required.
- **SSoT (Single Source of Truth)**: A task's definition lives in one place and is propagated across the entire system.
- **Predictable Iteration**: Developers and AI agents can modify the tracker with zero risk of breaking core orchestration, because every layer has a strict, enforced boundary.
- **Profile Isolation**: Multiple user profiles (Default, Ironman, etc.) each maintain their own independent completion state, stored via a scoped `localStorage` prefix.

---

## 🛰️ Architectural Anatomy — The 7-Layer Framework

Dailyscape follows a strict 7-layer topology. Each layer is isolated, has a singular responsibility, and follows explicit import direction rules.

```
src/
├── app/        → Orchestration (wires all layers together)
├── content/    → Authored game data (SSoT — no runtime imports)
├── domain/     → Business rules and content resolution
├── features/   → Vertical feature slices (isolated behavior units)
├── shared/     → Cross-cutting utilities (storage, time, state, DOM)
├── theme/      → Token-driven CSS (no JS, loaded via <link> tags)
└── widgets/    → Self-contained UI components
```

### Layer Ownership Map

| Layer | Path | What Lives Here | Canonical Owner |
| :--- | :--- | :--- | :--- |
| **Orchestration** | `src/app/` | Boot, runtime, registries, shell, renderers | `src/app/runtime/render-orchestrator.js` |
| **Content** | `src/content/` | All game task, section, and page definitions | `src/content/games/rs3/` |
| **Domain** | `src/domain/` | Content loading, validation, and resolution | `src/domain/content/content-loader.js` |
| **Features** | `src/features/` | Domain-specific logic, state, storage rules | `src/features/sections/domain/` |
| **Shared** | `src/shared/` | Storage, time utils, state, DOM helpers | `src/shared/lib/storage/keys-builder.js` |
| **Theme** | `src/theme/` | Design tokens, component CSS, layout styles | `src/theme/tokens/tokens.css` |
| **Widgets** | `src/widgets/` | Tracker rows, headers, panels, modals | `src/widgets/tracker/sections/renderers/section-engine.js` |

### Import Direction

```
src/content/    (no imports — pure authored data)
      ↑
src/domain/     (imports: content, shared)
      ↑
src/features/   (imports: domain, shared)
      ↑                      ↑
src/widgets/    (imports: shared — receives features via injection from app)
      ↑
src/app/        (imports: everything — the only layer that can)

src/shared/     (imported by: domain, features, widgets, app)
src/theme/      (loaded via HTML <link> tags only — never imported in JS)
```

---

## 🔄 The Core Engine Mechanics

### Data → Runtime Pipeline

The transformation from a content file to a rendered UI row follows a deterministic, one-way pipeline:

```
1. Authorship   →  Task authored as a JS object in src/content/games/rs3/sections/*/tasks/
2. Loading      →  content-loader.js scans manifests, applies defaults, validates schemas
3. Resolution   →  Resolvers hydrate custom tasks, penguins, and farming timer groups
4. Registration →  unified-registry.js maps tasks to sections/pages per active pageMode
5. Orchestration → render-orchestrator.js detects state change or boot, triggers render loop
6. Rendering    →  tracker-section-renderer.js selects the render variant:
                     → standard, grouped-sections, parent-children, or timer-groups
7. Row Building →  Section engine iterates block contracts (subgroups or rows)
                     → Row factory populates a template with task content
8. Persistence  →  Task state manager binds checkbox to localStorage via StorageKeyBuilder
```

### CSS Architecture

CSS is entirely decoupled from JavaScript through the `src/theme/` layer. Every visual value — colors, spacing, rounding, row heights — lives as a CSS custom property (`--ds-*` token) in `src/theme/tokens/tokens.css`.

No raw pixel values are ever hardcoded in component files. Tracker geometry tokens include:

| Token | Purpose |
|---|---|
| `--ds-row-height` | Canonical row height for all tracker rows |
| `--ds-section-gap` | Vertical gap between subgroups |
| `--ds-rounding-radius` | Border radius for section panels and rows |
| `--ds-checkbox-border` | Checkbox border width and color |

---

## 🛠️ Technical Implementation Detail

### Data Schemas

All content is validated against strict schemas in `src/content/schemas/`.

- **Tasks**: `id`, `name`, `wiki`, `reset` (daily/weekly/monthly/etc.), optional `note`, optional `location`.
- **Sections**: `id`, `label`, `renderVariant`, and either `items` (tasks) or `groups` (subgroups).
- **Pages**: A sequence of `sections` defining the vertical layout of a workspace, plus `game`, `route`, and `legacyMode`.
- **Timer Groups**: `id`, `label`, `tasks` (with `duration`, `speedyDuration`, and location metadata).

### State and Persistence

- **Storage Scoping**: All keys generated through `StorageKeyBuilder` (`src/shared/lib/storage/keys-builder.js`). Page-mode state is scoped by game (`pageMode:rs3`, `pageMode:osrs`).
- **Profile Isolation**: Each profile has its own isolated storage prefix (e.g., `rsdailies:ironman:`).
- **Migration Path**: `src/shared/lib/storage/migrations.js` handles schema versioning (currently v3) — legacy `viewMode` keys are safely backfilled to `pageMode` on first load.
- **Export/Import**: Profiles can be exported as JSON payloads and imported on any device, maintaining full state fidelity.

### Reset Orchestration

The Reset Orchestrator (`src/features/sections/domain/logic/reset-orchestrator.js`) manages temporal logic:

- **Daily Reset**: Triggers at 00:00 UTC. Clears all `reset: 'daily'` tasks.
- **Weekly Reset**: Wednesday/Thursday crossover (RS3-specific). Clears `reset: 'weekly'` tasks.
- **Monthly Reset**: First of the month at 00:00 UTC.
- **Auto-Reset**: On every render, the system checks for "stale" tasks and automatically clears them if their reset window has elapsed — even if the app was closed during the reset moment.

---

## ✨ Feature Deep-Dive

### ⏱️ Precision Timers

The farming timer system uses a high-frequency render loop combined with cached boundary math to provide real-time countdown updates without CPU overhead.

- **Growth Math**: Calculations include "Speedy Growth" potion modifiers (reduces duration by a configured factor) and specific growth-stage intervals per crop type.
- **Timer Groups**: Clustered by category (Fruit Trees, Herbs, Hops, Allotments, Specialty) with animated countdown displays.
- **Boundaries**: `src/shared/lib/time/boundaries.js` calculates the next daily, weekly, and monthly reset times in UTC. `countdowns.js` produces human-readable strings like "2h 14m".

### 📑 Section Engine

The Section Engine (`src/widgets/tracker/sections/renderers/section-engine.js`) is the most sophisticated UI component. It handles:

- **Render Variants**: Dispatches to `standard`, `grouped-sections`, `parent-children`, or `timer-groups` renderers based on the section's `renderVariant` field.
- **Attached Headers**: Subgroup headers that "attach" to the table above without creating a visual gap.
- **Terminal Row Selection**: Automatically detects the last *visible* row in a section to apply bottom rounding, accounting for hidden or completed tasks.
- **Gap Management**: Drives consistent vertical spacing through `--ds-section-gap` tokens — never hardcoded values.
- **Block Contract**: Sections are composed of typed blocks — `{ kind: 'rows', tasks }` or `{ kind: 'subgroup', title, tasks, headerMode }`.

### 👤 Custom Tasks

Users can create their own persistence-aware tasks through the Custom Task modal:

- Custom tasks are stored in `localStorage` under a scoped key and treated as first-class citizens in the rendering pipeline.
- They can be pinned to the Overview panel.
- They support the same hide-on-complete and show-completed behaviors as authored tasks.
- The custom task controller lives in `src/widgets/custom-tasks/modal/custom-task-controller.js`.

### 🧑‍💼 Profile System

Dailyscape supports multiple named profiles for players who maintain different play styles (Main, Ironman, HC Ironman, etc.):

- Each profile has a fully isolated `localStorage` namespace.
- Profiles can be switched without losing any state — all profiles persist simultaneously.
- Profile definitions are stored via `src/features/profiles/domain/`.
- The profile view widget is `src/widgets/profiles/profile-view.js`.

---

## 🛡️ Verification and Quality Assurance

Dailyscape maintains a **"Green Only"** policy. Every change is validated through a multi-gate quality pipeline:

```bash
npm test            # Node.js unit tests (10 tests, 0 failures)
npm run audit       # Import, topology, content, and timer validation
npm run build       # Vite production build (must exit 0)
```

### What Each Gate Validates

| Gate | Command | Validates |
|---|---|---|
| Unit Tests | `npm test` | Registry, settings, timer math, storage, view model |
| Import Audit | `npm run audit` | No cross-layer violations, no circular imports |
| Topology Audit | `npm run audit` | No files misplaced in wrong directories |
| Content Validation | `npm run audit` | Every task/section schema-compliant |
| Timer Validation | `npm run audit` | All farming durations and growth math valid |
| Production Build | `npm run build` | Vite resolves all 189 modules, CSS bundled, no errors |

### E2E Tests

Playwright smoke tests (`tests/e2e/app-smoke.spec.js`) verify:

- RS3 game-selection to tracker-shell render flow
- Navigation between Tasks, Gathering, and Timers pages
- OSRS game-selection to empty-state shell flow

---

## 🛠️ Developer Guide

### Setup

```bash
# Install dependencies
npm install

# Start the local development server (hot reload)
npm run dev

# Preview the production build
npm run build
npm run preview
```

### Where Does My File Go?

| What are you building? | Where does it go? |
|---|---|
| New game task or section | `src/content/games/<game>/sections/<name>/` |
| New business logic on content | `src/domain/` |
| New isolated feature | `src/features/<feature-name>/` |
| Reusable utility (time, math, storage) | `src/shared/lib/<category>/` |
| Reusable UI component | `src/widgets/<widget-name>/` |
| CSS styling | `src/theme/<appropriate-sublayer>/` |
| App wiring, boot, or routing | `src/app/` |

### Adding New Game Content

1. **Create the task file** in `src/content/games/rs3/sections/<section>/tasks/<name>.tasks.js`
2. **Use the factory**:
   ```js
   import { defineTask } from '../../../../factories/define-task.js';

   export const myNewTasks = [
     defineTask({
       id: 'my-task',
       name: 'My Task Name',
       wiki: 'https://runescape.wiki/w/My_Task',
       reset: 'daily',
     }),
   ];
   ```
3. **Import into the section** and add to the section's `items` array.
4. **Run the quality gate**:
   ```bash
   npm run audit && npm test && npm run build
   ```

### Figma-to-Code Workflow

When implementing a new design:

1. **Map visual values** to tokens in `src/theme/tokens/tokens.css` — never hardcode colors or spacing.
2. **Reuse existing widgets** from `src/widgets/` before creating new ones.
3. **Add CSS** to the appropriate `src/theme/` sublayer — not inline in JS.
4. **For new row behavior**: modify the shared row flow in `src/widgets/tracker/rows/factory/` before adding a special-case renderer.
5. **For new section layout**: implement through the section engine block contract, not bespoke renderer conditionals.
6. **Run the full quality gate** before committing.

---

## ⚖️ Legal and Credits

- **RuneScape**: RuneScape and Old School RuneScape are trademarks of Jagex Ltd. Dailyscape is an independent community project and is not affiliated with Jagex.
- **Dailyscape**: Original concept cloned and significantly altered from the original Dailyscape community project. Many thanks to the original contributors for their foundational work.
- **Assets**: All game icons and assets are property of Jagex Ltd. Other icons and assets were generated with AI tools or are original work by the project author.
