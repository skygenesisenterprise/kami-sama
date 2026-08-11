import { env } from "../config/env.js";
import { logger } from "./logger.js";

/**
 * Minimal async cache interface. Commands only depend on this abstraction so
 * the backend (memory / Redis) can be swapped without touching commands.
 *
 * @typedef {Object} CacheBackend
 * @property {(key: string) => Promise<*>} get
 * @property {(key: string, value: *, ttlMs?: number) => Promise<void>} set
 * @property {(key: string) => Promise<void>} del
 */

class MemoryBackend {
  constructor() {
    this.store = new Map();
  }

  async get(key) {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (entry.expiresAt !== null && entry.expiresAt <= Date.now()) {
      this.store.delete(key);
      return undefined;
    }
    return entry.value;
  }

  async set(key, value, ttlMs = 0) {
    this.store.set(key, {
      value,
      expiresAt: ttlMs > 0 ? Date.now() + ttlMs : null,
    });
  }

  async del(key) {
    this.store.delete(key);
  }

  async clear() {
    this.store.clear();
  }
}

export function createCache(backend = null) {
  const memory = new MemoryBackend();
  const active = backend ?? memory;
  const enabled = env.cacheEnabled;

  return {
    async get(key) {
      if (!enabled) return undefined;
      try {
        return await active.get(key);
      } catch (error) {
        logger.warn(`cache.get failed for ${key}`, { error: error.message });
        return undefined;
      }
    },

    async set(key, value, ttlMs = env.cacheTtlSeconds * 1000) {
      if (!enabled) return;
      try {
        await active.set(key, value, ttlMs);
      } catch (error) {
        logger.warn(`cache.set failed for ${key}`, { error: error.message });
      }
    },

    async del(key) {
      try {
        await active.del(key);
      } catch (error) {
        logger.warn(`cache.del failed for ${key}`, { error: error.message });
      }
    },

    /**
     * Run `producer` and cache its result for `ttlMs`. Cache misses, hits and
     * producer failures are all handled without crashing.
     */
    async remember(key, producer, ttlMs = env.cacheTtlSeconds * 1000) {
      const cached = await this.get(key);
      if (cached !== undefined) return cached;

      const value = await producer();
      if (value !== undefined && value !== null) {
        await this.set(key, value, ttlMs);
      }
      return value;
    },

    async clear() {
      await memory.clear();
    },
  };
}

export const cache = createCache();
