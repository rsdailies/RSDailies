import type { GameId, TrackerSection, TrackerTask } from '@entities/task/types';
import type { ResolvedTimerGroup } from '@features/timers/services/timer-group-resolution.ts';
import { resolveTimerGroups } from '@features/timers/services/timer-group-resolution.ts';
import { getTrackerPage } from '../navigation/page-registry.ts';
import { resolveWeeklyPenguinTask } from '../penguins/penguin-task-resolution.ts';
import { getTrackerSection, getTrackerSections } from './section-registry.ts';

type SectionResolutionOptions = {
	game?: GameId | null;
	getCustomTasks?: () => TrackerTask[];
	getPenguinWeeklyData?: () => Record<string, Partial<TrackerTask>>;
	gatheringView?: string | null;
};

type ResolvedSectionItems = TrackerTask[] | ResolvedTimerGroup[];

function resolveSectionItems(section: TrackerSection, options: SectionResolutionOptions): ResolvedSectionItems {
	if (section.id === 'custom') {
		return typeof options.getCustomTasks === 'function' ? options.getCustomTasks() : [];
	}

	if (Array.isArray(section.groups) && section.groups.length > 0) {
		return resolveTimerGroups(section.groups);
	}

	const items = Array.isArray(section.items) ? section.items : [];

	if (section.id === 'gathering') {
		return items;
	}

	if (section.id !== 'rs3weekly') {
		return items;
	}

	return items.map((task) =>
		resolveWeeklyPenguinTask(
			task,
			typeof options.getPenguinWeeklyData === 'function' ? options.getPenguinWeeklyData() : {},
		),
	);
}

export function resolveTrackerSections(options: SectionResolutionOptions = {}) {
	const { game = null } = options;

	return getTrackerSections(game).reduce(
		(sections: Record<string, ResolvedSectionItems>, section) => {
			sections[section.id] = resolveSectionItems(section, options);
			return sections;
		},
		{} as Record<string, ResolvedSectionItems>,
	);
}

export function resolveTrackerPage(pageId: string, options: Omit<SectionResolutionOptions, 'gatheringView'> = {}) {
	const page = getTrackerPage(pageId, options.game || null);
	if (!page) {
		return null;
	}

	return {
		...page,
		sections: (page.sections || [])
			.map((sectionId) => {
				const section = getTrackerSection(sectionId);
				if (!section) return null;
				return {
					...section,
					resolvedItems: resolveSectionItems(section, options),
				};
			})
			.filter(Boolean),
	};
}
