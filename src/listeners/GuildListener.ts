import { Aoba, Event, Listener } from '../structures';
import { stripIndents } from 'common-tags';
import { Guild } from 'eris';

export default class GuildListener extends Listener {
  constructor(bot: Aoba) {
    super(bot, 'guild');
  }

  @Event('guildCreate')
  async onGuildJoined(guild: Guild) {
    this.bot.logger.discord(`Joined ${guild.name} (${guild.id})`);
    await this.bot.database.createGuild(guild.id);

    const channel = this.bot.client.getChannel('529593466729267200');
    if (channel.type === 0) {
      const embed = this.bot.getEmbed()
        .setTitle('Joined a new guild')
        .setThumbnail(guild.icon ? guild.iconURL! : '')
        .setDescription(stripIndents`
          > __**Joined ${guild.name}**__

          > Members [${guild.members.size}] => **${guild.members.filter(s => s.bot).length} bots; ${guild.members.filter(s => !s.bot).length} humans**
          > Channels [${guild.channels.size}] => **${guild.channels.filter(s => s.type === 0).length} text; ${guild.channels.filter(s => s.type === 2).length} voice**
          > ID => **${guild.id}**
        `)
        .setFooter(`Now at ${this.bot.client.guilds.size} guilds!`, this.bot.client.user.dynamicAvatarURL('png', 1024));
    
      return channel.createMessage({ embed: embed.build() });
    }
  }

  @Event('guildDelete')
  async onGuildLeft(guild: Guild) {
    this.bot.logger.discord(`Left ${guild.name} (${guild.id})`);
    await this.bot.database.removeGuild(guild.id);

    const channel = this.bot.client.getChannel('529593466729267200');
    if (channel.type === 0) {
      const embed = this.bot.getEmbed()
        .setTitle('Left a new guild')
        .setThumbnail(guild.icon ? guild.iconURL! : '')
        .setDescription(stripIndents`
          > __**Left ${guild.name}**__

          > Members [${guild.members.size}] => **${guild.members.filter(s => s.bot).length} bots; ${guild.members.filter(s => !s.bot).length} humans**
          > Channels [${guild.channels.size}] => **${guild.channels.filter(s => s.type === 0).length} text; ${guild.channels.filter(s => s.type === 2).length} voice**
          > ID => **${guild.id}**
        `)
        .setFooter(`Now at ${this.bot.client.guilds.size} guilds!`, this.bot.client.user.dynamicAvatarURL('png', 1024));
    
      return channel.createMessage({ embed: embed.build() });
    }
  }
}