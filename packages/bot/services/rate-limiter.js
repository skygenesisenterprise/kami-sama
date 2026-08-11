import { env } from "../config/env.js";
import { RateLimitError } from "./errors.js";

/**
 * Fixed-window rate limiter keyed by an arbitrary string (user, guild,
 * command, endpoint). Commands use it through the central handler; autocomplete
 * and pagination components can pass stricter limits.
 */
export class RateLimiter {
  constructor({ windowMs = env.rateLimitWindowMs, max = env.rateLimitMax } = {}) {
    this.windowMs = windowMs;
    this.max = max;
    this.buckets = new Map();
  }

  _windowStart(now) {
    return now - (now % this.windowMs);
  }

  /**
   * @returns {{ allowed: boolean, remaining: number, retryAfterMs: number }}
   */
  consume(key, weight = 1) {
    const now = Date.now();
    const windowStart = this._windowStart(now);
    const bucket = this.buckets.get(key) ?? { windowStart: 0, count: 0 };

    if (bucket.windowStart !== windowStart) {
      bucket.windowStart = windowStart;
      bucket.count = 0;
    }

    bucket.count += weight;
    this.buckets.set(key, bucket);

    const retryAfterMs = this.windowMs - (now - windowStart);
    const allowed = bucket.count <= this.max;

    if (this.buckets.size > 10_000) {
      for (const [staleKey, stale] of this.buckets) {
        if (stale.windowStart !== this._windowStart(Date.now())) {
          this.buckets.delete(staleKey);
        }
      }
    }

    return { allowed, remaining: Math.max(0, this.max - bucket.count), retryAfterMs };
  }

  assert(key, weight = 1) {
    const result = this.consume(key, weight);
    if (!result.allowed) {
      throw new RateLimitError(result.retryAfterMs);
    }
    return result;
  }

  /** Convenience key builders. */
  static keyFor(interaction, suffix = "") {
    const user = interaction.user?.id ?? "unknown";
    const guild = interaction.guildId ?? "dm";
    return `${guild}:${user}:${suffix}`;
  }
}

export const rateLimiter = new RateLimiter();

/** Per-command rate limiters (e.g. cheaper limits for autocomplete). */
export const commandRateLimiter = new RateLimiter({
  windowMs: env.rateLimitWindowMs,
  max: env.rateLimitMax,
});

export const autocompleteRateLimiter = new RateLimiter({ windowMs: 10_000, max: 20 });
