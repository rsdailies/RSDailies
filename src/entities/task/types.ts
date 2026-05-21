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
	game?: GameId;
	sectionKey?: string;
	detailLines?: TaskDetailLine[];
	children?: TrackerTask[];
	childRows?: TrackerTask[];
	cooldownMinutes?: number;
	timerId?: string;
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
	title?: string;
	navLabel?: string;
	game: GameId;
	route: string;
	layout?: 'tracker' | 'overview';
	displayOrder: number;
	availableViews: TrackerView[];
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
	note?: string;
	durationNote?: string;
	plots?: TimerPlot[];
	baseMinutes?: number;
	ticks?: number;
	cycleMinutes?: number;
	stages?: number;
	timerMinutes?: number;
	growthMinutes?: number;
	useHerbSetting?: boolean;
	timerCategory?: string;
	timerKind?: string;
	alertOnReady?: boolean;
	autoClearOnReady?: boolean;
	vanishOnStart?: boolean;
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
