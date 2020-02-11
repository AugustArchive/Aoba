import { Documentation, Aoba } from '..';
import { Constants } from '../../util';

interface DiscordJSDoc {
  E: string;
}

export class DiscordJSDocs extends Documentation<DiscordJSDoc> {
  constructor(bot: Aoba) {
    super(bot, 'discord.js');
  }

  get url() {
    return Constants.DocSites.DiscordJS;
  }

  async provide(clazz: string) {
    const obj: DiscordJSDoc = { E: '' };
    return obj;
  }
}