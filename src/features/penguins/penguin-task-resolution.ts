import { resolvePenguinTask } from '../../domain/resolvers/penguin.ts';

export function resolveWeeklyPenguinTask(task: any, weeklyData: Record<string, any> = {}) {
	return resolvePenguinTask(task, weeklyData);
}
