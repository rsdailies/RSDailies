# Dailyscape — Full Repo Restructure Blueprint

Date: May 2026
Target Stack:

- Astro 6
- Svelte 5
- TypeScript
- Tailwind v4
- shadcn-svelte
- Vercel

Goal:

- eliminate overlap
- eliminate ownership confusion
- isolate features
- simplify edits
- reduce style collisions
- improve scalability
- improve debugging
- improve onboarding
- improve maintainability
- create predictable architecture

---

# TL;DR

## Current Problem

Current structure is organized by:

- technical type
- partial feature grouping
- shared utility dumping
- cross-cutting CSS
- overlapping logic layers

This creates:

- file collisions
- style conflicts
- duplicated ownership
- difficult tracing
- hidden dependencies

---

# Target Architecture

Move to:

# Feature-Sliced Architecture

Everything related to a feature lives together.

This is the single biggest improvement you can make.

---

# FINAL TARGET STRUCTURE

```txt
src/
│
├── app/
│   ├── config/
│   ├── layouts/
│   ├── providers/
│   ├── router/
│   ├── styles/
│   └── startup/
│
├── pages/
│
├── content/
│   ├── games/
│   ├── guides/
│   └── collections/
│
├── features/
│   ├── tracker/
│   ├── sections/
│   ├── timers/
│   ├── settings/
│   ├── profiles/
│   ├── search/
│   ├── sync/
│   ├── import-export/
│   ├── notifications/
│   ├── farming/
│   ├── tasks/
│   ├── filters/
│   ├── command-palette/
│   └── accessibility/
│
├── entities/
│   ├── task/
│   ├── timer/
│   ├── section/
│   ├── profile/
│   └── game/
│
├── shared/
│   ├── ui/
│   ├── lib/
│   ├── hooks/
│   ├── constants/
│   ├── types/
│   ├── utils/
│   ├── validation/
│   ├── icons/
│   └── themes/
│
└── tests/
    ├── e2e/
    ├── integration/
    ├── unit/
    └── mocks/
```

---

# MAJOR STRUCTURAL RULES

# Rule 1

## Features Own Their Logic

BAD:

```txt
stores/
logic/
services/
components/
```

GOOD:

```txt
features/tracker/
```

Everything tracker-related belongs there.

---

# Rule 2

## Shared Means ACTUALLY Shared

If only one feature uses it:

DO NOT put it in shared.

Keep it inside the feature.

---

# Rule 3

## Components Must Be Thin

Components:

- render
- emit events
- consume state

Components should NOT:

- manage persistence
- perform calculations
- mutate unrelated state
- fetch directly

---

# Rule 4

## Stores Are State Only

Stores should NOT:

- handle persistence
- perform API calls
- contain giant business logic

Services handle logic.

---

# Rule 5

## Styling Is Scoped

Avoid giant global CSS files.

Feature styles stay with features.

---

# RECOMMENDED APP LAYER

# src/app/

Purpose:

Global application setup.

---

# Final Structure

```txt
app/
├── config/
│   ├── env.ts
│   ├── app.config.ts
│   ├── feature-flags.ts
│   └── routes.ts
│
├── layouts/
│   ├── RootLayout.astro
│   ├── DashboardLayout.astro
│   └── DocsLayout.astro
│
├── providers/
│   ├── ThemeProvider.svelte
│   ├── SettingsProvider.svelte
│   └── ToastProvider.svelte
│
├── router/
│   └── navigation.ts
│
├── startup/
│   ├── bootstrap.ts
│   └── hydration.ts
│
└── styles/
    ├── globals.css
    ├── reset.css
    ├── typography.css
    ├── utilities.css
    └── tokens.css
```

---

# MIGRATIONS

## MOVE

```txt
styles/base/*
→ app/styles/
```

## MOVE

```txt
styles/tokens/*
→ app/styles/tokens.css
```

## MOVE

```txt
layouts/*
→ app/layouts/
```

---

# RECOMMENDED FEATURE STRUCTURE

Every feature should follow THIS EXACT SHAPE.

