import { Cooldown, Subcommand, Command, CommandContext } from '../../structures';
import { stripIndents } from 'common-tags';
import { dateformat } from '../../util';
import { Constants } from 'eris';
import { Module } from '../../util/Constants';

export default class SettingsCommand extends Command {
  constructor() {
    super({
      userPermissions: ['manageGuild'],
      description: 'Enables, disables, sets, resets, or view a guild or user\'s configuration',
      guildOnly: true,
      aliases: ['config', 'cfg'],
      module: Module.Core,
      name: 'settings'
    });
  }

  @Cooldown(7000)
  async run(ctx: CommandContext) {
    const settings = await this.bot.database.getGuild(ctx.guild!.id);
    const modifiedAt = dateformat(settings.modifiedAt).parse('mm/dd/yyyy hh:MM:ss TT');
    const isEnabled = (value: boolean) => value ? '✅' : '❌';

    const config = stripIndents`
      > :pencil2: **| Modified configuration at ${modifiedAt}**

      \`\`\`ini
      [prefix]: ${settings.prefix}<command>
      [providers.nintendo]: ${isEnabled(settings.providers.nintendo.enabled)}
      [providers.picarto]: ${isEnabled(settings.providers.picarto.enabled)}
      [providers.youtube]: ${isEnabled(settings.providers.youtube.enabled)}
      [providers.twitch]: ${isEnabled(settings.providers.twitch.enabled)}
      [providers.mixer]: ${isEnabled(settings.providers.mixer.enabled)}
      [providers.picarto.events]: ${!settings.providers.picarto.events.length ? 'None' : settings.providers.picarto.events.map((x, i) => `- ${i + 1}: ${x}`).join('\n')}
      [providers.youtube.events]: ${!settings.providers.youtube.events.length ? 'None' : settings.providers.youtube.events.map((x, i) => `- ${i + 1}: ${x}`).join('\n')}
      [providers.twitch.events]: ${!settings.providers.twitch.events.length ? 'None' : settings.providers.twitch.events.map((x, i) => `- ${i + 1}: ${x}`).join('\n')}
      [providers.mixer.events]: ${!settings.providers.mixer.events.length ? 'None' : settings.providers.mixer.events.map((x, i) => `- ${i + 1}: ${x}`).join('\n')}
      \`\`\`
    `;

    const embed = this.bot.getEmbed()
      .setAuthor(`| Configuration for ${ctx.guild!.name}`, undefined, ctx.guild!.iconURL)
      .setDescription(config);

    return ctx.embed(embed);
  }

  @Subcommand('set', 'Sets a key to a value')
  async set(ctx: CommandContext) {
    const keys = [
      'providers.nintendo.channelID',
      'providers.picarto.channelID',
      'provider.picarto.channels',
      'provider.picarto.events',
      'providers.youtube.channelID',
      'providers.youtube.channels',
      'providers.youtube.events',
      'providers.twitch.channelID',
      'providers.twitch.channels',
      'providers.twitch.events',
      'providers.mixer.channelID',
      'providers.mixer.channels',
      'providers.mixer.events',
    ];

    const key = ctx.args.get(0);

    switch (key) {
      case 'providers.nintendo.channelID': {
        if (ctx.args.empty(1)) return ctx.send('S-sorry, but you\'ll need to set a channel id, mention, or name!');

        const channelID = ctx.args.get(1);
        const channel = await this.bot.rest.getChannel(channelID, ctx.guild!).catch(ex => ctx.send(ex));

        const message = await ctx.send(stripIndents`
          :pencil2: **| B-before I do anything, are you sure you do this?**
          > Type \`yes\` to add <#${channel.id}> as a channel to send updates on Nintendo News.
          > Type \`no\` to opt-out of this menu and not do anything.

          You have a minute to decide, I-I'm doing this, so I won't do a-anything s-s-stupid...
        `);

        const collected = await ctx.collector.awaitMessage(msg => msg.author.id === ctx.author.id && ['yes', 'no'].includes(msg.content), {
          channelID: ctx.channel.id,
          userID: ctx.author.id,
          timeout: 60
        });

        if (!collected.content) return message.edit(`O-ok **${ctx.author.username}**, I have opted you out of the menu.`);
        if (collected.content === 'yes') {
          await this.bot.database.updateGuild(ctx.guild!.id, {
            $set: {
              'modifiedAt': Date.now(),
              'providers.nintendo.channelID': channel.id
            }
          });

          return message.edit(`I have set the channel to receive Nintendo news in <#${channel.id}>!`);
        }
        if (collected.content === 'no') return message.edit(`O-ok **${ctx.author.username}**, I will not set the channel`);
      } break;

      default: return ctx.send(key === undefined ? `Missing key. (${keys.join(' | ')})` : `Invalid key **${key}** (${keys.join(' | ')})`);
    }
  }
}