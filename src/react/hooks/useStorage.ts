/**
 * useStorage Hook
 * 
 * Custom React hook for managing state with automatic localStorage persistence.
 * Syncs across multiple tabs using StorageEvent listeners.
 */

import { useState, useEffect, useCallback } from 'react'

interface UseStorageReturn<T> {
  value: T
  setValue: (value: T) => void
  clear: () => void
}

/**
 * Use state with automatic localStorage persistence
 * @param key - localStorage key
 * @param initialValue - default value if key doesn't exist
 * @returns Object with value, setValue, and clear functions
 */
export function useStorage<T>(key: string, initialValue: T): UseStorageReturn<T> {
  // Initialize state from localStorage or use initialValue
  const [value, setValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key)
      if (item === null) {
        return initialValue
      }
      return JSON.parse(item) as T
    } catch (error) {
      console.warn(`Failed to parse localStorage[${key}]:`, error)
      return initialValue
    }
  })

  // Persist to localStorage whenever value changes
  const handleSetValue = useCallback(
    (newValue: T) => {
      try {
        setValue(newValue)
        if (newValue === undefined) {
          localStorage.removeItem(key)
        } else {
          localStorage.setItem(key, JSON.stringify(newValue))
        }
      } catch (error) {
        console.error(`Failed to save to localStorage[${key}]:`, error)
        throw error
      }
    },
    [key]
  )

  // Operation to clear the value
  const handleClear = useCallback(() => {
    try {
      setValue(initialValue)
      localStorage.removeItem(key)
    } catch (error) {
      console.error(`Failed to clear localStorage[${key}]:`, error)
    }
  }, [key, initialValue])

  // Listen for changes from other tabs
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === key && event.newValue !== null) {
        try {
          const newValue = JSON.parse(event.newValue) as T
          setValue(newValue)
        } catch (error) {
          console.warn(`Failed to parse storage event for[${key}]:`, error)
        }
      } else if (event.key === key && event.newValue === null) {
        // Value was cleared in another tab
        setValue(initialValue)
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [key, initialValue])

  return {
    value,
    setValue: handleSetValue,
    clear: handleClear,
  }
}
