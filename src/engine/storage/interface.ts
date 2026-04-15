/**
 * Storage Abstraction Interface
 * 
 * Defines the contract for storage implementations (localStorage, Supabase, memory).
 * Enables swappable storage backends without changing consuming code.
 */

/**
 * Callback function invoked when storage changes (multi-tab sync)
 */
export type StorageWatchCallback = (key: string, newValue: string | null, oldValue: string | null) => void

/**
 * Storage Adapter Interface
 * 
 * All implementations must support async operations for future cloud backends.
 */
export interface IStorageAdapter {
  /**
   * Get a value from storage
   * @param key Storage key
   * @returns Value if exists, null if not found
   */
  get(key: string): Promise<string | null>

  /**
   * Set a value in storage
   * @param key Storage key
   * @param value Value to store (serialized to string)
   */
  set(key: string, value: string): Promise<void>

  /**
   * Remove a value from storage
   * @param key Storage key
   */
  remove(key: string): Promise<void>

  /**
   * Clear all storage
   */
  clear(): Promise<void>

  /**
   * Get all storage keys
   */
  keys(): Promise<string[]>

  /**
   * Watch for storage changes (multi-tab sync support)
   * @param callback Invoked when any key changes
   * @returns Unsubscribe function
   */
  watch(callback: StorageWatchCallback): () => void
}

/**
 * Storage Configuration
 */
export interface StorageConfig {
  adapter: 'localStorage' | 'supabase' | 'memory'
  supabaseUrl?: string
  supabaseKey?: string
  profilePrefix?: string
}
