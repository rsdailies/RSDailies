---
title: Request Scoping
description: Guidance for scoping repo changes and keeping implementation requests targeted.
---

# AI request scoping guide

Use narrow prompts. Do not ask an agent to rewrite the whole app unless you are prepared to review everything.

## Safe request buckets

### Routing/layout only

Scope:

- `src/pages/`
- `src/app/layout/`
- `src/features/navigation/`
- `src/shared/ui/`

Do not touch tracker rows, timer data, or content JSON.

### Content only

Scope:

- `src/content.config.ts`
- `src/content/games/`
- `src/entities/task/`

Do not touch Svelte markup or CSS.

### Timer/farming only

Scope:

- `src/features/tracker/components/section/SectionBody.svelte`
- `src/features/timers/services/`
- `src/features/sections/section-resolution.ts`
- `src/content/games/rs3/sections/timers.json`

Do not touch RS3 daily/weekly/monthly, OSRS, navbar, or modals.

### Row visual parity only

Scope:

- `src/features/tracker/components/TaskRow.svelte`
- `src/features/tracker/components/row/`
- `src/app/styles/`

Do not touch content loading or routing.

## Red flags

Stop any agent that proposes:

- adding any global table renderer
- injecting dashboard HTML manually
- creating a second tracker renderer
- moving content back out of `src/content/games/`
