# GitHub(s) and Websites

## My GitHub

https://github.com/rsdailies/RSDailies

## My Website

https://rsdailies.github.io/RSDailies/

## Original/Cloned GitHub

https://github.com/dailyscape/dailyscape.github.io

## Original/Cloned Website

https://dailyscape.github.io

---

1. Correct. We need to fix this where Task Name and Notes are the two bigger ones (90% so 45/45% split) and checkbox is a small column width at 10% of it's original size so it's just a box that shows. I'm using percentages as examples but realistically should help make sense. Please understand I am giving examples, and things need to adhere to it's current size, and adjust all the same appropriately so things aren't butchered. we're just in relative terms shrinking them and then applying a task to the other side. 
2. collapsed = ▲ - change this arrow to point to the right please. / when open and expanded = ▼
3. They do! Just remove the (active) that appears in the menu near the one selected. 
4. I've yet to check the pinned section yet and test that. 
5. Timers feel right in the right spot now (visual ones). The timers for scripts and farming for example, I need a note to detail how long it takes in the new 3-column view so we can have a note about time length as well as any notes we extracted from the wiki for that location/city. 
6. It is!
7. I want this

- Some refresh buttons also don't work. We need a file by file top to button trouble shoot and debug to double check everything works accordingly. Same goes for some rows and favoriting and not syncing to the overview section up top. Farming is one of them that does not pin. 

- collapsed = ▲ - change this arrow to point to the right please. 
You stated this:
Also, on the farming setting question: the RuneScape Wiki says herb patches normally grow in 4 × 20-minute cycles (80 minutes), reduced to 3 × 20-minute cycles (60 minutes) with the relevant upgrade, so if your farming table is now explicitly modeled per location/timer row, that old global toggle is no longer the best UI and can be removed.

So that means 3-tick setting should be renamed to the name of the upgrade itself so if turned on, it updates the timer settings. That makes more sense. 

I WANT ALL THIS DONE IN ONE GO FOR EACH FILE SO WE CAN PUSH IT ALL AT ONCE AND THEN TEST AND FIX MORE PRECISELY. WHY ARE WE UPDATING A FILE JUST TO UPDATE IT AGAIN LATER

You need to re-check my github state so you don't conflict with old logic and see where we've updated to. 

Can you make this a handoff report to give to claude to give me precisely file by file overwrite only, no other context needed, and just focus on these changes, things needed, things missing, issues still present. Give me a full repository review prior to handoff. Review every single file and make a task list of all fixes. If there is a way we can compress the main files and break them down into parent/subfolder heirarchy where we can split components for easier management and configurability, would be ideal. 

We need best practices forward, research HEAVY, code blocks, metadata, logic, context, explainations, subtasks and reasonings, everything. visuals included. Please re-research just my page and my github at this point. We've altered entirely away from the original clone by this point so we can solely focus on us now. I need additions, things to add that's runescape based. I need to double check and review and ensure we properly added all things. Please give me a grand report properly start to finish, all requests, restraints, mention subagent usage, tools, MCP servers, everything an AI can use (Claude and Codex precisely) to be able to fix, rebuild, revise, optimize, and fix and get us finished. We should be testing things, understanding we're on these two pages only so when I say things like git push and then review page, THAT is how we test as we dont have a local setup. We should include dev ways to be able to do more technical stuff and alleviate troubleshooting and debugging issues. Is there a way to fix this entire repository in a way while staying entirely intact 100% as it does cover 90% of everything we want, we're just hitting some bumps. 

Like a buddy just told me there's a new allotment in Havenhythe I can add to the timer but I have zero idea. 

My other buddy mentioned astroJS is pure HTML in a way, and probably way more easier with syntax and variables to be able to learn to code as a novice/non-coder aspect. Help fix, restructure, and re-design logic while keeping my web page entirely 100% intact the way it is other than the very specific and precise fixes we've requested. 

Below is the handoff report for Claude/Codex.

## Repository review summary

Your current repo is now a **custom static-site fork**, not an “original parity” clone anymore. The live structure is centered on:

* `index.html`
* `dailyscape.css`
* `dailyscape.js`
* `tasks-config.js`
* `farming-config.js`

The current `index.html` now has:

* top nav with **RSDailies**, **More Resources**, and right-side utility buttons,
* an **Overview** panel below the navbar,
* stacked section tables below that,
* row template with `pin-button`, `hide-button`, and right-column checkbox/description. 

The current `dailyscape.js` now already includes:

