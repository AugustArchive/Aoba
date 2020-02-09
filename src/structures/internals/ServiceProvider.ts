import { Aoba } from '.';

export abstract class ServiceProvider {
  /**
   * The service provider's name
   */
  public name: string;

  /**
   * The bot instance itself
   */
  public bot: Aoba;

  /**
   * Creates a new instance of the ServiceProvider
   * @param bot The bot instance
   * @param name The provider's name
   */
  constructor(bot: Aoba, name: string) {
    this.name = name;
    this.bot = bot;
  }

  /**
   * Function to get information from that service provider
   * @param args Additional arguments to supply
   */
  public abstract provide<T = { [x: string]: any }>(...args: any[]): Promise<T>;
}