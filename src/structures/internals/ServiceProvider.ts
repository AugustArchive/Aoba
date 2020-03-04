import { Aoba } from '.';

export abstract class ServiceProvider<T = any> {
  /**
   * Private interval to run the service provider
   */
  private interval!: NodeJS.Timer;

  /**
   * Amount of milliseconds to retrive data to do notifications
   */
  public timeout: number;

  /**
   * The service provider's name
   */
  public name: string;

  /**
   * The bot instance itself
   */
  public bot!: Aoba;

  /**
   * Creates a new instance of the ServiceProvider
   * @param name The provider's name
   * @param timeout The amount of milliseconds to retrive data to do notifications
   */
  constructor(name: string, timeout: number) {
    this.name = name;
    this.timeout = timeout;
  }

  /**
   * Function to get information from that service provider
   * @param args Additional arguments to supply
   */
  public abstract provide(...args: any[]): Promise<T>;

  inject(bot: Aoba) {
    this.bot = bot;
  }
}