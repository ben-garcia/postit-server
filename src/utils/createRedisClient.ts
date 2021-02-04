import Redis from 'ioredis';

export const createRedisClient = () => {
  let redisClient: Redis.Redis;

  if (process.env.REDIS_URL && process.env.NODE_ENV === 'production') {
    redisClient = new Redis(process.env.REDIS_URL);
  } else {
    // use localhost in development
    redisClient = new Redis({ password: process.env.REDIS_PASSWORD });
  }

  return redisClient;
};
