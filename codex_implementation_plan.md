# Codex Implementation Plan (Decision-Complete)

Date: 2026-04-15 (America/New_York)  
Target repo: RSDailies (static GitHub Pages)

## Summary
Implement a single navbar “Views” menu-button switcher, remove the old top tabs and the Overview/All buttons, add a per-row “Pin to Overview” control, and implement Overview as pinned-only Top 5 with no filler. Preserve theme, controls, and existing behaviors.

## Files to change
- `index.html` (navbar + overview panel + row template)
- `dailyscape.js` (pageMode, views control, pins, Overview rendering, visibility)
- `dailyscape.css` (views-control styling + pin-button placement/hover + minor Overview header tweak)

## Storage model (per profile; uses existing profile-prefixed keys)
- `pageMode`: string enum
  - Allowed: `overview`, `all`, `custom`, `rs3farming`, `rs3daily`, `gathering`, `rs3weekly`, `rs3monthly`
- `overviewPins`: object map `{ [pinId: string]: true }`

### Backward compatibility (migration)
If `pageMode` is missing:
- Read legacy `viewMode`:
  - `overview` → `pageMode = "overview"`
  - otherwise → `pageMode = "all"`
- Save `pageMode` so subsequent loads are consistent.

## View switcher UI (navbar)
### HTML changes (`index.html`)
1. Remove left nav `<li>` items for section anchor tabs:
   - Custom Tasks, Farming, Dailies, Gathering, Weeklies, Monthlies
2. Keep “More Resources” dropdown unchanged.
3. Replace the current `#overview-button` right-side button with a new button:
   - `id="views-button"`, `href="#"`, keep `expanding_button` style.
4. Add a floating panel `div` similar to profile/settings:
   - `id="views-control"`, `data-display="none"`, initially hidden, with a `ul id="views-list"`.

### JS behavior (`dailyscape.js`)
Add `setupViewsControl()`:
- Clicking `#views-button` opens `#views-control` (and closes other floating controls).
- Populate `#views-list` with links for the allowed views.
- Clicking a view:
  - `setPageMode(mode)`
  - close floating controls
  - `renderApp()`
- Active view is visually marked (e.g., `"(active)"` suffix or CSS class).

Update existing floating-control functions:
- `closeFloatingControls()` must include `views-control`.
- `setupGlobalClickCloser()` must treat `#views-button` / `#views-control` as “inside click”.

## Remove Overview/All buttons (Overview panel)
### HTML changes (`index.html`)
- Delete the buttons:
  - `#view-overview-button`
  - `#view-all-button`
- Keep the Overview panel header and title.

### JS changes (`dailyscape.js`)
- Remove `getViewMode()` / `setViewMode()` usage and `setupOverviewControls()` wiring.
- Replace with:
  - `getPageMode()` / `setPageMode()`
  - Overview mode is when `pageMode === "overview"`.

## Row pinning UI
### HTML changes (`index.html`)
In `<template id="sample_row">`:
- Insert a new button immediately before `.hide-button`:
  - `button.pin-button.btn.btn-secondary.btn-sm.active`
  - Initial label can be a hollow star `☆` (unpinned) / filled `★` (pinned)
  - Title toggles: “Pin to Overview” / “Unpin from Overview”

### CSS changes (`dailyscape.css`)
- Position pin button to the left of hide button:
  - `.pin-button { right: 52px; }`
  - `.hide-button { right: 10px; }` (existing)
- Show on row hover similarly to hide button:
  - `tr:hover ... button.pin-button { display: inline-block; }`
- Hide pins for child rows if desired (recommended for v1 to avoid clutter):
  - `.farming-child-row ... button.pin-button { display: none !important; }`

### JS changes (`dailyscape.js`)
In `createBaseRow()`:
- Find `.pin-button` from the cloned template.
- Determine a stable `pinId`:
  - If `taskId` already contains `::` (child id format), use `taskId` as pinId.
  - Else use `${sectionKey}::${taskId}`.
- Read pins from `getOverviewPins()`.
- Render pinned state:
  - pinned → `★`
  - unpinned → `☆`
- On click:
  - toggle pin in `overviewPins`
  - `renderApp()` (simplest) or `renderOverviewPanel()` (optimized)

## Overview logic (pinned-only Top 5, no filler)
### Item collection
Implement `collectOverviewItems(sections)`:
- Read `overviewPins`; if empty, return `[]`.
- Iterate tasks in sections:
  - `custom`, `rs3daily`, `gathering`, `rs3weekly`, `rs3monthly`
  - (Farming is header-driven; v1 pins apply to normal rows rendered from the template.)
- Include only if `overviewPins[pinId] === true`.
- Exclude if row is manually hidden (`hiddenRows` for that section contains the task id) → **hide wins**.

### nextActionAt ranking
Compute `nextActionAtMs` per pinned item:
1. If cooldown exists and active: `cooldowns[taskId].readyAt`
2. Else if task is completed:
   - if task has `reset`: next reset boundary (`nextDailyBoundary/nextWeeklyBoundary/nextMonthlyBoundary`)
   - else: `Infinity` (effectively excluded by top-5 cap)
3. Else (not completed):
   - if task has `reset`: use `getTaskAlertTarget(task)` (deadline-aware)
   - else: `Date.now()`

Sort ascending and take `.slice(0, 5)` (Top 5 max, pinned-only).
No filler: do not pad to 5.

### Rendering
Update `renderOverviewPanel()`:
- Always render content into `#overview-content`.
- Empty state text if `items.length === 0`:
  - “Pin rows to show them here.”
- For each item:
  - `.overview_row`
    - `.overview_row_title`: task name
    - `.overview_row_meta`: `${SectionLabel} • ${CountdownText}`
    - optional `.overview_row_meta`: note text if present

### Visibility by pageMode
Implement `applyPageModeVisibility(pageMode)`:
- If `overview`:
  - show `#overview-panel`
  - hide `.activity_tables`
- Else if `all`:
  - show `#overview-panel`
  - show `.activity_tables`
  - show all section containers
- Else (section modes):
  - show `#overview-panel`
  - show `.activity_tables`
  - show only the selected section container, hide the others

Mapping mode → container id uses existing `getContainerId(sectionKey)`.

## Test plan (what must be verified)
### Non-mutating checks (can run any time)
- `node --check dailyscape.js`
- `node --check tasks-config.js`
- `node --check farming-config.js`

### Manual acceptance (must pass)
- Navigation:
  - top section tabs removed
  - navbar Views menu switches modes and persists per profile
  - More Resources unaffected
- Overview:
  - empty until pin
  - pinned-only, max 5, no filler
  - hidden rows never appear
  - cooldown/timer-hidden tasks can still appear with countdown
- Regression:
  - profiles, settings, compact mode, import/export unchanged
  - hide/show/reset/order/sort still work

