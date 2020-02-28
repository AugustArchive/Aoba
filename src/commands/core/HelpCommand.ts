import { CommandContext, Command, Cooldown } from '../../structures';
import { stripIndents } from 'common-tags';
import { Constants } from '../../util';

export default class HelpCommand extends Command {
  constructor() {
    super({
      description: 'Shows a list of Aoba\'s commands or gives documentation on a specific command',
      aliases: ['halp', 'h', 'cmds', 'commands', 'command'],
      module: Constants.Module.Core,
      name: 'help'
    });
  }

  @Cooldown(3000)
  async run(ctx: CommandContext) {
    const settings = await this.bot.database.getGuild(ctx.guild!.id);

    if (ctx.args.empty(0)) {
      const commands = this.bot.commands.filter(x => !x.ownerOnly);
      const categories: { [x: string]: Command[] } = {};

      for (const command of commands) {
        if (!categories.hasOwnProperty(command.module)) categories[command.module] = [];
        categories[command.module].push(command);
      }

      const embed = this.bot.getEmbed();
      embed
        .setDescription(stripIndents`
          > :pencil2: **| Use \`${settings.prefix}help <command>\` to get documentation of a command.**

          [GitHub](https://github.com/nowoel/Aoba) **|** [Support](https://discord.gg/yDnbEDH)
        `);

      for (const cat in categories) {
        embed.addField(`${cat} [${categories[cat].length}]`, categories[cat].map(s => `**\`${s.name}\`**`).join(', '));
      }

      return void ctx.embed(embed);
    }
    else {
      const arg = ctx.args.get(0)!;
      const cmd = this.bot.commands.filter(x =>
        x.name === arg || x.aliases.includes(arg)
      );

      if (cmd.length) {
        const command = cmd[0];
        const embed = this.bot.getEmbed();
        embed.setDescription(stripIndents`
          __**Command \`${command.signature}\`**__
          > **${command.description}**
        `);

        embed
          .addField('Module', command.module, true)
          .addField('Disabled', command.disabled.is ? `Yes (**${command.disabled.reason}**)` : 'No')
          .addField('Guild Only', command.guildOnly ? 'Yes' : 'No')
          .addField('Owner Only', command.ownerOnly ? 'Yes' : 'No')
          .addField('User Permissions Required', command.userPermissions.length ? command.userPermissions.map(s => s).join(' | ') : 'None')
          .addField('Bot Permissions Required', command.botPermissions.length ? command.botPermissions.map(s => s).join(' | ') : 'None');

        return void ctx.embed(embed);
      }
      else {
        const mod = this.bot.commands.filter(x => x.module === arg);
        if (mod.length) {
          const commands = mod.map(s => `**${s.signature}**: \`${s.description}\``).join(', ');
          const embed = this.bot.getEmbed();
          embed
            .setTitle(`Aoba | Commands in "${mod[0].module}"`)
            .setDescription(commands);

          return void ctx.embed(embed);
        }
        else {
          return void ctx.send(`No command or module c-called \`${arg}\` was not found... I-I'm so sorry!`);
        }
      }
    }
  }
}