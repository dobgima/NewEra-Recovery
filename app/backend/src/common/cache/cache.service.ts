import Redis from 'ioredis';
import { env } from '../config/env';
import { logger } from '../logger/logger';

const MAX_RETRIES = 5;
const INITIAL_RETRY_DELAY = 100; // ms
const MAX_RETRY_DELAY = 5000; // ms

export class CacheService {
  private client: Redis | null = null;
  private isConnected: boolean = false;
  private isEnabled: boolean;

  constructor() {
    this.isEnabled = env.redisEnabled;

    if (!this.isEnabled) {
      logger.info('Redis caching is disabled (REDIS_ENABLED=false)');
      return;
    }

    this.client = new Redis(env.redisUrl, {
      maxRetriesPerRequest: 3,
      lazyConnect: true,
      enableReadyCheck: true,
      enableOfflineQueue: false,
      retryStrategy: (times: number) => {
        // Stop retrying after MAX_RETRIES attempts
        if (times > MAX_RETRIES) {
          logger.warn(`Redis: Stopped retrying after ${MAX_RETRIES} attempts`);
          return null; // Stop retrying
        }

        // Exponential backoff with jitter
        const delay = Math.min(INITIAL_RETRY_DELAY * Math.pow(1.5, times), MAX_RETRY_DELAY);
        const jitter = Math.random() * delay * 0.1; // 10% jitter
        const finalDelay = Math.floor(delay + jitter);

        logger.warn(`Redis: Retry attempt ${times}, waiting ${finalDelay}ms before reconnect`);
        return finalDelay;
      },
    });

    this.client.on('connect', () => {
      this.isConnected = true;
      logger.info('✓ Redis cache connected successfully');
    });

    this.client.on('error', (error) => {
      this.isConnected = false;
      // Don't spam logs with repeated connection errors
      if (error.message.includes('ECONNREFUSED') || error.message.includes('connect')) {
        logger.debug({ error: error.message }, 'Redis connection error (expected if Redis is not running)');
      } else {
        logger.error({ error }, 'Redis cache error');
      }
    });

    this.client.on('close', () => {
      this.isConnected = false;
      logger.warn('Redis cache connection closed');
    });

    this.client.on('reconnecting', () => {
      logger.debug('Redis: Attempting to reconnect...');
    });
  }

  async connect(): Promise<void> {
    if (!this.isEnabled) {
      logger.info('Redis cache disabled - skipping connection attempt');
      return;
    }

    if (!this.client) {
      logger.warn('Redis client is not initialized');
      return;
    }

    if (this.isConnected) {
      return;
    }

    if (process.env.NODE_ENV === 'test') {
      return;
    }

    try {
      await this.client.connect();
      // Give it a moment to fully establish
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      // Redis is optional - log error but don't fail startup
      logger.warn(
        { error: error instanceof Error ? error.message : String(error) },
        'Failed to connect to Redis cache, continuing without cache'
      );
      this.isConnected = false;
    }
  }

  async disconnect(): Promise<void> {
    if (!this.client || !this.isConnected) {
      return;
    }

    try {
      await this.client.quit();
      this.isConnected = false;
    } catch (error) {
      logger.error({ error }, 'Error disconnecting from Redis');
    }
  }

  /**
   * Check if cache is currently connected and healthy
   */
  isHealthy(): boolean {
    return this.isEnabled && this.isConnected;
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.isEnabled || !this.client) {
      return null;
    }

    try {
      const data = await this.client.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      logger.debug({ error, key }, 'Cache get error - returning null');
      return null;
    }
  }

  async set(key: string, value: any, ttlSeconds?: number): Promise<void> {
    if (!this.isEnabled || !this.client) {
      return;
    }

    try {
      const serializedValue = JSON.stringify(value);
      const ttl = ttlSeconds ?? env.redisCacheTtl;

      await this.client.setex(key, ttl, serializedValue);
    } catch (error) {
      logger.debug({ error, key }, 'Cache set error - continuing without caching');
    }
  }

  async delete(key: string): Promise<void> {
    if (!this.isEnabled || !this.client) {
      return;
    }

    try {
      await this.client.del(key);
    } catch (error) {
      logger.debug({ error, key }, 'Cache delete error');
    }
  }

  async deletePattern(pattern: string): Promise<void> {
    if (!this.isEnabled || !this.client) {
      return;
    }

    try {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(...keys);
      }
    } catch (error) {
      logger.debug({ error, pattern }, 'Cache delete pattern error');
    }
  }

  async exists(key: string): Promise<boolean> {
    if (!this.isEnabled || !this.client) {
      return false;
    }

    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      logger.debug({ error, key }, 'Cache exists error');
      return false;
    }
  }

  // Cache key generators
  static dailyFeedKey(date: string): string {
    return `daily_feed:${date}`;
  }

  static userPreferencesKey(userId: string): string {
    return `user_preferences:${userId}`;
  }

  static availablePeersKey(): string {
    return 'available_peers';
  }

  static userProfileKey(userId: string): string {
    return `user_profile:${userId}`;
  }

  static riskAssessmentKey(userId: string, date: string): string {
    return `risk_assessment:${userId}:${date}`;
  }
}

// Singleton instance
export const cacheService = new CacheService();