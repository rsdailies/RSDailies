import type { TrackerTask } from '@entities/task/types.ts';
import { slugify } from '../../shared/utils/slugify.ts';

type CustomTaskReset = 'daily' | 'weekly' | 'monthly' | 'timer';
type BuildCustomTaskInput = {
	rawName: string;
	rawNote: string;
	rawWiki: string;
	rawReset: string;
	rawAlertDaysBeforeReset: string;
	rawTimerMinutes: string;
};

export type CustomTask = TrackerTask & {
	alertDaysBeforeReset: number;
	reset: CustomTaskReset;
};

export function parsePositiveInt(value: unknown, fallback: number) {
	const parsed = parseInt(String(value ?? '').trim(), 10);
	if (!Number.isFinite(parsed) || parsed < 0) return fallback;
	return parsed;
}

export function isValidOptionalUrl(value: unknown) {
	const trimmed = String(value || '').trim();
	if (!trimmed) return true;
	try {
		const parsed = new URL(trimmed);
		return parsed.protocol === 'http:' || parsed.protocol === 'https:';
	} catch {
		return false;
	}
}

export function buildCustomTask({
	rawName,
	rawNote,
	rawWiki,
	rawReset,
	rawAlertDaysBeforeReset,
	rawTimerMinutes,
}: BuildCustomTaskInput): CustomTask {
	const allowed: CustomTaskReset[] = ['daily', 'weekly', 'monthly', 'timer'];
	const reset = allowed.includes(rawReset as CustomTaskReset) ? (rawReset as CustomTaskReset) : 'daily';
	const alertDaysBeforeReset = parsePositiveInt(rawAlertDaysBeforeReset, 0);

	const task: CustomTask = {
		id: `custom-${slugify(rawName)}-${Date.now()}`,
		name: rawName,
		note: rawNote,
		wiki: rawWiki,
		reset,
		alertDaysBeforeReset,
	};

	if (task.reset === 'timer') {
		let minutes = parsePositiveInt(rawTimerMinutes, 60);
		if (minutes < 1) minutes = 60;
		task.cooldownMinutes = minutes;
		task.alertDaysBeforeReset = 0;
		task.note = task.note ? `${task.note} | Repeating timer: ${minutes}m` : `Repeating timer: ${minutes}m`;
	}

	return task;
}
