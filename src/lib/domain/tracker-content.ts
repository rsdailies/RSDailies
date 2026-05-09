import { getCustomTasks } from '../features/custom-tasks/custom-task-service.ts';
import { StorageKeyBuilder } from '../shared/storage/keys-builder.ts';
import * as StorageService from '../shared/storage/storage-service.ts';
import { resolvePenguinTask } from './resolvers/penguin.ts';

export interface TrackerView {
	id: string;
	label: string;
}

export interface TrackerTask {
	id: string;
	name: string;
	wiki?: string;
	note?: string;
	reset?: string;
	alertDaysBeforeReset?: number;
	children?: TrackerTask[];
	childRows?: TrackerTask[];
	cooldownMinutes?: number;
}

export interface TimerDefinition {
	id: string;
	name: string;
	wiki?: string;
	note?: string;
	cycleMinutes?: number;
	stages?: number;
	timerCategory?: string;
	useHerbSetting?: boolean;
	alertOnReady?: boolean;
	autoClearOnReady?: boolean;
	vanishOnStart?: boolean;
	plots?: TrackerTask[];
}

export interface TimerGroup {
	id: string;
	label: string;
	note?: string;
	timers: TimerDefinition[];
	plots: TrackerTask[];
}

export interface TrackerSection {
	id: string;
	label: string;
	game: 'rs3' | 'osrs';
	displayOrder: number;
	resetFrequency: string;
	renderVariant: 'standard' | 'grouped-sections' | 'parent-children' | 'timer-groups';
	legacySectionId?: string;
	containerId?: string;
	tableId?: string;
	includedInAllMode?: boolean;
	supportsTaskNotifications?: boolean;
	shell?: {
		columns?: string[];
		countdownId?: string;
		extraTableClasses?: string[];
		showAddButton?: boolean;
		showResetButton?: boolean;
		showCountdown?: boolean;
	};
	items: TrackerTask[];
	groups?: TimerGroup[];
}

export interface TrackerPage {
	id: string;
	title: string;
	navLabel: string;
	game: 'rs3' | 'osrs';
	route: string;
	layout: 'tracker' | 'overview';
	displayOrder: number;
	primaryNav: boolean;
	availableViews: TrackerView[];
	sections: string[];
}

export interface OverviewTask {
	storageId: string;
	sectionId: string;
	taskId: string;
	task: TrackerTask;
	completed: boolean;
	isCustom: boolean;
}

export interface OverviewModel {
	pinnedTasks: OverviewTask[];
	customTasks: TrackerTask[];
}

function normalizeViewValue(value: string | null | undefined) {
	return String(value || '').trim().toLowerCase();
}

function sortByDisplayOrder<T extends { displayOrder?: number; id?: string }>(left: T, right: T) {
	const leftOrder = Number.isFinite(left?.displayOrder) ? left.displayOrder! : Number.MAX_SAFE_INTEGER;
	const rightOrder = Number.isFinite(right?.displayOrder) ? right.displayOrder! : Number.MAX_SAFE_INTEGER;
	if (leftOrder !== rightOrder) return leftOrder - rightOrder;
	return String(left?.id || '').localeCompare(String(right?.id || ''));
}

export function getTrackerPage(game: string, pageId: string, pages: TrackerPage[]) {
	const normalizedGame = game === 'osrs' ? 'osrs' : 'rs3';
	return pages.find((page) => page.game === normalizedGame && (page.id === pageId || page.route.endsWith(`/${pageId}`))) || null;
}

export function normalizeTrackerView(page: TrackerPage, requestedView: string | null | undefined) {
	if (!page.availableViews.length) return '';

	const normalized = normalizeViewValue(requestedView);
	const fallback = page.availableViews[0]?.id || '';
	return page.availableViews.some((view) => view.id === normalized) ? normalized : fallback;
}

function cloneSection(section: TrackerSection): TrackerSection {
	return JSON.parse(JSON.stringify(section)) as TrackerSection;
}

function mapTaskChildren(task: TrackerTask, weeklyData: Record<string, any>) {
	return resolvePenguinTask(task, weeklyData);
}

