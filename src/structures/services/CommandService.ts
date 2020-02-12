import { Aoba, Logger, Command, CommandContext, ArgumentParser } from '..';
import { Message, TextChannel } from 'eris';
import { stripIndents } from 'common-tags';
import { Constants } from '../../util';

// Partially stolen from Nino (edge branch)
class CommandInvocation {
  public oneTime: boolean;
  public command: Command;
  public context: CommandContext;

  constructor(command: Command, ctx: CommandContext, oneTime: boolean = false) {
    this.oneTime = oneTime;
    this.context = ctx;
    this.command = command;
  }

  canInvoke() {
    const owners = this.context.bot.config.get<string[]>('owners')!;
    
    if (this.command.info.guildOnly && [1, 3, 4].includes(this.context.channel.type)) return `You need to be in a text channel to run the \`${this.command.info.name}\` command.`;
    if (this.command.info.ownerOnly && !owners.includes(this.context.author.id)) return `You must need to be a developer to run the \`${this.command.info.name}\` command.`;
    if (
      this.command.info.disabled && 
      this.command.info.disabled.is && 
      !this.oneTime
    ) return `Command \`${this.command.info.name}\` is currently globally disabled because \`${this.command.info.disabled.reason}\``;

    return null;
  }
}

export default class CommandService {
  /**
   * The logger instance
   */
  private logger: Logger;

  /**
   * The bot instance itself
   */
  public bot: Aoba;

  /**
   * Creates a new command service instance
   */
  constructor(bot: Aoba) {
    this.logger = new Logger();
    this.bot = bot;
  }

  /**
   * Invoked when a new message has occured
   * @param msg The message instance
   */
  async invoke(msg: Message) {
    this.bot.statistics.messagesSeen++;
    this.bot.prometheus.messagesSeen.inc();

    // Ignore if the user is a bot
    if (msg.author.bot) return;

    const guild = (msg.channel as TextChannel).guild;
    const settings = await this.bot.database.getGuild(guild.id);
    const user = await this.bot.database.getUser(msg.author.id);

    // Check if the user is blacklisted
    if (user.blacklisted.is) {
      const date = !user.blacklisted.time ? 'No expiration date' : new Date(user.blacklisted.time);
      const enforcer = this.bot.client.users.get(user.blacklisted.enforcer!)!;

      // TODO: Add a time parser (like moment)
      return msg.channel.createMessage(stripIndents`
        **${msg.author.username},** I'm s-so sorry! You were blacklisted by \`${enforcer.username}#${enforcer.discriminator}\`!

        > **Reason**          => **${user.blacklisted.reason !== null ? user.blacklisted.reason : 'No reason was provided'}**
        > **Expiration Date** => **${date instanceof Date ? date.toUTCString() : date}**
      `);
    }

    // Check for prefixes
    const mention = new RegExp(`^<@!?${this.bot.client.user.id}> `).exec(msg.content);
    const prefixes = ['aoba ', 'ao!', `${mention}`, settings.prefix, user.prefix];
    let prefix: string | null = null;

    for (const pre of prefixes) if (msg.content.startsWith(pre)) prefix = pre;
    if (!prefix) return;

    const mentioned = msg.content.match(new RegExp(`^<@!?${this.bot.client.user.id}> `)) || msg.content.match(new RegExp(`^<@!?${this.bot.client.user.id}> `));
    if (mentioned !== null) {
      const embed = this.bot.getEmbed();
      embed
        .setAuthor(`${this.bot.client.user.username}#${this.bot.client.user.discriminator} | Information`, undefined, this.bot.client.user.dynamicAvatarURL('png', 1024))
        .setDescription(stripIndents`
          **H-hello! My name is Aoba and I am bot that provides notifications to a text channel or give documentation from different API sites!**

          **S-since you pinged me, I'll show you a list of prefixes that you can use to call any command!**
          ${prefixes.map(s => `${s}<command>`)}
        `);

      return msg.channel.createMessage({ embed: embed.build() });
    }

    // Concat all arguments
    const args = msg.content.slice(prefix.length).trim().split(/ +/g);
    const ctx = new CommandContext(this.bot, msg, args);
    const invocation = this.getCommand(ctx);

    if (invocation) {
      const invoked = invocation.canInvoke();
      if (typeof invoked === 'string') {
        const embed = this.bot.getEmbed()
          .setTitle(`Unable to run ${invocation.command.info.name} command`)
          .setDescription(`**${invoked}**`)
          .build();

        return ctx.embed(embed);
      }

      try {
        await invocation.command.run(ctx);

        this.bot.prometheus.commandsExecuted.inc();
        this.bot.statistics.inc(invocation.command);
        this.logger.info(`Ran command ${invocation.command.info.name} for ${ctx.author.username} in ${ctx.guild!.name}`);
      }
      catch(ex) {
        this.bot.logger.error(`Unable to run the ${invocation.command.info.name} command:`, ex);

        const embed = this.bot.getEmbed()
          .setTitle(`Unable to run ${invocation.command.info.name} command`)
          .setDescription(stripIndents`
            aaaaaa, I am so sorry, **${ctx.author.username}!**

            Here is the report:
            \`\`\`js
            ${ex.stack.split('\n')[0]}
            \`\`\`

            I-if it occurs again, report it to <@280158289667555328> in <${Constants.server}>
          `);

        return ctx.embed(embed);
      }
    }
  }

  private getCommand(ctx: CommandContext) {
    if (!ctx.args.raw.length) return null;

    const name = ctx.args.raw.shift()!;
    const cmd = this.bot.commands.find(x =>
      x.info.name === name || (x.info.aliases || []).includes(name)  
    );

    if (cmd) return new CommandInvocation(cmd, ctx, false);
    return null;
  }
}