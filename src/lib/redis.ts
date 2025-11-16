import Redis from 'ioredis';

// Redis connection configuration
// Uses REDIS_URL from environment and database 3
const getRedisConnection = (): Redis => {
  const redisUrl = process.env.REDIS_URL;
  
  if (!redisUrl) {
    throw new Error('REDIS_URL environment variable is not set');
  }

  // Parse Redis URL and set database to 3
  const redis = new Redis(redisUrl, {
    db: 3,
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
  });

  return redis;
};

// Singleton Redis connection instance
let redisConnection: Redis | null = null;

export const getRedis = (): Redis => {
  if (!redisConnection) {
    redisConnection = getRedisConnection();
  }
  return redisConnection;
};

// Close Redis connection (useful for cleanup)
export const closeRedis = async (): Promise<void> => {
  if (redisConnection) {
    await redisConnection.quit();
    redisConnection = null;
  }
};


