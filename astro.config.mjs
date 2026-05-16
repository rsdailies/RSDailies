// @ts-check
import { defineConfig } from 'astro/config';

import svelte from '@astrojs/svelte';

import starlight from '@astrojs/starlight';

/**
 * Vite plugin that raises the FSWatcher MaxListeners limit at the point
 * when the dev server is configured — directly on the watcher instance.
 * This permanently eliminates the MaxListenersExceededWarning.
 */
const fixMaxListeners = {
	name: 'vite-plugin-fix-max-listeners',
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
			console.log(pc.bold(pc.magenta('\n  ▲ DAILYSCAPE DEVELOPMENT MODE')));
			console.log(pc.dim('  ------------------------------------------'));
			console.log(pc.cyan('  RS3 Module: ') + pc.green('100% (Beta Ready)'));
			console.log(pc.cyan('  OSRS Module: ') + pc.yellow('Placeholder Shell'));
			console.log(pc.cyan('  Wiki Engine: ') + pc.green('Active (Starlight)'));
			console.log(pc.dim('  ------------------------------------------\n'));
		}
	}
};

// https://astro.build/config
export default defineConfig({
  integrations: [
    dailyscapeBanner,
    svelte(),
    starlight({
      title: 'Dailyscape Internal Wiki',
      social: [
        { label: 'GitHub', href: 'https://github.com/anthony/dailyscape', icon: 'github' },
      ],
      sidebar: [
        {
          label: 'Overview',
          link: '/PROJECT_OVERVIEW',
        },
        {
          label: 'Architecture',
          items: [
            { label: 'File Tree', slug: 'architecture/FILE_TREE' },
            { label: 'Persistence & Actions', slug: 'guides/persistence-actions' },
            { label: 'No Legacy Policy', slug: 'architecture/NO_LEGACY_POLICY' },
            { label: 'Ownership', slug: 'architecture/OWNERSHIP' },
          ],
        },
        {
          label: 'Features',
          items: [{ autogenerate: { directory: 'features' } }],
        },
        {
          label: 'Framework',
          items: [{ autogenerate: { directory: 'framework' } }],
        },
        {
          label: 'Testing & Verification',
          items: [
            { label: 'Verification', slug: 'testing/VERIFICATION' },
            { label: 'Testing', slug: 'testing/LAST_VERIFIED' },
            { label: 'Troubleshooting', slug: 'verification/INSTALL_TROUBLESHOOTING' },
          ],
        },
        {
          label: 'Maintenance',
          items: [{ autogenerate: { directory: 'maintenance' } }],
        },
      ],
    }),
  ],

  prefetch: true,
  output: 'server',
  adapter: vercel(),
  vite: {
    plugins: [fixMaxListeners],
  },
});