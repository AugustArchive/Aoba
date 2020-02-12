import RedisClient, { Redis } from 'ioredis';
import { Aoba, Logger } from '..';

enum Status {
  NotConnected = 'not.connected',
  Unhealthy = 'unhealthy',
  Healthy = 'healthy'
}
export default class RedisManager {
  /**
   * If the Redis server is connected
   */
  public connected: boolean;
  
  /**
   * The logger instance
   */
  private logger: Logger  
  
  /**
   * The current status of the Redis manager
   */
  private status: Status;

  /**
   * The redis client itself
   */
  public client: Redis;

  /**
   * The bot instance itself
   */
  public bot: Aoba;

  /**
   * Creates a new instance of the Redis manager
   * @param bot THe bot instance
   */
  constructor(bot: Aoba) {
    const config = bot.config.get('redis', {
      host: 'localhost',
      port: 6379,
      db: 5
    });

    this.connected = false;
    this.logger = new Logger();
    this.client = new RedisClient({
      lazyConnect: false,
      ...config
    });
    this.status = Status.NotConnected;
    this.bot = bot;
  }

  /**
   * If the connection is healthy to be used
   */
  get healthy() {
    return this.status === Status.Healthy;
  }

  /**
   * Disposes the connection
   */
  dispose() {
    this.connected = false;
    this.status = Status.NotConnected;

    this.client.disconnect();
    this.logger.warn('Redis connection was disposed');
  }

  /**
   * Connects to the Redis server
   */
  async connect() {
    if (this.connected) {
      this.logger.warn('Redis connection is already connected, why create a new pool?');
      return;
    }

    await this.client.connect();

    this.client.once('ready', () => {
      this.logger.info('Redis connection was established.');

      this.connected = true;
      this.status = Status.Healthy;
    });

    this.client.on('wait', () => {
      this.logger.warn('Redis connection is awaiting a new connection...');

      this.connected = false;
      this.status = Status.Unhealthy;
    });
  }

  /**
   * Gets a value from the Redis server
   * @param key The key to get
   */  
  get(key: string) {
    return this.client.get(key);
  }

  /**
   * Checker to check if the key is avaliable in the Redis server
   * @param key The key to fetch
   */
  async has(key: string) {
    return await this.get(key) !== null;
  }

  /**
   * Gets the length of values found from that key itself
   * @param key The key to get the length from
   */
  length(key: string) {
    let size = 0;
    this.client.llen(key, (error, value) => {
      if (error) this.logger.error(`Unable to fetch the key collection size for key ${key}:`, error);
      size += value;
    });

    return size;
  }

  /**
   * Sets a new value to a key
   * @param key The key to set the value to
   * @param value The value to set
   */
  add(key: string, value: string) {
    return this.client.set(key, value);
  }
}