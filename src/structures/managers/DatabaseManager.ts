import { MongoClient, Admin, Db } from 'mongodb';
import { Logger } from '..';

interface GuildModel {
  providers: {
    nintendo: {
      enabled: boolean;
      channelID: string;
    };
    youtube: {
      enabled: boolean;
      channelID: string;
      channels: string[];
    };
    twitch: {
      enabled: boolean;
      channelID: string;
      channels: string[];
    };
    mixer: {
      enabled: boolean;
      channelID: string;
      channels: string[];
    };
  };
  guildID: string;
  prefix: string;
}

interface UserModel {
  blacklisted: {
    enforcer: string;
    reason: string;
    time: number | false;
    is: boolean;
  }
  prefix: string;
  userID: string;
}

export default class DatabaseManager {
  /**
   * The logger instant
   */
  private logger: Logger;

  /**
   * The client (for connecting and disconnecting pools)
   */
  public client: MongoClient;

  /**
   * The admin instance
   */
  public admin!: Admin;

  /**
   * The database instance
   */
  public db!: Db;

  /**
   * Creates a new instance of the database manager
   * @param url The database URL
   */
  constructor(url: string) {
    this.logger = new Logger();
    this.client = new MongoClient(url, {
      useUnifiedTopology: true,
      useNewUrlParser: true
    });
  }

  /**
   * Connects to the database
   */
  async connect() {
    if (this.client.isConnected()) {
      this.logger.warn('Why are you making a new connection pool if there is one open?');
      return;
    }

    await this.client.connect();
    this.db = this.client.db('Aoba');
    this.admin = this.db.admin();

    this.logger.database('Connected to the database with a new connection pool instanitated');
  }

  /**
   * Disposes the connection pool
   */
  async dispose() {
    if (!this.client.isConnected()) {
      this.logger.warn('Why are you dispoing a dead connection pool?');
      return;
    }

    await this.client.close();
    this.logger.warn('Database connection pool has been disposed');
  }

  /**
   * Gets a guild's settings
   */
}