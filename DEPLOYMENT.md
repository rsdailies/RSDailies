# Deployment

## Runtime Target

This repo is a Vercel-hosted static Astro app.

- Build command: `npm run build`
- Output directory: `dist`
- Production branch: `main`
- Node: `22.x`
- Do not add an Astro server adapter unless the app intentionally moves to SSR or server features

## Vercel Project

The active production project is `rsdailies`.

Expected Vercel settings:

1. Framework preset: `Astro`
2. Build command: `npm run build`
3. Output directory: `dist`
4. Node.js version: `22.x`
5. Public env vars only when explicitly needed, such as `PUBLIC_PENGUIN_API_URL`

Production URL:

- `https://rsdailies.vercel.app`

## Verification

The deployment host should build with `npm run build`.

The verification gate stays in CI and local validation:

- `npm test`
- `npm run audit:content`
- `npm run audit:routes`
- `npm run audit:timers`
- `npm run build`
- `npm run test:e2e`
- `npm run verify:full`

This repo includes:

- `.github/workflows/verify.yml` for PR and `main` verification
- `tools/verify/run-full.mjs` as the cross-platform verification runner

## Base Project Notes

- Public assets are served from `/img`
- The repo is intentionally Vercel-only
- Manual `dist` uploads, alternate host configs, and server adapters are out of scope for this base project
