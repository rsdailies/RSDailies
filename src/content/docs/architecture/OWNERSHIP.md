# Ownership boundaries

## Astro owns

- route files in `src/pages/`
- global document layout in `src/layouts/`
- content collection loading through `src/content.config.ts`
- static HTML composition before hydration

## Svelte owns

- navbar rendering
- modal rendering
- overview rendering
- tracker table rendering
- section collapse/reset controls
- row complete/hide/pin controls
- farming/timer hierarchy rendering

## Storage/services own

- local storage namespacing
- import/export token encoding
- reset boundaries
- timer math
- content audits

## Forbidden architecture

Do not add any new code that:

- calls a global table renderer
- imperatively injects tracker rows into the dashboard
- keeps a duplicate renderer beside Svelte
- uses old injected shell HTML as the active UI source
