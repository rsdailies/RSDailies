import osrsTasksPage from '../../content/games/osrs/pages/tasks.json' with { type: 'json' };
import rs3GatheringPage from '../../content/games/rs3/pages/gathering.json' with { type: 'json' };
import rs3TasksPage from '../../content/games/rs3/pages/tasks.json' with { type: 'json' };
import rs3TimersPage from '../../content/games/rs3/pages/timers.json' with { type: 'json' };

import type { TrackerPage } from './types.ts';

export const TRACKER_PAGES: TrackerPage[] = [
	rs3TasksPage as TrackerPage,
	rs3GatheringPage as TrackerPage,
	rs3TimersPage as TrackerPage,
	osrsTasksPage as TrackerPage,
];
