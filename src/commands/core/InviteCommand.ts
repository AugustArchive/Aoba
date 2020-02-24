import { CommandContext, Command } from '../../structures';
import { stripIndents } from 'common-tags';
import { Constants } from '../../util';

export default class InviteCommand extends Command {
  constructor() {
    super({
      description: 'Gives you a link to invite me to your server',
      aliases: ['inviteme'],
      module: Constants.Module.Core,
      name: 'invite'
    });
  }

  async run(ctx: CommandContext) {
    const invite = `https://discordapp.com/oauth2/authorize?client_id=${this.bot.client.user.id}&scope=bot`;
    const embed = this.bot.getEmbed()
      .setTitle('Invite Links')
      .setDescription(stripIndents`
        :pencil2: **Invite**: <${invite}>
        :island: **Support Server**: <${Constants.server}>
      `);

    return void ctx.embed(embed);
  }
}