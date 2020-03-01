import { Cooldown, Subcommand, Command, CommandContext } from '../../structures';
import { stripIndents } from 'common-tags';
import { dateformat } from '../../util';
import { Module } from '../../util/Constants';

export default class SettingsCommand extends Command {
  constructor() {
    super({
      userPermissions: ['manageGuild'],
      description: 'Enables, disables, sets, or resets this guild\'s configuration',
      guildOnly: true,
      aliases: ['config', 'cfg'],
      module: Module.Core,
      usage: 'set <key> <value> | enable <key> | disable <key> | reset <key>',
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
      [providers.picarto.events]: ${!settings.providers.picarto.events.length ? 'None' : settings.providers.picarto.events === 'all' ? 'All' : settings.providers.picarto.events.map((x, i) => `- ${i + 1}: ${x}`).join('\n')}
      [providers.youtube.events]: ${!settings.providers.youtube.events.length ? 'None' : settings.providers.youtube.events === 'all' ? 'All' : settings.providers.youtube.events.map((x, i) => `- ${i + 1}: ${x}`).join('\n')}
      [providers.twitch.events]: ${!settings.providers.twitch.events.length ? 'None' : settings.providers.twitch.events === 'all' ? 'All' : settings.providers.twitch.events.map((x, i) => `- ${i + 1}: ${x}`).join('\n')}
      [providers.mixer.events]: ${!settings.providers.mixer.events.length ? 'None' : settings.providers.mixer.events === 'all' ? 'All' : settings.providers.mixer.events.map((x, i) => `- ${i + 1}: ${x}`).join('\n')}
      \`\`\`
    `;

    const embed = this.bot.getEmbed()
      .setAuthor(`| Configuration for ${ctx.guild!.name}`, undefined, ctx.guild!.iconURL)
      .setDescription(config)
      .setFooter('You are shown this due to no subcommand.', this.bot.client.users.get(ctx.guild!.ownerID)!.dynamicAvatarURL('png', 1024));

    return ctx.embed(embed);
  }

  @Subcommand('set', 'Sets a key to a value')
  async set(ctx: CommandContext) {
    const keys = [
      'providers.nintendo.channelID',
      'providers.picarto.channelID',
      'providers.picarto.channels',
      'providers.youtube.channelID',
      'providers.youtube.channels',
      'providers.twitch.channelID',
      'providers.twitch.channels',
      'providers.mixer.channelID',
      'providers.mixer.channels'
    ];

    const key = ctx.args.get(0);
    const settings = await this.bot.database.getGuild(ctx.guild!.id);

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

      case 'providers.picarto.channelID': {
        if (ctx.args.empty(1)) return ctx.send('S-sorry, but you\'ll need to set a channel id, mention, or name!');

        const channelID = ctx.args.get(1);
        const channel = await this.bot.rest.getChannel(channelID, ctx.guild!).catch(ex => ctx.send(ex));

        const message = await ctx.send(stripIndents`
          :pencil2: **| B-before I do anything, are you sure you do this?**
          > Type \`yes\` to add <#${channel.id}> as a channel to send updates on when Picarto.tv users stream.
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
              'providers.picarto.channelID': channel.id
            }
          });

          return message.edit(`I have set the channel to receive Picarto.tv news in <#${channel.id}>!`);
        }
        if (collected.content === 'no') return message.edit(`O-ok **${ctx.author.username}**, I will not set the channel`);
      } break;

      case 'providers.picarto.channels': {
        if (ctx.args.empty(1)) return ctx.send('S-sorry, but you\'ll need to provide a list (example: `x y z`');

        const list = ctx.args.slice(1).raw;

        const message = await ctx.send(stripIndents`
          :pencil2: **| B-before I do anything, are you sure you do this?**
          > Type \`yes\` to add ${list.length} channels to opt in notifications?
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
          const doc = {
            'modifiedAt': Date.now(),
            'providers.picarto.channels': settings.providers.picarto.channels.length ? [...settings.providers.picarto.channels, ...list] : list
          };

          if (!settings.providers.picarto.enabled) doc['providers.picarto.enabled'] = true;
          await this.bot.database.updateGuild(ctx.guild!.id, {
            $set: doc
          });

          return message.edit(`You have set ${list.length} channels to receive notifications from, to enable events, do \`aoba settings enable providers.picarto.events\``);
        }
        if (collected.content === 'no') return message.edit(`O-ok **${ctx.author.username}**, I will not set the channel`);
      } break;

      case 'providers.youtube.channelID': {
        if (ctx.args.empty(1)) return ctx.send('S-sorry, but you\'ll need to set a channel id, mention, or name!');

        const channelID = ctx.args.get(1);
        const channel = await this.bot.rest.getChannel(channelID, ctx.guild!).catch(ex => ctx.send(ex));

        const message = await ctx.send(stripIndents`
          :pencil2: **| B-before I do anything, are you sure you do this?**
          > Type \`yes\` to add <#${channel.id}> as a channel to send updates on when YouTube channels do stuff.
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
              'providers.youtube.channelID': channel.id
            }
          });

          return message.edit(`I have set the channel to receive YouTube news in <#${channel.id}>!`);
        }
        if (collected.content === 'no') return message.edit(`O-ok **${ctx.author.username}**, I will not set the channel`);
      } break;

      case 'providers.youtube.channels': {
        if (ctx.args.empty(1)) return ctx.send('S-sorry, but you\'ll need to provide a list (example: `x y z`');

        const list = ctx.args.slice(1).raw;

        const message = await ctx.send(stripIndents`
          :pencil2: **| B-before I do anything, are you sure you do this?**
          > Type \`yes\` to add ${list.length} channels to opt in notifications?
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
          const doc = {
            'modifiedAt': Date.now(),
            'providers.picarto.channels': settings.providers.youtube.channels.length ? [...settings.providers.youtube.channels, ...list] : list
          };

          if (!settings.providers.youtube.enabled) doc['providers.youtube.enabled'] = true;
          await this.bot.database.updateGuild(ctx.guild!.id, {
            $set: doc
          });

          return message.edit(`You have set ${list.length} channels to receive notifications from, to enable events, do \`aoba settings enable providers.picarto.events\``);
        }
        if (collected.content === 'no') return message.edit(`O-ok **${ctx.author.username}**, I will not set the channel`);
      } break;

      case 'providers.twitch.channelID': {
        if (ctx.args.empty(1)) return ctx.send('S-sorry, but you\'ll need to set a channel id, mention, or name!');

        const channelID = ctx.args.get(1);
        const channel = await this.bot.rest.getChannel(channelID, ctx.guild!).catch(ex => ctx.send(ex));

        const message = await ctx.send(stripIndents`
          :pencil2: **| B-before I do anything, are you sure you do this?**
          > Type \`yes\` to add <#${channel.id}> as a channel to send updates on when Twitch users stream.
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
              'providers.twitch.channelID': channel.id
            }
          });

          return message.edit(`I have set the channel to receive Twitch news in <#${channel.id}>!`);
        }
        if (collected.content === 'no') return message.edit(`O-ok **${ctx.author.username}**, I will not set the channel`);
      } break;

      case 'providers.twitch.channels': {
        if (ctx.args.empty(1)) return ctx.send('S-sorry, but you\'ll need to provide a list (example: `x y z`');

        const list = ctx.args.slice(1).raw;

        const message = await ctx.send(stripIndents`
          :pencil2: **| B-before I do anything, are you sure you do this?**
          > Type \`yes\` to add ${list.length} channels to opt in notifications?
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
          const doc = {
            'modifiedAt': Date.now(),
            'providers.twitch.channels': settings.providers.twitch.channels.length ? [...settings.providers.twitch.channels, ...list] : list
          };

          if (!settings.providers.twitch.enabled) doc['providers.twitch.enabled'] = true;
          await this.bot.database.updateGuild(ctx.guild!.id, {
            $set: doc
          });

          return message.edit(`You have set ${list.length} channels to receive notifications from, to enable events, do \`aoba settings enable providers.twitch.events\``);
        }
        if (collected.content === 'no') return message.edit(`O-ok **${ctx.author.username}**, I will not set the channel`);
      } break;

