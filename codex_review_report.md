# Codex Review Report (Grounded in Current Repo)

Date: 2026-04-15 (America/New_York)  
Repo HEAD reviewed: `d40985c`

## What you asked for (authoritative intent)
- Keep the current theme and interaction language (left info / right interaction).
- Keep the site static (GitHub Pages compatible); no React/Next/Vite/Tailwind/backends.
- Keep right-side utility buttons.
- Keep “More Resources” as-is.
- Replace top section tabs with a compact menu-button-based view switcher.
- Fix Overview:
  - **Opt-in only**: nothing appears unless the user pins items.
  - **Top 5 max**: show up to 5 “coming up” items.
  - **Pinned-only + no filler**: if fewer than 5 qualify, show fewer than 5.
  - Show timers/due info + notes in a clean, compact row format.

## Current repo reality (what exists today)
- `index.html` has top nav tabs: Custom Tasks / Farming / Dailies / Gathering / Weeklies / Monthlies (anchor links).
- `index.html` includes an Overview panel with two buttons: `#view-overview-button` and `#view-all-button`.
- `dailyscape.js` uses a per-profile `viewMode` (`overview` / `all`) and toggles tables visibility.
- Overview content is not implemented: `collectOverviewItems()` returns `[]`.
- Overview styling scaffolding already exists in `dailyscape.css` (`.overview_row`, `.overview_row_title`, `.overview_row_meta`).
- Per-row template is `index.html` `<template id="sample_row">` and the “remove/hide” control is `.hide-button`.

## Decisions locked (per your latest instruction)
- Navigation:
  - Use a **single navbar menu button** to switch views.
  - Remove top section tabs.
  - Remove the Overview/All buttons inside the Overview panel.
- Overview logic:
  - **Pinned-only**, **Top 5 max**, **no filler**.
  - Cooldown/timer-hidden tasks may still appear in Overview with countdowns.
  - Manual hide wins: a hidden row does not appear in Overview even if pinned.
  - Completed pinned tasks are allowed to appear only if they naturally rank in the Top 5 pinned.

## Risks / pitfalls to avoid
- Breaking existing “floating control” patterns (`profile-control`, `settings-control`) when introducing a new `views-control`.
- Accidentally making Overview auto-populate from incomplete tasks (explicitly forbidden).
- Pin button placement: must be immediately left of the existing `.hide-button` in the row template.
- Confusing the old `viewMode` with the new `pageMode`: migrate cleanly to avoid user state loss.

## Acceptance criteria (high signal)
- The top section tabs are gone; “More Resources” and right-side buttons remain.
- Navbar view switcher changes view and persists per profile.
- Overview is empty until at least one item is pinned.
- Overview shows up to 5 pinned items, sorted by “next action time”, and shows timers + notes.
- No filling behavior: 1–4 pinned items display as 1–4 items.
- Hidden rows do not display in Overview even if pinned.
- Cooldown/timer-hidden rows can display in Overview with their countdown.

