import { map } from 'nanostores';
import { persistentMap } from '@nanostores/persistent';
import { settingsDefaults, type Settings } from '../lib/features/settings/settings-defaults';
import { STORAGE_ROOT } from '../lib/shared/storage/namespace';

// We use persistentMap to ensure settings survive page reloads automatically
export const $settings = persistentMap<Settings>(
  `${STORAGE_ROOT}:settings:`,
  settingsDefaults,
  {
    encode: JSON.stringify,
    decode: JSON.parse,
  }
);

export function updateSetting<K extends keyof Settings>(key: K, value: Settings[K]) {
  $settings.setKey(key, value);
}

export function resetSettings() {
  $settings.set(settingsDefaults);
}
