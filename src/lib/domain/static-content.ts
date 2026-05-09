import osrsOverviewPage from '../../content/pages/osrs-overview.json' with { type: 'json' };
import osrsTasksPage from '../../content/pages/osrs-tasks.json' with { type: 'json' };
import rs3GatheringPage from '../../content/pages/rs3-gathering.json' with { type: 'json' };
import rs3OverviewPage from '../../content/pages/rs3-overview.json' with { type: 'json' };
import rs3TasksPage from '../../content/pages/rs3-tasks.json' with { type: 'json' };
import rs3TimersPage from '../../content/pages/rs3-timers.json' with { type: 'json' };

import gatheringSection from '../../content/sections/gathering.json' with { type: 'json' };
import osrsDailySection from '../../content/sections/osrsdaily.json' with { type: 'json' };
import osrsMonthlySection from '../../content/sections/osrsmonthly.json' with { type: 'json' };
import osrsWeeklySection from '../../content/sections/osrsweekly.json' with { type: 'json' };
import rs3DailySection from '../../content/sections/rs3daily.json' with { type: 'json' };
import rs3MonthlySection from '../../content/sections/rs3monthly.json' with { type: 'json' };
import rs3WeeklySection from '../../content/sections/rs3weekly.json' with { type: 'json' };
import timersSection from '../../content/sections/timers.json' with { type: 'json' };

export const TRACKER_PAGES = [
	rs3OverviewPage,
	rs3TasksPage,
	rs3GatheringPage,
	rs3TimersPage,
	osrsOverviewPage,
	osrsTasksPage,
];

export const TRACKER_SECTIONS = [
	rs3DailySection,
	rs3WeeklySection,
	rs3MonthlySection,
	gatheringSection,
	timersSection,
	osrsDailySection,
	osrsWeeklySection,
	osrsMonthlySection,
];
