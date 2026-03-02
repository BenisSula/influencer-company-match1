import { Injectable, Logger } from '@nestjs/common';
import { createClient, RedisClientType } from 'redis';

@Injectable()
export class CacheService {
  private client: RedisClientType | null = null;
  private readonly logger = new Logger(CacheService.name);
  private isConnected = false;

  constructor() {
    this.initializeRedis();
  }

  private async initializeRedis() {
    // Only attempt Redis connection if explicitly enabled
    const redisEnabled = process.env.REDIS_ENABLED === 'true';
    
    if (!redisEnabled) {
      this.logger.warn('Redis is disabled. Caching features will use in-memory fallback.');
      return;
    }

    try {
      this.client = createClient({
        url: `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`,
        password: process.env.REDIS_PASSWORD || undefined,
        socket: {
          connectTimeout: 5000,
          reconnectStrategy: (retries) => {
            if (retries > 3) {
              this.logger.error('Redis connection failed after 3 retries. Falling back to no cache.');
              return false; // Stop retrying
            }
            return Math.min(retries * 100, 3000);
          },
        },
      });

      this.client.on('error', (err) => {
        this.logger.error('Redis Client Error:', err.message);
        this.isConnected = false;
      });

      this.client.on('connect', () => {
        this.logger.log('Redis client connected successfully');
        this.isConnected = true;
      });

      this.client.on('ready', () => {
        this.logger.log('Redis client ready');
      });

      this.client.on('end', () => {
        this.logger.warn('Redis client connection ended');
        this.isConnected = false;
      });

      await this.client.connect();
    } catch (error) {
      this.logger.error('Failed to initialize Redis:', error.message);
      this.logger.warn('Continuing without Redis caching');
      this.client = null;
      this.isConnected = false;
    }
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.isConnected || !this.client) {
      return null; // Graceful fallback - no cache
    }

    try {
      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      this.logger.error(`Cache get error for key ${key}:`, error.message);
      return null;
    }
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    if (!this.isConnected || !this.client) {
      return; // Graceful fallback - no cache
    }

    try {
      const serialized = JSON.stringify(value);
      if (ttl) {
        await this.client.setEx(key, ttl, serialized);
      } else {
        await this.client.set(key, serialized);
      }
    } catch (error) {
      this.logger.error(`Cache set error for key ${key}:`, error.message);
    }
  }

  async del(key: string): Promise<void> {
    if (!this.isConnected || !this.client) {
      return; // Graceful fallback - no cache
    }

    try {
      await this.client.del(key);
    } catch (error) {
      this.logger.error(`Cache delete error for key ${key}:`, error.message);
    }
  }

  async flush(): Promise<void> {
    if (!this.isConnected || !this.client) {
      return; // Graceful fallback - no cache
    }

    try {
      await this.client.flushAll();
    } catch (error) {
      this.logger.error('Cache flush error:', error.message);
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      try {
        await this.client.quit();
      } catch (error) {
        this.logger.error('Error disconnecting Redis:', error.message);
      }
    }
  }

  isRedisAvailable(): boolean {
    return this.isConnected;
  }
}
