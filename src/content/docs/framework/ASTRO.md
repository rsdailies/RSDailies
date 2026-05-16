# Astro notes

This project uses Astro for static page composition.

## Relevant official documentation

- Astro project structure: https://docs.astro.build/en/basics/project-structure/
- Astro content collections: https://docs.astro.build/en/guides/content-collections/
- Astro Content Loader API: https://docs.astro.build/en/reference/content-loader-reference/
- Astro Svelte integration: https://docs.astro.build/en/guides/integrations-guide/svelte/
- Astro client directives: https://docs.astro.build/en/reference/directives-reference/

## Project usage

- `src/pages/[game]/[page].astro` resolves static tracker routes.
- `src/content.config.ts` validates JSON page/section content.
- Svelte components are hydrated with `client:load` only where interactive behavior is needed.
