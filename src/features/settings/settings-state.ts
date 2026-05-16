import { StorageKeyBuilder } from '@shared/storage/keys-builder';
import {
	getSettings as getHostedSettings,
	normalizeSettings as normalizeHostedSettings,
	saveSettings as saveHostedSettings,
	type Settings,
} from './settings-service.ts';

type LoadFn = <T = any>(key: string, fallback?: T) => T;
type SaveFn = (key: string, value: any) => void;

export function normalizeSettings(partial: Partial<Settings> = {}) {
	return normalizeHostedSettings(partial);
}

export function getSettings({ load }: { load?: LoadFn } = {}) {
	if (typeof load === 'function') {
		return normalizeSettings(load(StorageKeyBuilder.settings(), getHostedSettings()));
	}

	return getHostedSettings();
}

export function saveSettings(settings: Partial<Settings>, { save }: { save?: SaveFn } = {}) {
	const normalized = normalizeSettings(settings);

	if (typeof save === 'function') {
		save(StorageKeyBuilder.settings(), normalized);
		return normalized;
	}

	return saveHostedSettings(normalized);
}
