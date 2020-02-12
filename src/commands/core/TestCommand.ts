import { Command, CommandContext } from '../../structures';
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
    if (!ctx.args.has(0)) return void ctx.send(`unknown usage: \`${this.signature}\``);

    const text = ctx.args.slice(0).join(' ');
    return void ctx.send(text);
  }
}