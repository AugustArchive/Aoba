import { Aoba, Logger, ServiceProvider } from '..';
import { Collection } from '@augu/immutable';
import * as Providers from '../providers';

export default class ServiceProviderManager extends Collection<ServiceProvider> {
  /**
   * The logger instance itself
   */
  private logger: Logger;

  /**
   * The bot instance itself
   */
  public bot: Aoba;

  /**
   * Creates a new service provider manager
   * @param bot The bot instance
   */
  constructor(bot: Aoba) {
    super();

    this.logger = new Logger();
    this.bot = bot;
  }

  configure() {
    const providers: (typeof ServiceProvider)[] = Object.values(Providers);

    this.logger.info(`Now loading ${providers.length} providers!`);
    for (const provider of providers) {
      const instance: ServiceProvider = new (provider as any)(this);
      this.set(instance.name, instance);

      this.logger.info(`Built the ${instance.name} service provider`);
    }
  }

  /**
   * Gets the Nintendo provider
   */
  getProvider(name: 'nintendo'): Providers.NintendoServiceProvider;

  /**
   * Gets the Twitch provider
   */
  getProvider(name: 'twitch'): Providers.TwitchServiceProvider;

  /**
   * Gets the YouTube provider
   */
  getProvider(name: 'youtube'): Providers.YouTubeServiceProvider;
  
  /**
   * Gets any provider
   * @param name The name of the provider
   */
  getProvider(name: string): ServiceProvider;
  getProvider(name: string) {
    return this.get(name)!;
  }
}