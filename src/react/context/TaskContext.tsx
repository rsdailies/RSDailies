/**
 * TaskContext - React Context for global task state management
 * 
 * Manages all task operations, filtering, and calculations.
 */

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import {
  Task,
  ResetType,
  calculateTotalProfit,
  calculateCompletionPercentage,
} from '../../engine'

interface TaskContextType {
  tasks: Task[]
  addTask: (task: Task) => void
  updateTask: (slug: string, task: Task) => void
  deleteTask: (slug: string) => void
  toggleTask: (slug: string) => void
  toggleHideTask: (slug: string) => void
  getTasksByResetType: (resetType: ResetType) => Task[]
  getTotalProfit: (resetType?: ResetType) => number
  getCompletionPercentage: (resetType?: ResetType) => number
}

const TaskContext = createContext<TaskContextType | undefined>(undefined)

interface TaskContextProviderProps {
  children: ReactNode
}

/**
 * Provider component for TaskContext
 */
export function TaskContextProvider({ children }: TaskContextProviderProps) {
  const [tasks, setTasks] = useState<Task[]>([])

  const addTask = useCallback((task: Task) => {
    setTasks((prev) => {
      // Replace if task with same slug exists, otherwise append
      const exists = prev.findIndex((t) => t.slug === task.slug)
      if (exists !== -1) {
        const updated = [...prev]
        updated[exists] = task
        return updated
      }
      return [...prev, task]
    })
  }, [])

  const updateTask = useCallback((slug: string, task: Task) => {
    setTasks((prev) =>
      prev.map((t) => (t.slug === slug ? { ...t, ...task } : t))
    )
  }, [])

  const deleteTask = useCallback((slug: string) => {
    setTasks((prev) => prev.filter((t) => t.slug !== slug))
  }, [])

  const toggleTask = useCallback((slug: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.slug === slug
          ? { ...t, isCompleted: !t.isCompleted, completedTimestamp: Date.now() }
          : t
      )
    )
  }, [])

  const toggleHideTask = useCallback((slug: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.slug === slug ? { ...t, isHidden: !t.isHidden } : t))
    )
  }, [])

  const getTasksByResetType = useCallback(
    (resetType: ResetType): Task[] => {
      return tasks.filter((t) => t.resetType === resetType)
    },
    [tasks]
  )

  const getTotalProfit = useCallback(
    (resetType?: ResetType): number => {
      return calculateTotalProfit(tasks, resetType)
    },
    [tasks]
  )

  const getCompletionPercentage = useCallback(
    (resetType?: ResetType): number => {
      return calculateCompletionPercentage(tasks, resetType)
    },
    [tasks]
  )

  const value: TaskContextType = {
    tasks,
    addTask,
    updateTask,
    deleteTask,
    toggleTask,
    toggleHideTask,
    getTasksByResetType,
    getTotalProfit,
    getCompletionPercentage,
  }

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>
}

/**
 * Hook to access TaskContext
 */
export function useTaskContext(): TaskContextType {
  const context = useContext(TaskContext)
  if (!context) {
    throw new Error('useTaskContext must be used within TaskContextProvider')
  }
  return context
}
