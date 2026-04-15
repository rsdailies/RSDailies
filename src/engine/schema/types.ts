/**
 * TypeScript Type Definitions & Data Schema
 * 
 * Defines all types used across the Dailyscape application.
 * Based on existing localStorage schema audit and feature requirements.
 */

/** Task identifiers and metadata */
export type TaskSlug = string // e.g., 'herb-run', 'birdhouse-run'
export type TaskStatus = 'true' | 'false' | 'hide' // Completion states in localStorage

/** Reset period types */
export type ResetType = 'daily' | 'weekly' | 'monthly'

/** User profile names */
export type ProfileName = string // e.g., 'default', 'alt1', 'alt2'

/** Task sorting orders */
export type SortOrder = 'alpha' | 'asc' | 'desc'

/** Layout display modes */
export type LayoutMode = 'normal' | 'compact'

/** Task object in memory representation */
export interface Task {
  slug: TaskSlug
  name: string
  category: string // e.g., 'Daily', 'Weekly', 'Shop'
  resetType: ResetType
  profitGp: number // GP earned when task completes
  completedTimestamp?: number // Milliseconds when last marked complete
  isCompleted: boolean // Current period completion status
  isHidden: boolean // Hidden in UI but still tracked
  tooltip?: string // Hover text for RS wiki links or descriptions
}

/** Profile represents a separate task list/save file */
export interface Profile {
  name: ProfileName
  tasks: { [slug: TaskSlug]: Task }
  lastUpdated: number // Milliseconds of last sync
  layout: LayoutConfig
}

/** Layout configuration for task display */
export interface LayoutConfig {
  mode: LayoutMode
  timeframeOrder: { [timeframe: string]: SortOrder }
  sectionLayout: { [section: string]: string[] } // Section -> [task slugs]
  splitDailyTables: boolean
}

/** Calculation results for profit/efficiency */
export interface ProfitCalculation {
  totalGpPerDay: number
  totalGpPerWeek: number
  totalGpPerMonth: number
  tasksCompletedToday: number
  tasksCompletedThisWeek: number
  tasksCompletedThisMonth: number
  nextResetCountdown: {
    daily: number // seconds
    weekly: number // seconds
    monthly: number // seconds
  }
}

/** Notification event details */
export interface NotificationEvent {
  type: 'reset' | 'reminder' | 'milestone'
  title: string
  message: string
  taskSlug?: TaskSlug
  timestamp: number
}

/** Application state at runtime */
export interface ApplicationState {
  currentProfile: ProfileName
  profiles: { [name: ProfileName]: Profile }
  userSettings: UserSettings
  notifications: NotificationEvent[]
}

/** User preference settings */
export interface UserSettings {
  enableNotifications: boolean
  enableSoundAlerts: boolean
  theme: 'light' | 'dark' | 'auto'
  language: string // e.g., 'en-US'
}

/** Timeframe definitions for grouping tasks */
export const TIMEFRAMES = {
  DAILY: 'rs3daily',
  DAILY_SHOPS: 'rs3dailyshops',
  WEEKLY: 'rs3weekly',
  WEEKLY_SHOPS: 'rs3weeklyshops',
  MONTHLY: 'rs3monthly',
} as const

export type Timeframe = (typeof TIMEFRAMES)[keyof typeof TIMEFRAMES]

/** Storage key prefixes for localStorage */
export const STORAGE_KEYS = {
  PROFILE_PREFIX: 'rs3-profile-',
  CURRENT_PROFILE: 'current-profile',
  PROFILES_LIST: 'profiles',
  CURRENT_LAYOUT: 'current-layout',
  TASK_SUFFIX: '', // Tasks use format: `${profilePrefix}${taskSlug}`
  LAYOUT_SUFFIX: '-layout',
  ORDER_SUFFIX: '-order',
  UPDATED_SUFFIX: '-updated',
  SPLIT_DAILY_TABLES: '-split-daily-tables',
} as const

/**
 * Build localStorage key for a task in a profile
 */
export function buildTaskKey(profileName: ProfileName, taskSlug: TaskSlug): string {
  return `${STORAGE_KEYS.PROFILE_PREFIX}${profileName}.${taskSlug}`
}

/**
 * Build localStorage key for layout settings
 */
export function buildLayoutKey(
  profileName: ProfileName,
  timeframe: Timeframe,
  mode: LayoutMode
): string {
  return `${STORAGE_KEYS.PROFILE_PREFIX}${profileName}.${timeframe}-layout-${mode}`
}

/**
 * Build localStorage key for sort order
 */
export function buildOrderKey(profileName: ProfileName, timeframe: Timeframe): string {
  return `${STORAGE_KEYS.PROFILE_PREFIX}${profileName}.${timeframe}-order`
}

/**
 * Build localStorage key for last update timestamp
 */
export function buildUpdatedKey(profileName: ProfileName, timeframe: Timeframe): string {
  return `${STORAGE_KEYS.PROFILE_PREFIX}${profileName}.${timeframe}-updated`
}

/**
 * Extract profile name from task key
 */
export function extractProfileFromTaskKey(taskKey: string): ProfileName {
  const prefix = STORAGE_KEYS.PROFILE_PREFIX
  if (!taskKey.startsWith(prefix)) {
    throw new Error(`Invalid task key format: ${taskKey}`)
  }
  const middle = taskKey.slice(prefix.length)
  const dotIndex = middle.indexOf('.')
  if (dotIndex === -1) {
    throw new Error(`Invalid task key format: ${taskKey}`)
  }
  return middle.slice(0, dotIndex)
}

/**
 * Extract task slug from task key
 */
export function extractTaskSlugFromKey(taskKey: string): TaskSlug {
  const prefix = STORAGE_KEYS.PROFILE_PREFIX
  if (!taskKey.startsWith(prefix)) {
    throw new Error(`Invalid task key format: ${taskKey}`)
  }
  const middle = taskKey.slice(prefix.length)
  const dotIndex = middle.indexOf('.')
  if (dotIndex === -1) {
    throw new Error(`Invalid task key format: ${taskKey}`)
  }
  return middle.slice(dotIndex + 1)
}
