/**
 * Schema & Type Definitions Tests
 */

import {
  buildTaskKey,
  buildLayoutKey,
  buildOrderKey,
  buildUpdatedKey,
  extractProfileFromTaskKey,
  extractTaskSlugFromKey,
  TIMEFRAMES,
  STORAGE_KEYS,
} from '@engine/schema/types'

describe('Schema & Type Utilities', () => {
  describe('buildTaskKey', () => {
    it('should build valid task key for profile and task slug', () => {
      const key = buildTaskKey('default', 'herb-run')
      expect(key).toBe('rs3-profile-default.herb-run')
    })

    it('should handle special characters in task slugs', () => {
      const key = buildTaskKey('default', 'birdhouse-run')
      expect(key).toBe('rs3-profile-default.birdhouse-run')
    })

    it('should handle alternative profile names', () => {
      const key = buildTaskKey('alt1', 'daily-chest')
      expect(key).toBe('rs3-profile-alt1.daily-chest')
    })
  })

  describe('buildLayoutKey', () => {
    it('should build valid layout key', () => {
      const key = buildLayoutKey('default', TIMEFRAMES.DAILY, 'normal')
      expect(key).toBe('rs3-profile-default.rs3daily-layout-normal')
    })

    it('should handle compact layout mode', () => {
      const key = buildLayoutKey('default', TIMEFRAMES.DAILY, 'compact')
      expect(key).toBe('rs3-profile-default.rs3daily-layout-compact')
    })

    it('should handle all timeframes', () => {
      expect(buildLayoutKey('default', TIMEFRAMES.WEEKLY, 'normal')).toBe(
        'rs3-profile-default.rs3weekly-layout-normal'
      )
      expect(buildLayoutKey('default', TIMEFRAMES.MONTHLY, 'normal')).toBe(
        'rs3-profile-default.rs3monthly-layout-normal'
      )
      expect(buildLayoutKey('default', TIMEFRAMES.DAILY_SHOPS, 'normal')).toBe(
        'rs3-profile-default.rs3dailyshops-layout-normal'
      )
    })
  })

  describe('buildOrderKey', () => {
    it('should build valid sort order key', () => {
      const key = buildOrderKey('default', TIMEFRAMES.DAILY)
      expect(key).toBe('rs3-profile-default.rs3daily-order')
    })

    it('should handle different profiles', () => {
      expect(buildOrderKey('alt2', TIMEFRAMES.WEEKLY)).toBe('rs3-profile-alt2.rs3weekly-order')
    })
  })

  describe('buildUpdatedKey', () => {
    it('should build valid updated timestamp key', () => {
      const key = buildUpdatedKey('default', TIMEFRAMES.DAILY)
      expect(key).toBe('rs3-profile-default.rs3daily-updated')
    })

    it('should handle all profiles', () => {
      expect(buildUpdatedKey('alt1', TIMEFRAMES.MONTHLY)).toBe(
        'rs3-profile-alt1.rs3monthly-updated'
      )
    })
  })

  describe('extractProfileFromTaskKey', () => {
    it('should extract profile name from valid task key', () => {
      const profile = extractProfileFromTaskKey('rs3-profile-default.herb-run')
      expect(profile).toBe('default')
    })

    it('should handle alternative profiles', () => {
      const profile = extractProfileFromTaskKey('rs3-profile-alt1.daily-chest')
      expect(profile).toBe('alt1')
    })

    it('should throw for invalid key format', () => {
      expect(() => extractProfileFromTaskKey('invalid-key')).toThrow()
    })

    it('should throw for key without dot separator', () => {
      expect(() => extractProfileFromTaskKey('rs3-profile-default')).toThrow()
    })
  })

  describe('extractTaskSlugFromKey', () => {
    it('should extract task slug from valid task key', () => {
      const slug = extractTaskSlugFromKey('rs3-profile-default.herb-run')
      expect(slug).toBe('herb-run')
    })

    it('should handle slugs with multiple hyphens', () => {
      const slug = extractTaskSlugFromKey('rs3-profile-default.birdhouse-run-morning')
      expect(slug).toBe('birdhouse-run-morning')
    })

    it('should throw for invalid key format', () => {
      expect(() => extractTaskSlugFromKey('not-a-task-key')).toThrow()
    })
  })

  describe('Round-trip extraction', () => {
    it('should round-trip profile and slug extraction', () => {
      const originalProfile = 'alt2'
      const originalSlug = 'daily-battle-front'
      const key = buildTaskKey(originalProfile, originalSlug)

      const extractedProfile = extractProfileFromTaskKey(key)
      const extractedSlug = extractTaskSlugFromKey(key)

      expect(extractedProfile).toBe(originalProfile)
      expect(extractedSlug).toBe(originalSlug)
    })
  })

  describe('Constants', () => {
    it('should have all timeframe constants defined', () => {
      expect(TIMEFRAMES.DAILY).toBeDefined()
      expect(TIMEFRAMES.DAILY_SHOPS).toBeDefined()
      expect(TIMEFRAMES.WEEKLY).toBeDefined()
      expect(TIMEFRAMES.WEEKLY_SHOPS).toBeDefined()
      expect(TIMEFRAMES.MONTHLY).toBeDefined()
    })

    it('should have correct timeframe values', () => {
      expect(TIMEFRAMES.DAILY).toBe('rs3daily')
      expect(TIMEFRAMES.WEEKLY).toBe('rs3weekly')
      expect(TIMEFRAMES.MONTHLY).toBe('rs3monthly')
    })

    it('should have storage key constants defined', () => {
      expect(STORAGE_KEYS.PROFILE_PREFIX).toBe('rs3-profile-')
      expect(STORAGE_KEYS.CURRENT_PROFILE).toBe('current-profile')
      expect(STORAGE_KEYS.PROFILES_LIST).toBe('profiles')
    })
  })
})
