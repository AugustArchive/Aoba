import { Aoba, MessageCollector, ArgumentParser, EmbedBuilder } from '.';
import { Message, TextChannel, EmbedOptions } from 'eris';

type EmbedResolvable = EmbedOptions | EmbedBuilder;

/**
 * Converts an embed resolvable to an embed object
 * @param embed The resolvable
 */
function resolveEmbed(embed: EmbedResolvable) {
  if (embed instanceof EmbedBuilder) return embed.build();
  else return embed;
}

export class CommandContext {
  /**
   * The collector for awaiting new messages
   */
  public collector: MessageCollector;

  /**
   * The message that was sent
   */
  public message: Message;

  /**
   * The arguments provided
   */
  public args: ArgumentParser;

  /**
   * The bot instance itself
   */
  public bot: Aoba;

  /**
   * Creates a new context instance
   * @param bot The bot instance
   * @param message The message
   * @param args The raw arguments provided
   */
  constructor(bot: Aoba, message: Message, args: string[]) {
    this.collector = new MessageCollector(bot);
    this.message = message;
    this.args = new ArgumentParser(args);
    this.bot = bot;
  }

  /**
   * Gets the guild object if the user is running in a text channel
   */
  get guild() {
    return this.message.channel.type === 0 ? (this.message.channel as TextChannel).guild : null;
  }

  /**
   * Gets the member instance of Aoba
   */
  get self() {
    return this.guild ? this.guild.members.get(this.bot.client.user.id)! : null;
  }

  /**
   * Gets the member instance of the message author
   */
  get member() {
    return this.guild ? this.guild.members.get(this.author.id)! : null;
  }

  /**
   * The message author
   */
  get author() {
    return this.message.author;
  }

  /**
   * Sends a message to the current text channel
   * @param content The content to send
   * @param embed An embed to send with the content sent
   */
  send(content: string, embed?: EmbedResolvable) {
    return this.message.channel.createMessage({ content, embed: embed ? resolveEmbed(embed) : undefined });
  }

  /**
   * Sends a embed to the current text channel
   * @param embed The embed to send
   */
  embed(embed: EmbedResolvable) {
    return this.message.channel.createMessage({ embed: resolveEmbed(embed) });
  }
}