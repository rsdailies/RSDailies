# Dailyscape

<p align="center">
  <img src="public/img/dailyscapebig.png" alt="Dailyscape logo" width="180" />
</p>

<p align="center">
  <strong>A lightweight RuneScape routine tracker for dailies, weeklies, monthlies, gathering activities, farming patches, and timed tasks.</strong>
</p>

<p align="center">
  Dailyscape keeps recurring RuneScape activities organized with a compact tracker UI, profile-scoped local storage, pinned priorities, and dedicated RS3 and OSRS routes.
</p>

<p align="center">
  <a href="https://dailyscape.app">Live Site</a> |
  <a href="#features">Features</a> |
  <a href="#local-development">Local Development</a> |
  <a href="#verification">Verification</a> |
  <a href="#documentation">Documentation</a>
</p>

---

## Features

- RS3 tracker pages for tasks, gathering, and timers
- OSRS tracker shell with stable routing
- Overview pinning across tracker sections
- Profile-scoped local storage
- Import/export token flow for backups and device transfer
- Optional local-only filesystem server backup
- Tracker resets, cooldown cleanup, and timer cleanup
- Astro + Svelte architecture with shared UI primitives

## Pages

- `/` - landing page
- `/rs3/tasks` - primary RS3 checklist
- `/rs3/gathering` - gathering-focused tracker
- `/rs3/timers` - farming and timer workflows
- `/osrs/tasks` - OSRS tracker shell

## Local Development

### Requirements

- Node.js 22.12.0 or newer
- npm

### Install

```bash
npm install
```

### Start the dev server

```bash
npm run dev
```

### Build the production output

```bash
npm run build
```

### Preview the production output

```bash
npm run preview
```

## Verification

### Full verification gate

```bash
npm run verify:full
```

This runs:

1. `npm run lint`
2. `npm run check`
3. `npm test`
4. Content, route, timer, legacy-surface, hash-link, mojibake, dependency, heading, and asset-budget audits
5. `npm run build`
6. `npm run test:e2e`

### Browser prerequisites

Playwright browser binaries are not bundled in the repository. Install them locally before browser checks:

```bash
npx playwright install
```

## Server Sync

Dailyscape is local-first by default. Server profile backup is disabled unless explicitly configured for local development or preview.

To enable the local filesystem backup adapter:

```bash
set SERVER_SYNC_DRIVER=filesystem
set PUBLIC_SERVER_SYNC_DRIVER=filesystem
set PUBLIC_ENABLE_SERVER_SYNC=true
```

This writes profile snapshots under `user_data/`. Do not rely on this mode for serverless deployments.

## Project Structure

- `public/` - static images and public assets
- `src/pages/` - Astro routes
- `src/app/` - shell layout, app state, and global style layers
- `src/features/` - tracker, timers, navigation, settings, and modal workflows
- `src/entities/` - domain types plus static content adapters
- `src/shared/` - storage, time, API helpers, shared UI, and utilities
- `src/content/` - tracker page and section data
- `src/content/docs/` - internal documentation
- `tests/` - automated tests
- `tools/` - audits, verification helpers, and local preview tooling

## Documentation

Detailed technical notes live in `src/content/docs/`, especially:

- `architecture/`
- `features/`
- `framework/`
- `guides/`
- `testing/`
- `deployment/`

## Disclaimer

Dailyscape is an unofficial fan-made RuneScape tracker inspired by the earlier RSDailies project. It is not affiliated with, endorsed by, sponsored by, or approved by Jagex.
