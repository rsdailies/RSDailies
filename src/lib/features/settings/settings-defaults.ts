export const settingsDefaults = {
  splitDailyTables: true,
  splitWeeklyTables: true,
  showCompletedTasks: false,
  herbTicks: 4 as 3 | 4,
  growthOffsetMinutes: 0,
  browserNotif: false,
  webhookUrl: '',
  webhookUserId: '',
  webhookMessageTemplate: 'RSDailies: {task} is due.',
  overviewVisible: true,
};

export type Settings = typeof settingsDefaults;

export default settingsDefaults;
