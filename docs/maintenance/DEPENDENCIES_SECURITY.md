# Dependencies and security

## Current policy

- Keep `package-lock.json` committed.
- Use `npm install` to reproduce the dependency tree.
- Use `npm audit` as the local known-vulnerability gate.
- Do not use `npm audit fix --force` blindly.

## YAML tooling vulnerability note

The previous audit issue came from a transitive tooling dependency chain through Astro checking/language-server packages into `yaml-language-server` and `yaml`.

The project now uses this npm override:

```json
"overrides": {
  "yaml": "^2.8.3"
}
```

That forces npm to resolve the patched `yaml` version while keeping the current Astro/Svelte toolchain intact.

## Recommended update process

1. Run `npm outdated`.
2. Upgrade direct dependencies intentionally.
3. Run `npm install`.
4. Run `npm audit`.
5. Run `npm run verify:full`.
6. Run browser smoke tests when UI packages changed.

## Do not remove yet

React and Nanostores dependencies are intentionally left alone in this checkpoint because the priority was visual/runtime stability. Remove them only after a separate import audit confirms they are unused and the build remains clean.
