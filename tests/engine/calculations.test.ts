/**
 * Profit Calculations Tests
 * 
 * Tests for calculating profit/efficiency metrics across all tasks.
 */

import {
  calculateTotalProfit,
  calculateProfitPerTask,
  calculateCompletionPercentage,
} from '@engine/calculations'
import { Task, ResetType } from '@engine/schema/types'

// Helper to create mock tasks
const createTask = (
  slug: string,
  profitGp: number,
  isCompleted: boolean = false,
  resetType: ResetType = 'daily'
): Task => ({
  slug,
  name: slug,
  category: 'Test',
  resetType,
  profitGp,
  isCompleted,
  isHidden: false,
})

describe('Profit Calculations', () => {
  describe('calculateTotalProfit', () => {
    it('should return 0 for empty task list', () => {
      const profit = calculateTotalProfit([])
      expect(profit).toBe(0)
    })

    it('should sum profit of all completed daily tasks', () => {
      const tasks: Task[] = [
        createTask('task1', 100000, true, 'daily'),
        createTask('task2', 50000, true, 'daily'),
        createTask('task3', 25000, true, 'daily'),
      ]

      const profit = calculateTotalProfit(tasks, 'daily')
      expect(profit).toBe(175000)
    })

    it('should ignore incomplete tasks', () => {
      const tasks: Task[] = [
        createTask('task1', 100000, true, 'daily'),
        createTask('task2', 50000, false, 'daily'),
        createTask('task3', 75000, true, 'daily'),
      ]

      const profit = calculateTotalProfit(tasks, 'daily')
      expect(profit).toBe(175000) // Only task1 and task3
    })

    it('should ignore hidden tasks', () => {
      const tasks: Task[] = [
        createTask('task1', 100000, true, 'daily'),
        { ...createTask('task2', 50000, true, 'daily'), isHidden: true },
        createTask('task3', 75000, true, 'daily'),
      ]

      const profit = calculateTotalProfit(tasks, 'daily')
      expect(profit).toBe(175000) // task2 is hidden
    })

    it('should filter by reset type', () => {
      const tasks: Task[] = [
        createTask('daily1', 100000, true, 'daily'),
        createTask('daily2', 50000, true, 'daily'),
        createTask('weekly1', 500000, true, 'weekly'),
      ]

      const dailyProfit = calculateTotalProfit(tasks, 'daily')
      const weeklyProfit = calculateTotalProfit(tasks, 'weekly')

      expect(dailyProfit).toBe(150000)
      expect(weeklyProfit).toBe(500000)
    })

    it('should handle large profit values', () => {
      const tasks: Task[] = [
        createTask('task1', 1000000, true, 'daily'),
        createTask('task2', 2500000, true, 'daily'),
      ]

      const profit = calculateTotalProfit(tasks, 'daily')
      expect(profit).toBe(3500000)
    })

    it('should handle mixed reset types in single calculation', () => {
      const tasks: Task[] = [
        createTask('daily1', 100000, true, 'daily'),
        createTask('daily2', 50000, true, 'daily'),
        createTask('weekly1', 500000, true, 'weekly'),
        createTask('monthly1', 2000000, true, 'monthly'),
      ]

      const allTask = calculateTotalProfit(tasks)
      expect(allTask).toBe(2650000)
    })
  })

  describe('calculateProfitPerTask', () => {
    it('should return 0 for incomplete task', () => {
      const task = createTask('task1', 100000, false, 'daily')
      const profit = calculateProfitPerTask(task)
      expect(profit).toBe(0)
    })

    it('should return task profit for completed task', () => {
      const task = createTask('task1', 100000, true, 'daily')
      const profit = calculateProfitPerTask(task)
      expect(profit).toBe(100000)
    })

    it('should return 0 for hidden completed task', () => {
      const task: Task = { ...createTask('task1', 100000, true, 'daily'), isHidden: true }
      const profit = calculateProfitPerTask(task)
      expect(profit).toBe(0)
    })

    it('should work independently of reset type', () => {
      const dailyTask = createTask('daily', 50000, true, 'daily')
      const weeklyTask = createTask('weekly', 500000, true, 'weekly')
      const monthlyTask = createTask('monthly', 2000000, true, 'monthly')

      expect(calculateProfitPerTask(dailyTask)).toBe(50000)
      expect(calculateProfitPerTask(weeklyTask)).toBe(500000)
      expect(calculateProfitPerTask(monthlyTask)).toBe(2000000)
    })
  })

  describe('calculateCompletionPercentage', () => {
    it('should return 0% for empty task list', () => {
      const percentage = calculateCompletionPercentage([])
      expect(percentage).toBe(0)
    })

    it('should return 100% when all tasks completed', () => {
      const tasks: Task[] = [
        createTask('task1', 100000, true, 'daily'),
        createTask('task2', 50000, true, 'daily'),
        createTask('task3', 75000, true, 'daily'),
      ]

      const percentage = calculateCompletionPercentage(tasks, 'daily')
      expect(percentage).toBe(100)
    })

    it('should return 0% when no tasks completed', () => {
      const tasks: Task[] = [
        createTask('task1', 100000, false, 'daily'),
        createTask('task2', 50000, false, 'daily'),
        createTask('task3', 75000, false, 'daily'),
      ]

      const percentage = calculateCompletionPercentage(tasks, 'daily')
      expect(percentage).toBe(0)
    })

    it('should calculate correct percentage for partial completion', () => {
      const tasks: Task[] = [
        createTask('task1', 100000, true, 'daily'),
        createTask('task2', 50000, false, 'daily'),
        createTask('task3', 75000, true, 'daily'),
        createTask('task4', 100000, false, 'daily'),
      ]

      const percentage = calculateCompletionPercentage(tasks, 'daily')
      expect(percentage).toBe(50) // 2 out of 4 complete
    })

    it('should ignore hidden tasks in percentage', () => {
      const tasks: Task[] = [
        createTask('task1', 100000, true, 'daily'),
        { ...createTask('task2', 50000, false, 'daily'), isHidden: true },
        createTask('task3', 75000, true, 'daily'),
        createTask('task4', 100000, false, 'daily'),
      ]

      const percentage = calculateCompletionPercentage(tasks, 'daily')
      // Hidden task2 ignored, so 2 out of 3 visible = 66.67%
      expect(percentage).toBeCloseTo(66.67, 1)
    })

    it('should handle single task', () => {
      const tasks: Task[] = [createTask('task1', 100000, true, 'daily')]
      expect(calculateCompletionPercentage(tasks, 'daily')).toBe(100)

      const taskIncomplete: Task[] = [createTask('task1', 100000, false, 'daily')]
      expect(calculateCompletionPercentage(taskIncomplete, 'daily')).toBe(0)
    })

    it('should filter by reset type', () => {
      const tasks: Task[] = [
        createTask('daily1', 100000, true, 'daily'),
        createTask('daily2', 50000, false, 'daily'),
        createTask('weekly1', 500000, true, 'weekly'),
        createTask('weekly2', 250000, true, 'weekly'),
      ]

      const dailyPercentage = calculateCompletionPercentage(tasks, 'daily')
      const weeklyPercentage = calculateCompletionPercentage(tasks, 'weekly')

      expect(dailyPercentage).toBe(50) // 1 out of 2 daily tasks
      expect(weeklyPercentage).toBe(100) // 2 out of 2 weekly tasks
    })

    it('should return rounded percentage', () => {
      const tasks: Task[] = [
        createTask('task1', 100000, true, 'daily'),
        createTask('task2', 50000, false, 'daily'),
        createTask('task3', 75000, false, 'daily'),
      ]

      const percentage = calculateCompletionPercentage(tasks, 'daily')
      expect(percentage).toBeCloseTo(33.33, 1) // 1 out of 3 = 33.33%
    })
  })

  describe('Edge Cases', () => {
    it('should handle all tasks being hidden', () => {
      const tasks: Task[] = [
        { ...createTask('task1', 100000, true, 'daily'), isHidden: true },
        { ...createTask('task2', 50000, true, 'daily'), isHidden: true },
      ]

      expect(calculateTotalProfit(tasks, 'daily')).toBe(0)
      expect(calculateCompletionPercentage(tasks, 'daily')).toBe(0)
    })

    it('should handle zero-profit tasks', () => {
      const tasks: Task[] = [
        createTask('task1', 0, true, 'daily'),
        createTask('task2', 50000, true, 'daily'),
      ]

      const profit = calculateTotalProfit(tasks, 'daily')
      expect(profit).toBe(50000)
    })
  })
})
