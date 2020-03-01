import { Command, Subcommand, Cooldown, CommandContext } from '../../structures';
import { Module } from '../../util/Constants';

export default class PrefixCommand extends Command {
  constructor() {
    super({
      userPermissions: ['manageGuild'],
      description: 'Views, sets, or resets the prefix for this guild.',
      guildOnly: true,
      module: Module.Core,
      usage: 'set <prefix> | reset',
      name: 'prefix'
    });
  }

  @Cooldown(5000)
  async run(ctx: CommandContext) {
    const settings = await this.bot.database.getGuild(ctx.guild!.id);
    return ctx.send(`:pencil2: **| The prefix for ${ctx.guild!.name} is \`${settings.prefix}\`.**`);
  }

  @Subcommand('set', 'Sets the prefix')
  async set(ctx: CommandContext) {
    if (ctx.args.empty(0)) return ctx.send('Y-you are missing a prefix to set!');

    const prefix = ctx.args.get(0);
    if (prefix.length > 15) return ctx.send(`The prefix you set (\`${prefix}\`) is too long!`);
    if (['@everyone', '@here'].includes(prefix)) return ctx.send('W-why did you p-ping everyone?!');

    await this.bot.database.updateGuild(ctx.guild!.id, {
      $set: {
        'prefix': prefix
      }
    });

    return ctx.send(`:pencil2: **| Prefix \`${prefix}\` is now the guild's prefix. I'll respond with a mention or with the default prefix!**`);
  }

  @Subcommand('reset', 'Resets the guild\'s prefix')
  async reset(ctx: CommandContext) {
    await this.bot.database.updateGuild(ctx.guild!.id, {
      $set: {
        'prefix': 'aoba '
      }
    });

    return ctx.send(':pencil2: **| Resetted the guild prefix to `aoba`**');
  }
}