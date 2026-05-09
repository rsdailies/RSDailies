# Deployment

## Default Recommendation

Use a Git-connected static host. This app is a static Astro build with `dist` output, no server adapter, and browser-only persisted state.

Default ranking for this repo:

1. `Vercel`
2. `Cloudflare Pages`
3. `Netlify`

Shared settings:

- Build command: `npm run build`
- Output directory: `dist`
- Production branch: `main`
- Node: `22.x`
- Do not add an Astro server adapter unless the app intentionally moves to SSR or server features

## Vercel

This is the least manual path for this repo.

Why:

- Astro static deploys work without adapter changes
- production deploys from `main` are automatic
- preview deploys for branches and PRs are automatic
- `vercel.json` is already committed with the correct static build settings

Setup:

1. Import the GitHub repository into Vercel.
2. Confirm the detected framework is `Astro`.
3. Confirm:
   - Build command: `npm run build`
   - Output directory: `dist`
   - Node.js version: `22.x`
4. Add any optional public env vars such as `PUBLIC_PENGUIN_API_URL` if needed.
5. Attach the custom domain after the first successful deploy.

Verification:

- `main` creates a production deploy
- PRs create preview deploys
- canonical routes load correctly from the hosted URL

## Cloudflare Pages

This is the best alternative if you prefer Cloudflare's hosting model.

Why:

- Astro static builds are supported directly
- Git integration handles production deploys and preview deploys
- branch aliases are useful for longer-running work

Setup:

1. Create a Pages project from the GitHub repository.
2. Set:
   - Production branch: `main`
   - Build command: `npm run build`
   - Build directory: `dist`
   - Node version: `22.x`
3. Add any optional public env vars if needed.
4. Attach the custom domain after the first successful deploy.

Notes:

- Prefer Git integration for the normal workflow.
- Do not use Direct Upload unless CI is intentionally owning deployments.

## Netlify

Use Netlify if you already want Netlify as the team host.

Why:

- static Astro deploys work directly
- production deploys and deploy previews work well
- `netlify.toml` is already committed with the build and publish settings

Setup:

1. Connect the GitHub repository to Netlify.
2. Confirm:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Node version: `22.x`
3. Add any optional public env vars if needed.
4. Attach the custom domain after the first successful deploy.

## CI and Verification

The deployment host should build with `npm run build`.

The verification gate should stay in CI or pre-merge checks:

- `npm test`
- `npm run audit:content`
- `npm run audit:routes`
- `npm run audit:timers`
- `npm run build`
- `npm run test:e2e`

This repo now includes:

- `.github/workflows/verify.yml` for PR and `main` verification
- `tools/verify/run-full.mjs` as the cross-platform verification runner

## Alternative Methods

### CI-driven deployment

Use this only if deployment must be blocked on a dedicated CI pipeline.

Examples:

- GitHub Actions deploy to Cloudflare Pages Direct Upload
- GitHub Actions deploy to Azure Static Web Apps
- GitHub Actions publish GitHub Pages

Tradeoff:

- more moving parts than native Git-connected hosting

### Azure Static Web Apps

Use this only if the rest of your stack already lives in Azure.

### GitHub Pages with Actions

Use this only if you want to stay entirely inside GitHub and accept weaker deployment ergonomics than Vercel or Cloudflare Pages.

## Discouraged Patterns

- Manual `dist` uploads as the normal workflow
- VPS, Docker, or nginx hosting for this app
- adding Astro server adapters before the app actually needs SSR