```txt
feature-name/
├── components/
├── stores/
├── services/
├── hooks/
├── utils/
├── styles/
├── types/
├── validation/
├── constants/
├── tests/
├── index.ts
└── README.md
```

---

# FEATURE: TRACKER

# FINAL STRUCTURE

```txt
features/tracker/
├── components/
│   ├── Tracker.svelte
│   ├── TrackerHeader.svelte
│   ├── TrackerBody.svelte
│   ├── TrackerGrid.svelte
│   ├── TrackerToolbar.svelte
│   ├── TrackerSidebar.svelte
│   └── TrackerFooter.svelte
│
├── rows/
│   ├── TrackerRow.svelte
│   ├── CompactRow.svelte
│   ├── MobileRow.svelte
│   └── RowActions.svelte
│
├── cells/
│   ├── CheckboxCell.svelte
│   ├── TimerCell.svelte
│   ├── RewardCell.svelte
│   ├── NotesCell.svelte
│   └── ProgressCell.svelte
│
├── stores/
│   ├── tracker.store.ts
│   ├── selection.store.ts
│   └── ui.store.ts
│
├── services/
│   ├── tracker.service.ts
│   ├── tracker-calculations.service.ts
│   ├── tracker-filter.service.ts
│   ├── tracker-grouping.service.ts
│   └── tracker-sort.service.ts
│
├── utils/
│   ├── tracker-helpers.ts
│   └── tracker-formatters.ts
│
├── hooks/
│   ├── useTracker.ts
│   └── useTrackerFilters.ts
│
├── validation/
│   └── tracker.schema.ts
│
├── types/
│   ├── tracker.types.ts
│   └── tracker.enums.ts
│
├── styles/
│   ├── tracker.css
│   ├── tracker-grid.css
│   └── tracker-mobile.css
│
├── tests/
│   ├── tracker.store.test.ts
│   ├── tracker.service.test.ts
│   └── tracker.ui.test.ts
│
└── index.ts
```

---

# MIGRATIONS

## MOVE

```txt
components/tracker/*
→ features/tracker/components/
```

## MOVE

```txt
stores/tracker*
→ features/tracker/stores/
```

## MOVE

```txt
logic/tracker*
→ features/tracker/services/
```

## MOVE

```txt
styles/tracker/*
→ features/tracker/styles/
```

---

# FEATURE: SECTIONS

# FINAL STRUCTURE

```txt
features/sections/
├── components/
│   ├── Section.svelte
│   ├── SectionHeader.svelte
│   ├── SectionContent.svelte
│   ├── CollapsibleSection.svelte
│   └── SectionTabs.svelte
│
├── stores/
│   └── sections.store.ts
│
├── services/
│   ├── sections.service.ts
│   └── section-visibility.service.ts
│
├── styles/
│   └── sections.css
│
├── types/
│   └── section.types.ts
│
└── index.ts
```

---

# FEATURE: TIMERS

# FINAL STRUCTURE

```txt
features/timers/
├── components/
│   ├── Timer.svelte
│   ├── TimerDisplay.svelte
│   ├── TimerControls.svelte
│   └── CooldownBadge.svelte
│
├── stores/
│   └── timers.store.ts
│
├── services/
│   ├── timers.service.ts
│   ├── cooldown.service.ts
│   └── reset.service.ts
│
├── hooks/
│   └── useTimer.ts
│
├── utils/
│   └── timer-utils.ts
│
├── styles/
│   └── timers.css
│
└── index.ts
```

---

# FEATURE: SETTINGS

# FINAL STRUCTURE

```txt
features/settings/
├── components/
│   ├── SettingsModal.svelte
│   ├── ThemeSettings.svelte
│   ├── AccessibilitySettings.svelte
│   ├── DataSettings.svelte
│   └── LayoutSettings.svelte
│
├── stores/
│   └── settings.store.ts
│
├── services/
│   ├── settings.service.ts
│   └── preferences.service.ts
│
├── validation/
│   └── settings.schema.ts
│
├── types/
│   └── settings.types.ts
│
└── index.ts
```

---

# FEATURE: SEARCH

