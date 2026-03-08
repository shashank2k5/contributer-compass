import Redis from "ioredis";

// Global cache object for memory fallback
const memoryCache = new Map<string, { value: string; expiresAt: number }>();

class CacheService {
    private redis: Redis | null = null;
    private isConnected = false;

    constructor() {
        if (process.env.REDIS_URL) {
            try {
                this.redis = new Redis(process.env.REDIS_URL, {
                    maxRetriesPerRequest: 1,
                    retryStrategy(times) {
                        // Don't retry more than 3 times
                        if (times > 3) {
                            return null;
                        }
                        return Math.min(times * 50, 2000);
                    },
                });

                this.redis.on("connect", () => {
                    this.isConnected = true;
                    console.log("Connected to Redis");
                });

                this.redis.on("error", (err) => {
                    this.isConnected = false;
                    console.warn("Redis connection error, falling back to memory cache:", err.message);
                });
            } catch (error) {
                console.warn("Failed to initialize Redis, falling back to memory cache");
            }
        } else {
            console.warn("REDIS_URL not set, using memory cache");
        }
    }

    async get(key: string): Promise<string | null> {
        if (this.redis && this.isConnected) {
            try {
                return await this.redis.get(key);
            } catch (error) {
                console.warn(`Redis get error for key ${key}, falling back to memory cache`);
            }
        }

        // Fallback to memory cache
        const cached = memoryCache.get(key);
        if (cached) {
            // Check if expired
            if (Date.now() > cached.expiresAt) {
                memoryCache.delete(key);
                return null;
            }
            return cached.value;
        }

        return null;
    }

    async set(key: string, value: string, expireSeconds: number): Promise<void> {
        if (this.redis && this.isConnected) {
            try {
                await this.redis.set(key, value, "EX", expireSeconds);
                return;
            } catch (error) {
                console.warn(`Redis set error for key ${key}, falling back to memory cache`);
            }
        }

        // Fallback to memory cache
        memoryCache.set(key, {
            value,
            expiresAt: Date.now() + expireSeconds * 1000,
        });
    }
}

// Create a singleton instance
export const cache = new CacheService();
