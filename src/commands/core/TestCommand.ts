import { Command, CommandContext, Subcommand } from '../../structures';
import { Constants } from '../../util';

export default class TestCommand extends Command {
  constructor() {
    super({
      name: 'test',
      description: 'A test command, what did you expect?',
      module: Constants.Module.Core,
      aliases: ['debug', 'owo'],
      ownerOnly: true,
      usage: '<...text>'
    });
  }

  async run(ctx: CommandContext) {
    const subcommands = this.subcommands.map(s => s.name).join(', ');
    return void ctx.send('subcommands: E');
  }

  @Subcommand('e', 'test subcommand')
  async e(ctx: CommandContext) {
    return void ctx.send('e');
  }
}