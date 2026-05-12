# Timers and farming page

The timers page is rendered by `src/components/tracker/timers/TimerGroups.svelte`.

## Data shape

Timer section data lives in:

```text
src/content/games/rs3/sections/timers.json
```

Supported hierarchy:

```text
Timer section
└─ group: Herbs / Trees / Specialty
   ├─ timer: Herb Run / Regular Trees / Crystal Tree
   │  └─ plots: Falador / Catherby / etc.
   └─ group-level plots can be shared by a single timer
```

## Rendering rules

- Group labels render as subgroup headers.
- Timer names render as parent headers only when needed, especially for multi-timer groups like Trees and Specialty.
- Plot/location rows render as real task rows, not fake subheaders.
- Row state is stored under the `timers` section key.
- Storage ids use `timers::<timerId>::<plotId>` so locations do not collide across timer parents.

## Common failure to avoid

Do not let Astro schema strip nested `timer.plots`. If `plots` is missing from the timer schema, Trees and Specialty collapse into empty headers.
