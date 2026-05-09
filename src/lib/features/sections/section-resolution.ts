import { getTrackerPage } from '../navigation/page-registry.ts';
import { resolveWeeklyPenguinTask } from '../penguins/penguin-task-resolution.ts';
import { resolveTimerGroups } from '../timers/timer-group-resolution.ts';
import { getTrackerSections } from './section-registry.ts';

function resolveSectionItems(
	section: any,
	options: { getCustomTasks?: () => any[]; getPenguinWeeklyData?: () => Record<string, any> }
) {
	if (section.id === 'custom') {
		return typeof options.getCustomTasks === 'function' ? options.getCustomTasks() : [];
	}

	if (Array.isArray(section.groups) && section.groups.length > 0) {
		return resolveTimerGroups(section.groups);
	}

	if (section.id !== 'rs3weekly') {
		return Array.isArray(section.items) ? section.items : [];
	}

	return (section.items || []).map((task: any) =>
		resolveWeeklyPenguinTask(task, typeof options.getPenguinWeeklyData === 'function' ? options.getPenguinWeeklyData() : {})
	);
}

export function resolveTrackerSections(options: {
	game?: string | null;
	getCustomTasks?: () => any[];
	getPenguinWeeklyData?: () => Record<string, any>;
} = {}) {
	const { game = null } = options;

	return getTrackerSections(game).reduce((sections, section) => {
		sections[section.id] = resolveSectionItems(section, options);
		return sections;
	}, {} as Record<string, any>);
}

export function resolveTrackerPage(
	pageId: string,
	options: {
		game?: string | null;
		getCustomTasks?: () => any[];
		getPenguinWeeklyData?: () => Record<string, any>;
	} = {}
) {
	const page = getTrackerPage(pageId, options.game || null);
	if (!page) {
		return null;
	}

	return {
		...page,
		sections: (page.sections || []).map((section) => ({
			...section,
			resolvedItems: resolveSectionItems(section, options),
		})),
	};
}
