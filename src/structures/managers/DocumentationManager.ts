import { Aoba, Logger, Documentation } from '..';
import { Collection } from '@augu/immutable';
import * as Docs from '../documentation';

export default class DocumentationManager extends Collection<Documentation> {
  /**
   * The logger instance
   */
  private logger: Logger;

  /**
   * The bot instance itself
   */
  public bot: Aoba;

  /**
   * Creates a new instance of the documentation manager class
   * @param bot The bot instance
   */
  constructor(bot: Aoba) {
    super();

    this.logger = new Logger();
    this.bot = bot;
  }

  configure() {
    const docs = Object.values(Docs);
    for (const doc of docs) {
      const d = new doc(this.bot);
      this.set(d.name, d);
      this.logger.info(`Registered ${d.name} documentation class`);
    }
  }
}