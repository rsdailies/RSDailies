import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const childTaskSchema = z.object({
	id: z.string(),
	name: z.string(),
	wiki: z.string().optional(),
	note: z.string().optional(),
	reset: z.enum(['daily', 'weekly', 'monthly', 'custom', 'never']).optional(),
});

const taskSchema = z.object({
	id: z.string(),
	name: z.string(),
	wiki: z.string().optional(),
	note: z.string().optional(),
	reset: z.enum(['daily', 'weekly', 'monthly', 'custom', 'never']).default('daily'),
	cooldownMinutes: z.number().optional(),
	alertDaysBeforeReset: z.number().optional(),
	children: z.array(childTaskSchema).optional(),
	childRows: z.array(childTaskSchema).optional(),
});

const timerSchema = z.object({
	id: z.string(),
	name: z.string(),
	wiki: z.string().optional(),
	note: z.string().optional(),
	cycleMinutes: z.number().optional(),
	stages: z.number().optional(),
	timerMinutes: z.number().optional(),
	growthMinutes: z.number().optional(),
	useHerbSetting: z.boolean().optional(),
	alertOnReady: z.boolean().optional(),
	autoClearOnReady: z.boolean().optional(),
	vanishOnStart: z.boolean().optional(),
	timerKind: z.string().optional(),
	timerCategory: z.string().optional(),
});

const timerGroupSchema = z.object({
	id: z.string(),
	label: z.string(),
	note: z.string().optional(),
	timers: z.array(timerSchema).default([]),
	plots: z
		.array(
			z.object({
				id: z.string(),
				name: z.string(),
				wiki: z.string().optional(),
				note: z.string().optional(),
			})
		)
		.default([]),
});

const sectionSchema = z.object({
	id: z.string(),
	label: z.string(),
	game: z.enum(['rs3', 'osrs']),
	displayOrder: z.number().default(100),
	legacySectionId: z.string().optional(),
	resetFrequency: z.string().default('daily'),
	renderVariant: z.enum(['standard', 'grouped-sections', 'parent-children', 'timer-groups']).default('standard'),
	containerId: z.string().optional(),
	tableId: z.string().optional(),
	includedInAllMode: z.boolean().default(false),
	supportsTaskNotifications: z.boolean().default(false),
	shell: z
		.object({
			columns: z.array(z.string()).default([]),
			countdownId: z.string().optional(),
			extraTableClasses: z.array(z.string()).default([]),
			showAddButton: z.boolean().default(false),
			showResetButton: z.boolean().default(true),
			showCountdown: z.boolean().default(true),
		})
		.optional(),
	items: z.array(taskSchema).default([]),
	groups: z.array(timerGroupSchema).optional(),
});

const pageViewSchema = z.object({
	id: z.string(),
	label: z.string(),
});

const pageSchema = z.object({
	id: z.string(),
	title: z.string(),
	navLabel: z.string(),
	game: z.enum(['rs3', 'osrs']),
	route: z.string(),
	layout: z.enum(['tracker', 'overview']).default('tracker'),
	displayOrder: z.number().default(100),
	primaryNav: z.boolean().default(false),
	availableViews: z.array(pageViewSchema).default([]),
	sections: z.array(z.string()),
});

export const collections = {
	sections: defineCollection({
		loader: glob({ pattern: '**/[^_]*.json', base: './src/content/sections' }),
		schema: sectionSchema,
	}),
	pages: defineCollection({
		loader: glob({ pattern: '**/[^_]*.json', base: './src/content/pages' }),
		schema: pageSchema,
	}),
};
