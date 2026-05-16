---
title: Persistence & Astro Actions
description: Technical guide to the server-side persistence layer and synchronization logic.
---

# Persistence & Astro Actions

Dailyscape uses a **Local-First, Cloud-Synced** architecture. While the UI remains snappy by interacting primarily with `localStorage`, all state changes are asynchronously synchronized with the server using **Astro Actions**.

## Architecture Overview

The persistence layer consists of three main components:

1.  **TrackerStore (Client)**: A Svelte 5 Rune-based store that manages the reactive UI state.
2.  **Storage Service (Shared)**: A utility layer for reading/writing to `localStorage` with namespaced keys.
3.  **Astro Actions (Server)**: A secure RPC layer that persists data to the server's filesystem.

### The Sync Cycle

1.  User interacts with a component (e.g., checks a task).
2.  `TrackerStore` updates its internal state and writes to `localStorage`.
3.  `TrackerStore` triggers a **debounced sync** (2 seconds).
4.  The `syncProfile` Astro Action is called with the full profile payload.
5.  The server writes a JSON backup to `user_data/[profile].json`.

## Data Safety Bridge

To fulfill the requirement of "data safety across cache resets," the store implements an automatic recovery bridge:

- On initialization, if `localStorage` is empty (e.g., after a cache clear), the store calls the `fetchProfile` Action.
- If a backup exists on the server, the state is restored automatically.

## Implementation Details

### syncProfile Action
Located in `src/actions/index.ts`. It uses **Node.js Filesystem API** to ensure that data survives browser-level events.

```typescript
// Example of the sync handler
handler: async (input) => {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(input.data));
    return { success: true };
}
```

### TrackerStore Integration
Located in `src/stores/tracker.svelte.ts`. It uses `debounce` to minimize network traffic.

```typescript
async syncToServer() {
    // ... debounce logic ...
    const { error } = await actions.syncProfile({
        profileName,
        data,
        timestamp: Date.now(),
    });
}
```
