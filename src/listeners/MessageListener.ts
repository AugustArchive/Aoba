import { Aoba, Event, Listener } from '../structures';
import { Message } from 'eris';

export default class MessageListener extends Listener {
  constructor(bot: Aoba) {
    super(bot, 'message');
  }

  @Event('messageCreate')
  async onMessageCreate(m: Message) {
    return this.bot.commands.service.invoke(m);
  }
}