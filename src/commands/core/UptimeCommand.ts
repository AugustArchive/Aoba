import { CommandContext, Cooldown, Command } from '../../structures';
import { humanize } from '../../util';
import { Module } from '../../util/Constants';

export default class UptimeCommand extends Command {
  constructor() {
    super({
      description: 'Shows the current uptime of Aoba',
      module: Module.Core,
      name: 'uptime'
    });
  }

  @Cooldown(5000)
  async run(ctx: CommandContext) {
    return ctx.send(humanize(Date.now() - this.bot.client.startTime));
  }
}