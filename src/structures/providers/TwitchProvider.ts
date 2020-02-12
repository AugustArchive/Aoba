import { Aoba, ServiceProvider } from '..';

interface Twitch {
  [x: string]: any;
}

export class TwitchServiceProvider extends ServiceProvider<Twitch | null> {
  constructor(bot: Aoba) {
    super(bot, 'twitch');
  }

  async provide(userID: string) {
    return { a: 'b' };
  }
}