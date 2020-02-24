import { Command, CommandContext } from '../../structures';
import { Constants } from '../../util';

export default class PingCommand extends Command {
  constructor() {
    super({
      description: 'Displays the current latency from Discord and message receving',
      aliases: ['pong'],
      module: Constants.Module.Core,
      name: 'ping'
    });
  }

  get static() {
    return {
      vowels: ['a', 'e', 'i', 'o', 'u']
    };
  }

  async run(ctx: CommandContext) {
    const msg = await ctx.send(':ping_pong: **| W-what? F-fine, I\'ll get it for you~**');

    const shardLatency = ctx.guild ? ctx.guild.shard.latency : 0;
    const msgLatency = msg.createdAt;

    return void msg.edit(`:pencil2: **| P${this.static.vowels[Math.floor(Math.random() * this.static.vowels.length)]}ng? ${shardLatency === 0 ? `Message: ${Date.now() - msgLatency}ms` : `Shard (#${ctx.guild!.shard.id}): ${shardLatency}ms / Message: ${Date.now() - msgLatency}ms`}**`);
  }
}