* page modes,
* overview pinning,
* grouped farming rendering,
* grouped gathering rendering,
* tooltip plumbing,
* and a new `formatCountdown()` implementation that is already intended to output minute/hour/day formats instead of the old `HHH:MM:SS`. 

The original DailyScape remains a static site, with the classic top tabs, red/green right-column interactions, localStorage persistence, drag/drop ordering, compact mode, and no build step. That is still useful as a historical interaction reference, but this fork has intentionally diverged. ([dailyscape.github.io][1])

## Bottom line

Do **not** rewrite the app from scratch.
Do **not** migrate it yet.
Do **not** switch frameworks right now.

This repo is already **90% of the way there**. The right move is a controlled cleanup/refactor while preserving the current UI and behavior.

---

# Non-negotiable constraints

1. Keep the site static.
2. Keep the current visual theme.
3. Keep the current URL structure and GitHub Pages deployment flow.
4. Keep the Overview panel as an in-page shell.
5. Keep More Resources in the top nav.
6. Keep the right-side utility buttons.
7. Do not reintroduce the original DailyScape top section tabs.
8. Do not rewrite into React/Vite/Next just to “clean it up.”
9. Do not break localStorage/profile/import-export behavior.
10. Fix behavior with precise file edits and test by git push + live page review.

---

# Current confirmed user requirements

## Navigation / layout

* Top nav remains a **single header row**.
* Overview remains inside the page below that header.
* Background outside tables should be black.
* More Resources stays in the top nav.
* Right-side utility buttons stay in the top nav.
* Views menu controls page modes:

  * Overview
  * All
  * Custom Tasks
  * Farming
  * Dailies
  * Gathering
  * Weeklies
  * Monthlies

## Single-page mode

When selecting a single page like Dailies:

* Overview stays at the top
* only that section renders below it
* remove `(active)` text from the Views menu entries

## Countdown formatting

All visible countdowns must use:

* `Xd HH:MM` if >= 1 day
* `HH:MM` if >= 1 hour and < 1 day
* `MM` if < 1 hour

No visible `HHH:MM:SS`.

## Collapse arrows

* **collapsed** = right arrow
* **expanded/open** = down arrow

The RuneScape Wiki confirms herb patches normally grow in 4 × 20-minute cycles (80 minutes), reduced to 3 × 20-minute cycles (60 minutes) when the **Speedy Growth** upgrade is owned. That means the old “3-tick herbs” setting should be renamed to the actual upgrade name and treated as a real upgrade toggle. ([RuneScape Wiki][2])

## Row layout target

For normal rows:

* 3-column logic per task:

  * Task Name
  * Notes
  * Checkbox
* Relative target:

  * name and notes are the large columns
  * checkbox is a narrow fixed/small column
* Do not butcher current sizing; just rebalance it cleanly.

## Farming

* Farming location rows must support both:

  * duration/time-to-grow note
  * location/city note
* Farming pinning to Overview currently does not work correctly and must be fixed.
* New farming locations should be easy to add in config, e.g. Havenhythe allotment.

## Overview

* Overview should only show pinned rows
* top 5 only
* cleaner display
* verify sync from row pin → Overview works everywhere

## Buttons / troubleshooting

* some refresh buttons do not work consistently
* pin/favorite syncing is inconsistent
* need a full top-to-bottom repo troubleshooting pass

## Penguins

The RuneScape Wiki states Penguin Hide and Seek includes twelve disguised penguins plus a Polar Bear each week, and the wiki’s penguin content is maintained in collaboration with the World60Pengs community. ([RuneScape Wiki][3])
That makes Penguins a valid helper-module target, but it should be built with:

* graceful fallback
* current-location updater
* notes/hints/requirements support
* frequent refresh with cache/rate-limit respect

## APIs / helper scripts

The RuneScape Wiki API docs say Weird Gloop-backed APIs expose GE data, Voice of Seren, Travelling Merchant stock, and more, and they explicitly ask for a **descriptive User-Agent** for automated tooling. ([RuneScape Wiki][4])

---

# Recommendation on Astro

Astro is real static-first technology and uses an islands architecture that renders most content as static HTML with smaller interactive islands only where needed. ([Astro Docs][5])

However:

## Recommendation

Do **not** migrate this repo to Astro right now.

## Why

* current app is already live and mostly working
* current app is plain static HTML/CSS/JS
* migration risk is high
* behavior bugs are smaller than framework migration cost
* you want to keep the page visually 100% intact

## Future option

Only consider Astro **after stabilization**, on a separate branch, and only if the goal is:

