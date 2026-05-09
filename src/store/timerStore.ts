import { map } from 'nanostores';
import * as StorageService from '../lib/shared/storage/storage-service';

export const $timerState = map<Record<string, number>>({});

// Hydrate from StorageService
if (typeof window !== 'undefined') {
  const preloaded = (window as any).__DAILYSCAPE_STATE__ || {};
  const timerData: Record<string, number> = {};
  
  Object.entries(preloaded).forEach(([key, value]) => {
    // If the value is a number, it's likely a timestamp
    if (typeof value === 'number') {
      timerData[key] = value;
    }
  });
  $timerState.set(timerData);
}

export function startTimer(timerId: string, durationMinutes: number) {
  const startTime = Date.now();
  $timerState.setKey(timerId, startTime);
  StorageService.save(timerId, startTime);
}

export function clearTimer(timerId: string) {
  $timerState.setKey(timerId, 0);
  StorageService.remove(timerId);
}
