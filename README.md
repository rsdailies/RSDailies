# Dailyscape

<p align="center">
  <img src="public/img/dailyscapebig.png" alt="Dailyscape logo" width="180" />
</p>

<p align="center">
  <strong>A lightweight RuneScape routine tracker for dailies, weeklies, monthlies, gathering activities, farming patches, and timed tasks.</strong>
</p>

<p align="center">
  Dailyscape helps you keep recurring RuneScape activities organized with a clean dark tracker UI, local progress saving, pinned priorities, profiles, import/export tools, and dedicated RS3 and OSRS tracker entry points.
</p>

<p align="center">
  <a href="https://rsdailies.vercel.app">Live Site</a>
  ·
  <a href="#features">Features</a>
  ·
  <a href="#trackers">Trackers</a>
  ·
  <a href="#local-development">Local Development</a>
  ·
  <a href="#documentation">Documentation</a>
</p>

---

## Table of Contents

- [About](#about)
- [Features](#features)
- [Trackers](#trackers)
- [Pages](#pages)
- [Overview and Pinning](#overview-and-pinning)
- [Profiles](#profiles)
- [Import and Export](#import-and-export)
- [Farming and Timers](#farming-and-timers)
- [Local Data and Privacy](#local-data-and-privacy)
- [Technology](#technology)
- [Project Structure](#project-structure)
- [Local Development](#local-development)
- [Available Scripts](#available-scripts)
- [Documentation](#documentation)
- [Roadmap Ideas](#roadmap-ideas)
- [Disclaimer](#disclaimer)
- [License](#license)

---

## About

**Dailyscape** is a web app for tracking recurring RuneScape activities.

It is designed for players who want a simple way to manage daily, weekly, monthly, gathering, and farming routines without keeping a separate spreadsheet, checklist, or note file open.

The app keeps the original DailyScape-inspired table layout while using a modern Astro and Svelte project foundation behind the scenes.

Dailyscape is built around a few simple goals:

- Open the tracker quickly.
- See the activities that matter.
- Check off completed tasks.
- Pin important tasks into an Overview section.
- Hide tasks that do not apply to your account.
- Track reset timers.
- Keep separate profile states.
- Export your data when you want a backup.

---

## Features

### Task Tracking

Dailyscape includes recurring tracker sections for routine activities.

Supported tracker patterns include:

- Daily tasks
- Weekly tasks
- Monthly tasks
- Gathering tasks
- Farming timers
- Patch/location rows
- Completion checkboxes
- Reset controls
- Collapsible sections

### Overview Panel

The Overview panel is a top-level priority area.

Use it to surface important tasks from the full tracker without needing to scroll through every section.

The Overview section is useful for:

- High-priority dailies
- Commonly forgotten tasks
- Farming tasks you are watching
- Short-session goals
- Activities you want visible every time you open the app

### Pinning

Any supported task can be pinned into the Overview panel.

Pinned tasks let you build a small personal checklist from the larger tracker.

### Hide and Restore

Tasks and sections can be hidden when they do not apply to your account, goals, or current routine.

This keeps the tracker clean while preserving the underlying activity data.

### Profiles

Profiles allow separate saved tracker states.

This is useful for:

- Main accounts
- Ironman accounts
- Alternate accounts
- Different playstyles
- Shared computers
- Testing different tracker setups

### Import and Export

Dailyscape includes import/export tools for local tracker state.

Use this to:

- Back up your tracker
- Move progress between browsers
- Restore a previous setup
- Save profile data before clearing browser storage
- Transfer data between devices

### Dark Tracker UI

The app uses a dark table-based interface designed for quick scanning.

The layout emphasizes:

- Compact rows
- Clear section headers
- Strong activity/status separation
- Readable notes
- Fast visual completion checks
- A familiar DailyScape-inspired tracker style

---

## Trackers

Dailyscape currently supports two game tracker entry points.

### RS3 Tracker

The RS3 tracker is the primary complete tracker.

It includes:

- Tasks
- Gathering
- Timers
- Daily activities
- Weekly activities
- Monthly activities
- Farming patch groups
- Overview pinning
- Profiles
- Import/export support

### OSRS Tracker

The OSRS tracker is currently a preserved tracker shell.

It includes:

- Tasks page
- Overview panel
- Daily section shell
- Weekly section shell
- Monthly section shell

The OSRS tracker is intentionally present so the app can support OSRS data expansion over time.

---

## Pages

### Landing Page

The landing page lets you choose which tracker to open.

Available tracker buttons:

- Open RS3 Tracker
- Open OSRS Tracker

### RS3 Tasks

The RS3 Tasks page contains the main recurring activity checklist.

Typical sections include:

- Overview
- Dailies
- Weeklies
- Monthlies

### RS3 Gathering

The Gathering page separates gathering-related activities from the main routine checklist.

This keeps the main tracker cleaner while still preserving gathering-specific workflows.

### RS3 Timers

The Timers page focuses on time-based and farming-related tasks.

It supports grouped categories, parent timer rows, and patch/location rows.

### OSRS Tasks

The OSRS Tasks page provides the OSRS tracker shell.

It is ready for future OSRS task data while keeping the current app navigation stable.

---

## Overview and Pinning

The Overview section is designed as a personal priority panel.

Instead of showing every task, it shows the tasks you choose to pin.

This lets you create a focused mini-tracker at the top of the page.

Common uses:

- Pin only tasks you do every day.
- Pin farming tasks that matter to your account.
- Pin high-value weeklies or monthlies.
- Pin activities you want to remember before logging out.
- Keep a lightweight session checklist.

Pinned tasks are still connected to their tracker state, so completing a pinned task should remain consistent with the full tracker behavior.

---

## Profiles

Dailyscape supports profile-style local state.

Profiles help keep different tracker setups separated.

Example profile uses:

- Main
- Ironman
- Skiller
- Alt account
- Test profile
- Seasonal routine

Profiles are stored locally in the browser.

---

## Import and Export

Import/export support gives you control over your saved tracker data.

This is important because Dailyscape does not require a remote login or account system.

Recommended uses:

- Export before clearing browser data.
- Export before changing devices.
- Export before major app updates.
- Keep occasional backup copies.
- Import a previous setup when needed.

---

## Farming and Timers

The RS3 Timers page supports farming and timer-style activity groups.

Timer categories may include:

- Herbs
- Allotments
- Hops
- Trees
- Fruit trees
- Specialty patches
- Farming locations
- Parent activity rows
- Patch/location child rows

The timer page is designed to keep the farming hierarchy readable while preserving the same tracker-table style used across the rest of the app.

---

## Local Data and Privacy

Dailyscape stores tracker state locally in your browser.

This means:

- There is no required login.
- Your tracker state stays on your device.
- Clearing browser data can remove saved progress.
- Import/export should be used for backups.
- Different browsers or devices may have separate tracker states unless you transfer data manually.

---

## Technology

Dailyscape is built with:

- Astro
- Svelte
- TypeScript
- Bootstrap
- CSS
- Static JSON content collections

Astro handles:

- Pages
- Layouts
- Routing
- Static build output
- Content loading

Svelte handles:

- Interactive tracker components
- Buttons
- Completion state
- Pinning
- Collapsing
- Client-side tracker behavior

---

## Project Structure

Main project folders:

- `public/` — static images and public assets
- `src/pages/` — Astro routes
- `src/layouts/` — shared page layouts
- `src/components/` — Svelte and Astro UI components
- `src/content/` — tracker page and section data
- `src/stores/` — client-side state
- `src/styles/` — visual styling
- `src/bootstrap/` — browser startup entry files
- `docs/` — deeper project documentation
- `tests/` — project tests
- `tools/` — validation and audit scripts

Tracker content lives under:

- `src/content/games/rs3/pages/`
- `src/content/games/rs3/sections/`
- `src/content/games/osrs/pages/`
- `src/content/games/osrs/sections/`

---

## Local Development

### Requirements

- Node.js 22.12.0 or newer
- npm
- A modern browser

### Install dependencies

Run:

    npm install

### Start the development server

Run:

    npm run dev

Then open the local URL shown in your terminal.

During normal editing, you do not need to rebuild after every file change. Keep the dev server running, save your file, and refresh the browser if needed.

### Build for production

Run:

    npm run build

### Preview the production build

Run:

    npm run preview

### Run the full verification suite

Run:

    npm run verify:full

---

## Available Scripts

### `npm run dev`

Starts the Astro development server.

Use this while actively editing the app.

### `npm run build`

Builds the production version of the site.

Use this before deployment.

### `npm run preview`

Serves the production build locally.

Use this to check the built output.

### `npm test`

Runs the project test suite.

### `npm run check`

Runs Astro and Svelte project checks.

### `npm run audit:content`

Validates tracker content structure.

### `npm run audit:routes`

Validates route coverage.

### `npm run audit:timers`

Validates timer content.

### `npm run test:e2e`

Runs browser smoke tests.

If this fails because browser binaries are missing, install Playwright browsers first.

### `npm run verify:full`

Runs the main verification sequence.

This is the best command to run before committing or deploying.

---

## Documentation

More detailed documentation lives in the `docs/` folder.

Recommended docs areas:

- `docs/architecture/`
- `docs/features/`
- `docs/framework/`
- `docs/verification/`
- `docs/deployment/`
- `docs/agents/`
- `docs/sources/`

The root README is intended to be the GitHub front page for the project.

The `docs/` folder is intended for deeper technical notes and maintenance details.

---

## Roadmap Ideas

Possible future improvements:

- Expanded OSRS task content
- Additional farming timer categories
- More profile controls
- More import/export options
- Mobile layout refinements
- Accessibility improvements
- More detailed content editing documentation
- More deployment guides
- Optional theme refinements
- More automation around content validation

---

## Contributing

Suggestions, fixes, and improvements are welcome.

When changing the project, try to keep work scoped:

- Content changes should stay in content files.
- Visual changes should stay in style and component files.
- Tracker behavior changes should stay in Svelte components and stores.
- Documentation changes should stay in README or `docs/`.
- Verification changes should stay in tests or tools.

This makes the project easier to review, maintain, and safely improve.

---

## Disclaimer

RSDailies is an unofficial fan-made tracker project. It originated from Dailyscape and their work they did. Thanks to them, I was able to do this!

It is not affiliated with, endorsed by, sponsored by, or approved by Jagex.

RuneScape, Old School RuneScape, and related names belong to their respective owners.

---