# FINAL STRUCTURE

```txt
features/search/
├── components/
│   ├── SearchBar.svelte
│   ├── SearchResults.svelte
│   └── SearchFilters.svelte
│
├── stores/
│   └── search.store.ts
│
├── services/
│   ├── search.service.ts
│   └── fuse.service.ts
│
├── hooks/
│   └── useSearch.ts
│
└── index.ts
```

---

# FEATURE: COMMAND PALETTE

# FINAL STRUCTURE

```txt
features/command-palette/
├── components/
│   ├── CommandPalette.svelte
│   ├── CommandInput.svelte
│   └── CommandResults.svelte
│
├── services/
│   └── command.service.ts
│
├── stores/
│   └── command.store.ts
│
└── index.ts
```

---

# FEATURE: IMPORT/EXPORT

# FINAL STRUCTURE

```txt
features/import-export/
├── components/
│   ├── ExportButton.svelte
│   ├── ImportModal.svelte
│   └── BackupManager.svelte
│
├── services/
│   ├── export.service.ts
│   ├── import.service.ts
│   └── backup.service.ts
│
├── validation/
│   └── import.schema.ts
│
└── index.ts
```

---

# FEATURE: NOTIFICATIONS

# FINAL STRUCTURE

```txt
features/notifications/
├── components/
│   ├── Toast.svelte
│   ├── ToastContainer.svelte
│   └── NotificationCenter.svelte
│
├── stores/
│   └── notifications.store.ts
│
├── services/
│   └── notifications.service.ts
│
└── index.ts
```

---

# ENTITY LAYER

Entities are reusable domain models.

NOT feature logic.

---

# FINAL STRUCTURE

```txt
entities/
├── task/
│   ├── task.types.ts
│   ├── task.schema.ts
│   ├── task.constants.ts
│   └── task.utils.ts
│
├── timer/
├── section/
├── game/
└── profile/
```

---

# WHAT BELONGS IN ENTITIES?

ONLY:

- schemas
- pure domain types
- validation
- constants
- serialization

NOT:

- UI
- stores
- feature state

---

# SHARED LAYER

# FINAL STRUCTURE

```txt
shared/
├── ui/
├── lib/
├── hooks/
├── constants/
├── types/
├── utils/
├── validation/
├── icons/
└── themes/
```

---

# SHARED/UI

Critical.

This becomes your design system.

---

# FINAL STRUCTURE

```txt
shared/ui/
├── button/
├── modal/
├── panel/
├── dropdown/
├── tooltip/
├── tabs/
├── table/
├── form/
├── input/
├── switch/
├── badge/
├── avatar/
├── scroll-area/
└── skeleton/
```

---

# EXAMPLE COMPONENT SHAPE

```txt
button/
├── Button.svelte
├── button.types.ts
├── button.variants.ts
├── button.test.ts
└── index.ts
```

---

# IMPORTANT

DO NOT create giant:

```txt
components/
```

folders anymore.

That is what caused overlap.

---

# SHARED/LIB

Use for:

```txt
shared/lib/
├── storage/
├── analytics/
├── dates/
├── formatting/
├── browser/
├── accessibility/
└── animation/
```

---

# STORAGE REFACTOR

# CURRENT PROBLEM

Storage logic appears spread around.

This must become centralized.

---

# FINAL STRUCTURE

```txt
shared/lib/storage/
├── local-storage.ts
├── indexed-db.ts
├── persistence.ts
├── migrations.ts
└── serialization.ts
```

---

# IMPORTANT

Stores should NOT directly access localStorage.

Instead:

```txt
store
→ service
→ storage layer
```

---

# CSS RESTRUCTURE

# REMOVE

```txt
styles/components/
styles/pages/
styles/tracker/
styles/shell/
```

These are causing overlap.

---

# REPLACE WITH

```txt
app/styles/
```

ONLY for:

- reset
- typography
- tokens
- utilities
- themes

AND:

feature-local CSS.

---

# RECOMMENDED TAILWIND STRUCTURE

```txt
src/
├── app/styles/globals.css
├── shared/ui/
└── features/
```

