import { Aoba, Logger, Listener, EventDefinition, getEventDefinitions } from '..';
import { promises as fs } from 'fs';
import { Collection } from '@augu/immutable';
import * as utils from '../../util';

export default class EventManager extends Collection<Listener> {
  /**
   * The logger instance
   */
  private logger: Logger;

  /**
   * The arbitray path
   */
  public path: string;

  /**
   * The bot instance itself
   */
  public bot: Aoba;

  /**
   * Creates a new instance of the event manager
   * @param bot The bot instance itself 
   */
  constructor(bot: Aoba) {
    super();

    this.logger = new Logger();
    this.path = utils.getArbitrayPath('listeners');
    this.bot = bot;
  } 

  async configure() {
    this.logger.info('Now building all listeners...');

    const files = await fs.readdir(this.path);
    this.logger.info(`Found ${files.length} listeners!`);
    for (const file of files) {
      const instance = await import(utils.getArbitrayPath('listeners', file));
      const listener: Listener = instance.default ? new instance.default(this.bot) : new instance(this.bot);

      const definitions = getEventDefinitions(listener);
      if (!definitions.length) {
        this.logger.warn(`Listener ${listener.name} didn't supply any event definitions, continuing...`);
        continue;
      }

      this.bindEvents(listener, definitions);
      this.set(listener.name, listener);
      this.logger.info(`Built ${listener.name} listener!`);
    }
  }

  private bindEvents(listener: Listener, events: EventDefinition[]) {
    this.logger.info(`Now building ${events.length} events for listener ${listener.name}`);
    for (const event of events) {
      const wrapper = async(...args: any[]) => {
        try {
          await event.exec.apply(listener, args);
        }
        catch(ex) {
          this.logger.error(`Unable to run event ${event.event}:`, ex);
        }
      };

      this.logger.info(`Binded event ${event.event}!`);
      listener.events.set(event.event, event);
      this.bot.client.on(event.event, wrapper);
    }
  }
}