# AI request scoping guide

Use narrow prompts. Do not ask an agent to rewrite the whole app unless you are prepared to review everything.

## Safe request buckets

### Routing/layout only

Scope:

- `src/pages/`
- `src/layouts/`
- `src/components/layout/`
- `src/bootstrap/`

Do not touch tracker rows, timer data, or content JSON.

### Content only

Scope:

- `src/content.config.ts`
- `src/content/games/`
- `src/lib/domain/`

Do not touch Svelte markup or CSS.

### Timer/farming only

Scope:

- `src/components/tracker/timers/`
- `src/content/games/rs3/sections/timers.json`
- `src/lib/features/timers/`

Do not touch RS3 daily/weekly/monthly, OSRS, navbar, or modals.

### Row visual parity only

Scope:

- `src/components/tracker/TaskRow.svelte`
- `src/styles/tracker/`
- `src/styles/base/states.css`

Do not touch content loading or routing.

## Red flags

Stop any agent that proposes:

- adding any global table renderer
- injecting dashboard HTML manually
- creating a second tracker renderer
- moving content back out of `src/content/games/`
