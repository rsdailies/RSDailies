/**
 * Engine Layer - Main Entry Point
 * 
 * Exports all engine modules (storage, timer, schema, calculations, notifications).
 * This is the public API for framework-independent business logic.
 */

// Storage Abstraction
export { IStorageAdapter, StorageWatchCallback } from './storage/interface'
export { LocalStorageAdapter } from './storage/adapters/localStorage'
export { SupabaseAdapter } from './storage/adapters/supabase'

// Timer & Reset Logic
export { ResetType, getNextReset, calculateCountdown, isTaskStillCompleteThisPeriod } from './timer'
export type { CountdownResult } from './timer'

// Schema & Types
export {
  TaskSlug,
  TaskStatus,
  ProfileName,
  SortOrder,
  LayoutMode,
  Task,
  Profile,
  LayoutConfig,
  ProfitCalculation,
  NotificationEvent,
  ApplicationState,
  UserSettings,
  Timeframe,
  TIMEFRAMES,
  STORAGE_KEYS,
  buildTaskKey,
  buildLayoutKey,
  buildOrderKey,
  buildUpdatedKey,
  extractProfileFromTaskKey,
  extractTaskSlugFromKey,
} from './schema/types'

// Calculations
export {
  calculateTotalProfit,
  calculateProfitPerTask,
  calculateCompletionPercentage,
  calculateEfficiency,
} from './calculations'
export type { EfficiencyMetrics } from './calculations'

// Notifications
export {
  INotificationAdapter,
  WebNotificationAdapter,
  NullNotificationAdapter,
} from './notifications'
export type { NotificationPermission } from './notifications'
