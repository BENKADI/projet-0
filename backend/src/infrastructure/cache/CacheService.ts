import Redis from 'ioredis';

export interface CacheOptions {
  ttl?: number;
  tags?: string[];
}

export interface CacheStats {
  hits: number;
  misses: number;
  hitRate: number;
  totalKeys: number;
  memoryUsage: number;
}

export class CacheService {
  private redis: Redis;
  private stats = {
    hits: 0,
    misses: 0,
  };

  constructor(redisUrl?: string) {
    this.redis = new Redis(redisUrl || process.env.REDIS_URL || 'redis://localhost:6379', {
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    });

    // Handle Redis errors
    this.redis.on('error', (error) => {
      console.error('Redis connection error:', error);
    });

    this.redis.on('connect', () => {
      console.log('Redis connected successfully');
    });
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.redis.get(key);
      
      if (value === null) {
        this.stats.misses++;
        return null;
      }

      this.stats.hits++;
      return JSON.parse(value) as T;
    } catch (error) {
      console.error(`Cache get error for key ${key}:`, error);
      this.stats.misses++;
      return null;
    }
  }

  async set(key: string, value: any, ttl: number = 3600): Promise<void> {
    try {
      const serializedValue = JSON.stringify(value);
      
      if (ttl > 0) {
        await this.redis.setex(key, ttl, serializedValue);
      } else {
        await this.redis.set(key, serializedValue);
      }
    } catch (error) {
      console.error(`Cache set error for key ${key}:`, error);
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.redis.del(key);
    } catch (error) {
      console.error(`Cache delete error for key ${key}:`, error);
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.redis.exists(key);
      return result === 1;
    } catch (error) {
      console.error(`Cache exists error for key ${key}:`, error);
      return false;
    }
  }

  async invalidate(pattern: string): Promise<void> {
    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
    } catch (error) {
      console.error(`Cache invalidate error for pattern ${pattern}:`, error);
    }
  }

  async invalidateByTags(tags: string[]): Promise<void> {
    try {
      for (const tag of tags) {
        const pattern = `tag:${tag}:*`;
        await this.invalidate(pattern);
      }
    } catch (error) {
      console.error(`Cache invalidate by tags error:`, error);
    }
  }

  async setWithTags(key: string, value: any, ttl: number = 3600, tags: string[] = []): Promise<void> {
    try {
      // Set the main value
      await this.set(key, value, ttl);

      // Set tag references
      for (const tag of tags) {
        const tagKey = `tag:${tag}:${key}`;
        await this.redis.setex(tagKey, ttl, '1');
      }
    } catch (error) {
      console.error(`Cache set with tags error for key ${key}:`, error);
    }
  }

  async increment(key: string, amount: number = 1): Promise<number> {
    try {
      return await this.redis.incrby(key, amount);
    } catch (error) {
      console.error(`Cache increment error for key ${key}:`, error);
      return 0;
    }
  }

  async decrement(key: string, amount: number = 1): Promise<number> {
    try {
      return await this.redis.decrby(key, amount);
    } catch (error) {
      console.error(`Cache decrement error for key ${key}:`, error);
      return 0;
    }
  }

  async getMultiple<T>(keys: string[]): Promise<(T | null)[]> {
    try {
      const values = await this.redis.mget(...keys);
      
      return values.map(value => {
        if (value === null) {
          this.stats.misses++;
          return null;
        }
        
        this.stats.hits++;
        return JSON.parse(value) as T;
      });
    } catch (error) {
      console.error(`Cache get multiple error:`, error);
      return keys.map(() => null);
    }
  }

  async setMultiple(entries: Array<{ key: string; value: any; ttl?: number }>): Promise<void> {
    try {
      const pipeline = this.redis.pipeline();
      
      for (const entry of entries) {
        const serializedValue = JSON.stringify(entry.value);
        
        if (entry.ttl && entry.ttl > 0) {
          pipeline.setex(entry.key, entry.ttl, serializedValue);
        } else {
          pipeline.set(entry.key, serializedValue);
        }
      }
      
      await pipeline.exec();
    } catch (error) {
      console.error(`Cache set multiple error:`, error);
    }
  }

  async getTTL(key: string): Promise<number> {
    try {
      return await this.redis.ttl(key);
    } catch (error) {
      console.error(`Cache TTL error for key ${key}:`, error);
      return -1;
    }
  }

  async expire(key: string, ttl: number): Promise<boolean> {
    try {
      const result = await this.redis.expire(key, ttl);
      return result === 1;
    } catch (error) {
      console.error(`Cache expire error for key ${key}:`, error);
      return false;
    }
  }

  async getKeys(pattern: string = '*'): Promise<string[]> {
    try {
      return await this.redis.keys(pattern);
    } catch (error) {
      console.error(`Cache get keys error for pattern ${pattern}:`, error);
      return [];
    }
  }

  async flushAll(): Promise<void> {
    try {
      await this.redis.flushall();
    } catch (error) {
      console.error('Cache flush all error:', error);
    }
  }

  async getStats(): Promise<CacheStats> {
    try {
      const info = await this.redis.info('memory');
      const memoryUsage = this.parseMemoryUsage(info);
      const totalKeys = await this.redis.dbsize();
      
      const totalRequests = this.stats.hits + this.stats.misses;
      const hitRate = totalRequests > 0 ? (this.stats.hits / totalRequests) * 100 : 0;

      return {
        hits: this.stats.hits,
        misses: this.stats.misses,
        hitRate: Math.round(hitRate * 100) / 100,
        totalKeys,
        memoryUsage,
      };
    } catch (error) {
      console.error('Cache get stats error:', error);
      return {
        hits: this.stats.hits,
        misses: this.stats.misses,
        hitRate: 0,
        totalKeys: 0,
        memoryUsage: 0,
      };
    }
  }

  private parseMemoryUsage(info: string): number {
    const match = info.match(/used_memory:(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  }

  async healthCheck(): Promise<{ status: 'healthy' | 'unhealthy'; latency?: number; error?: string }> {
    try {
      const start = Date.now();
      await this.redis.ping();
      const latency = Date.now() - start;

      return {
        status: 'healthy',
        latency,
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
      };
    }
  }

  // Advanced caching patterns

  async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl: number = 3600,
    options: CacheOptions = {}
  ): Promise<T> {
    // Try to get from cache first
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // Fetch fresh data
    const data = await fetcher();

    // Cache the data
    if (options.tags && options.tags.length > 0) {
      await this.setWithTags(key, data, ttl, options.tags);
    } else {
      await this.set(key, data, ttl);
    }

    return data;
  }

  async getOrSetMultiple<T>(
    keys: string[],
    fetcher: (missingKeys: string[]) => Promise<Map<string, T>>,
    ttl: number = 3600,
    options: CacheOptions = {}
  ): Promise<Map<string, T>> {
    // Get cached values
    const cachedValues = await this.getMultiple<T>(keys);
    
    // Identify missing keys
    const missingKeys: string[] = [];
    const result = new Map<string, T>();

    keys.forEach((key, index) => {
      const value = cachedValues[index];
      if (value !== null) {
        result.set(key, value);
      } else {
        missingKeys.push(key);
      }
    });

    // Fetch missing values
    if (missingKeys.length > 0) {
      const freshValues = await fetcher(missingKeys);
      
      // Cache fresh values
      const entriesToCache: Array<{ key: string; value: T; ttl?: number }> = [];
      
      freshValues.forEach((value, key) => {
        result.set(key, value);
        entriesToCache.push({ key, value, ttl });
      });

      if (entriesToCache.length > 0) {
        await this.setMultiple(entriesToCache);
      }
    }

    return result;
  }

  // Cache warming
  async warmCache(entries: Array<{ key: string; fetcher: () => Promise<any>; ttl?: number }>): Promise<void> {
    const promises = entries.map(async ({ key, fetcher, ttl = 3600 }) => {
      try {
        const data = await fetcher();
        await this.set(key, data, ttl);
      } catch (error) {
        console.error(`Cache warming error for key ${key}:`, error);
      }
    });

    await Promise.all(promises);
  }

  // Cache invalidation strategies
  async invalidatePattern(pattern: string): Promise<number> {
    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
      return keys.length;
    } catch (error) {
      console.error(`Cache invalidate pattern error:`, error);
      return 0;
    }
  }

  async invalidatePrefix(prefix: string): Promise<number> {
    return this.invalidatePattern(`${prefix}*`);
  }

  async invalidateSuffix(suffix: string): Promise<number> {
    return this.invalidatePattern(`*${suffix}`);
  }

  // Distributed cache locking
  async acquireLock(key: string, ttl: number = 30): Promise<string | null> {
    try {
      const lockKey = `lock:${key}`;
      const lockValue = `${Date.now()}-${Math.random()}`;
      
      const result = await this.redis.set(lockKey, lockValue, 'PX', ttl * 1000, 'NX');
      return result === 'OK' ? lockValue : null;
    } catch (error) {
      console.error(`Cache acquire lock error for key ${key}:`, error);
      return null;
    }
  }

  async releaseLock(key: string, lockValue: string): Promise<boolean> {
    try {
      const lockKey = `lock:${key}`;
      
      const script = `
        if redis.call("get", KEYS[1]) == ARGV[1] then
          return redis.call("del", KEYS[1])
        else
          return 0
        end
      `;
      
      const result = await this.redis.eval(script, 1, lockKey, lockValue);
      return result === 1;
    } catch (error) {
      console.error(`Cache release lock error for key ${key}:`, error);
      return false;
    }
  }

  // Cleanup and maintenance
  async cleanup(): Promise<void> {
    try {
      // Remove expired keys (Redis does this automatically, but we can force cleanup)
      const info = await this.redis.info('keyspace');
      console.log('Cache cleanup completed. Current keyspace info:', info);
    } catch (error) {
      console.error('Cache cleanup error:', error);
    }
  }

  async disconnect(): Promise<void> {
    try {
      await this.redis.disconnect();
    } catch (error) {
      console.error('Cache disconnect error:', error);
    }
  }
}
