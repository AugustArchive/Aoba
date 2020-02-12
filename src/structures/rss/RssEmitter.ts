import Parser, { Item, Meta, Image, Enclosure } from 'feedparser';
import { EventEmitter } from 'events';
import { HttpClient } from '../http';

export interface FeedItem extends Item {
  [x: string]: any;
  description: string;
  categories: string[];
  enclosures: Enclosure[];
  comments: string;
  origlink: string;
  summary: string;
  pubdate: Date | null;
  author: string;
  title: string;
  image: Image;
  date: Date | null;
  link: string;
  guid: string;
  meta: Meta;
}

export interface FeedConfig {
  maxHistoryLength?: number;
  ignoreFirst?: boolean;
  interval?: NodeJS.Timer;
  refresh?: number;
  items?: FeedItem[];
  url: string;
}

interface FeedMetadata {
  newItems: FeedItem[];
  feedURL: string;
  items: FeedItem[];
  feed?: FeedConfig;
}

class FeedError extends Error {
  public feedUrl: string;
  constructor(feedUrl: string, message: string) {
    super(`${message} (feed=${feedUrl})`);

    Error.captureStackTrace(this);
    this.feedUrl = feedUrl;
    this.message = message;
    this.name = 'FeedError';
  }
}

export default class RssFeedEmitter extends EventEmitter {
  public historyLengthMultipler: number = 3;
  public feeds: FeedConfig[] = [];
  private http: HttpClient = new HttpClient();

  add(config: FeedConfig) {
    this.updateFeedList(config);
    return this.feeds;
  }

  get(url: string) {
    return this.find(url);
  }

  remove(url: string) {
    const feed = this.find(url);
    return this.removeFeed(feed);
  }

  list() {
    return this.feeds;
  }

  dispose() {
    for (let i = this.feeds.length - 1; i >= 0; i--) this.removeFeed(this.feeds[i]);
  }

  private updateFeedList(config: FeedConfig) {
    const list = this.find(config.url);
    let update = false;

    if (list) {
      this.removeFeed(list);
      update = true;
    }

    this.addFeed(config);
    update ? this.emit('feed.update', config) : this.emit('feed:new', config);
  }

  private find(url: string) {
    return this.feeds.find(x => x.url === url);
  }

  private removeFeed(config?: FeedConfig) {
    if (!config || !config.interval) return;

    clearInterval(config.interval);
    for (let i = 0; i < this.feeds.length; i++) {
      if (this.feeds[i].url === config.url) {
        this.feeds.splice(i, 1);
        i--;
      }
    }
  }

  private findFeedItem(config: FeedConfig, item: FeedItem) {
    if (!config.items) return undefined;

    if (item.guid) return config.items.find(x => x.link === item.link && x.title === item.title && x.guid === item.guid);
    return config.items.find(x => x.link === item.link && x.title === item.title);
  }

  private addFeed(config: FeedConfig) {
    config.items = [];
    config.refresh = config.refresh ? config.refresh! : 60000;
    config.interval = this.buildInterval(config);

    this.feeds.push(config);
    this.emit('feed:init', config);
  }

  private buildInterval(config: FeedConfig) {
    const getContent = () => {
      const redefineItemHistory = (data: FeedMetadata) => {
        const length = data.items.length;
        data.feed!.maxHistoryLength = length * this.historyLengthMultipler;
      };

      const sortByDate = (data: FeedMetadata) => {
        // @ts-ignore
        data.items = data.items.sort((a, b) => b.date! - a.date);
      };

      const onIdentifyNewItems = (data: FeedMetadata) => {
        data.newItems = data.items.filter(item => this.findFeedItem(data.feed!, item) ? false : item);
      };

      const populate = (data: FeedMetadata) => {
        data.newItems.forEach(item => this.addItemToList(data.feed!, item));
        data.feed!.ignoreFirst = false;
      };

      this
        .fetch(config.url)
        .then(data => {
          // This felt hacky but it's gonna do for now lol
          redefineItemHistory(data);
          sortByDate(data);
          onIdentifyNewItems(data);
          populate(data);
        })
        .catch(error => this.emit('feed:error', error));
    };

    getContent();
    const interval = setInterval(getContent, config.refresh!);
    return interval;
  }

  private addItemToList(config: FeedConfig, item: FeedItem) {
    if (config.ignoreFirst) {
      config.items!.push(item);

      const maxHistory = config.maxHistoryLength || 10;
      const length = config.items!.length;
      config.items = config.items!.slice(length - maxHistory, length);
    }
    else {
      config.items!.push(item);

      const maxHistory = config.maxHistoryLength || 10;
      const length = config.items!.length;
      config.items = config.items!.slice(length - maxHistory, length);
      this.emit('item:new', item);
    }
  }

  private fetch(url: string) {
    return new Promise<FeedMetadata>((resolve, reject) => {
      const data: FeedMetadata = {
        feedURL: url,
        newItems: [],
        items: []
      };

      const parser = new Parser({});
      this
        .http
        .get(url, {
          headers: {
            accept: 'text/html,application/xhtml+xml,application/xml,text/xml'
          }
        })
        .execute()
        .then(res => {
          if (!res.success) reject(new FeedError(url, `Server responded with ${res.statusCode}: ${res.statusCodeText}`));

          const stream = res
            .stream()
            .pipe(parser);

          stream.once('finish', () => resolve(data));
        })
        .catch(error => reject(error));

      parser.on('readable', () => {
        const item = parser.read();
        item.meta.link = url;
        data.items.push(item);
      });

      parser.on('error', () => reject(new FeedError(url, 'Unable parse the feed')));
    });
  }
}