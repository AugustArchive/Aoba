import { Aoba, ServiceProvider } from '..';

interface YouTube {
  [x: string]: any;
}

export class YouTubeServiceProvider extends ServiceProvider<YouTube | null> {
  constructor(bot: Aoba) {
    super(bot, 'youtube');
  }

  async provide(channelID: string) {
    return { a: 'b' };
  }
}