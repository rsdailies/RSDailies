---
title: Persistence & Profile Sync
description: Technical guide to local-first storage, optional server backup, and profile synchronization.
---

# Persistence & profile sync

Dailyscape is local-first. The tracker always writes to `localStorage` immediately, and optional server backup only runs when an explicit local filesystem sync driver is enabled.

## Architecture overview

The persistence layer consists of three main components:

1. **Tracker store (client)**: A Svelte 5 rune-based store that manages reactive UI state.
2. **Storage service (shared)**: A utility layer for namespaced `localStorage`, profile switching, import/export, and state replacement.
3. **Profile API (server)**: The `/api/profile` route, backed by `src/shared/server/profile-storage.ts`, which can either disable server backup or use a local filesystem adapter.

## Sync cycle

1. A user action updates tracker state.
2. The store writes to `localStorage` immediately.
3. When server backup is enabled, the store schedules a debounced sync after 2 seconds.
4. The client posts the current profile payload to `/api/profile`.
5. The local filesystem adapter writes `user_data/[profile].json`.

## Recovery bridge

When server backup is enabled and the active profile has no local entries, the tracker requests `/api/profile` and restores the full saved profile payload into local storage before reloading the stores.

## Runtime modes

- Default mode: server backup disabled.
- Local preview/dev mode: set `SERVER_SYNC_DRIVER=filesystem`, `PUBLIC_SERVER_SYNC_DRIVER=filesystem`, and `PUBLIC_ENABLE_SERVER_SYNC=true`.
- Deployment mode: leave server backup disabled unless a real persistent backend is added in the future.

## Implementation details

### Server adapter boundary

Located in `src/shared/server/profile-storage.ts`.

- `resolveServerSyncConfig()` decides whether server backup is available.
- `filesystem` mode is only allowed for local development and preview runtimes.
- Disabled mode returns a clear message and `/api/profile` responds with a non-200 status.

### Tracker integration

Located in `src/features/tracker/stores/tracker.svelte.ts`.

- On startup and profile changes, the tracker loads local state first.
- If local state is empty and server backup is enabled, it restores the full profile payload from `/api/profile`.
- Sync failures do not block local usage; the UI falls back to import/export messaging.
