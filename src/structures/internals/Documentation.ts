import { Constants } from '../../util'; 
import { Aoba } from '.';

export abstract class Documentation {
  /**
   * The documentation's class name
   */
  public name: string;

  /**
   * The bot instance
   */
  public bot: Aoba;

  /**
   * Creates a new instance of the Documentation class
   * @param bot The bot instance
   * @param name The documentation class name
   */
  constructor(bot: Aoba, name: string) {
    this.name = name;
    this.bot = bot;
  }

  /**
   * A getter to get the documentation site url
   */
  public abstract get url(): Constants.DocSites;

  /**
   * Function to get the information needed
   * @param args Any additional parameters to include
   */
  public abstract provide<T = { [x: string]: any }>(...args: any[]): Promise<T>;
}