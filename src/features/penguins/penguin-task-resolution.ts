import { resolvePenguinTask } from '@entities/game/resolvers/penguin.ts';
import type { TrackerTask } from '@entities/task/types';

export function resolveWeeklyPenguinTask(task: TrackerTask, weeklyData: Record<string, Partial<TrackerTask>> = {}) {
	return resolvePenguinTask(task, weeklyData);
}
