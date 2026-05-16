export type GameId = 'rs3' | 'osrs';

export interface TaskDetailLine {
    text: string;
    kind: 'location' | 'duration' | 'note' | 'profit';
}

export interface TrackerTask {
    id: string;
    name: string;
    wiki?: string;
    note?: string;
    reset?: string;
    group?: string;
    detailLines?: TaskDetailLine[];
    childRows?: TrackerTask[];
}

export interface TrackerView {
    id: string;
    label: string;
}

export interface TrackerSection {
    id: string;
    label: string;
    game: GameId;
    displayOrder: number;
    resetFrequency: string;
    renderVariant?: string;
    shell?: any;
    items?: TrackerTask[];
    groups?: TimerGroup[];
    containerId?: string;
    tableId?: string;
    includedInAllMode?: boolean;
    supportsTaskNotifications?: boolean;
}

export interface TrackerPage {
    id: string;
    game: GameId;
    route: string;
    displayOrder: number;
    sections: string[];
}

export interface PinnedTask extends TrackerTask {
    sectionKey: string;
}

export interface TimerPlot {
    id: string;
    name: string;
    wiki?: string;
    note?: string;
    locationNote?: string;
}

export interface TimerDefinition {
    id: string;
    name: string;
    wiki?: string;
    durationNote?: string;
    plots?: TimerPlot[];
    baseMinutes?: number;
    ticks?: number;
}

export interface TimerGroup {
    id: string;
    label?: string;
    name?: string;
    plots?: TimerPlot[];
    timers?: TimerDefinition[];
}

export interface TaskGroup {
    id: string;
    name: string;
    tasks: TrackerTask[];
}
