import { Aoba, Task } from '../structures';

export default class GatewayPingTask extends Task {
  constructor(bot: Aoba) {
    super(bot, {
      interval: 10000,
      name: 'gateway.ping'
    });
  }

  async run() {
    const ping = this.bot.client.shards.reduce((a, b) => a + b.latency, 0);

    this.bot.logger.info(`Gateway Ping: ${ping}ms`);
    this.bot.prometheus.shardPing.set(ping);
  }
}