# Svelte notes

This project uses Svelte 5 style component state in the tracker layer.

## Relevant official documentation

- Svelte 5 migration guide: https://svelte.dev/docs/svelte/v5-migration-guide
- `$props`: https://svelte.dev/docs/svelte/$props
- `$state`: https://svelte.dev/docs/svelte/$state
- `$derived`: https://svelte.dev/docs/svelte/$derived

## Project usage

- Svelte owns all tracker row/table interactivity.
- Components use `$props`, `$state`, and `$derived` where practical.
- Event handlers should use Svelte 5 property-style handlers such as `onclick={handler}` in new code.
