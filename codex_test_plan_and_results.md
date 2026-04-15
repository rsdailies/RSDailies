# Codex Test Plan + Results (Base Stage + Implementation)

Date: 2026-04-15 (America/New_York)

## Tests Ran (Base Stage)
Non-mutating syntax checks:
- `node --check dailyscape.js` ✅
- `node --check tasks-config.js` ✅
- `node --check farming-config.js` ✅

## Manual Test Plan (Implementation Acceptance)

### 1) Regression tests (must not break)
- Profiles
  - Open/close panel
  - Switch profile, verify UI updates
  - Create and delete a profile
- Settings
  - Open/close panel
  - Save settings
  - Verify settings apply (split tables, herb ticks, growth offset, etc.)
- Compact mode
  - Toggle compact on/off
  - Verify no layout overlap in navbar or table rows
- Import/Export
  - Export token
  - Import token (use a scratch profile)
- Table behaviors
  - Mark complete on multiple sections
  - Hide rows, show hidden, reset section
  - Reorder where enabled, verify persistence

### 2) Navigation acceptance
- Top section tabs removed (left navbar no longer has section anchors).
- “More Resources” dropdown still works and is unchanged.
- Navbar “Views” menu:
  - opens/closes
  - closes when clicking outside
  - persists selected mode per profile
  - switching modes does not break profiles/settings panels

### 3) Overview acceptance
- Empty by default until pinning:
  - With 0 pins, show empty state only (no auto-fill).
- Pinning:
  - Pin button appears immediately left of hide/remove on hover.
  - Pin persists after refresh.
- Top 5 max, no filler:
  - Pin 2 tasks → Overview shows 2 tasks.
  - Pin 8 tasks → Overview shows 5 tasks.
- Hide wins:
  - Hide a pinned row → it no longer appears in Overview.
- Cooldown/timer-hidden still visible:
  - If a pinned task is hidden due to cooldown, it can still appear in Overview with countdown.

## “Done means…”
- No console errors on load.
- All regressions pass.
- Navigation and Overview acceptance both pass.

