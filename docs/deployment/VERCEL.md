# Deployment notes

The project is a static Astro site and can be deployed to Vercel or another static host.

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

The old visual checkpoint lives under a GitHub Pages URL. This cleaned project currently assumes root-relative routes such as `/rs3/tasks`. If deploying under a subpath, configure Astro `site`/`base` and review asset URLs before publishing.
