import { ServiceProvider, Logger } from '..';
import { FeedItem } from '../rss/RssEmitter';
import Parser from 'feedparser';

// eslint-disable-next-line
interface NintendoRSS extends FeedItem {}

type RSSItem = NintendoRSS[] | null;
export class NintendoServiceProvider extends ServiceProvider<RSSItem> {
  public logger: Logger = new Logger();
  public oldItem!: RSSItem;

  constructor() {
    super('nintendo', 30000);
  }

  async provide() {
    const items: FeedItem[] = [];
    const parser = new Parser({});
    let data: RSSItem = null;
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