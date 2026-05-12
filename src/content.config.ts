import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const resetSchema = z.enum(['daily', 'weekly', 'monthly', 'custom', 'never', 'rolling', 'mixed', 'timer']);

const detailLineSchema = z.object({
	kind: z.string().optional(),
	text: z.string(),
});

const childTaskSchema = z.object({
	id: z.string(),
	name: z.string(),
	wiki: z.string().optional(),
	note: z.string().optional(),
	reset: resetSchema.optional(),
	sectionKey: z.string().optional(),
	detailLines: z.array(detailLineSchema).optional(),
});

const taskSchema = z.object({
	id: z.string(),
	name: z.string(),
	wiki: z.string().optional(),
	note: z.string().optional(),
	reset: resetSchema.default('daily'),
	group: z.string().optional(),
	cooldownMinutes: z.number().optional(),
	alertDaysBeforeReset: z.number().optional(),
	sectionKey: z.string().optional(),
	children: z.array(childTaskSchema).optional(),
	childRows: z.array(childTaskSchema).optional(),
	detailLines: z.array(detailLineSchema).optional(),
});

const timerPlotSchema = z.object({
	id: z.string(),
	name: z.string(),
	wiki: z.string().optional(),
	note: z.string().optional(),
	locationNote: z.string().optional(),
});

const timerSchema = z.object({
	id: z.string(),
	name: z.string(),
	wiki: z.string().optional(),
	note: z.string().optional(),
	durationNote: z.string().optional(),
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
	plots: z.array(timerPlotSchema).default([]),
});

const timerGroupSchema = z.object({
	id: z.string(),
	label: z.string(),
	name: z.string().optional(),
	note: z.string().optional(),
	timers: z.array(timerSchema).default([]),
	plots: z.array(timerPlotSchema).default([]),
});

const sectionSchema = z.object({
	id: z.string(),
	label: z.string(),
	game: z.enum(['rs3', 'osrs']),
	displayOrder: z.number().default(100),
	resetFrequency: resetSchema.default('daily'),
	renderVariant: z.enum(['standard', 'grouped-sections', 'parent-children', 'timer-groups']).default('standard'),
	containerId: z.string().optional(),
	tableId: z.string().optional(),
	includedInAllMode: z.boolean().default(false),
	supportsTaskNotifications: z.boolean().default(false),
	shell: z.object({
		columns: z.array(z.string()).default(['activity_col_name', 'activity_col_notes', 'activity_col_status']),
		countdownId: z.string().optional(),
		extraTableClasses: z.array(z.string()).default([]),
		showAddButton: z.boolean().default(false),
		showResetButton: z.boolean().default(true),
		showCountdown: z.boolean().default(true),
	}).default({
		columns: ['activity_col_name', 'activity_col_notes', 'activity_col_status'],
		extraTableClasses: [],
		showAddButton: false,
		showResetButton: true,
		showCountdown: true,
	}),
	items: z.array(taskSchema).default([]),
	groups: z.array(timerGroupSchema).default([]),
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
		loader: glob({ pattern: '**/sections/*.json', base: './src/content/games' }),
		schema: sectionSchema,
	}),
	pages: defineCollection({
		loader: glob({ pattern: '**/pages/*.json', base: './src/content/games' }),
		schema: pageSchema,
	}),
};
