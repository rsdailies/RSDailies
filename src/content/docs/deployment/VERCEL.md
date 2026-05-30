---
title: Vercel Deployment
description: Deployment notes and expectations for the Vercel-hosted Astro build.
---

# Deployment notes

The project uses Astro server output with the Vercel adapter and should be deployed as a server-rendered Vercel app.

## Build command

```bash
npm run build
```

## Output directory

```text
dist
```

## Route contract

The root route renders the game-selection landing page. RS3 and OSRS tracker routes are linked from that landing screen.

## GitHub Pages note

The old visual checkpoint lives under a GitHub Pages URL and is kept only as a historical reference. This cleaned project currently assumes root-relative routes such as `/rs3/tasks`. If deploying under a subpath, configure Astro `site`/`base` and review asset URLs before publishing.
