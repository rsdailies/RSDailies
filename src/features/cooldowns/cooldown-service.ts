import { TRACKER_SECTIONS } from '@entities/task/section-definitions';
import { tracker } from '@features/tracker/stores/tracker.svelte';
import { StorageKeyBuilder } from '@shared/storage/keys-builder';
import { formatDurationMs } from '@shared/time/formatters';

type LoadFn = <T = any>(key: string, fallback?: T) => T;
type SaveFn = (key: string, value: any) => void;

function getCooldownsMap({ load }: { load?: LoadFn } = {}): Record<string, { readyAt: number; minutes: number }> {
	const reader = load || ((_: string, fallback: any) => fallback);
	const value = reader(StorageKeyBuilder.cooldowns(), {});
	return value && typeof value === 'object' ? value : {};
}

function saveCooldownsMap(
	data: Record<string, { readyAt: number; minutes: number }>,
	{ save }: { save?: SaveFn } = {},
) {
	(save || (() => {}))(StorageKeyBuilder.cooldowns(), data);
}

function restoreTaskInSection(sectionKey: string, taskId: string) {
	let changed = false;

	// Check reactive store completions
	if (tracker.completed[sectionKey]?.[taskId]) {
		tracker.toggleComplete(sectionKey, taskId); // sets completion to false reactively
		changed = true;
	}

	// Check reactive store hidden rows
	if (tracker.hiddenRows[sectionKey]?.[taskId]) {
		tracker.restore(sectionKey, taskId); // restores hidden status reactively
		changed = true;
	}

	return changed;
}

export function startCooldown(taskId: string, minutes: number, { load, save }: { load?: LoadFn; save?: SaveFn } = {}) {
	if (!taskId) return false;

	const durationMinutes = Math.max(1, Math.floor(Number(minutes) || 0));
	const cooldowns: Record<string, { readyAt: number; minutes: number }> = { ...getCooldownsMap({ load }) };
	cooldowns[taskId] = {
		readyAt: Date.now() + durationMinutes * 60000,
		minutes: durationMinutes,
	};

	saveCooldownsMap(cooldowns, { save });
	return true;
}

export function clearCooldown(taskId: string, { load, save }: { load?: LoadFn; save?: SaveFn } = {}) {
	if (!taskId) return false;

	const cooldowns: Record<string, { readyAt: number; minutes: number }> = { ...getCooldownsMap({ load }) };
	if (!cooldowns[taskId]) return false;

	delete cooldowns[taskId];
	saveCooldownsMap(cooldowns, { save });
	return true;
}

export function getCooldownStatus(taskId: string, { load }: { load?: LoadFn } = {}) {
	const cooldowns = getCooldownsMap({ load });
	const state = cooldowns[taskId];

	if (!state || !state.readyAt) {
		return { state: 'idle', note: '' };
	}

	const remaining = state.readyAt - Date.now();
	if (remaining <= 0) {
		return { state: 'ready', note: 'Ready now' };
	}

	return { state: 'running', note: `Ready in ${formatDurationMs(remaining)}` };
}

export function cleanupReadyCooldowns({ load, save }: { load?: LoadFn; save?: SaveFn } = {}) {
	const cooldowns: Record<string, { readyAt: number; minutes: number }> = { ...getCooldownsMap({ load }) };
	const sections = TRACKER_SECTIONS.filter(
		(section) => !('renderVariant' in section) || section.renderVariant !== 'timer-groups',
	).map((section) => section.id);
	let changed = false;

	Object.entries(cooldowns).forEach(([taskId, state]) => {
		if (!state || !state.readyAt || state.readyAt > Date.now()) return;

		delete cooldowns[taskId];
		changed = true;

		sections.forEach((sectionKey) => {
			restoreTaskInSection(sectionKey, taskId);
		});
	});

	if (changed) {
		saveCooldownsMap(cooldowns, { save });
	}

	return changed;
}
