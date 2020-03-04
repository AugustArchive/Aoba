import { Command, Cooldown, CommandContext } from '../../structures';
import { stripIndents } from 'common-tags';
import { inspect } from 'util';
import { Module } from '../../util/Constants';

export default class EvalCommand extends Command {
  constructor() {
    super({
      description: 'Evaluate arbitray JavaScript code',
      ownerOnly: true,
      aliases: ['ev', 'evl'],
      module: Module.Developer,
      usage: '<code>',
      name: 'eval'
    });
  }

  @Cooldown(6000)
  async run(ctx: CommandContext) {
    if (ctx.args.empty(0)) return ctx.send('What do you w-wanna evaluate?');

    const script = ctx.args.join(' ');
    const isAsync = (script.includes('return') || script.includes('await'));
    const started = Date.now();

    try {
      let result = eval(isAsync ? `(async()=>{${script}})()` : script);
      if ((result as any) instanceof Promise) result = await result;
      if (typeof result !== 'string') result = inspect(result, {
        depth: +!inspect(result, { depth: 1 }),
        showHidden: false
      });

      const res = this.cancelTokens(result);
      if (res.length > 1997) {
        const resp = await this.bot.http.get('https://hastebin.com/documents')
          .body(res, 'text')
          .execute();

        return ctx.send(`Result was too long. <https://hastebin.com/${resp.json().key}.js>`);
      }

      return ctx.send(stripIndents`
        > ***Took ${Date.now() - started}ms***
        \`\`\`js
        ${result}
        \`\`\`
      `);
    }
    catch(ex) {
      return ctx.send(stripIndents`
        > ***Took ${Date.now() - started}ms***
        \`\`\`js
        ${ex.message}
        ${ex.stack ? ex.stack.split('\n')[1] : ''}
        \`\`\`
      `);
    }
  }

  private cancelTokens(code: string) {
    const tokens = new RegExp([
      this.bot.config.cache.databaseUrl,
      this.bot.config.cache.discord.token,
      this.bot.config.cache.redis.host,
      this.bot.config.cache.webhooks.twitch.clientID,
      // @ts-ignore
      this.bot.twitch._options.client_id
    ].join('|'), 'gi');

    return code.replace(tokens, '--snip--');
  }
}