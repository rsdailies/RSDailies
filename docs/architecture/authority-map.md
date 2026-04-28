# Dailyscape3 Authority Map

This file is the architecture contract for staged cleanup passes. It exists so future AI edits do not improvise folder ownership.

## Top-level authority

```text
assets/      Static public files only: logos, icons, images, favicons.
docs/        Human-readable audits, plans, references, and pass reports.
src/app/     App boot and runtime composition only. No visual components. No domain calculators.
src/core/    Non-visual logic, hooks, state, storage, validation, debugging, API clients, and calculators.
src/data/    Data/configuration only. No rendering logic. No DOM access.
src/ui/      All visual output, layout, CSS, primitives, pages, app shell, and feature UI.
tools/       Developer verification tools only.
```

## Non-negotiable boundaries

1. UI code belongs under `src/ui/`.
2. Non-visual logic belongs under `src/core/`.
3. Reusable stateful non-visual hooks belong under `src/core/hooks/` once introduced.
4. Static configuration belongs under `src/data/` or a feature-specific config folder until migrated.
5. Do not introduce a theme engine. Color customization should stay in explicit rgba token/config files.
6. Do not reintroduce `src/shared/` or `src/ui/shared/`.
7. Do not move everything in one pass. Each pass should produce a buildable ZIP checkpoint.

## Tracker architecture target

Tracker rendering should follow a pipeline:

```text
data/config -> normalize/build pipeline -> parent system -> sub-parent system -> row system -> column system -> primitive UI
```

Each system should use consistent file roles where applicable:

```text
*.render.js      DOM/markup/render assembly only
*.logic.js       local non-render decision logic only
*.styles.css     CSS only
*.constants.js   names, selectors, options, registries
hooks/           stateful helpers for that system only, or core hooks if reusable
utils/           pure helpers for that system only
```

## Column system target

Columns should be centralized as a single system, not one folder per physical column count:

```text
src/ui/components/tracker/rows/columns/
  index.js
  column.render.js
  column.logic.js
  column.styles.css
  column.constants.js
  types/
  hooks/
  utils/
```

Rows import the column system; rows should not know individual column internals.

## Row system target

Rows should also be a system, not a single overloaded handler:

```text
src/ui/components/tracker/rows/
  index.js
  row.render.js
  row.logic.js
  row.styles.css
  row.constants.js
  types/
  hooks/
  utils/
  columns/
```

## Header / parent / sub-parent targets

Header, parent, and sub-parent controls should be split the same way when they contain behavior:

```text
render + logic + styles + constants + hooks + utils
```

This avoids hidden button/control behavior inside broad handler files.
