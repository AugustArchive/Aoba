import { Server, createServer, IncomingMessage, ServerResponse } from 'http';
import { Gauge, Counter, register, collectDefaultMetrics } from 'prom-client';
import { Logger } from '..';
import { parse } from 'url';

export default class PrometheusManager {
  /**
   * How may commands has Aoba executed for users
   */
  public commandsExecuted: Counter;

  /**
   * How many messages Aoba has seen
   */
  public messagesSeen: Counter;

  /**
   * How many guilds Aoba has joined/left
   */
  public guildCount: Gauge;

  /**
   * The logger instance
   */
  private logger: Logger;

  /**
   * The server instance for getting metrics
   */
  public server: Server;

  /**
   * Creates a new instance of the Prometheus manager
   */
  constructor() {
    this.commandsExecuted = new Counter({
      name: 'aoba_commands_executed',
      help: 'How many commands has Aoba executed'
    });

    this.messagesSeen = new Counter({
      name: 'aoba_messages_seen',
      help: 'How many messages Aoba has seen'
    });

    this.guildCount = new Gauge({
      name: 'aoba_guild_count',
      help: 'How many times Aoba has joined or left a guild'
    });

    this.logger = new Logger();
    this.server = createServer((req, res) => this.onRequest.apply(this, [req, res]));
    collectDefaultMetrics();
  }

  dispose() {
    this.server.close();
    this.logger.warn('Prometheus server has closed ports');
  }

  connect(port: number) {
    this.server.listen(port, () => this.logger.info(`Connected to Prometheus server -> ${this.logger.colors.gray(`http://127.0.0.1:${port}`)}`));
  }

  private onRequest(req: IncomingMessage, res: ServerResponse) {
    if (parse(req.url!).pathname === '/metrics') {
      res.writeHead(200, { 'Content-Type': register.contentType });
      res.write(register.metrics());
    }

    res.end();
  }
}