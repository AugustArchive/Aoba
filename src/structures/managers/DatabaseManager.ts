import { MongoClient, Admin, Db } from 'mongodb';
import { Aoba, Logger } from '..';

interface GuildModel {
  providers: {
    nintendo: {
      enabled: boolean;
      channelID: string | null;
    };
    youtube: {
      enabled: boolean;
      channelID: string | null;
      channels: string[];
    };
    twitch: {
      enabled: boolean;
      channelID: string | null;
      channels: string[];
    };
    mixer: {
      enabled: boolean;
      channelID: string | null;
      channels: string[];
    };
  };
  blacklisted: {
    enforcer: string | null;
    reason: string | null;
    time: number | false;
    is: boolean;
  };
  guildID: string;
  prefix: string;
}

interface UserModel {
  blacklisted: {
    enforcer: string | null;
    reason: string | null;
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
  constructor(private bot: Aoba) {
    const url = bot.config.get<string>('databaseUrl', 'mongodb://localhost:27017');

    this.logger = new Logger();
    this.client = new MongoClient(url, {
      useUnifiedTopology: true,
      useNewUrlParser: true
    });
  }

  /**
   * Gets a list of all collections avaliable
   */
  private get collections() {
    return {
      guilds: this.db.collection<GuildModel>('guilds'),
      users: this.db.collection<UserModel>('users')
    };
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
   * Gets a guild's configuration
   * @param id The guild's ID
   */
  async getGuild(id: string) {
    const model = await this.collections.guilds.findOne({ guildID: id });
    if (!model || model === null) return await this.createGuild(id);

    return model!;
  }

  /**
   * Creates a new guild instance
   * @param id The guild's ID
   */
  async createGuild(id: string) {
    const prefixes = this.bot.config.get<string[]>('discord.prefixes')!;
    const model: GuildModel = {
      guildID: id,
      prefix: prefixes[0],
      providers: {
        nintendo: {
          channelID: null,
          enabled: false
        },
        youtube: {
          channelID: null,
          channels: [],
          enabled: false
        },
        twitch: {
          channelID: null,
          channels: [],
          enabled: false
        },
        mixer: {
          channelID: null,
          channels: [],
          enabled: false
        }
      },
      blacklisted: {
        enforcer: null,
        reason: null,
        time: false,
        is: false
      }
    };

    await this.collections.guilds.insertOne(model);
    return model;
  }

  /**
   * Deletes a guild from the database
   * @param id The guild's ID
   */
  removeGuild(id: string) {
    return this.collections.guilds.deleteOne({ guildID: id });
  }

  /**
   * Updates guild settings
   * @param id The guild's ID
   * @param type The type to update
   * @param data The data to insert
   */
  updateGuild(id: string, data: any) {
    return this.collections.guilds.updateOne({ guildID: id }, data);
  }

  /**
   * Gets a guild's configuration
   * @param id The guild's ID
   */
  async getUser(id: string) {
    const model = await this.collections.users.findOne({ userID: id });
    if (!model || model === null) return await this.createUser(id);

    return model!;
  }

  /**
   * Creates a new guild instance
   * @param id The guild's ID
   */
  async createUser(id: string) {
    const prefixes = this.bot.config.get<string[]>('discord.prefixes')!;
    const model: UserModel = {
      userID: id,
      prefix: prefixes[0],
      blacklisted: {
        enforcer: null,
        reason: null,
        time: false,
        is: false
      }
    };

    await this.collections.users.insertOne(model);
    return model;
  }

  /**
   * Deletes a user from the database
   * @param id The user's ID
   */
  removeUser(id: string) {
    return this.collections.users.deleteOne({ userID: id });
  }

  /**
   * Updates user settings
   * @param id The user's ID
   * @param type The type to update
   * @param data The data to insert
   */
  updateUser(id: string, data: any) {
    return this.collections.users.updateOne({ userID: id }, data);
  }
}