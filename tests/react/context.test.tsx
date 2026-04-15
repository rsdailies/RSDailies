/**
 * TaskContext Tests
 * 
 * Tests for React Context managing task state and operations.
 */

import React from 'react'
import { renderHook, act } from '@testing-library/react'
import { TaskContextProvider, useTaskContext } from '@react/context/TaskContext'
import { Task, ResetType, Timeframe, TIMEFRAMES } from '@engine/schema'

// Mock task for testing
const mockTask = (overrides?: Partial<Task>): Task => ({
  slug: 'herb-run',
  name: 'Herb Run',
  category: 'Daily',
  resetType: 'daily' as ResetType,
  profitGp: 100000,
  isCompleted: false,
  isHidden: false,
  ...overrides,
})

describe('TaskContext', () => {
  describe('useTaskContext', () => {
    it('should provide initial empty task list', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <TaskContextProvider>{children}</TaskContextProvider>
      )

      const { result } = renderHook(() => useTaskContext(), { wrapper })

      expect(result.current.tasks).toEqual([])
    })

    it('should load tasks on mount', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <TaskContextProvider>{children}</TaskContextProvider>
      )

      const { result } = renderHook(() => useTaskContext(), { wrapper })

      // Should initialize after mount
      expect(Array.isArray(result.current.tasks)).toBe(true)
    })

    it('should add a new task', async () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <TaskContextProvider>{children}</TaskContextProvider>
      )

      const { result } = renderHook(() => useTaskContext(), { wrapper })
      const newTask = mockTask()

      act(() => {
        result.current.addTask(newTask)
      })

      expect(result.current.tasks).toContainEqual(newTask)
    })

    it('should toggle task completion', async () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <TaskContextProvider>{children}</TaskContextProvider>
      )

      const { result } = renderHook(() => useTaskContext(), { wrapper })
      const task = mockTask({ isCompleted: false })

      act(() => {
        result.current.addTask(task)
      })

      act(() => {
        result.current.toggleTask('herb-run')
      })

      const updated = result.current.tasks.find((t) => t.slug === 'herb-run')
      expect(updated?.isCompleted).toBe(true)
    })

    it('should toggle task visibility (hide)', async () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <TaskContextProvider>{children}</TaskContextProvider>
      )

      const { result } = renderHook(() => useTaskContext(), { wrapper })
      const task = mockTask({ isHidden: false })

      act(() => {
        result.current.addTask(task)
      })

      act(() => {
        result.current.toggleHideTask('herb-run')
      })

      const updated = result.current.tasks.find((t) => t.slug === 'herb-run')
      expect(updated?.isHidden).toBe(true)
    })

    it('should update task', async () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <TaskContextProvider>{children}</TaskContextProvider>
      )

      const { result } = renderHook(() => useTaskContext(), { wrapper })
      const task = mockTask()

      act(() => {
        result.current.addTask(task)
      })

      const updated = mockTask({ profitGp: 150000 })

      act(() => {
        result.current.updateTask('herb-run', updated)
      })

      const found = result.current.tasks.find((t) => t.slug === 'herb-run')
      expect(found?.profitGp).toBe(150000)
    })

    it('should delete task', async () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <TaskContextProvider>{children}</TaskContextProvider>
      )

      const { result } = renderHook(() => useTaskContext(), { wrapper })
      const task = mockTask()

      act(() => {
        result.current.addTask(task)
      })

      expect(result.current.tasks).toHaveLength(1)

      act(() => {
        result.current.deleteTask('herb-run')
      })

      expect(result.current.tasks).toHaveLength(0)
    })

    it('should filter tasks by reset type', async () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <TaskContextProvider>{children}</TaskContextProvider>
      )

      const { result } = renderHook(() => useTaskContext(), { wrapper })

      act(() => {
        result.current.addTask(mockTask({ slug: 'daily-1', resetType: 'daily' }))
        result.current.addTask(mockTask({ slug: 'weekly-1', resetType: 'weekly' }))
        result.current.addTask(mockTask({ slug: 'daily-2', resetType: 'daily' }))
      })

      const daily = result.current.getTasksByResetType('daily')
      expect(daily).toHaveLength(2)
      expect(daily.every((t) => t.resetType === 'daily')).toBe(true)
    })

    it('should calculate total profit', async () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <TaskContextProvider>{children}</TaskContextProvider>
      )

      const { result } = renderHook(() => useTaskContext(), { wrapper })

      act(() => {
        result.current.addTask(mockTask({ slug: 'task-1', profitGp: 100000, isCompleted: true }))
        result.current.addTask(mockTask({ slug: 'task-2', profitGp: 50000, isCompleted: true }))
        result.current.addTask(mockTask({ slug: 'task-3', profitGp: 75000, isCompleted: false }))
      })

      const profit = result.current.getTotalProfit()
      expect(profit).toBe(150000) // Only completed tasks
    })

    it('should calculate completion percentage', async () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <TaskContextProvider>{children}</TaskContextProvider>
      )

      const { result } = renderHook(() => useTaskContext(), { wrapper })

      act(() => {
        result.current.addTask(mockTask({ slug: 'task-1', isCompleted: true }))
        result.current.addTask(mockTask({ slug: 'task-2', isCompleted: false }))
        result.current.addTask(mockTask({ slug: 'task-3', isCompleted: true }))
      })

      const percentage = result.current.getCompletionPercentage()
      expect(percentage).toBe(66.67) // 2 out of 3 complete
    })
  })

  describe('Error Handling', () => {
    it('should throw when useTaskContext used outside provider', () => {
      // Suppress console.error for this test
      const spy = jest.spyOn(console, 'error').mockImplementation()

      expect(() => {
        renderHook(() => useTaskContext())
      }).toThrow()

      spy.mockRestore()
    })

    it('should handle duplicate task additions gracefully', async () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <TaskContextProvider>{children}</TaskContextProvider>
      )

      const { result } = renderHook(() => useTaskContext(), { wrapper })
      const task = mockTask()

      act(() => {
        result.current.addTask(task)
        result.current.addTask(task) // Add same task again
      })

      // Should replace, not duplicate
      expect(result.current.tasks.filter((t) => t.slug === 'herb-run')).toHaveLength(1)
    })
  })
})
