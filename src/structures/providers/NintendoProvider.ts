import { Aoba, ServiceProvider } from '..';
import { FeedItem } from '../rss/RssEmitter';
import Parser from 'feedparser';

// eslint-disable-next-line
interface NintendoRSS extends FeedItem {}

export class NintendoServiceProvider extends ServiceProvider<NintendoRSS[] | null> {
  constructor(bot: Aoba) {
    super(bot, 'nintendo');
  }

  async provide() {
    const items: FeedItem[] = [];
    const parser = new Parser({});
    let data: NintendoRSS[] | null = null;
    const request = await this.bot.http.get('https://www.nintendolife.com/feeds/news')
      .header('Accept', 'text/html,application/xhtml+xml,application/xml,text/xml')
      .execute();

    parser.on('readable', () => {
      const item = parser.read();
      item.meta.link = 'https://www.nintendolife.com/feeds/news';
      items.push(item);
    });

    parser.on('error', () => data = null);

    if (!request.success) return null;
    const stream = request.stream().pipe(parser);
    stream.once('finish', () => data = items);

    return data;
  }
}