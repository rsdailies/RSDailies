import { TRACKER_SECTIONS } from '../../domain/static-content.ts';

const sectionById = new Map(TRACKER_SECTIONS.map((section) => [section.id, section]));

export function requireTrackerSection(sectionId: string) {
	const section = sectionById.get(sectionId);
	if (!section) {
		throw new Error(`Missing tracker section "${sectionId}" in migrated content registry.`);
	}
	return section;
}

export function getTrackerSectionDefinitions() {
	return TRACKER_SECTIONS;
}

export function getTrackerSections(game: string | null = null) {
	return game ? TRACKER_SECTIONS.filter((section) => section.game === game) : TRACKER_SECTIONS;
}

export function getTrackerSection(sectionId: string) {
	return sectionById.get(sectionId) || null;
}

export const getContentSectionDefinition = getTrackerSection;

export function getTrackerSectionIds(game: string | null = null) {
	return getTrackerSections(game).map((section) => section.id);
}

export function getTrackerSectionIdMaps() {
	return getTrackerSections().reduce(
		(maps, section) => {
			maps.containerIds[section.id] = section.containerId;
			maps.tableIds[section.id] = section.tableId;
			return maps;
		},
		{ containerIds: {} as Record<string, string>, tableIds: {} as Record<string, string> }
	);
}
