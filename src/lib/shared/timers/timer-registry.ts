export function buildFarmingTimerEntries(timerGroups: any[]) {
  const entries: [string, any][] = [];

  timerGroups.forEach((group) => {
    const timers = Array.isArray(group?.timers) ? group.timers : [];

    timers.forEach((timer: any, index: number) => {
      const timerId = timer?.id || `${group.id}-timer-${index}`;

      entries.push([
        timerId,
        {
          ...timer,
          id: timerId,
          groupId: group.id,
          groupLabel: group.label || group.name || group.id,
          category: timer?.timerCategory || 'farming',
          game: 'rs3',
        },
      ]);
    });
  });

  return entries;
}

export class TimerRegistry {
  private registry: Map<string, any>;

  constructor(timerGroups: any[]) {
    this.registry = new Map(buildFarmingTimerEntries(timerGroups));
  }

  getTimerDefinition(timerId: string) {
    return this.registry.get(timerId) || null;
  }

  getAllTimerDefinitions() {
    return Array.from(this.registry.values());
  }
}
