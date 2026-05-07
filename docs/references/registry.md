# Dailyscape Reference Registry

This document tracks external URLs, CDN dependencies, and notable integration points used by the current app.

## Table of Contents

1. [UI Dependencies](#ui-dependencies)
2. [Project Links](#project-links)
3. [RuneScape References](#runescape-references)
4. [Integration Notes](#integration-notes)
5. [Maintenance Rule](#maintenance-rule)

---

## UI Dependencies

| Purpose | Location | Reference |
|---|---|---|
| Bootstrap CSS | `src/app/shell/html/index.html` | `https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css` |
| Bootstrap JS bundle | `src/app/shell/html/index.html` | `https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js` |

> ⚠️ Bootstrap is loaded via CDN. If you need to pin a version, update both the CSS and JS links in `src/app/shell/html/index.html` together.

---

## Project Links

| Purpose | Location | Reference |
|---|---|---|
| Repository link | App shell navbar and footer | `https://github.com/rsdailies/RSDailies` |
| Discord/community link | App shell navbar and footer | Configured in shell markup |

---

## RuneScape References

| Purpose | Reference |
|---|---|
| RuneScape Wiki | `https://runescape.wiki/` |
| Money making guide | `https://runescape.wiki/w/Money_making_guide` |
| Distractions and Diversions | `https://runescape.wiki/w/Distractions_and_Diversions` |
| PVM Encyclopedia | `https://pvme.github.io` |
| Runepixels | `https://runepixels.com/` |

---

## Integration Notes

| Area | Location | Notes |
|---|---|---|
| Grand Exchange and wiki-backed utilities | `src/app/runtime/app-core/fetch-profits.js` | UI should consume domain/app services instead of fetching directly in renderers. |
| Penguin data proxy | `vite.config.js`, `src/features/penguins/` | Dev and preview flows support the configured penguin endpoint path (`/api/penguins/actives`). The proxy is defined in `vite.config.js` via `penguinProxyPlugin()`. |
| Storage keys | `src/shared/lib/storage/keys-builder.js` | All localStorage keys must be constructed through `StorageKeyBuilder` — never hardcoded strings. |
| Timer math | `src/shared/lib/timers/timer-registry.js` | Farming growth intervals and Speedy Growth modifiers live here. |

---

## Maintenance Rule

When adding an external dependency or URL:

1. Add it to this document.
2. Record exactly where it is used (file path).
3. Explain what part of the app it supports.
4. Prefer routing access through `src/app/`, `src/domain/`, or `src/shared/` layers instead of coupling renderers or widgets directly to remote services.
