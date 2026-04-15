# Codex Task List (Base Stage → Implementation)

Date: 2026-04-15 (America/New_York)

This is a linear checklist designed so you can stop at any phase and still have a stable site.

## Phase A — Base stage (docs + safety checks)
- [ ] Confirm working tree is clean before changes
- [ ] Run `node --check dailyscape.js`
- [ ] Run `node --check tasks-config.js`
- [ ] Run `node --check farming-config.js`
- [ ] Ensure these docs exist (artifact pack):
  - [ ] `codex_review_report.md`
  - [ ] `codex_handoff_report.md`
  - [ ] `codex_implementation_plan.md`
  - [ ] `codex_task_list.md`
  - [ ] `codex_visual_examples.md`
  - [ ] `codex_test_plan_and_results.md`
- [ ] Commit “Base stage: codex artifact pack”
- [ ] Push to `origin/main` (this is the revert point)

## Phase B — UI: navbar view switcher
- [ ] Remove top section tabs from `index.html`
- [ ] Add navbar “Views” menu-button (right side)
- [ ] Add floating `views-control` panel (like profile/settings)
- [ ] Implement `pageMode` storage per profile in `dailyscape.js`
- [ ] Implement `setupViewsControl()` and integrate into global closer
- [ ] Verify: More Resources still works; profiles/settings still open/close correctly

## Phase C — UI: remove Overview/All buttons
- [ ] Remove `#view-overview-button` and `#view-all-button` from `index.html`
- [ ] Delete `setupOverviewControls()` usage and legacy `viewMode` dependency
- [ ] Implement visibility rules:
  - [ ] `overview` hides tables
  - [ ] `all` shows all tables
  - [ ] section modes show only the selected section table

## Phase D — Row pinning
- [ ] Add `pin-button` to `<template id="sample_row">` (left of hide/remove)
- [ ] Add CSS for pin hover + positioning
- [ ] Add `overviewPins` storage per profile
- [ ] Toggle pin on click; persist + rerender

## Phase E — Overview Top 5 (pinned-only, no filler)
- [ ] Implement `collectOverviewItems()`:
  - [ ] pinned-only
  - [ ] hide wins (manually hidden excluded)
  - [ ] cooldown-hidden can still appear with countdown
  - [ ] sort by `nextActionAt`, cap 5, no filler
- [ ] Implement Overview render:
  - [ ] title + meta + note
  - [ ] empty state if no pins qualify

## Phase F — Regression + acceptance
- [ ] Profiles regression
- [ ] Settings regression
- [ ] Compact mode regression
- [ ] Import/Export regression
- [ ] Hide/show/reset/order regression
- [ ] View switching acceptance
- [ ] Overview pinning acceptance

## Phase G — Final handoff (no push)
- [ ] Provide screenshots / wireframe confirmation notes
- [ ] Leave changes local (do not push)
- [ ] Optional: local commit(s) for review (still no push)

