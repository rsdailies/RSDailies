import { defineConfig } from 'astro/config';

import svelte from '@astrojs/svelte';

import starlight from '@astrojs/starlight';
import { APP_REPOSITORY_URL, APP_SITE_URL, APP_WIKI_TITLE } from './src/shared/app-meta.js';

// @ts-check
/**
 * Vite plugin that raises the FSWatcher MaxListeners limit at the point
 * when the dev server is configured directly on the watcher instance.
 * This permanently eliminates the MaxListenersExceededWarning.
 */
const fixMaxListeners = {
	name: 'vite-plugin-fix-max-listeners',
	/** @param {import('vite').ViteDevServer} server */
	configureServer(server) {
		server.watcher.setMaxListeners(50);
	},
};

import vercel from '@astrojs/vercel';
import pc from 'picocolors';

/** @type {import('astro').AstroIntegration} */
const dailyscapeBanner = {
	name: 'dailyscape-banner',
	hooks: {
		'astro:server:start': () => {
			console.log(pc.bold(pc.magenta('\n  DAILYSCAPE DEVELOPMENT MODE')));
			console.log(pc.dim('  ------------------------------------------'));
			console.log(pc.cyan('  RS3 Module: ') + pc.green('100% (Beta Ready)'));
			console.log(pc.cyan('  OSRS Module: ') + pc.yellow('Placeholder Shell'));
			console.log(pc.cyan('  Wiki Engine: ') + pc.green('Active (Starlight)'));
			console.log(pc.dim('  ------------------------------------------\n'));
		},
	},
};

// https://astro.build/config
export default defineConfig({
	site: APP_SITE_URL,
	integrations: [
		dailyscapeBanner,
		svelte({ prebundleSvelteLibraries: false }),
		starlight({
			title: APP_WIKI_TITLE,
			social: [{ label: 'GitHub', href: APP_REPOSITORY_URL, icon: 'github' }],
		}),
	],

	prefetch: true,
	output: 'server',
	adapter: vercel(),
	devToolbar: {
		enabled: false,
	},
	vite: {
		cacheDir: '.astro-cache/vite',
		optimizeDeps: {
			disabled: true,
		},
		ssr: {
			optimizeDeps: {
				disabled: true,
			},
		},
		plugins: [fixMaxListeners],
	},
});
