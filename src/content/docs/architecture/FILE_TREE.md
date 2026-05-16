# File tree guide

```text
src/components/tracker/
├─ Dashboard.svelte          Route-level tracker dashboard island
├─ Overview.svelte           Pin overview island
├─ Section.svelte            Generic non-timer tracker section
├─ SubgroupHeader.svelte     Collapsible/resettable subgroup header
├─ TaskRow.svelte            Standard task row
└─ timers/
   ├─ TimerGroups.svelte     Farming/timer group renderer
   ├─ TimerParentRow.svelte  Reserved parent-row component
   └─ TimerPlotRow.svelte    Reserved timer plot row adapter
```

```text
src/content/games/
├─ rs3/pages/                RS3 route definitions
├─ rs3/sections/             RS3 task/timer data
├─ osrs/pages/               OSRS route definition
└─ osrs/sections/            Empty OSRS section shells
```

```text
src/lib/
├─ domain/                   JSON-backed page/section helpers for tests/audits
├─ features/settings/        settings defaults and normalization
├─ features/sections/        reset/section state services
├─ features/timers/          timer math and timer definitions
├─ shared/storage/           profile-scoped local storage
└─ shared/time/              reset boundary helpers
```
