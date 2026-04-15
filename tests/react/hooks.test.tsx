/**
 * useStorage Hook Tests
 * 
 * Tests for custom React hook that manages data persistence to localStorage.
 */

import { renderHook, act, waitFor } from '@testing-library/react'
import { useStorage } from '@react/hooks/useStorage'

describe('useStorage Hook', () => {
  beforeEach(() => {
    localStorage.clear()
    jest.clearAllMocks()
  })

  describe('Basic Operations', () => {
    it('should initialize with default value when storage is empty', async () => {
      const { result } = renderHook(() => useStorage('test-key', 'default-value'))

      expect(result.current.value).toBe('default-value')
    })

    it('should load existing value from localStorage', async () => {
      localStorage.setItem('existing-key', JSON.stringify('persisted-value'))

      const { result } = renderHook(() => useStorage('existing-key', 'default'))

      await waitFor(() => {
        expect(result.current.value).toBe('persisted-value')
      })
    })

    it('should set value and persist to localStorage', async () => {
      const { result } = renderHook(() => useStorage('test-key', 'initial'))

      act(() => {
        result.current.setValue('updated-value')
      })

      expect(result.current.value).toBe('updated-value')
      expect(localStorage.getItem('test-key')).toBe('"updated-value"')
    })

    it('should handle JSON serialization for objects', async () => {
      const { result } = renderHook(() => useStorage('obj-key', { count: 0 }))

      const obj = { count: 5, name: 'test' }
      act(() => {
        result.current.setValue(obj)
      })

      expect(result.current.value).toEqual(obj)
      const stored = JSON.parse(localStorage.getItem('obj-key') || '{}')
      expect(stored).toEqual(obj)
    })

    it('should handle arrays', async () => {
      const arr = [1, 2, 3]
      const { result } = renderHook(() => useStorage('arr-key', arr))

      const newArr = [4, 5, 6]
      act(() => {
        result.current.setValue(newArr)
      })

      expect(result.current.value).toEqual(newArr)
      const stored = JSON.parse(localStorage.getItem('arr-key') || '[]')
      expect(stored).toEqual(newArr)
    })
  })

  describe('Cleanup & Removal', () => {
    it('should remove value from storage', async () => {
      localStorage.setItem('remove-key', '"test-value"')

      const { result } = renderHook(() => useStorage('remove-key', 'default'))

      await waitFor(() => {
        expect(result.current.value).toBe('test-value')
      })

      act(() => {
        result.current.clear()
      })

      expect(localStorage.getItem('remove-key')).toBeNull()
    })

    it('should reset to default value after clear', async () => {
      const { result } = renderHook(() => useStorage('clear-key', 'default'))

      const newValue = 'updated'
      act(() => {
        result.current.setValue(newValue)
      })

      expect(result.current.value).toBe(newValue)

      act(() => {
        result.current.clear()
      })

      expect(result.current.value).toBe('default')
    })
  })

  describe('Multiple Keys', () => {
    it('should handle multiple storage keys independently', async () => {
      const { result: result1 } = renderHook(() => useStorage('key1', 'value1'))
      const { result: result2 } = renderHook(() => useStorage('key2', 'value2'))

      expect(result1.current.value).toBe('value1')
      expect(result2.current.value).toBe('value2')

      act(() => {
        result1.current.setValue('updated1')
      })

      expect(result1.current.value).toBe('updated1')
      expect(result2.current.value).toBe('value2') // unchanged
    })
  })

  describe('Edge Cases', () => {
    it('should handle null values', async () => {
      const { result } = renderHook(() => useStorage('null-key', null as any))

      act(() => {
        result.current.setValue(null)
      })

      expect(result.current.value).toBeNull()
      expect(localStorage.getItem('null-key')).toBe('null')
    })

    it('should handle undefined values', async () => {
      const { result } = renderHook(() => useStorage('undef-key', undefined))

      act(() => {
        result.current.setValue(undefined)
      })

      expect(result.current.value).toBeUndefined()
    })

    it('should handle empty strings', async () => {
      const { result } = renderHook(() => useStorage('empty-key', ''))

      act(() => {
        result.current.setValue('')
      })

      expect(result.current.value).toBe('')
      expect(localStorage.getItem('empty-key')).toBe('""')
    })

    it('should handle numbers', async () => {
      const { result } = renderHook(() => useStorage('num-key', 0))

      act(() => {
        result.current.setValue(42)
      })

      expect(result.current.value).toBe(42)
      expect(localStorage.getItem('num-key')).toBe('42')
    })

    it('should handle booleans', async () => {
      const { result } = renderHook(() => useStorage('bool-key', false))

      act(() => {
        result.current.setValue(true)
      })

      expect(result.current.value).toBe(true)
      expect(localStorage.getItem('bool-key')).toBe('true')
    })
  })

  describe('Error Handling', () => {
    it('should handle corrupted JSON gracefully', async () => {
      localStorage.setItem('corrupt-key', 'not-valid-json{')

      const { result } = renderHook(() => useStorage('corrupt-key', 'default'))

      await waitFor(() => {
        // Should fall back to parsing as string or default
        expect(result.current.value).toBeDefined()
      })
    })

    it('should handle localStorage quota exceeded', async () => {
      const mockSetItem = jest.spyOn(Storage.prototype, 'setItem')
      mockSetItem.mockImplementationOnce(() => {
        throw new Error('QuotaExceededError')
      })

      const { result } = renderHook(() => useStorage('quota-key', 'default'))

      act(() => {
        expect(() => {
          result.current.setValue('large-value')
        }).toThrow()
      })

      mockSetItem.mockRestore()
    })
  })

  describe('Sync Across Tabs', () => {
    it('should react to storage events from other tabs', async () => {
      const { result } = renderHook(() => useStorage('sync-key', 'initial'))

      expect(result.current.value).toBe('initial')

      // Simulate storage change from another tab
      act(() => {
        const event = new StorageEvent('storage', {
          key: 'sync-key',
          newValue: '"updated-from-other-tab"',
          oldValue: '"initial"',
        })
        window.dispatchEvent(event)
      })

      await waitFor(() => {
        expect(result.current.value).toBe('updated-from-other-tab')
      })
    })

    it('should ignore storage events for different keys', async () => {
      const { result } = renderHook(() => useStorage('my-key', 'initial'))

      act(() => {
        const event = new StorageEvent('storage', {
          key: 'other-key',
          newValue: '"value"',
        })
        window.dispatchEvent(event)
      })

      expect(result.current.value).toBe('initial')
    })
  })
})
