import { Collection } from '@augu/immutable';
import { Message } from 'eris';
import { Aoba } from '.';

type Filter = (msg: Message) => boolean;
type ResolveLike = (value?: Message | PromiseLike<Message>) => void;

interface Collector {
  /**
   * Function when to resolve the collector
   */
  resolve: ResolveLike;

  /**
   * The filter that was provided
   */
  filter: Filter;
}

interface AwaiterOptions {
  /**
   * The channel's ID
   */
  channelID: string;

  /**
   * The amount of seconds to resolve the collector
   */
  timeout?: number;

  /**
   * The user's ID
   */
  userID: string;
}

export class MessageCollector {
  /**
   * Collection of all collectors
   */
  public collectors: Collection<Collector>;

  /**
   * Creates a new instance of the message collector
   * @param bot The bot instance
   */
  constructor(bot: Aoba) {
    this.collectors = new Collection();

    bot.client.on('messageCreate', this.verify.bind(this));
  }

  /**
   * Function to verify if the collector exists and if the filter is correct
   * @param msg The message instance
   */
  private verify(msg: Message) {
    // If there is no author, don't do anything
    if (!msg.author) return;

    const collector = this.collectors.get(`${msg.author.id}:${msg.channel.id}`);
    if (collector && collector.filter(msg)) collector.resolve(msg);
  }

  /**
   * Awaits a new message and waits a specific amount and return a message or nothing
   * @param filter The filter to use to check
   * @param options Any additional options to append
   */
  awaitMessage(filter: Filter, options: AwaiterOptions) {
    return new Promise<Message>(resolve => {
      if (this.collectors.has(`${options.userID}:${options.channelID}`)) this.collectors.delete(`${options.userID}:${options.channelID}`);

      this.collectors.set(`${options.userID}:${options.channelID}`, {
        filter,
        resolve
      });

      setTimeout(resolve.bind<any, any, any>(null, false), options.timeout ? options.timeout * 1000 : 30000);
    });
  }
}