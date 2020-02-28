import { Aoba, Logger, Command, CommandContext, getCooldownDefinitions } from '..';
import { Message, TextChannel, Member } from 'eris';
import { stripIndents } from 'common-tags';
import { Collection } from '@augu/immutable';
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

  get member() {
    return this.context.member || this.context.author;
  }

  get self() {
    return this.context.guild ? this.context.self : this.context.bot.client.user;
  }

  canInvoke() {
    const owners = this.context.bot.config.get<string[]>('owners', []);
    
    if (this.command.guildOnly && [1, 3, 4].includes(this.context.channel.type)) return `You need to be in a text channel to run the \`${this.command.name}\` command.`;
    if (this.command.ownerOnly && !owners.includes(this.context.author.id)) return `You must need to be a developer to run the \`${this.command.name}\` command.`;
    if (this.command.disabled.is && !this.oneTime) return `Command \`${this.command.name}\` is currently globally disabled because \`${this.command.disabled.reason}\``;
    
    if (!owners.includes(this.context.author.id)) {
      if (this.member instanceof Member) {
        const denial = this.command.userPermissions.some(x => !(this.member as Member).permission.has(x));
        if (denial) {
          const needed = this.command.userPermissions.filter(x => !(this.member as Member).permission.has(x));
          return `You are missing the current permissions: ${needed.join(', ')}`;
        }
      }

      if (this.self instanceof Member) {
        const denial = this.command.botPermissions.some(x => !(this.member as Member).permission.has(x));
        if (denial) {
          const needed = this.command.botPermissions.filter(x => !(this.member as Member).permission.has(x));
          return `U-um..., I am missing the following permissions: ${needed.join(', ')}`;
        }
      }
    }

    return null;
  }
}

export default class CommandService {
  /**
   * A list of ratelimits from a user
   */
  public ratelimits: Collection<Collection<number>>;

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
    this.ratelimits = new Collection();
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

    // Concat all arguments
    const args = msg.content.slice(prefix.length).trim().split(/ +/g);
    const ctx = new CommandContext(this.bot, msg, args);
    const invocation = this.getCommand(ctx);
    let run!: (ctx: CommandContext) => Promise<void>;
    let isSub = false;

    if (invocation) {
      const invoked = invocation.canInvoke();
      if (typeof invoked === 'string') {
        const embed = this.bot.getEmbed()
          .setTitle(`Unable to run ${invocation.command.name} command`)
          .setDescription(`**${invoked}**`)
          .build();

        return ctx.embed(embed);
      }

      run = invocation.command.run;
      if (ctx.args.raw.length) {
        for (const arg of ctx.args.raw) {
          if (!invocation.command.subcommands.empty && invocation.command.subcommands.find(sub => sub.name === arg)) {
            run = invocation.command.subcommands.find(s => s.name === arg)!.exec;
            isSub = true;
          }
        }
      }

      if (!this.ratelimits.has(invocation.command.name)) this.ratelimits.set(invocation.command.name, new Collection());
      const amount = getCooldownDefinitions(invocation.command);
      const now = Date.now();
      const ratelimit = this.ratelimits.get(invocation.command.name)!;

      if (!ratelimit.has(ctx.author.id)) {
        ratelimit.set(ctx.author.id, now);
        setTimeout(() => ratelimit.delete(ctx.author.id), amount);
      }
      else {
        const time = ratelimit.get(ctx.author.id)!;
        if (now < time) {
          const left = (time - now) / 1000;
          const embed = this.bot.getEmbed();
          embed
            .setAuthor(`| Command "${invocation.command.name}" is on cooldown...`, undefined, ctx.author.dynamicAvatarURL('png', 1024))
            .setDescription(`S-sorry, I've put command **${invocation.command.name}** on cooldown for **${left.toFixed()} second${left > 1 ? 's' : ''}**`);
            
          ctx.embed(embed);
        }

        ratelimit.set(ctx.author.id, now);
        setTimeout(() => ratelimit.delete(ctx.author.id), amount);
      }

      invocation.command.inject(this.bot);
      try {
        if (isSub) {
          ctx.args.raw.shift();
          await run.apply(invocation.command, [ctx]);
          this.bot.prometheus.commandsExecuted.inc();
          this.bot.statistics.inc(invocation.command);
          this.logger.info(`Ran command ${invocation.command.name} for ${ctx.author.username} in ${ctx.guild!.name}`);
          return; // Don't conflict with subcommands and parent commands
        }

        await invocation.command.run(ctx);
        this.bot.prometheus.commandsExecuted.inc();
        this.bot.statistics.inc(invocation.command);
        this.logger.info(`Ran command ${invocation.command.name} for ${ctx.author.username} in ${ctx.guild!.name}`);
      }
      catch(ex) {
        this.bot.logger.error(`Unable to run the ${invocation.command.name} command:`, ex);

        const embed = this.bot.getEmbed()
          .setTitle(`Unable to run ${invocation.command.name} command`)
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
      x.name === name || x.aliases.includes(name)  
    );

    if (cmd) return new CommandInvocation(cmd, ctx, false);
    return null;
  }
}