function filterTaskItems(items: TrackerTask[], cadence: string, weeklyData: Record<string, any>) {
	return items
		.map((item) => mapTaskChildren(item, weeklyData))
		.filter((item) => cadence === 'all' || String(item.reset || '').toLowerCase() === cadence);
}

export function getTrackerSectionsForPage(
	game: string,
	pageId: string,
	view: string | null | undefined,
	pages: TrackerPage[],
	sections: TrackerSection[],
	options: { weeklyData?: Record<string, any> } = {}
) {
	const page = getTrackerPage(game, pageId, pages);
	if (!page) return [];

	const requestedView = normalizeTrackerView(page, view);
	const gameSections = sections
		.filter((section) => page.sections.includes(section.id) && section.game === page.game)
		.sort(sortByDisplayOrder)
		.map(cloneSection);

	if (!requestedView) {
		return gameSections;
	}

	if (page.id.endsWith('tasks')) {
		if (requestedView === 'all') {
			return gameSections.map((section) => ({
				...section,
				items: filterTaskItems(section.items || [], 'all', options.weeklyData || {}),
			}));
		}

		return gameSections
			.filter((section) => String(section.resetFrequency || '').toLowerCase() === requestedView)
			.map((section) => ({
				...section,
				items: filterTaskItems(section.items || [], requestedView, options.weeklyData || {}),
			}));
	}

	if (page.id.endsWith('gathering')) {
		return gameSections.map((section) => ({
			...section,
			items: filterTaskItems(section.items || [], requestedView, options.weeklyData || {}),
		}));
	}

	return gameSections;
}

function buildTaskLookup(game: string, sections: TrackerSection[]) {
	const lookup = new Map<string, { sectionId: string; task: TrackerTask }>();

	sections
		.filter((section) => section.game === game)
		.forEach((section) => {
			(section.items || []).forEach((task) => {
				lookup.set(StorageKeyBuilder.overviewPinStorageId(section.id, task.id), { sectionId: section.id, task });
				(task.children || task.childRows || []).forEach((child) => {
					lookup.set(StorageKeyBuilder.overviewPinStorageId(section.id, child.id), { sectionId: section.id, task: child });
				});
			});
		});

	return lookup;
}

export function resolveCustomTasks(_activeProfile: string) {
	return getCustomTasks();
}

export function resolveOverviewModel(game: string, activeProfile: string, sections: TrackerSection[]): OverviewModel {
	const normalizedGame = game === 'osrs' ? 'osrs' : 'rs3';
	const customTasks = resolveCustomTasks(activeProfile).filter((task) => task.game === normalizedGame);
	const pins = StorageService.load<Record<string, boolean>>(StorageKeyBuilder.overviewPins(), {});
	const taskLookup = buildTaskLookup(normalizedGame, sections);
	const completedCustom = StorageService.load<Record<string, boolean>>(StorageKeyBuilder.sectionCompletion('custom'), {});

	const pinnedTasks = Object.keys(pins)
		.filter((storageId) => pins[storageId])
		.map((storageId) => {
			const matched = taskLookup.get(storageId);
			if (matched) {
				const completed = StorageService.load<Record<string, boolean>>(StorageKeyBuilder.sectionCompletion(matched.sectionId), {});
				return {
					storageId,
					sectionId: matched.sectionId,
					taskId: matched.task.id,
					task: matched.task,
					completed: !!completed[matched.task.id],
					isCustom: false,
				};
			}

			const customTaskId = storageId.replace(/^custom::/, '');
			const customTask = customTasks.find((task) => task.id === customTaskId);
			if (!customTask) return null;

			return {
				storageId,
				sectionId: 'custom',
				taskId: customTask.id,
				task: customTask,
				completed: !!completedCustom[customTask.id],
				isCustom: true,
			};
		})
		.filter(Boolean) as OverviewTask[];

	return {
		pinnedTasks,
		customTasks,
	};
}

export function buildPrimaryNavItems(game: string, pages: TrackerPage[]) {
	const normalizedGame = game === 'osrs' ? 'osrs' : 'rs3';
	return pages
		.filter((page) => page.game === normalizedGame && page.primaryNav)
		.sort(sortByDisplayOrder)
		.map((page) => ({
			id: page.id,
			label: page.navLabel,
			href: page.route,
		}));
}
