import { settingsDefaults, type Settings } from './settings-defaults.ts';
import { StorageKeyBuilder } from '../../shared/storage/keys-builder.ts';
import * as StorageService from '../../shared/storage/storage-service.ts';

function deriveGrowthOffsetMinutes(herbTicks: 3 | 4) {
	return herbTicks === 3 ? 20 : 0;
}

function normalizeWebhookUrl(value: unknown) {
	return String(value || '').trim();
}

function normalizeWebhookUserId(value: unknown) {
	return String(value || '').trim().replace(/[^\d]/g, '');
}

function normalizeWebhookTemplate(value: unknown) {
	const trimmed = String(value || '').trim();
	return trimmed || settingsDefaults.webhookMessageTemplate;
}

export function normalizeSettings(partial: Partial<Settings> = {}): Settings {
	const herbTicks: 3 | 4 = partial.herbTicks === 3 ? 3 : 4;
	const webhookUrl = normalizeWebhookUrl(partial.webhookUrl);

	return {
		splitDailyTables: partial.splitDailyTables !== false,
		splitWeeklyTables: partial.splitWeeklyTables !== false,
		showCompletedTasks: partial.showCompletedTasks === true,
		herbTicks,
		growthOffsetMinutes: deriveGrowthOffsetMinutes(herbTicks),
		browserNotif: !!partial.browserNotif,
		webhookUrl,
		webhookUserId: webhookUrl ? normalizeWebhookUserId(partial.webhookUserId) : '',
		webhookMessageTemplate: normalizeWebhookTemplate(partial.webhookMessageTemplate),
		overviewVisible: partial.overviewVisible !== false,
	};
}

export function getSettings(): Settings {
	const stored = StorageService.load(StorageKeyBuilder.settings(), settingsDefaults);
	return normalizeSettings(stored);
}

export function saveSettings(settings: Partial<Settings>) {
	const normalized = normalizeSettings(settings);
	StorageService.save(StorageKeyBuilder.settings(), normalized);
	return normalized;
}

export function updateSetting<K extends keyof Settings>(key: K, value: Settings[K]) {
	const nextSettings = {
		...getSettings(),
		[key]: value,
	};

	return saveSettings(nextSettings);
}

export function resetSettings() {
	return saveSettings(settingsDefaults);
}
