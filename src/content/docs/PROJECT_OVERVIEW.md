---
title: Project Overview
description: High-level goals and scope for the Dailyscape project.
---

# Project overview

RSDailies is a static tracker built with Astro for page composition and Svelte for hydrated interactivity.

## What is intentionally in scope

- RS3 task pages.
- RS3 gathering page.
- RS3 farming/timers page.
- Empty OSRS task shell.
- Local browser storage for completions, hidden rows, collapsed groups, pins, settings, and export/import tokens.

## What is intentionally not in scope right now

- A old runtime renderer.
- Injected HTML shell fragments.
- Competing table renderers outside Svelte.
- Real OSRS task data until authored.

## Design principle

The app should be easy to ask an AI or human to modify by feature:

- routes and layout live together
- content data lives together
- tracker rendering lives together
- timer rendering has its own nested subfolder
- storage and pure feature services stay out of component markup when possible
