# Dailyscape

Astro-based RuneScape tracker with canonical consolidated routes, JSON-authored content, profile-scoped local storage, timers, resets, and end-to-end verification.

## Canonical Routes

- `/`
- `/rs3/overview`
- `/rs3/tasks?view=all|daily|weekly|monthly`
- `/rs3/gathering?view=daily|weekly`
- `/rs3/timers`
- `/osrs/overview`
- `/osrs/tasks?view=all|daily|weekly|monthly`

## Project Layout

- `src/pages/`: Astro routes and route entrypoints
- `src/layouts/`: shared Astro shell
- `src/bootstrap/`: browser app startup
- `src/content/`: JSON source of truth for pages and sections
- `src/lib/`: active domain, runtime, storage, timer, UI, and renderer logic
- `src/widgets/`: local shell fragments and row templates used by the hosted runtime
- `public/`: static assets

## Commands

```bash
npm run dev
npm run build
npm test
npm run audit:content
npm run audit:routes
npm run audit:timers
npm run test:e2e
npm run verify:full
```

## Deployment

- Recommended host: `Vercel`
- Build command: `npm run build`
- Output directory: `dist`
- Node version is pinned in `.nvmrc`, `.node-version`, and `package.json`
- Vercel config is committed in `vercel.json`

See [DEPLOYMENT.md](DEPLOYMENT.md) for the Vercel deployment setup and verification details.

## Verification

`npm run verify:full` is the completion gate. It runs:

1. unit tests
2. content audit
3. route audit
4. timer audit
5. production build
6. Playwright smoke coverage against the built app

## Notes

- Astro JSON content under `src/content` is the authored source of truth.
- The current app does not require `_vanilla_legacy` or `src/legacy-port` at runtime.
- Public assets are served from the canonical `/img` path.
- Penguin sync is opt-in only through `PUBLIC_PENGUIN_API_URL`.
- `verify:full` is cross-platform and suitable for CI; the host build command should stay `npm run build`.
