import type { Settings } from '../settings/settings-defaults';

function getBaseTimerMinutes(task: any) {
	if (Number.isFinite(task?.growthMinutes)) return task.growthMinutes;
	if (Number.isFinite(task?.timerMinutes)) return task.timerMinutes;
	if (Number.isFinite(task?.cooldownMinutes)) return task.cooldownMinutes;

	const parsedGrowth = parseInt(task?.growthMinutes, 10);
	if (Number.isFinite(parsedGrowth) && parsedGrowth > 0) return parsedGrowth;

	const parsedTimer = parseInt(task?.timerMinutes, 10);
	if (Number.isFinite(parsedTimer) && parsedTimer > 0) return parsedTimer;

	const parsedCooldown = parseInt(task?.cooldownMinutes, 10);
	if (Number.isFinite(parsedCooldown) && parsedCooldown > 0) return parsedCooldown;

	const cycleMinutes = Number.isFinite(task?.cycleMinutes) ? task.cycleMinutes : parseInt(task?.cycleMinutes, 10);
	const stages = Number.isFinite(task?.stages) ? task.stages : parseInt(task?.stages, 10);

	if (Number.isFinite(cycleMinutes) && cycleMinutes > 0 && Number.isFinite(stages) && stages > 0) {
		return cycleMinutes * stages;
	}

	return 0;
}

export function getFarmingTimerMinutes(task: any, settings: Partial<Settings> = {}) {
	const baseMinutes = getBaseTimerMinutes(task);
	if (!baseMinutes) return 0;

	const herbTicks = settings.herbTicks === 3 ? 3 : 4;
	const growthOffsetMinutes =
		Number.isFinite(settings.growthOffsetMinutes) && Number(settings.growthOffsetMinutes) >= 0
			? Number(settings.growthOffsetMinutes)
			: herbTicks === 3
				? 20
				: 0;

	if (task?.useHerbSetting && herbTicks === 3) {
		return Math.max(0, baseMinutes - growthOffsetMinutes);
	}

	return baseMinutes;
}

export function getTimerMinutes(task: any, settings: Partial<Settings> = {}) {
	if (task?.timerCategory === 'farming') {
		return getFarmingTimerMinutes(task, settings);
	}

	return getBaseTimerMinutes(task);
}
