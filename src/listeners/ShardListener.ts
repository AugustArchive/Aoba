import { Aoba, Event, Listener } from '../structures';

export default class ShardListener extends Listener {
  constructor(bot: Aoba) {
    super(bot, 'shard');
  }

  @Event('shardReady')
  onShardReady(id: number) {
    this.bot.logger.discord(`Shard #${id} is ready!`);
  }

  @Event('shardResume')
  onShardResumed(id: number) {
    this.bot.logger.discord(`Shard #${id} resumed from being disconnected`);
  }

  @Event('shardDisconnect')
  onShardDisconnect(error: any, id: number) {
    this.bot.logger.discord(`Shard #${id} has disconnected`, error || 'No error stack was provided');
  }
}