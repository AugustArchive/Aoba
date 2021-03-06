import { Aoba, Logger, ServiceProvider } from '..';
import { Collection } from '@augu/immutable';
import * as utils from '../../util';

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

  async configure() {
    const Providers = await import(utils.getArbitrayPath('structures', 'providers'));
    const providers = Object.values(Providers);

    this.logger.info(`Now loading ${providers.length} providers!`);
    for (const provider of providers) {
      const instance: ServiceProvider = new (provider as any)();

      instance.inject(this.bot);
      this.set(instance.name, instance);
      this.logger.info(`Built the ${instance.name} service provider`);
    }
  }
}