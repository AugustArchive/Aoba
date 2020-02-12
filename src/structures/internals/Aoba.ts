import { EmbedBuilder, HttpClient, Logger } from '..';
import { Client as DiscordClient } from 'eris';
import CommandStatisticsManager from '../managers/CommandStatsManager';
import ServiceProviderManager from '../managers/ServiceProviderManager';
import DocumentationManager from '../managers/DocumentationManager';
import PrometheusManager from '../managers/PrometheusManager';
import DatabaseManager from '../managers/DatabaseManager';
import CommandManager from '../managers/CommandManager';
import ConfigManager from '../managers/ConfigManager';
import EventManager from '../managers/EventManager';
import RedisManager from '../managers/RedisManager';
import TaskManager from '../managers/TaskManager';

export interface Config {
  databaseUrl: string;
  environment: 'development' | 'production';
  discord: {
    prefixes: string[];
    token: string;
  };
  redis: {
    host: string;
    port: number;
    db: number;
  };
  keys: {
    youtube: string;
    twitch: string;
    mixer: string;
  };
}

export class Aoba {
  public documentation: DocumentationManager;
  public statistics: CommandStatisticsManager;
  public prometheus: PrometheusManager;
  public providers: ServiceProviderManager;
  public commands: CommandManager;
  public database: DatabaseManager;
  public logger: Logger;
  public client: DiscordClient;
  public config: ConfigManager;
  public events: EventManager;
  public redis: RedisManager;
  public tasks: TaskManager;
  public http: HttpClient;

  constructor(config: Config) {
    this.documentation = new DocumentationManager(this);
    this.statistics = new CommandStatisticsManager();
    this.prometheus = new PrometheusManager();
    this.providers = new ServiceProviderManager(this);
    this.commands = new CommandManager(this);
    this.database = new DatabaseManager(this);
    this.logger = new Logger();
    this.client = new DiscordClient(config.discord.token, {
      disableEveryone: true,
      autoreconnect: true,
      restMode: true
    });
    this.config = new ConfigManager(config);
    this.events = new EventManager(this);
    this.redis = new RedisManager(this);
    this.tasks = new TaskManager(this);
    this.http = new HttpClient();
  }

  getEmbed() {
    return new EmbedBuilder()
      .setColor(0x9189D1);
  }

  async start() {
    this.logger.info('Now building Aoba...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    this.logger.info('Loading all commands...');
    await this.commands.configure();

    this.logger.info('Loaded all commands! Now building all events...');
    await this.events.configure();

    this.logger.info('Loaded all events! Now building all tasks...');
    await this.tasks.configure();

    this.logger.info('Loaded all tasks! Now building all service providers...');
    this.providers.configure();

    this.logger.info('Loaded all service providers! Now building all documentation classes...');
    this.documentation.configure();

    this.logger.info('Loaded all documentation classes! Now connecting to MongoDB...');
    await this.database.connect();

    this.logger.info('Connected to MongoDB! Now connecting to Redis...');
    await this.redis.connect();

    this.logger.info('Connected to Redis! Now connecting to Discord...');
    await this.client.connect();
  }

  async dispose() {
    this.logger.warn('Disposing connections...');
    await this.database.dispose();
    this.redis.dispose();
    this.client.disconnect({ reconnect: false });
    await new Promise(resolve => setTimeout(resolve, 2000));

    this.logger.warn('Clearing all collection values...');
    this.documentation.clear();
    this.prometheus.dispose();
    this.providers.clear();
    this.commands.clear();
    this.events.clear();
    this.tasks.clear();

    this.logger.warn('Bot connection was disposed');
  }
}