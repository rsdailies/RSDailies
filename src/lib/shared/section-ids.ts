import { getTrackerSectionIdMaps } from '../domain/legacy-mode-content.ts';

export const SECTION_CONTAINER_IDS = new Proxy<Record<string, string>>(
	{},
	{
		get(_target, prop: string) {
			return getTrackerSectionIdMaps().containerIds[prop];
		},
	}
);

export const SECTION_TABLE_IDS = new Proxy<Record<string, string>>(
	{},
	{
		get(_target, prop: string) {
			return getTrackerSectionIdMaps().tableIds[prop];
		},
	}
);
