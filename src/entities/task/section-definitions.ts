import osrsDailySection from '../../content/games/osrs/sections/daily.json' with { type: 'json' };
import osrsMonthlySection from '../../content/games/osrs/sections/monthly.json' with { type: 'json' };
import osrsTimersSection from '../../content/games/osrs/sections/timers.json' with { type: 'json' };
import osrsWeeklySection from '../../content/games/osrs/sections/weekly.json' with { type: 'json' };
import rs3DailySection from '../../content/games/rs3/sections/daily.json' with { type: 'json' };
import gatheringSection from '../../content/games/rs3/sections/gathering.json' with { type: 'json' };
import rs3MonthlySection from '../../content/games/rs3/sections/monthly.json' with { type: 'json' };
import timersSection from '../../content/games/rs3/sections/timers.json' with { type: 'json' };
import rs3WeeklySection from '../../content/games/rs3/sections/weekly.json' with { type: 'json' };

import type { TrackerSection } from './types.ts';

export const TRACKER_SECTIONS: TrackerSection[] = [
	rs3DailySection as TrackerSection,
	rs3WeeklySection as TrackerSection,
	rs3MonthlySection as TrackerSection,
	gatheringSection as TrackerSection,
	timersSection as TrackerSection,
	osrsDailySection as TrackerSection,
	osrsWeeklySection as TrackerSection,
	osrsMonthlySection as TrackerSection,
	osrsTimersSection as TrackerSection,
];
