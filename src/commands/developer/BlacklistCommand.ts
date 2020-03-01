import { Command, Cooldown, Subcommand, CommandContext } from '../../structures';
import { stripIndents } from 'common-tags';
import { User, Guild } from 'eris';
import { Module } from '../../util/Constants';

export default class BlacklistCommand extends Command {
  constructor() {
    super({
      description: 'Blacklists a user from using me.',
      ownerOnly: true,
      module: Module.Developer,
      usage: '<"user"|"guild"> <id> [reason]',
      name: 'blacklist'
    });
  }

  @Cooldown(10000)
  async run(ctx: CommandContext) {
    const users = await this.bot.database.collections.users.find({ 'blacklisted.is': true }).toArray();
    const guilds = await this.bot.database.collections.guilds.find({ 'blacklisted.is': true }).toArray();
    const embed = this.bot.getEmbed()
      .setDescription(stripIndents`
        **Guilds Blacklisted**: ${guilds.length}
        **Users Blacklisted**: ${users.length}
      `);

    return ctx.embed(embed);
  }

  @Subcommand('user', 'Blacklists a user from using me')
  async user(ctx: CommandContext) {
    if (ctx.args.empty(0)) return ctx.send('Missing the user\'s ID or name');

    const userID = ctx.args.get(0);
    const user: User = await this.bot.rest.getUser(userID).catch<any>(ex => ctx.send(ex));

    const reason = ctx.args.empty(1) ? null : ctx.args.slice(1).join(' ');
    await this.bot.database.updateUser(user.id, {
      $set: {
        'blacklisted.is': true,
        'blacklisted.enforcer': ctx.author.id,
        'blacklisted.reason': reason,
        'blacklisted.time': false // TODO: Add a manager to do this
      }
    });

    return ctx.send(`Successfully blacklisted user **${user.username}#${user.discriminator}** for **${reason === null ? 'No reason' : reason}**`);
  }

  @Subcommand('guild', 'Blacklists a guild from using me')
  async guild(ctx: CommandContext) {
    if (ctx.args.empty(0)) return ctx.send('Missing the guild\'s ID or name');

    const guildID = ctx.args.get(0);
    const guild: Guild = await this.bot.rest.getGuild(guildID).catch<any>(ex => ctx.send(ex));

    const reason = ctx.args.empty(1) ? null : ctx.args.slice(1).join(' ');
    await this.bot.database.updateGuild(guild.id, {
      $set: {
        'blacklist.enforcer': ctx.author.id,
        'blacklisted.reason': reason,
        'blacklisted.time': false, // TODO: View above for the user subcommand
        'blacklisted.is': true
      }
    });

    return ctx.send(`Guild **${guild.name}** is blacklisted for **${reason === null ? 'None' : reason}**`);
  }
}