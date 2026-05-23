import type { TimerDefinition, TimerPlot, TrackerTask } from '@entities/task/types.ts';
import type { Settings } from '@features/settings/settings-defaults.ts';

type TimerLike = Partial<TimerDefinition & TimerPlot & TrackerTask>;

function parsePositiveInt(value: unknown) {
	const parsed = Number.parseInt(String(value ?? ''), 10);
	return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

function getBaseTimerMinutes(task: TimerLike): number {
	if (Number.isFinite(task?.growthMinutes)) return Number(task.growthMinutes);
	if (Number.isFinite(task?.timerMinutes)) return Number(task.timerMinutes);
	if (Number.isFinite(task?.cooldownMinutes)) return Number(task.cooldownMinutes);

	const parsedGrowth = parsePositiveInt(task?.growthMinutes);
	if (parsedGrowth > 0) return parsedGrowth;

	const parsedTimer = parsePositiveInt(task?.timerMinutes);
	if (parsedTimer > 0) return parsedTimer;

	const parsedCooldown = parsePositiveInt(task?.cooldownMinutes);
	if (parsedCooldown > 0) return parsedCooldown;

	const cycleMinutes = Number.isFinite(task?.cycleMinutes)
		? Number(task.cycleMinutes)
		: parsePositiveInt(task?.cycleMinutes);
	const stages = Number.isFinite(task?.stages) ? Number(task.stages) : parsePositiveInt(task?.stages);

	if (Number.isFinite(cycleMinutes) && cycleMinutes > 0 && Number.isFinite(stages) && stages > 0) {
		return cycleMinutes * stages;
	}

	return 0;
}

export function getFarmingTimerMinutes(task: TimerLike, settings: Partial<Settings> = {}): number {
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

export function getTimerMinutes(task: TimerLike, settings: Partial<Settings> = {}): number {
	if (task?.timerCategory === 'farming') {
		return getFarmingTimerMinutes(task, settings);
	}

	return getBaseTimerMinutes(task);
}
