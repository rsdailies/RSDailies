import { TIMER_SECTION_KEY } from '../timers/timer-runtime.ts';
import { StorageKeyBuilder } from '../../shared/storage/keys-builder.ts';
import { formatDurationMs } from '../../shared/time/formatters.ts';

function normalizeMinutes(value: unknown) {
	const numeric = Number.isFinite(value) ? Number(value) : parseInt(String(value), 10);
	return Number.isFinite(numeric) ? numeric : null;
}

export function getCustomTimerText(taskId: string, task: any, load?: <T = any>(key: string, fallback?: T) => T) {
	const cooldownMinutes = normalizeMinutes(task?.cooldownMinutes);
	if (cooldownMinutes === null || cooldownMinutes < 1) return '';

	const cooldowns: Record<string, { readyAt?: number }> = load?.(StorageKeyBuilder.cooldowns(), {}) || {};
	const active = cooldowns?.[taskId];
	if (active?.readyAt && active.readyAt > Date.now()) {
		return formatDurationMs(active.readyAt - Date.now());
	}

	return formatDurationMs(cooldownMinutes * 60 * 1000);
}

export function createTimerColumn(text = '') {
	const cell = document.createElement('td');
	cell.className = 'activity_notes custom-task-timer';
	cell.textContent = text || '';
	return cell;
}

export function isFarmingChildStorageId(sectionKey: string, taskId: string, task: any) {
	return (
		sectionKey === TIMER_SECTION_KEY &&
		typeof taskId === 'string' &&
		taskId.startsWith(`${TIMER_SECTION_KEY}::`) &&
		taskId.split('::').length >= 3 &&
		!task?.isTimerParent
	);
}
