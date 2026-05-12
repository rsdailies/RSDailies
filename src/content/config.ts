import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

const pagesCollection = defineCollection({
	loader: glob({ pattern: "**/pages/*.json", base: "./src/content/games" }),
	schema: z.object({
		id: z.string(),
		title: z.string(),
		navLabel: z.string(),
		game: z.enum(['rs3', 'osrs']),
		route: z.string(),
		layout: z.string(),
		displayOrder: z.number(),
		primaryNav: z.boolean(),
		availableViews: z.array(z.object({
			id: z.string(),
			label: z.string(),
		})).optional().default([]),
		sections: z.array(z.string()).optional().default([]),
	}),
});

const sectionsCollection = defineCollection({
	loader: glob({ pattern: "**/sections/*.json", base: "./src/content/games" }),
	schema: z.object({
		id: z.string(),
		label: z.string(),
		shortLabel: z.string().optional(),
		game: z.enum(['rs3', 'osrs']),
		displayOrder: z.number(),
		resetFrequency: z.enum(['daily', 'weekly', 'monthly', 'timer', 'mixed', 'rolling']),
		renderVariant: z.string().optional().default('standard'),
		shell: z.object({
			columns: z.array(z.string()),
			extraTableClasses: z.array(z.string()).optional().default([]),
			showAddButton: z.boolean().optional().default(false),
			showResetButton: z.boolean().optional().default(true),
			showCountdown: z.boolean().optional().default(true),
			countdownId: z.string().optional(),
		}),
		items: z.array(z.object({
			id: z.string(),
			name: z.string(),
			wiki: z.string().optional(),
			note: z.string().optional(),
			reset: z.string().optional(),
			cooldownMinutes: z.number().optional(),
			alertDaysBeforeReset: z.number().optional(),
			childRows: z.array(z.any()).optional(), // We'll keep it as any for now to allow recursion
		})).optional().default([]),
		groups: z.array(z.object({
			id: z.string(),
			label: z.string(),
			name: z.string().optional(),
			note: z.string().optional(),
			timers: z.array(z.object({
				id: z.string(),
				name: z.string(),
				wiki: z.string().optional(),
				note: z.string().optional(),
				cycleMinutes: z.number().optional(),
				stages: z.number().optional(),
				durationNote: z.string().optional(),
				useHerbSetting: z.boolean().optional(),
				alertOnReady: z.boolean().optional(),
				autoClearOnReady: z.boolean().optional(),
				vanishOnStart: z.boolean().optional(),
				timerKind: z.string().optional(),
				timerCategory: z.string().optional(),
				plots: z.array(z.object({
					id: z.string(),
					name: z.string(),
					wiki: z.string().optional(),
				})).optional(),
			})).optional(),
			plots: z.array(z.object({
				id: z.string(),
				name: z.string(),
				wiki: z.string().optional(),
				locationNote: z.string().optional(),
			})).optional(),
		})).optional().default([]),
		legacySectionId: z.string().optional(),
		containerId: z.string().optional(),
		tableId: z.string().optional(),
		includedInAllMode: z.boolean().optional().default(false),
		supportsTaskNotifications: z.boolean().optional().default(true),
	}),
});

export const collections = {
	'pages': pagesCollection,
	'sections': sectionsCollection,
};
