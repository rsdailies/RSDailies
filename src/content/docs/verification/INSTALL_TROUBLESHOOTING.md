# Install troubleshooting

## Expected install path

```bash
npm install
npm run verify:full
npm run dev
```

## Registry safety

The project includes `.npmrc` so local installs use the public npm registry:

```text
registry=https://registry.npmjs.org/
engine-strict=false
fund=false
audit=true
```

This prevents lockfile entries generated in a private CI or AI sandbox registry from leaking into local installs. The checked `package-lock.json` should not contain private registry hosts.

## Windows EPERM cleanup warnings

If npm is interrupted, Windows can leave locked folders under `node_modules`. Close terminals, editors, preview servers, and file explorers that may be touching the folder, then delete `node_modules` and run `npm install` again.

## Node version

Astro 6 requires Node `22.12.0` or newer. This project sets:

```json
"engines": { "node": ">=22.12.0" }
```

That means Node 22 LTS and Node 24 are accepted.