* componentized templates
* easier novice editing
* more structured config-driven rendering

For now, use a **static multi-file refactor inside the existing repo** instead.

---

# Required file-by-file work

## FILE 1 — `index.html`

### Goal

Stabilize markup and header shell permanently.

### Tasks

1. Confirm the navbar closes **before** the Overview container.
2. Keep top nav limited to:

   * brand
   * More Resources
   * profile/settings/import-export buttons
3. Keep Overview below nav as a page shell.
4. Remove any dead/duplicate view controls outside the intended Overview panel control.
5. Bump asset versions any time CSS/JS changes are pushed.

### Specific checks

* verify `</div></div></nav>` closes before:

  ```html
  <div class="container-xl">
  ```
* verify Overview panel is not nested inside navbar
* verify no legacy compact-mode markup remains
* verify no malformed table header lines remain

### Also do

Rename the farming settings label from:

* `3-tick herb patches`
  to:
* `Speedy Growth upgrade`

And update the help text or tooltip so the meaning is clear.

---

## FILE 2 — `dailyscape.css`

### Goal

Fix layout, column proportions, and row integrity.

### Problems still present

* row content is still too coupled to old red-cell text flow
* checkbox column is not yet properly isolated visually
* some note text still behaves like full red-cell content instead of a dedicated notes column
* top page shell styling still needs cleanup alignment
* collapse icon state styling still needs to match the final direction

### Required changes

#### A. Header shell

* body background remains black
* top nav remains one line
* Overview panel stays visually inside page, not fused to nav
* footer must not overlap content

#### B. Row layout

Refactor rows so each task visually behaves like:

* column 1: task name
* column 2: notes
* column 3: checkbox

#### C. Width guidance

Use a layout close to:

* name: ~45%
* notes: ~45%
* checkbox: ~10%

Do not hardcode those exact percentages if the table needs slight adjustment. Preserve current page width and alignment.

#### D. Checkbox column

* narrow
* stable
* visually boxed
* not floating in text
* same sizing system everywhere

#### E. Parent/subparent headers

* left and right sides must share row color
* no random black right cells unless intentionally a child-row style
* collapse indicator aligned consistently

#### F. Collapse icons

Set visual states for:

* collapsed = right arrow
* expanded = down arrow

#### G. Remove dead CSS

Remove all remaining compact-mode CSS.
Remove dead selectors for deleted controls.

### Structural recommendation

Convert `.activity_desc` from a “dump all content inside red column” model to a real grid/flex sublayout:

* wrapper for notes
* wrapper for checkbox
* optional metadata lines below note title

---

## FILE 3 — `dailyscape.js`

### Goal

Fix logic, sync behavior, and standardize render flow.

### Critical fixes

#### A. Countdown format

Even though current repo code already contains the intended formatter, verify the rendered output is actually using it everywhere. 

Audit all countdown outputs:

* Dailies
* Gathering subgroup headers
* Weeklies
* Monthlies
* Farming running timers
* Overview countdown text

Unify them under one shared formatter contract:

* `Xd HH:MM`
* `HH:MM`
* `MM`

#### B. Views menu

* remove `(active)` suffix from selected item labels
* keep page mode logic
* confirm single-section rendering shows Overview first, then only selected section
* ensure `Overview` mode hides section tables below

#### C. Collapse arrows

Change current collapse button text logic from:

* collapsed = `▼`
* expanded = `▲`

to:

* collapsed = `▶` or `▸`
* expanded = `▼`

That matches your requested “right when closed, down when open”.

#### D. Overview pinning

Fix Overview sync so pinning works for:

* normal tasks
* farming tasks
* child rows if intended
* custom tasks

Current issue to troubleshoot:

* farming rows not syncing into overview correctly

#### E. Overview rendering

Polish top 5 pinned rows:

* title
* section label
* due/ready/reset time
* note line
* maybe task source badge

#### F. Refresh button debugging

Audit each section reset/refresh button:

* custom
* farming
* dailies
* gathering
* weeklies
* monthlies

Verify each button still correctly resets:

* hidden rows
* sort state where intended
* section state
* running farming timers where intended

#### G. Child row/farming row notes

For farming location rows, show both:

* growth time note
* location/city note
* optional wiki-derived tip/hint

#### H. Settings rename

Rename the old herb speed toggle to:

* `Speedy Growth upgrade`

And update logic so this setting feeds herb timing.

#### I. Remove dead legacy logic

Clean out any stale:

