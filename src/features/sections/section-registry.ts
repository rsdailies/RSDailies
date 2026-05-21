import { TRACKER_SECTIONS } from '@entities/task/section-definitions.ts';
import type { GameId, TrackerSection } from '@entities/task/types.ts';

const sections = TRACKER_SECTIONS as TrackerSection[];
const sectionById = new Map<string, TrackerSection>(sections.map((section) => [section.id, section]));

export function requireTrackerSection(sectionId: string) {
	const section = sectionById.get(sectionId);
	if (!section) {
		throw new Error(`Missing tracker section "${sectionId}" in migrated content registry.`);
	}
	return section;
}

export function getTrackerSectionDefinitions() {
	return sections;
}

export function getTrackerSections(game: GameId | string | null = null) {
	return game ? sections.filter((section) => section.game === game) : sections;
}

export function getTrackerSection(sectionId: string) {
	return sectionById.get(sectionId) || null;
}

export const getContentSectionDefinition = getTrackerSection;

export function getTrackerSectionIds(game: GameId | string | null = null) {
	return getTrackerSections(game).map((section) => section.id);
}

export function getTrackerSectionIdMaps() {
	return getTrackerSections().reduce<{ containerIds: Record<string, string>; tableIds: Record<string, string> }>(
		(maps, section) => {
			if (section.containerId) maps.containerIds[section.id] = section.containerId;
			if (section.tableId) maps.tableIds[section.id] = section.tableId;
			return maps;
		},
		{ containerIds: {}, tableIds: {} },
	);
}
