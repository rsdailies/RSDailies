import { APP_DEFAULT_WEBHOOK_MESSAGE } from '../../shared/app-meta.js';

export type DensityMode = 'compact' | 'comfortable';

export const settingsDefaults = {
	splitDailyTables: true,
	splitWeeklyTables: true,
	showCompletedTasks: false,
	densityMode: 'compact' as DensityMode,
	herbTicks: 4 as 3 | 4,
	growthOffsetMinutes: 0,
	browserNotif: false,
	webhookUrl: '',
	webhookUserId: '',
	webhookMessageTemplate: APP_DEFAULT_WEBHOOK_MESSAGE,
	overviewVisible: true,
};

export type Settings = typeof settingsDefaults;

export default settingsDefaults;
