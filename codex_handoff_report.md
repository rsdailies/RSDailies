# Codex Coder Handoff Report (Task / Files / Find / Replace / Test)

Date: 2026-04-15 (America/New_York)  
Baseline reference: repo `main` @ `d40985c`

## Non-negotiables
- Static site only, GitHub Pages compatible.
- Do not rewrite into React/Vite/Next/Tailwind or add a backend.
- Do not change the theme; do not convert to “cards”.
- Keep “More Resources” unchanged.
- Keep right-side utility buttons and existing interaction language.
- Overview is opt-in, pinned-only, Top 5 max, **no filler**.

---

## Task 0 — Baseline sanity (no behavior changes)
**Files:** `dailyscape.js`, `tasks-config.js`, `farming-config.js`  
**Run:**
- `node --check dailyscape.js`
- `node --check tasks-config.js`
- `node --check farming-config.js`
**Expected:** no output, exit code 0.

---

## Task 1 — Navbar: remove top section tabs; add “Views” switcher

### Files
- `index.html`
- `dailyscape.css`
- `dailyscape.js`

### Find (index.html)
The left navbar `<ul class="navbar-nav mr-auto">` block currently contains:
- `<a href="#custom-tasks" ...>Custom Tasks</a>`
- `<a href="#farming" ...>Farming</a>`
- `<a href="#dailies" ...>Dailies</a>`
- `<a href="#gathering" ...>Gathering</a>`
- `<a href="#weeklies" ...>Weeklies</a>`
- `<a href="#monthlies" ...>Monthlies</a>`

### Replace
- Remove those `<li class="nav-item">` entries entirely.
- Keep the `More Resources` dropdown entry as-is.

### Add (index.html)
Replace the existing right-side `#overview-button` block with a Views menu button + panel:
- Button: `id="views-button"` (use existing `expanding_button` style)
- Panel: `div id="views-control"` with `ul id="views-list"`, initially hidden like `profile-control`.

### Update CSS (dailyscape.css)
Add `#views-control` to match the positioning and style of:
- `#profile-control`
- `#settings-control`

### Update JS (dailyscape.js)
Add:
- `getPageMode()` / `setPageMode(mode)` (allowed modes: `overview`, `all`, `custom`, `rs3farming`, `rs3daily`, `gathering`, `rs3weekly`, `rs3monthly`)
- `setupViewsControl()`
Update:
- `closeFloatingControls()` to include `views-control`
- `setupGlobalClickCloser()` to treat `#views-button` / `#views-control` as inside-click elements

### Test
- Views menu opens/closes like Profiles/Settings.
- Selecting a view persists after refresh and respects the current profile.
- More Resources remains functional.

---

## Task 2 — Remove Overview/All buttons in the Overview panel

### Files
- `index.html`
- `dailyscape.js`

### Find (index.html)
Inside `#overview-panel`, remove:
- `<button id="view-overview-button" ...>Overview</button>`
- `<button id="view-all-button" ...>All</button>`

### Replace
- Keep only the title area; no buttons inside the Overview panel.

### Update JS (dailyscape.js)
Remove dependency on:
- `getViewMode()`
- `setViewMode()`
- `setupOverviewControls()`

Replace with:
- `pageMode` driving whether tables are shown:
  - `overview` hides `.activity_tables`
  - other modes show `.activity_tables`

### Test
- No console errors.
- Switching to Overview mode hides the tables.
- Switching to All or a section view shows tables correctly.

---

## Task 3 — Add “Pin to Overview” button next to hide/remove

### Files
- `index.html`
- `dailyscape.css`
- `dailyscape.js`

### Find (index.html)
Row template:
`<template id="sample_row"> ... <button class="hide-button ..."> ... </button> ... </template>`

### Replace / Add
Add pin button immediately before the hide button:
- `button.pin-button.btn.btn-secondary.btn-sm.active`
- Use `☆` (unpinned) / `★` (pinned)

### CSS changes (dailyscape.css)
- Position `.pin-button` to the left of `.hide-button`:
  - `.pin-button { right: 52px; }`
  - `.hide-button { right: 10px; }` (already)
- Display pin on hover like hide:
  - `tr:hover ... button.pin-button { display: inline-block; }`
- (Recommended) hide pin for child rows:
  - `.farming-child-row ... button.pin-button { display: none !important; }`

### JS changes (dailyscape.js)
Add storage helpers:
- `getOverviewPins()` / `saveOverviewPins(pins)`
In `createBaseRow()`:
- compute `pinId`:
  - if `taskId` contains `::` use `taskId`, else `${sectionKey}::${taskId}`
- toggle pin on click
- re-render app

### Test
- Pin state persists after refresh and per-profile.
- Pin button sits immediately left of hide/remove button.

---

## Task 4 — Implement Overview: pinned-only Top 5 coming up (NO FILL)

### Files
- `dailyscape.js`
- `dailyscape.css` (minor if needed)

### Find (dailyscape.js)
Overview stub:
- `function collectOverviewItems() { return []; }`

### Replace (logic)
Implement:
- pinned-only selection using `overviewPins`
- exclude manually hidden rows (`hiddenRows` wins)
- ranking by `nextActionAt`:
  1) active cooldown → cooldown readyAt
  2) completed + reset → next reset boundary
  3) not completed + reset → alert target (deadline aware)
  4) otherwise → now
- sort ascending, `slice(0, 5)`
- **no filler**

### Replace (rendering)
Update `renderOverviewPanel()`:
- empty state: “Pin rows to show them here.”
- render `.overview_row` entries with title, meta (section + countdown), and note line if present

### Test
- With 0 pins: empty state only.
- With 1–4 pins: 1–4 rows render (no padding).
- With 6 pins: only 5 render.
- Hidden pinned row never appears.
- Cooldown-hidden pinned row can appear with countdown.

---

## Task 5 — Regression checklist (must pass)
- Profiles: switching profiles still works and updates UI.
- Settings: toggles still apply; no broken panel behavior.
- Compact mode toggle works.
- Import/Export still works.
- Completing/hiding/resetting/ordering tasks still works.

