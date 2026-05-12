# No legacy renderer policy

The migration goal is not to preserve a bridge forever. The old imperative renderer was removed from the active project because it competed with Svelte and caused duplicate/ambiguous rendering.

## Allowed

- Pure data helpers.
- Storage helpers.
- Timer math.
- Reset math.
- Static content definitions.
- Svelte components that preserve old visual classes.

## Not allowed

- `renderApp()` style global table rendering.
- Imperative injection of tracker rows into the dashboard.
- Runtime use of old shell HTML fragments.
- Hidden compatibility bridges that mutate the same DOM rendered by Svelte.
- Duplicate content folders that compete with `src/content/games/`.

## How to migrate future code

1. Identify the feature owner: Astro route, Svelte component, content JSON, or pure service.
2. Keep visual classes when preserving appearance.
3. Move behavior into Svelte or pure services.
4. Run `npm run verify:full`.
5. Run browser smoke tests when UI behavior changed.
