---
title: File Tree
description: Current high-level source tree layout for the Astro and Svelte application.
---

# File tree guide

```text
src/app/
├─ layout/                     Main Astro shell, footer, and global stylesheet imports
├─ state/                      App-shell state such as modal routing
└─ styles/                     Tokens, layout, controls, responsive rules, and tracker CSS
```

```text
src/features/
├─ navigation/                 Topbar, menus, game switching, and settings/profile controls
├─ tracker/                    Dashboard, overview, sections, rows, pins, and tracker facade
├─ timers/                     Timer math, runtime helpers, display chips, and timer row IDs
├─ sections/                   Reset policy, section registry, and section-level orchestration
├─ settings/                   Settings defaults, normalization, and persistence
└─ import-export/              Import/export modal workflow
```

```text
src/entities/ + src/shared/
├─ entities/task/              Task, section, page, timer, and pinned-task types/content adapters
├─ entities/game/              Game-specific resolvers such as penguin enrichment
├─ shared/storage/             Profile-scoped local storage and key building
├─ shared/time/                Reset boundaries, time formatting, and live time store
├─ shared/ui/                  Modal primitives and shared UI atoms
└─ shared/utils/               Reusable formatting and routing helpers
```

```text
src/content/games/
├─ rs3/pages/                  RS3 route definitions
├─ rs3/sections/               RS3 task and timer data
├─ osrs/pages/                 OSRS route definitions
└─ osrs/sections/              OSRS section shells and incremental content
```
