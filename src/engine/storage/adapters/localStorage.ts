/**
 * LocalStorage Adapter Implementation
 * 
 * Phase 1 storage backend using browser's localStorage API.
 * Fully synchronous underneath but wrapped in Promises for compatibility
 * with future async adapters (e.g., Supabase).
 */

import { IStorageAdapter, StorageWatchCallback } from '../interface'

export class LocalStorageAdapter implements IStorageAdapter {
  private watchers: Map<StorageWatchCallback, (event: StorageEvent) => void> = new Map()

  async get(key: string): Promise<string | null> {
    return localStorage.getItem(key)
  }

  async set(key: string, value: string): Promise<void> {
    localStorage.setItem(key, value)
  }

  async remove(key: string): Promise<void> {
    localStorage.removeItem(key)
  }

  async clear(): Promise<void> {
    localStorage.clear()
  }

  async keys(): Promise<string[]> {
    const keys: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key !== null) {
        keys.push(key)
      }
    }
    return keys
  }

  watch(callback: StorageWatchCallback): () => void {
    // Create an event listener that adapts StorageEvent to our callback
    const eventListener = (event: StorageEvent) => {
      if (event.key !== null) {
        callback(event.key, event.newValue, event.oldValue)
      }
    }

    // Store the listener so we can remove it later
    this.watchers.set(callback, eventListener)

    // Listen to storage events (fired when localStorage changes in other tabs)
    window.addEventListener('storage', eventListener)

    // Return unsubscribe function
    return () => {
      this.watchers.delete(callback)
      window.removeEventListener('storage', eventListener)
    }
  }
}
