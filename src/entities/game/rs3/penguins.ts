import { nextWeeklyBoundary } from '@shared/time/boundaries';

const PENGUIN_CACHE_KEY = 'penguinWeeklyData';
const PENGUIN_META_KEY = 'penguinWeeklyDataMeta';
const PENGUIN_REFRESH_MS = 3 * 60 * 60 * 1000;

function sanitizeText(value: any) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function buildPenguinNote(entry: any) {
  const parts = [];
  if (entry.points) parts.push(`${entry.points}-point`);
  if (entry.disguise) parts.push(entry.disguise);
  if (entry.last_location) parts.push(`Last seen: ${sanitizeText(entry.last_location)}`);
  if (entry.confined_to) parts.push(`Area: ${sanitizeText(entry.confined_to)}`);
  return parts.join(' | ');
}

export function parsePenguinActives(payload: any) {
  const penguins = Array.isArray(payload?.Activepenguin) ? [...payload.Activepenguin] : [];
  const parsed: Record<string, any> = {};

  penguins.slice(0, 12).forEach((entry, index) => {
    parsed[`penguin-${index + 1}`] = {
      name: sanitizeText(entry?.name) || `Penguin ${index + 1}`,
      note: buildPenguinNote(entry)
    };
  });

  return parsed;
}

export async function syncPenguins({ load, save }: any) {
  const weekKey = nextWeeklyBoundary().toISOString();
  const meta = load(PENGUIN_META_KEY, {});
  const configuredUrl = String(import.meta.env.PUBLIC_PENGUIN_API_URL || '').trim();

  // Check if we need to refresh
  if (meta.weekKey === weekKey && (Date.now() - (meta.syncedAt || 0)) < PENGUIN_REFRESH_MS) {
    return false;
  }

  if (!configuredUrl) {
    return false;
  }

  try {
    const response = await fetch(configuredUrl);
    if (!response.ok) return false;
    
    const payload = await response.json();
    const parsed = parsePenguinActives(payload);
    
    save(PENGUIN_CACHE_KEY, parsed);
    save(PENGUIN_META_KEY, {
      weekKey,
      syncedAt: Date.now()
    });
    return true;
  } catch {
    return false;
  }
}