      case 'providers.mixer.channelID': {
        if (ctx.args.empty(1)) return ctx.send('S-sorry, but you\'ll need to set a channel id, mention, or name!');

        const channelID = ctx.args.get(1);
        const channel = await this.bot.rest.getChannel(channelID, ctx.guild!).catch(ex => ctx.send(ex));

        const message = await ctx.send(stripIndents`
          :pencil2: **| B-before I do anything, are you sure you do this?**
          > Type \`yes\` to add <#${channel.id}> as a channel to send updates on when Mixer users stream.
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
              'providers.mixer.channelID': channel.id
            }
          });

          return message.edit(`I have set the channel to receive Mixer news in <#${channel.id}>!`);
        }
        if (collected.content === 'no') return message.edit(`O-ok **${ctx.author.username}**, I will not set the channel`);
      } break;

      case 'providers.mixer.channels': {
        if (ctx.args.empty(1)) return ctx.send('S-sorry, but you\'ll need to provide a list (example: `x y z`');

        const list = ctx.args.slice(1).raw;

        const message = await ctx.send(stripIndents`
          :pencil2: **| B-before I do anything, are you sure you do this?**
          > Type \`yes\` to add ${list.length} channels to opt in notifications?
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
          const doc = {
            'modifiedAt': Date.now(),
            'providers.mixer.channels': settings.providers.mixer.channels.length ? [...settings.providers.mixer.channels, ...list] : list
          };

          if (!settings.providers.mixer.enabled) doc['providers.mixer.enabled'] = true;
          await this.bot.database.updateGuild(ctx.guild!.id, {
            $set: doc
          });

          return message.edit(`You have set ${list.length} channels to receive notifications from, to enable events, do \`aoba settings enable providers.mixer.events\``);
        }
        if (collected.content === 'no') return message.edit(`O-ok **${ctx.author.username}**, I will not set the channel`);
      } break;

      default: return ctx.send(key === undefined ? `Missing key. (${keys.join(' | ')})` : `Invalid key **${key}** (${keys.join(' | ')})`);
    }
  }

  @Subcommand('enable', 'Enable providers or events to send')
  async enable(ctx: CommandContext) {
    const allKeys = [
      'providers',
      'providers.events',
      'providers.nintendo',
      'providers.picarto',
      'providers.picarto.events',
      'providers.youtube',
      'providers.youtube.events',
      'providers.twitch',
      'providers.twitch.events',
      'providers.mixer',
      'providers.mixer.events'
    ];

    const key = ctx.args.get(0);
    const providers = allKeys
      .filter(x => x !== 'providers')
      .map(x => x.endsWith('.events') ? x.slice(0, x.length - 7) : x)
      .filter((a, b) => 
        // This looks ugly but it works lol
        a === 'providers' ? false : ['providers.nintendo'].includes(a) ? true : allKeys.indexOf(a) === b
      );

    switch (key) {
      case 'providers': {
        const message = await ctx.send(stripIndents`
          :pencil2: **| Are you sure you wanna enable all providers?**
          > Type \`yes\` to enable ${providers.length} providers
          > Type \`no\` to opt-out of this message.

          You have a minute to decide, I-I'm doing this, so I won't do a-anything s-s-stupid...
        `);

        const collector = await ctx.collector.awaitMessage(m => m.author.id === ctx.author.id && ['yes', 'no'].includes(m.content), {
          channelID: ctx.channel.id,
          userID: ctx.author.id,
          timeout: 60
        });

        if (!collector.content) return message.edit('You\'ve decided to opt-out due to no r-response.');
        if (collector.content === 'yes') {
          await this.bot.database.updateGuild(ctx.guild!.id, {
            $set: {
              'modifiedAt': Date.now(),
              'providers.nintendo.enabled': true,
              'providers.picarto.enabled': true,
              'providers.youtube.enabled': true,
              'providers.twitch.enabled': true,
              'providers.mixer.enabled': true
            }
          });

          await message.delete();
          return ctx.send('I have e-enabled all providers! To enable events, do `aoba settings enable provider.events`');
        }
        if (collector.content === 'no') return message.edit('O-ok, I won\'t enable all providers! I-I guess it was a mistake? I get it...');
      } break;

      case 'providers.events': {
        const message = await ctx.send(stripIndents`
          :pencil2: **| Are you sure you wanna enable all events for ${providers.length} providers?**
          > Type \`yes\` to enable all events for ${providers.length} providers avaliable.
          > Type \`no\` to opt-out of this menu you are s-seeing.

          You have a minute to decide, I-I'm doing this, so I won't do a-anything s-s-stupid...
        `);

        const collected = await ctx.collector.awaitMessage(m => m.author.id === ctx.author.id && ['yes', 'no'].includes(m.content), {
          channelID: ctx.channel.id,
          userID: ctx.author.id,
          timeout: 60
        });

        if (!collected.content) return message.edit('Got it, I won\'t enable all events for all providers. I guess y-you dont want me to be your m-m-messenger >//<');
        if (collected.content === 'yes') {
          const doc = {
            modifiedAt: Date.now(),
            'providers.picarto.events': 'all',
            'providers.youtube.events': 'all',
            'providers.twitch.events': 'all',
            'providers.mixer.events': 'all'
          };

          await this.bot.database.updateGuild(ctx.guild!.id, {
            $set: doc
          });

          return message.edit('Enabled all events.');
        }
        if (collected.content === 'no') return message.edit('Guess y-you mistyped? O-ok...');
      } break;

      case 'providers.picarto': {
        const message = await ctx.send(stripIndents`
          :pencil2: **| Are you sure you wanna enable the Picarto.tv providers?**
          > Type \`yes\` to enable the Picarto.tv provider
          > Type \`no\` to opt-out of this message.

          You have a minute to decide, I-I'm doing this, so I won't do a-anything s-s-stupid...
        `);

        const collector = await ctx.collector.awaitMessage(m => m.author.id === ctx.author.id && ['yes', 'no'].includes(m.content), {
          channelID: ctx.channel.id,
          userID: ctx.author.id,
          timeout: 60
        });

        if (!collector.content) return message.edit('You\'ve decided to opt-out due to no r-response.');
        if (collector.content === 'yes') {
          await this.bot.database.updateGuild(ctx.guild!.id, {
            $set: {
              'modifiedAt': Date.now(),
              'providers.picarto.enabled': true
            }
          });

          await message.delete();
          return ctx.send('I have e-enabled the Picarto.tv provider! To enable events, do `aoba settings enable provider.picarto.events`');
        }
        if (collector.content === 'no') return message.edit('O-ok, I won\'t enable the Picarto.tv provider! I-I guess it was a mistake? I get it...');
      } break;

      case 'providers.picarto.events': {
        const message = await ctx.send(stripIndents`
          :pencil2: **| Are you sure you wanna enable all events for the Picarto.tv provider?**
          > Type \`yes\` to enable all events for the Picarto.tv provider.
          > Type \`no\` to opt-out of this menu you are s-seeing.

          You have a minute to decide, I-I'm doing this, so I won't do a-anything s-s-stupid...
        `);

        const collected = await ctx.collector.awaitMessage(m => m.author.id === ctx.author.id && ['yes', 'no'].includes(m.content), {
          channelID: ctx.channel.id,
          userID: ctx.author.id,
          timeout: 60
        });

        if (!collected.content) return message.edit('Got it, I won\'t enable all events for the Picarto.tv providers. I guess y-you dont want me to be your m-m-messenger >//<');
        if (collected.content === 'yes') {
          const doc = {
            modifiedAt: Date.now(),
            'providers.picarto.events': 'all'
          };

          await this.bot.database.updateGuild(ctx.guild!.id, {
            $set: doc
          });

          return message.edit('Enabled all events for Picarto.tv');
        }
        if (collected.content === 'no') return message.edit('Guess y-you mistyped? O-ok...');
      } break;

      case 'providers.youtube': {
        const message = await ctx.send(stripIndents`
          :pencil2: **| Are you sure you wanna enable the YouTube provider?**
          > Type \`yes\` to enable the YouTube provider
          > Type \`no\` to opt-out of this message.

          You have a minute to decide, I-I'm doing this, so I won't do a-anything s-s-stupid...
        `);

        const collector = await ctx.collector.awaitMessage(m => m.author.id === ctx.author.id && ['yes', 'no'].includes(m.content), {
          channelID: ctx.channel.id,
          userID: ctx.author.id,
          timeout: 60
        });

        if (!collector.content) return message.edit('You\'ve decided to opt-out due to no r-response.');
        if (collector.content === 'yes') {
          await this.bot.database.updateGuild(ctx.guild!.id, {
            $set: {
              'modifiedAt': Date.now(),
              'providers.picarto.enabled': true
            }
          });

          await message.delete();
          return ctx.send('I have e-enabled the YouTube provider! To enable events, do `aoba settings enable provider.youtube.events`');
        }
        if (collector.content === 'no') return message.edit('O-ok, I won\'t enable the YouTube provider! I-I guess it was a mistake? I get it...');
      } break;

      case 'providers.youtube.events': {
        const message = await ctx.send(stripIndents`
          :pencil2: **| Are you sure you wanna enable all events for the YouTube provider?**
          > Type \`yes\` to enable all events for the YouTube provider.
          > Type \`no\` to opt-out of this menu you are s-seeing.

          You have a minute to decide, I-I'm doing this, so I won't do a-anything s-s-stupid...
        `);

        const collected = await ctx.collector.awaitMessage(m => m.author.id === ctx.author.id && ['yes', 'no'].includes(m.content), {
          channelID: ctx.channel.id,
          userID: ctx.author.id,
          timeout: 60
        });

        if (!collected.content) return message.edit('Got it, I won\'t enable all events for the YouTube providers. I guess y-you dont want me to be your m-m-messenger >//<');
        if (collected.content === 'yes') {
          const doc = {
            modifiedAt: Date.now(),
            'providers.youtube.events': 'all'
          };

          await this.bot.database.updateGuild(ctx.guild!.id, {
            $set: doc
          });

          return message.edit('Enabled all events for YouTube');
        }
        if (collected.content === 'no') return message.edit('Guess y-you mistyped? O-ok...');
      } break;

      case 'providers.twitch': {
        const message = await ctx.send(stripIndents`
          :pencil2: **| Are you sure you wanna enable the Twitch provider?**
          > Type \`yes\` to enable the Twitch provider
          > Type \`no\` to opt-out of this message.

          You have a minute to decide, I-I'm doing this, so I won't do a-anything s-s-stupid...
        `);

        const collector = await ctx.collector.awaitMessage(m => m.author.id === ctx.author.id && ['yes', 'no'].includes(m.content), {
          channelID: ctx.channel.id,
          userID: ctx.author.id,
          timeout: 60
        });

        if (!collector.content) return message.edit('You\'ve decided to opt-out due to no r-response.');
        if (collector.content === 'yes') {
          await this.bot.database.updateGuild(ctx.guild!.id, {
            $set: {
              'modifiedAt': Date.now(),
              'providers.twitch.enabled': true
            }
          });

          await message.delete();
          return ctx.send('I have e-enabled the Twitch provider! To enable events, do `aoba settings enable provider.twitch.events`');
        }
        if (collector.content === 'no') return message.edit('O-ok, I won\'t enable the Twitch provider! I-I guess it was a mistake? I get it...');
      } break;

      case 'providers.twitch.events': {
        const message = await ctx.send(stripIndents`
          :pencil2: **| Are you sure you wanna enable all events for the Twitch provider?**
          > Type \`yes\` to enable all events for the Twitch provider.
          > Type \`no\` to opt-out of this menu you are s-seeing.

          You have a minute to decide, I-I'm doing this, so I won't do a-anything s-s-stupid...
        `);

        const collected = await ctx.collector.awaitMessage(m => m.author.id === ctx.author.id && ['yes', 'no'].includes(m.content), {
          channelID: ctx.channel.id,
          userID: ctx.author.id,
          timeout: 60
        });

        if (!collected.content) return message.edit('Got it, I won\'t enable all events for the Mixer provider. I guess y-you dont want me to be your m-m-messenger >//<');
        if (collected.content === 'yes') {
          const doc = {
            modifiedAt: Date.now(),
            'providers.twitch.events': 'all'
          };

          await this.bot.database.updateGuild(ctx.guild!.id, {
            $set: doc
          });

          return message.edit('Enabled all events for Twitch');
        }
        if (collected.content === 'no') return message.edit('Guess y-you mistyped? O-ok...');
      } break;

      case 'providers.mixer': {
        const message = await ctx.send(stripIndents`
          :pencil2: **| Are you sure you wanna enable the Mixer provider?**
          > Type \`yes\` to enable the Mixer provider.
          > Type \`no\` to opt-out of this message.

          You have a minute to decide, I-I'm doing this, so I won't do a-anything s-s-stupid...
        `);

        const collector = await ctx.collector.awaitMessage(m => m.author.id === ctx.author.id && ['yes', 'no'].includes(m.content), {
          channelID: ctx.channel.id,
          userID: ctx.author.id,
          timeout: 60
        });

        if (!collector.content) return message.edit('You\'ve decided to opt-out due to no r-response.');
        if (collector.content === 'yes') {
          await this.bot.database.updateGuild(ctx.guild!.id, {
            $set: {
              'modifiedAt': Date.now(),
              'providers.mixer.enabled': true
            }
          });

          await message.delete();
          return ctx.send('I have e-enabled the Mixer provider! To enable events, do `aoba settings enable provider.mixer.events`');
        }
        if (collector.content === 'no') return message.edit('O-ok, I won\'t enable the Mixer provider! I-I guess it was a mistake? I get it...');
      } break;

      case 'providers.mixer.events': {
        const message = await ctx.send(stripIndents`
          :pencil2: **| Are you sure you wanna enable all events for the Mixer provider?**
          > Type \`yes\` to enable all events for the Mixer provider.
          > Type \`no\` to opt-out of this menu you are s-seeing.

          You have a minute to decide, I-I'm doing this, so I won't do a-anything s-s-stupid...
        `);

        const collected = await ctx.collector.awaitMessage(m => m.author.id === ctx.author.id && ['yes', 'no'].includes(m.content), {
          channelID: ctx.channel.id,
          userID: ctx.author.id,
          timeout: 60
        });

        if (!collected.content) return message.edit('Got it, I won\'t enable all events for the Mixer providers. I guess y-you dont want me to be your m-m-messenger >//<');
        if (collected.content === 'yes') {
          const doc = {
            modifiedAt: Date.now(),
            'providers.mixer.events': 'all'
          };

          await this.bot.database.updateGuild(ctx.guild!.id, {
            $set: doc
          });

          return message.edit('Enabled all events for Mixer');
        }
        if (collected.content === 'no') return message.edit('Guess y-you mistyped? O-ok...');
      } break;

      default: return ctx.send(key === undefined ? `No key was specified. (${allKeys.join(' | ')})` : `Invalid key "${key}"`);
    }
  }

  @Subcommand('disable', 'Disable providers or events to send')
  async disable(ctx: CommandContext) {
    const allKeys = [
      'providers',
      'providers.events',
      'providers.nintendo',
      'providers.picarto',
      'providers.picarto.events',
      'providers.youtube',
      'providers.youtube.events',
      'providers.twitch',
      'providers.twitch.events',
      'providers.mixer',
      'providers.mixer.events'
    ];

    const key = ctx.args.get(0);
    const providers = allKeys
      .filter(x => x !== 'providers')
      .map(x => x.endsWith('.events') ? x.slice(0, x.length - 7) : x)
      .filter((a, b) => 
        // This looks ugly but it works lol
        a === 'providers' ? false : ['providers.nintendo'].includes(a) ? true : allKeys.indexOf(a) === b
      );

    switch (key) {
      case 'providers': {
        const message = await ctx.send(stripIndents`
          :pencil2: **| Are you sure you wanna disable all providers?**
          > Type \`yes\` to disable ${providers.length} providers
          > Type \`no\` to opt-out of this message.

          You have a minute to decide, I-I'm doing this, so I won't do a-anything s-s-stupid...
        `);

        const collector = await ctx.collector.awaitMessage(m => m.author.id === ctx.author.id && ['yes', 'no'].includes(m.content), {
          channelID: ctx.channel.id,
          userID: ctx.author.id,
          timeout: 60
        });

        if (!collector.content) return message.edit('You\'ve decided to opt-out due to no r-response.');
        if (collector.content === 'yes') {
          await this.bot.database.updateGuild(ctx.guild!.id, {
            $set: {
              'modifiedAt': Date.now(),
              'providers.nintendo.enabled': false,
              'providers.picarto.enabled': false,
              'providers.youtube.enabled': false,
              'providers.twitch.enabled': false,
              'providers.mixer.enabled': false
            }
          });

          await message.delete();
          return ctx.send('I have d-disnabled all providers! To enable events, do `aoba settings enable provider.events`');
        }
        if (collector.content === 'no') return message.edit('O-ok, I won\'t enable all providers! I-I guess it was a mistake? I get it...');
      } break;

      case 'providers.events': {
        const message = await ctx.send(stripIndents`
          :pencil2: **| Are you sure you wanna disable all provider events?**
          > Type \`yes\` to disable all events for ${providers.length} providers avaliable.
          > Type \`no\` to opt-out of this menu you are s-seeing.

          You have a minute to decide, I-I'm doing this, so I won't do a-anything s-s-stupid...
        `);

        const collected = await ctx.collector.awaitMessage(m => m.author.id === ctx.author.id && ['yes', 'no'].includes(m.content), {
          channelID: ctx.channel.id,
          userID: ctx.author.id,
          timeout: 60
        });

        if (!collected.content) return message.edit('Got it, I won\'t disable all events for all providers. I guess y-you dont want me to be your m-m-messenger >//<');
        if (collected.content === 'yes') {
          const doc = {
            modifiedAt: Date.now(),
            'providers.picarto.events': [],
            'providers.youtube.events': [],
            'providers.twitch.events': [],
            'providers.mixer.events': []
          };

          await this.bot.database.updateGuild(ctx.guild!.id, {
            $set: doc
          });

          return message.edit('Disabled all events.');
        }
        if (collected.content === 'no') return message.edit('Guess y-you mistyped? O-ok...');
      } break;

      case 'providers.picarto': {
        const message = await ctx.send(stripIndents`
          :pencil2: **| Are you sure you wanna enable the Picarto.tv providers?**
          > Type \`yes\` to enable the Picarto.tv provider
          > Type \`no\` to opt-out of this message.

          You have a minute to decide, I-I'm doing this, so I won't do a-anything s-s-stupid...
        `);

        const collector = await ctx.collector.awaitMessage(m => m.author.id === ctx.author.id && ['yes', 'no'].includes(m.content), {
          channelID: ctx.channel.id,
          userID: ctx.author.id,
          timeout: 60
        });

        if (!collector.content) return message.edit('You\'ve decided to opt-out due to no r-response.');
        if (collector.content === 'yes') {
          await this.bot.database.updateGuild(ctx.guild!.id, {
            $set: {
              'modifiedAt': Date.now(),
              'providers.picarto.enabled': false
            }
          });

          await message.delete();
          return ctx.send('I have d-disabled the Picarto.tv provider.');
        }
        if (collector.content === 'no') return message.edit('O-ok, I won\'t disable the Picarto.tv provider! I-I guess it was a mistake? I get it...');
      } break;

      case 'providers.picarto.events': {
        const message = await ctx.send(stripIndents`
          :pencil2: **| Are you sure you wanna disable all events for the Picarto.tv provider?**
          > Type \`yes\` to enable all events for the Picarto.tv provider.
          > Type \`no\` to opt-out of this menu you are s-seeing.

          You have a minute to decide, I-I'm doing this, so I won't do a-anything s-s-stupid...
        `);

        const collected = await ctx.collector.awaitMessage(m => m.author.id === ctx.author.id && ['yes', 'no'].includes(m.content), {
          channelID: ctx.channel.id,
          userID: ctx.author.id,
          timeout: 60
        });

        if (!collected.content) return message.edit('Got it, I won\'t disable all events for the Picarto.tv provider. I guess y-you dont want me to be your m-m-messenger >//<');
        if (collected.content === 'yes') {
          const doc = {
            modifiedAt: Date.now(),
            'providers.picarto.events': []
          };

          await this.bot.database.updateGuild(ctx.guild!.id, {
            $set: doc
          });

          return message.edit('Disabled all events for Picarto.tv');
        }
        if (collected.content === 'no') return message.edit('Guess y-you mistyped? O-ok...');
      } break;

      case 'providers.youtube': {
        const message = await ctx.send(stripIndents`
          :pencil2: **| Are you sure you wanna disable the YouTube provider?**
          > Type \`yes\` to enable the YouTube provider
          > Type \`no\` to opt-out of this message.

          You have a minute to decide, I-I'm doing this, so I won't do a-anything s-s-stupid...
        `);

        const collector = await ctx.collector.awaitMessage(m => m.author.id === ctx.author.id && ['yes', 'no'].includes(m.content), {
          channelID: ctx.channel.id,
          userID: ctx.author.id,
          timeout: 60
        });

        if (!collector.content) return message.edit('You\'ve decided to opt-out due to no r-response.');
        if (collector.content === 'yes') {
          await this.bot.database.updateGuild(ctx.guild!.id, {
            $set: {
              'modifiedAt': Date.now(),
              'providers.youtube.enabled': false
            }
          });

          await message.delete();
          return ctx.send('I have d-disabled the YouTube provider.');
        }
        if (collector.content === 'no') return message.edit('O-ok, I won\'t disable the YouTube provider! I-I guess it was a mistake? I get it...');
      } break;

      case 'providers.youtube.events': {
        const message = await ctx.send(stripIndents`
          :pencil2: **| Are you sure you wanna disable all events for the YouTube provider?**
          > Type \`yes\` to enable all events for the YouTube provider.
          > Type \`no\` to opt-out of this menu you are s-seeing.

          You have a minute to decide, I-I'm doing this, so I won't do a-anything s-s-stupid...
        `);

        const collected = await ctx.collector.awaitMessage(m => m.author.id === ctx.author.id && ['yes', 'no'].includes(m.content), {
          channelID: ctx.channel.id,
          userID: ctx.author.id,
          timeout: 60
        });

        if (!collected.content) return message.edit('Got it, I won\'t disable all events for the YouTube providers. I guess y-you dont want me to be your m-m-messenger >//<');
        if (collected.content === 'yes') {
          const doc = {
            modifiedAt: Date.now(),
            'providers.youtube.events': []
          };

          await this.bot.database.updateGuild(ctx.guild!.id, {
            $set: doc
          });

          return message.edit('Disabled all events for YouTube');
        }
        if (collected.content === 'no') return message.edit('Guess y-you mistyped? O-ok...');
      } break;

      case 'providers.twitch': {
        const message = await ctx.send(stripIndents`
          :pencil2: **| Are you sure you wanna disable the Twitch provider?**
          > Type \`yes\` to enable the Twitch provider
          > Type \`no\` to opt-out of this message.

          You have a minute to decide, I-I'm doing this, so I won't do a-anything s-s-stupid...
        `);

        const collector = await ctx.collector.awaitMessage(m => m.author.id === ctx.author.id && ['yes', 'no'].includes(m.content), {
          channelID: ctx.channel.id,
          userID: ctx.author.id,
          timeout: 60
        });

        if (!collector.content) return message.edit('You\'ve decided to opt-out due to no r-response.');
        if (collector.content === 'yes') {
          await this.bot.database.updateGuild(ctx.guild!.id, {
            $set: {
              'modifiedAt': Date.now(),
              'providers.twitch.enabled': false
            }
          });

          await message.delete();
          return ctx.send('I have d-disabled the Twitch provider!');
        }
        if (collector.content === 'no') return message.edit('O-ok, I won\'t disable the Twitch provider! I-I guess it was a mistake? I get it...');
      } break;

      case 'providers.twitch.events': {
        const message = await ctx.send(stripIndents`
          :pencil2: **| Are you sure you wanna disable all events for the Twitch provider?**
          > Type \`yes\` to enable all events for the Twitch provider.
          > Type \`no\` to opt-out of this menu you are s-seeing.

          You have a minute to decide, I-I'm doing this, so I won't do a-anything s-s-stupid...
        `);

        const collected = await ctx.collector.awaitMessage(m => m.author.id === ctx.author.id && ['yes', 'no'].includes(m.content), {
          channelID: ctx.channel.id,
          userID: ctx.author.id,
          timeout: 60
        });

        if (!collected.content) return message.edit('Got it, I won\'t disable all events for the Mixer provider. I guess y-you dont want me to be your m-m-messenger >//<');
        if (collected.content === 'yes') {
          const doc = {
            modifiedAt: Date.now(),
            'providers.twitch.events': []
          };

          await this.bot.database.updateGuild(ctx.guild!.id, {
            $set: doc
          });

          return message.edit('Disabled all events for Twitch');
        }
        if (collected.content === 'no') return message.edit('Guess y-you mistyped? O-ok...');
      } break;

      case 'providers.mixer': {
        const message = await ctx.send(stripIndents`
          :pencil2: **| Are you sure you wanna disable the Mixer provider?**
          > Type \`yes\` to enable the Mixer provider.
          > Type \`no\` to opt-out of this message.

          You have a minute to decide, I-I'm doing this, so I won't do a-anything s-s-stupid...
        `);

        const collector = await ctx.collector.awaitMessage(m => m.author.id === ctx.author.id && ['yes', 'no'].includes(m.content), {
          channelID: ctx.channel.id,
          userID: ctx.author.id,
          timeout: 60
        });

        if (!collector.content) return message.edit('You\'ve decided to opt-out due to no r-response.');
        if (collector.content === 'yes') {
          await this.bot.database.updateGuild(ctx.guild!.id, {
            $set: {
              'modifiedAt': Date.now(),
              'providers.mixer.enabled': false
            }
          });

          await message.delete();
          return ctx.send('I have d-disabled the Mixer provider.');
        }
        if (collector.content === 'no') return message.edit('O-ok, I won\'t disable the Mixer provider! I-I guess it was a mistake? I get it...');
      } break;

      case 'providers.mixer.events': {
        const message = await ctx.send(stripIndents`
          :pencil2: **| Are you sure you wanna disable all events for the Mixer provider?**
          > Type \`yes\` to enable all events for the Mixer provider.
          > Type \`no\` to opt-out of this menu you are s-seeing.

          You have a minute to decide, I-I'm doing this, so I won't do a-anything s-s-stupid...
        `);

        const collected = await ctx.collector.awaitMessage(m => m.author.id === ctx.author.id && ['yes', 'no'].includes(m.content), {
          channelID: ctx.channel.id,
          userID: ctx.author.id,
          timeout: 60
        });

        if (!collected.content) return message.edit('Got it, I won\'t disable all events for the Mixer providers. I guess y-you dont want me to be your m-m-messenger >//<');
        if (collected.content === 'yes') {
          const doc = {
            modifiedAt: Date.now(),
            'providers.mixer.events': []
          };

          await this.bot.database.updateGuild(ctx.guild!.id, {
            $set: doc
          });

          return message.edit('Disabled all events for Mixer');
        }
        if (collected.content === 'no') return message.edit('Guess y-you mistyped? O-ok...');
      } break;

      default: return ctx.send(key === undefined ? `No key was specified. (${allKeys.join(' | ')})` : `Invalid key "${key}"`);
    }
  }

  @Subcommand('reset', 'Reset a key to it\'s initial value.')
  async reset(ctx: CommandContext) {
    const keys = [
      'providers.nintendo.channelID',
      'providers.picarto.channelID',
      'providers.picarto.channels',
      'providers.youtube.channelID',
      'providers.youtube.channels',
      'providers.twitch.channelID',
      'providers.twitch.channels',
      'providers.mixer.channelID',
      'providers.mixer.channels'
    ];

    const key = ctx.args.get(0);
    switch (key) {
      case 'providers.nintendo.channelID': {
        const message = await ctx.send(stripIndents`
          :pencil2: **| B-before I do anything, are you sure you do this?**
          > Type \`yes\` reset the channel.
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
              'providers.nintendo.channelID': null
            }
          });

          return message.edit('Resetted the channel to receive notifications from.');
        }
        if (collected.content === 'no') return message.edit(`O-ok **${ctx.author.username}**, I will not reset the channel`);
      } break;

      case 'providers.picarto.channelID': {
        const message = await ctx.send(stripIndents`
          :pencil2: **| B-before I do anything, are you sure you do this?**
          > Type \`yes\` to reset the channel.
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
              'providers.picarto.channelID': null
            }
          });

          return message.edit('Resetted the channel for the Picarto.tv provider.');
        }
        if (collected.content === 'no') return message.edit(`O-ok **${ctx.author.username}**, I will not reset the channel`);
      } break;

      case 'providers.picarto.channels': {
        const message = await ctx.send(stripIndents`
          :pencil2: **| B-before I do anything, are you sure you do this?**
          > Type \`yes\` remove all streamers that were previously added?
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
          const doc = {
            'modifiedAt': Date.now(),
            'providers.picarto.channels': []
          };

          await this.bot.database.updateGuild(ctx.guild!.id, {
            $set: doc
          });

          return message.edit('Resetted the channels to receive notifications from.');
        }
        if (collected.content === 'no') return message.edit(`O-ok **${ctx.author.username}**, I will not reset the channel`);
      } break;

      case 'providers.youtube.channelID': {
        const message = await ctx.send(stripIndents`
          :pencil2: **| B-before I do anything, are you sure you do this?**
          > Type \`yes\` to reset the channel.
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
              'providers.youtube.channelID': null
            }
          });

          return message.edit('Resetted the channel successfully.');
        }
        if (collected.content === 'no') return message.edit(`O-ok **${ctx.author.username}**, I will not reset the channel`);
      } break;

      case 'providers.youtube.channels': {
        const message = await ctx.send(stripIndents`
          :pencil2: **| B-before I do anything, are you sure you do this?**
          > Type \`yes\` to remove all channels for this provider.
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
          const doc = {
            'modifiedAt': Date.now(),
            'providers.youtube.channels': []
          };

          await this.bot.database.updateGuild(ctx.guild!.id, {
            $set: doc
          });

          return message.edit('Resetted all channels successfully.');
        }
        if (collected.content === 'no') return message.edit(`O-ok **${ctx.author.username}**, I will not reset the channel`);
      } break;

      case 'providers.twitch.channelID': {
        const message = await ctx.send(stripIndents`
          :pencil2: **| B-before I do anything, are you sure you do this?**
          > Type \`yes\` to reset the channel.
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
              'providers.twitch.channelID': null
            }
          });

          return message.edit('Resetted the channel successfully.');
        }
        if (collected.content === 'no') return message.edit(`O-ok **${ctx.author.username}**, I will not reset the channel`);
      } break;

      case 'providers.twitch.channels': {
        const message = await ctx.send(stripIndents`
          :pencil2: **| B-before I do anything, are you sure you do this?**
          > Type \`yes\` to remove all channels for this provider.
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
          const doc = {
            'modifiedAt': Date.now(),
            'providers.twitch.channels': []
          };

          await this.bot.database.updateGuild(ctx.guild!.id, {
            $set: doc
          });

          return message.edit('Resetted the channels successfully.');
        }
        if (collected.content === 'no') return message.edit(`O-ok **${ctx.author.username}**, I will not reset the channel`);
      } break;

      case 'providers.mixer.channelID': {
        const message = await ctx.send(stripIndents`
          :pencil2: **| B-before I do anything, are you sure you do this?**
          > Type \`yes\` to reset the channel.
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
              'providers.mixer.channelID': null
            }
          });

          return message.edit('Resetted the channel successfully.');
        }
        if (collected.content === 'no') return message.edit(`O-ok **${ctx.author.username}**, I will not reset the channel`);
      } break;

      case 'providers.mixer.channels': {
        const message = await ctx.send(stripIndents`
          :pencil2: **| B-before I do anything, are you sure you do this?**
          > Type \`yes\` to remove all channels for this provider.
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
          const doc = {
            'modifiedAt': Date.now(),
            'providers.mixer.channels': []
          };

          await this.bot.database.updateGuild(ctx.guild!.id, {
            $set: doc
          });

          return message.edit('Resetted the channel successfully.');
        }
        if (collected.content === 'no') return message.edit(`O-ok **${ctx.author.username}**, I will not reset the channel`);
      } break;

      default: return ctx.send(key === undefined ? `Missing key. (${keys.join(' | ')})` : `Invalid key **${key}** (${keys.join(' | ')})`);
    }
  }
}