* old compact mode hooks
* old views-button hooks
* duplicate view-mode migration remnants if no longer needed

#### J. Render safety

Current render path is large. Add guardrails:

* no duplicated event listeners
* no accidental DOM reparenting side effects
* no panel/table nesting bugs
* no row text leaking outside intended container

---

## FILE 4 — `tasks-config.js`

### Goal

Content cleanup + expandability.

### Required tasks

1. Review every configured task for:

   * note quality
   * reset type
   * alert offsets
   * overview suitability
   * missing RuneScape-specific tasks

2. Add or verify:

   * missing current RS3 upkeep tasks
   * missing D&D tasks
   * missing common utility tasks

3. For Penguins:

   * static fallback child rows remain
   * names/notes should be mergeable from helper script
   * include hints/requirements schema support

### Schema improvement

Move toward richer task schema:

```javascript
{
  id,
  name,
  wiki,
  note,
  reset,
  alertDaysBeforeReset,
  cooldownMinutes,
  section,
  tags,
  showInOverviewDefault,
  helperKey,
  requirements,
  locationNote,
  durationNote
}
```

---

## FILE 5 — `farming-config.js`

### Goal

Make farming easy to edit for non-coders.

### Required tasks

1. Add missing farming locations like Havenhythe as needed.
2. Add explicit per-location metadata support:

   * display name
   * location note
   * duration note
   * wiki url
3. Ensure all groupings are easy to read:

   * HERB
   * ALLOTMENT
   * HOPS
   * TREES
   * SPECIALTY

### Schema target

Use a template like:

```javascript
{
  id: 'allotment-havenhythe',
  name: 'Havenhythe',
  wiki: '...',
  locationNote: 'Teleport / route note',
  durationNote: '80 minutes / affected by upgrade',
  tags: ['allotment']
}
```

This avoids burying important notes in ad hoc strings.

---

# Recommended repo refactor without changing the app

Do not switch frameworks yet.
Instead, split the current large JS into static subfiles.

## Recommended target structure

```text
/
  index.html
  dailyscape.css
  /config
    tasks-config.js
    farming-config.js
    templates-config.js
  /scripts
    app-state.js
    render-core.js
    render-overview.js
    render-farming.js
    render-gathering.js
    render-weeklies.js
    profiles.js
    settings.js
    import-export.js
    tooltip.js
    timers.js
    helpers-penguins.js
```

## Why

* easier debugging
* easier handoff to AI tools
* easier grep/search
* safer overwrite strategy
* easier novice editing

## Constraint

Keep it as multiple plain `<script>` includes.
No build step required.

---

# Suggested helper scripts

## `helpers-penguins.js`

Purpose:

* ingest current penguin locations
* merge names + notes into `penguinWeeklyData`
* refresh every 1–5 minutes
* fail gracefully
* show last updated timestamp

### Data source rules

* prefer structured/fallback-safe source
* use community/world60/wiki-derived mapping carefully
* do not hard-fail if external source is down
* cache last successful response
* expose manual override UI

## `helpers-weirdgloop.js`

Purpose:

* optional future support for:

  * Travelling Merchant
  * Voice of Seren
  * GE utilities
* set a descriptive User-Agent in any external tool or server-side fetch process, per wiki guidance. ([RuneScape Wiki][4])

---

# AI execution guidance for Claude / Codex

Use this as the execution policy.

## Allowed tools/workflows

* GitHub MCP / GitHub integration for file reads/writes
* browser automation for live-page inspection
* grep/search across repo
* HTML/CSS/JS static validation
* small refactors only
* incremental PRs / commits
* screenshot-based UI verification
* diff-based edits only

## Use subagents / parallel workers for

1. **layout audit subagent**

   * inspect current HTML/CSS layout
   * identify broken nesting/overflow issues

2. **row renderer subagent**

   * isolate row structure
   * propose `name | notes | checkbox` render model

3. **state/logic subagent**

   * verify pinning, collapse, refresh, reset, timers

4. **farming data subagent**

   * normalize config schema
   * add missing farming locations
   * rename Speedy Growth setting logic

5. **penguin helper subagent**

   * define helper data model
   * fetch/caching/manual override design

6. **QA subagent**

   * test each section after each commit
   * verify live page after push

## Do not let AI do this

* no framework migration in the same pass
* no global rewrite
* no “cleanup” that changes UX without instruction
* no replacing static site with SPA
* no deleting localStorage schema without migration

---

# Testing workflow

You said your real test loop is:

* edit
* git push
* review live page

