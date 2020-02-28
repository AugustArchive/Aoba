import { CommandContext, Command } from '../../structures';
import { Module } from '../../util/Constants';

export default class ShardsCommand extends Command {
  constructor() {
    super({
      description: 'Shows a list of shards that have spawned',
      aliases: ['shardinfo'],
      module: Module.Core,
      name: 'shards'
    });
  }

  async run(ctx: CommandContext) {
    const data: string[] = [];
    for (const shard of this.bot.client.shards.values()) {
      const guilds = this.bot.client.guilds.filter(x => x.shard.id === shard.id);
      const users = guilds.reduce((a, b) => a + b.memberCount, 0);

      const check = shard.status === 'disconnected' ? '-' : shard.status === 'connecting' || shard.status === 'handshaking' ? '*' : '+';
      data.push(`${check} Shard #${shard.id} ${shard.id === ctx.guild!.shard.id ? '(current)' : ''} | G: ${guilds.length} | U: ${users} | L: ${shard.latency}ms`);
    }

    return ctx.send(`\`\`\`diff\n${data.join('\n')}\`\`\``);
  }
}