/**
 * LocalStorageAdapter Tests
 * 
 * RED Phase: Write tests that fail first, then implement
 */

import { LocalStorageAdapter } from '../../src/engine/storage/adapters/localStorage'
import { IStorageAdapter } from '../../src/engine/storage/interface'

describe('LocalStorageAdapter', () => {
  let adapter: IStorageAdapter
  let store: Record<string, string>

  beforeEach(() => {
    // Mock localStorage
    store = {}
    global.localStorage = {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, value: string) => {
        store[key] = value
      },
      removeItem: (key: string) => {
        delete store[key]
      },
      clear: () => {
        store = {}
      },
      key: (index: number) => Object.keys(store)[index] || null,
      length: Object.keys(store).length,
    } as any

    adapter = new LocalStorageAdapter()
  })

  describe('get', () => {
    test('returns null when key does not exist', async () => {
      const result = await adapter.get('nonexistent')
      expect(result).toBeNull()
    })

    test('returns stored value when key exists', async () => {
      localStorage.setItem('test-key', 'test-value')
      const result = await adapter.get('test-key')
      expect(result).toBe('test-value')
    })
  })

  describe('set', () => {
    test('stores a value', async () => {
      await adapter.set('key1', 'value1')
      expect(localStorage.getItem('key1')).toBe('value1')
    })

    test('overwrites existing value', async () => {
      await adapter.set('key1', 'value1')
      await adapter.set('key1', 'value2')
      expect(localStorage.getItem('key1')).toBe('value2')
    })
  })

  describe('remove', () => {
    test('removes a key', async () => {
      localStorage.setItem('key1', 'value1')
      await adapter.remove('key1')
      expect(localStorage.getItem('key1')).toBeNull()
    })

    test('does not throw when key does not exist', async () => {
      await expect(adapter.remove('nonexistent')).resolves.toBeUndefined()
    })
  })

  describe('clear', () => {
    test('removes all keys', async () => {
      localStorage.setItem('key1', 'value1')
      localStorage.setItem('key2', 'value2')
      await adapter.clear()
      expect(localStorage.getItem('key1')).toBeNull()
      expect(localStorage.getItem('key2')).toBeNull()
    })
  })

  describe('keys', () => {
    test('returns empty array when no keys exist', async () => {
      const result = await adapter.keys()
      expect(result).toEqual([])
    })

    test('returns all keys', async () => {
      localStorage.setItem('key1', 'value1')
      localStorage.setItem('key2', 'value2')
      const result = await adapter.keys()
      expect(result).toEqual(expect.arrayContaining(['key1', 'key2']))
    })
  })

  describe('watch', () => {
    test('calls callback when value changes', async () => {
      const callback = jest.fn()
      adapter.watch(callback)

      localStorage.setItem('key1', 'value1')
      
      // Simulate storage event
      const event = new StorageEvent('storage', {
        key: 'key1',
        newValue: 'value1',
        oldValue: null,
      })
      window.dispatchEvent(event)

      // In real implementation, callback should be called
      expect(callback).toHaveBeenCalled()
    })

    test('returns unsubscribe function', async () => {
      const callback = jest.fn()
      const unsubscribe = adapter.watch(callback)
      
      expect(typeof unsubscribe).toBe('function')
      
      unsubscribe()
      localStorage.setItem('key1', 'value1')
      
      // Callback should not be called after unsubscribe
      const event = new StorageEvent('storage', {
        key: 'key1',
        newValue: 'value1',
        oldValue: null,
      })
      window.dispatchEvent(event)
    })
  })
})
