import { Documentation, EmbedBuilder, Embed, Aoba } from '..';
import { EmbedOptions } from 'eris';
import { Constants } from '../../util';
import { stringify } from 'querystring';

type Sources = 'stable' | 'master' | 'rpc' | 'commando' | 'akairo' | 'akairo-master' | '11.5-dev' | string;
export class DiscordJSDocs extends Documentation<EmbedOptions | null> {
  constructor(bot: Aoba) {
    super(bot, 'discord.js');
  }

  get url() {
    return Constants.DocSites.DiscordJS;
  }

  // Credit: https://github.com/Naval-Base/Yukikaze
  async provide(branch: Sources, property: string) {
    if (branch === '11.5-dev') branch = `https://raw.githubusercontent.com/discordjs/discord.js/docs/${branch}.json`;

    const query = stringify({
      src: branch,
      q: property.split(' ').join(' '),
      force: false,
      includePrivate: false
    });

    const site = this.url.replace('${query}', query);
    const request = await this.bot
      .http
      .get(site)
      .execute();

    try {
      const res = request.json<Embed>();
      return new EmbedBuilder(res).build();
    }
    catch(ex) {
      return null;
    }
  }
}