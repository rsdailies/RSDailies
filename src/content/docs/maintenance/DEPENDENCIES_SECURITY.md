---
title: Dependencies and Security
description: Dependency management policy, npm audit expectations, and security maintenance notes.
---

# Dependencies and security

## Current policy

- Keep `package-lock.json` committed.
- Use `npm install` to reproduce the dependency tree.
- Use `npm audit` as the local known-vulnerability gate.
- Require zero reported vulnerabilities when `npm audit` completes successfully.
- Do not use `npm audit fix --force` blindly.
- Treat npm audit endpoint or registry outages as operational failures, not proof that the dependency tree is clean.

## YAML tooling vulnerability note

The previous audit issue came from a transitive tooling dependency chain through Astro checking/language-server packages into `yaml-language-server` and `yaml`.

The project now uses this npm override:

```json
"overrides": {
  "yaml": "2.9.0"
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

If step 4 fails because the audit service itself is unavailable, rerun it later and do not treat that result as a clean security pass.

## Cleaned up dependencies

React and Nanostores dependencies have been successfully removed from the project. All UI logic is now handled by Svelte 5.
