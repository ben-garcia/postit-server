import { Redis } from 'ioredis';
import { Inject, Service } from 'typedi';

/**
 * Service interats with Redis.
 */
@Service()
class RedisService {
  private redisClient: Redis;

  /**
   * Contructor injection via typedi's Inject decorator
   *
   * redis is the name of the service, which is used
   * when setting it's value by calling Container.set.
   */
  constructor(@Inject('redisClient') redisClient: Redis) {
    this.redisClient = redisClient;
  }

  /*
   * Remove a key.
   */
  remove(key: string): Promise<number> {
    return this.redisClient.del(key);
  }

  /**
   * Store a new key for a certain amount of time.
   */
  add(key: string, expiresIn: number, data: any): Promise<'OK'> {
    return this.redisClient.setex(key, expiresIn, JSON.stringify(data));
  }
}

export default RedisService;
