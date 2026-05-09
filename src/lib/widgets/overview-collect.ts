import { getTrackerSections, getTrackerSection } from '../domain/legacy-mode-content.ts';

function getPinTimestamp(pins: Record<string, any>, pinId: string) {
	const value = pins?.[pinId];
	if (typeof value === 'number' && Number.isFinite(value)) return value;
	if (value) return 0;
	return -1;
}

function collectTaskPins(items: any[], sectionKey: string, pins: Record<string, any>, into: any[]) {
	items.forEach((task) => {
		const pinId = `${sectionKey}::${task.id}`;
		if (pins[pinId]) {
			into.push({ task, sectionKey, pinId, pinTimestamp: getPinTimestamp(pins, pinId) });
		}

		if (!Array.isArray(task.children)) {
			return;
		}

		task.children.forEach((child: any) => {
			const childPinId = `${sectionKey}::${task.id}::${child.id}`;
			if (!pins[childPinId]) {
				return;
			}

			into.push({
				task: child,
				sectionKey,
				pinId: childPinId,
				parentId: task.id,
				pinTimestamp: getPinTimestamp(pins, childPinId),
			});
		});
	});
}

function collectFarmingPins(groups: any[], pins: Record<string, any>, into: any[]) {
	groups.forEach((group) => {
		if (!Array.isArray(group.subgroups)) {
			return;
		}

		group.subgroups.forEach((subgroup: any) => {
			if (subgroup.isTimer && subgroup.timerTask) {
				const pinId = `timers::${subgroup.timerTask.id}`;
				if (pins[pinId]) {
					into.push({
						task: subgroup.timerTask,
						sectionKey: 'timers',
						pinId,
						pinTimestamp: getPinTimestamp(pins, pinId),
					});
				}
				return;
			}

			if (Array.isArray(subgroup.tasks)) {
				collectTaskPins(subgroup.tasks, 'timers', pins, into);
			}
		});
	});
}

export function collectOverviewItems(sections: Record<string, any>, { getOverviewPins, load }: any) {
	const pins = getOverviewPins(load);
	const items: any[] = [];

	getTrackerSections().forEach((sectionDefinition) => {
		const sectionKey = sectionDefinition.id;
		const sectionValue = sections?.[sectionKey];

		if (sectionDefinition.renderVariant === 'timer-groups') {
			if (Array.isArray(sectionValue)) {
				collectFarmingPins(sectionValue, pins, items);
			}
			return;
		}

		if (Array.isArray(sectionValue)) {
			collectTaskPins(sectionValue, sectionKey, pins, items);
		}
	});

	return items;
}

export function getSectionLabel(sectionKey: string) {
	return getTrackerSection(sectionKey)?.shortLabel || getTrackerSection(sectionKey)?.label || sectionKey;
}
