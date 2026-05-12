import osrsTasksPage from '../../content/games/osrs/pages/tasks.json' with { type: 'json' };
import rs3GatheringPage from '../../content/games/rs3/pages/gathering.json' with { type: 'json' };
import rs3TasksPage from '../../content/games/rs3/pages/tasks.json' with { type: 'json' };
import rs3TimersPage from '../../content/games/rs3/pages/timers.json' with { type: 'json' };

import gatheringSection from '../../content/games/rs3/sections/gathering.json' with { type: 'json' };
import osrsDailySection from '../../content/games/osrs/sections/daily.json' with { type: 'json' };
import osrsMonthlySection from '../../content/games/osrs/sections/monthly.json' with { type: 'json' };
import osrsWeeklySection from '../../content/games/osrs/sections/weekly.json' with { type: 'json' };
import rs3DailySection from '../../content/games/rs3/sections/daily.json' with { type: 'json' };
import rs3MonthlySection from '../../content/games/rs3/sections/monthly.json' with { type: 'json' };
import rs3WeeklySection from '../../content/games/rs3/sections/weekly.json' with { type: 'json' };
import timersSection from '../../content/games/rs3/sections/timers.json' with { type: 'json' };

export const TRACKER_PAGES = [rs3TasksPage, rs3GatheringPage, rs3TimersPage, osrsTasksPage];
export const TRACKER_SECTIONS = [rs3DailySection, rs3WeeklySection, rs3MonthlySection, gatheringSection, timersSection, osrsDailySection, osrsWeeklySection, osrsMonthlySection];
