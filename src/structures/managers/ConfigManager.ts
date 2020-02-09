import { Config } from '..';

export default class ConfigManager {
  /**
   * The config itself
   */
  private cache: Config;

  /**
   * Creates a new instance of the config manager
   */
  constructor(config: Config) {
    this.cache = config;
  }

  /**
   * Gets something from the config
   * @param section The section to get
   * @param defaultValue The default value if it wasn't found
   */
  get<T>(section: string, defaultValue: T): T;

  /**
   * Gets something from the config
   * @param section The section to get
   */
  get<T>(section: string): T | null;

  /**
   * Gets something from the config
   * @param section The section to get
   * @param defaultValue The default value if it wasn't found
   */
  get<T>(section: string, defaultValue?: T) {
    const nodes = section.split('.');
    let cache: any = this.cache;
    for (const frag of nodes) cache = cache[frag];

    return (cache === void 0 || cache === null) ? defaultValue ? defaultValue! : null : cache as T;
  }
}