Tailwind handles most layout/styling.

Feature CSS handles exceptions.

---

# MIGRATION PLAN

# PHASE 1 — PREP

## Create New Root Structure

Create:

```txt
app/
features/
entities/
shared/
```

DO NOT delete old folders yet.

---

# PHASE 2 — MOVE FEATURES

Order:

1. tracker
2. sections
3. timers
4. settings
5. notifications
6. import/export

Move ONE feature at a time.

Verify after every move.

---

# PHASE 3 — STORAGE NORMALIZATION

Centralize:

- persistence
- serialization
- migrations
- local storage
- indexedDB

---

# PHASE 4 — UI SYSTEM

Introduce:

- shadcn-svelte
- reusable primitives
- variants
- utility classes

---

# PHASE 5 — CSS CLEANUP

Delete:

- overlapping globals
- page CSS
- shell CSS
- duplicated variables

---

# PHASE 6 — IMPORT ALIASES

# tsconfig.json

```json
{
  "compilerOptions": {
    "paths": {
      "@app/*": ["src/app/*"],
      "@features/*": ["src/features/*"],
      "@entities/*": ["src/entities/*"],
      "@shared/*": ["src/shared/*"]
    }
  }
}
```

---

# IMPORT RULES

# GOOD

```ts
import { trackerStore } from '@features/tracker';
```

# BAD

```ts
../../../stores/trackerStore
```

---

# BARREL EXPORTS

Every feature should expose:

```txt
index.ts
```

Example:

```ts
export * from './stores/tracker.store';
export * from './services/tracker.service';
export { default as Tracker } from './components/Tracker.svelte';
```

---

# TEST RESTRUCTURE

# FINAL STRUCTURE

```txt
tests/
├── unit/
├── integration/
├── e2e/
└── mocks/
```

Feature-specific tests remain inside features.

Cross-feature tests go here.

---

# RECOMMENDED LIBRARIES

# UI

```txt
shadcn-svelte
```

---

# TABLES

```txt
TanStack Table
```

---

# SEARCH

```txt
Fuse.js
```

---

# STORAGE

```txt
Dexie
```

---

# VALIDATION

```txt
zod
```

---

# MOTION

```txt
motion
```

---

# FORMS

```txt
superforms
```

---

# RESPONSIVE STRATEGY

Current likely issue:

Desktop-first styling.

Switch to:

# Mobile-first

Required.

---

# RESPONSIVE RULES

Every feature gets:

```txt
Desktop
Tablet
Mobile
Compact
```

variants.

---

# RECOMMENDED FILE SIZE RULES

# HARD LIMITS

## Components

```txt
250-300 lines max
```

---

## Services

```txt
400 lines max
```

---

## Stores

```txt
150 lines max
```

---

## CSS

```txt
300 lines max
```

---

# WHEN TO SPLIT FILES

Split immediately when:

- feature has multiple responsibilities
- component has multiple layouts
- file exceeds limits
- conditional rendering explodes
- styles become nested messes

---

# EXAMPLE REFACTOR

# BAD

```txt
Tracker.svelte
```

contains:

- toolbar
- sidebar
- rows
- timers
- filters
- mobile layout
- desktop layout
- actions
- persistence
- sorting
- searching

---

# GOOD

```txt
Tracker.svelte
→ orchestration only
```

Everything else extracted.

---

# RECOMMENDED PRIORITY ORDER

# FIRST

1. feature folders
2. storage cleanup
3. CSS cleanup
4. UI primitives

---

# SECOND

5. command palette
6. search
7. responsive rewrite
8. accessibility

---

# THIRD

9. sync layer
10. cloud profiles
11. APIs
12. plugins/extensions

---

# FINAL RESULT

After this restructure:

You will gain:

- predictable ownership
- isolated edits
- reduced overlap
- easier debugging
- easier onboarding
- scalable architecture
- faster development
- easier styling
- cleaner imports
- safer refactors
- better testing
- easier future AI assistance

Most importantly:

You stop fighting your architecture.

Instead:

The architecture starts helping you.

