/**
 * Profit & Efficiency Calculations Engine
 * 
 * Calculates metrics like total GP, completion percentages, and efficiency.
 */

import { Task, ResetType } from '@engine/schema/types'

/**
 * Calculate total profit from a list of tasks.
 * @param tasks - Array of tasks to calculate profit from
 * @param filterByResetType - Optional: filter to specific reset type (default: all)
 * @returns Total GP earned
 */
export function calculateTotalProfit(tasks: Task[], filterByResetType?: ResetType): number {
  return tasks.reduce((total, task) => {
    // Skip hidden tasks
    if (task.isHidden) return total

    // Skip incomplete tasks
    if (!task.isCompleted) return total

    // Filter by reset type if specified
    if (filterByResetType && task.resetType !== filterByResetType) return total

    return total + task.profitGp
  }, 0)
}

/**
 * Calculate profit contribution from a single task.
 * @param task - Task to calculate profit for
 * @returns GP value if task is completed and visible, 0 otherwise
 */
export function calculateProfitPerTask(task: Task): number {
  if (task.isHidden || !task.isCompleted) return 0
  return task.profitGp
}

/**
 * Calculate completion percentage for tasks.
 * @param tasks - Array of tasks to calculate percentage for
 * @param filterByResetType - Optional: filter to specific reset type (default: all)
 * @returns Completion percentage (0-100)
 */
export function calculateCompletionPercentage(
  tasks: Task[],
  filterByResetType?: ResetType
): number {
  // Filter visible tasks
  const visibleTasks = tasks.filter((task) => !task.isHidden)

  // Filter to reset type if specified
  const filtered = filterByResetType
    ? visibleTasks.filter((task) => task.resetType === filterByResetType)
    : visibleTasks

  // Handle empty list
  if (filtered.length === 0) return 0

  // Count completed tasks
  const completedCount = filtered.filter((task) => task.isCompleted).length

  // Calculate percentage
  const percentage = (completedCount / filtered.length) * 100

  // Return rounded to 2 decimal places
  return Math.round(percentage * 100) / 100
}

/**
 * Calculate efficiency metrics for task completion.
 */
export interface EfficiencyMetrics {
  gpsPerHour: number
  gpsPerTask: number
  timeEstimateMinutes: number
}

/**
 * Estimate efficiency based on completed tasks and time.
 * @param totalGp - Total GP earned
 * @param numberOfTasks - Number of tasks completed
 * @param elapsedSeconds - Elapsed time in seconds
 * @returns Efficiency metrics
 */
export function calculateEfficiency(
  totalGp: number,
  numberOfTasks: number,
  elapsedSeconds: number
): EfficiencyMetrics {
  const elapsedHours = elapsedSeconds / 3600

  return {
    gpsPerHour: elapsedHours > 0 ? Math.floor(totalGp / elapsedHours) : 0,
    gpsPerTask: numberOfTasks > 0 ? Math.floor(totalGp / numberOfTasks) : 0,
    timeEstimateMinutes: numberOfTasks > 0 ? Math.floor((elapsedSeconds / numberOfTasks) / 60) : 0,
  }
}