So optimize for that.

## Minimum workflow per change

1. edit one file or one tightly related pair
2. commit
3. push
4. open live site
5. verify exact visual/behavior issue
6. capture screenshot
7. only then continue

## Add this dev workflow too

Even if you do not use it daily, include:

* `python3 -m http.server 8000`
* or equivalent static local server
* Chrome DevTools
* console error review
* network tab check for stale assets
* disable cache when devtools open
* hard reload after pushing

The original DailyScape repo documents a local setup path for development, but your fork no longer needs to follow its exact data-repo process unless you intentionally adopt their generated-data model. ([GitHub][6])

---

# Priority-ordered task list

## P0 — must do next

1. Fix row layout to `Task | Notes | Checkbox`
2. Fix checkbox column sizing
3. Remove `(active)` from Views menu
4. Fix collapse arrow states to right/down
5. Audit all refresh/reset buttons
6. Fix farming pin-to-overview

## P1

7. Rename Speedy Growth setting
8. Add duration/location notes to farming rows
9. Verify all countdowns render correctly everywhere
10. Clean Overview row rendering

## P2

11. Split JS into `/scripts`
12. Enrich config schemas
13. Add missing farming locations like Havenhythe
14. Add manual penguin updater
15. Add automated penguin helper with cache

## P3

16. Add more RS-specific templates
17. Add richer helper integrations
18. Consider Astro on a separate branch only after stabilization

---

# RuneScape-specific additions worth adding

1. Havenhythe allotment if valid in your route
2. more route notes per farming location
3. requirement notes for penguins
4. disguise/hint notes for penguins
5. route templates:

   * Ironman upkeep
   * shop run
   * farming route
   * D&D weeklies
   * PvM upkeep
6. optional helper modules for:

   * Travelling Merchant
   * Voice of Seren
   * GE utility rows
7. optional “late-doing” task flags for activities like Herby Werby
8. route-specific notes on shop runs and utility loops

---

# Final recommendation

## Do this now

Stay in the current stack.
Refactor in place.
Fix behavior first.
Split files second.
Add helpers third.

## Do not do now

Do not migrate to Astro yet.

Astro is viable later because it preserves static-first rendering and can reduce JS sprawl with islands, but it is not the right move while you are still stabilizing row rendering, pins, timers, and layout fidelity. ([Astro Docs][5])

---

# Copy/paste instruction for Claude/Codex

Use this exact objective:

```text
Review the current rsdailies/RSDailies repository as a live static GitHub Pages app. Do not rewrite frameworks. Do not change the visual theme. Keep the current page intact except for the specific fixes below.

Primary goals:
1. Fix row layout to Task | Notes | Checkbox, with checkbox as a narrow column.
2. Remove (active) from Views menu.
3. Ensure page modes render Overview first, then only the selected section.
4. Set collapse icons to right-arrow when collapsed and down-arrow when expanded.
5. Rename the herb-speed setting to Speedy Growth upgrade and wire it to herb timing.
6. Fix farming and pinned-row sync into Overview.
7. Audit and fix all refresh/reset buttons.
8. Add farming row support for both duration notes and location/city notes.
9. Keep site static and GitHub Pages compatible.
10. Refactor the large JS into smaller /scripts files only if behavior remains identical.

Work file by file. Prefer diff-based edits. After each change, state exactly which file changed and what to verify on the live page after git push.
```

If you want, I can next turn this into a **strict file-by-file overwrite checklist** for Claude, starting with `dailyscape.js`, then `dailyscape.css`, then `farming-config.js`.

[1]: https://dailyscape.github.io/ "DailyScape - RS3 Dailies, Weeklies, Monthlies Task Checklist for RuneScape"
[2]: https://runescape.wiki/w/Herb_patch?utm_source=chatgpt.com "Herb patch - The RuneScape Wiki"
[3]: https://runescape.wiki/w/Distractions_and_Diversions/Locations/Penguin_Hide_and_Seek?utm_source=chatgpt.com "Penguin Hide and Seek - The RuneScape Wiki"
[4]: https://runescape.wiki/w/RuneScape%3AAPIs?utm_source=chatgpt.com "Help:APIs - The RuneScape Wiki"
[5]: https://docs.astro.build/en/concepts/islands/?utm_source=chatgpt.com "Islands architecture | Docs"
[6]: https://github.com/dailyscape/dailyscape.github.io "GitHub - dailyscape/dailyscape.github.io: RS3 Dailies, Weeklies, Monthlies · GitHub"