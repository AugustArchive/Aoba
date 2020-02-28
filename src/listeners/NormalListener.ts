import { Aoba, Event, Listener } from '../structures';

export default class NormalListener extends Listener {
  constructor(bot: Aoba) {
    super(bot, 'normal');
  }

  @Event('ready')
  async onReady() {
    this.bot.logger.discord(`Connected to Discord as ${this.bot.client.user.username}#${this.bot.client.user.discriminator}`);
    this.bot.client.editStatus('online', {
      name: `aoba help | ${this.bot.client.guilds.size.toLocaleString()} Guilds`,
      type: 0
    });

    this.bot.prometheus.connect(this.bot.config.get('ports.prometheus', 9969));
    this.bot.twitch.listen()
      .then(() => this.bot.logger.info('Opened a new connection for the Twitch service provider'))
      .catch((ex) => this.bot.logger.error('Unable to open a new connection for the Twitch service provider', ex));

    for (const task of this.bot.tasks.values()) {
      this.bot.logger.info(`Booting up task ${task.info.name}...`);
      await task.run();

      setInterval(async () => {
        this.bot.logger.info(`Running task ${task.info.name}...`);
        await task.run();
      }, task.info.interval);
    }
  }
}