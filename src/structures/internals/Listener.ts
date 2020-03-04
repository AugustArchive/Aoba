import { Aoba, EventDefinition } from '..';
import { Collection } from '@augu/immutable';

export class Listener {
  /**
   * Collection of all events from this listener
   */
  public events: Collection<EventDefinition>;

  /**
   * The listener's name
   */
  public name: string;

  /**
   * The bot instance itself
   */
  public bot!: Aoba;

  /**
   * Creates a new instance of the listener class
   * @param bot The bot instance
   * @param name The listener name
   */
  constructor(name: string) {
    this.events = new Collection();
    this.name = name;
  }

  inject(bot: Aoba) {
    this.bot = bot;
  }
}