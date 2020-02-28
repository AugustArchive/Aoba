import { CommandContext, Command, Cooldown } from '../../structures';
import { stripIndents } from 'common-tags';
import { dateformat } from '../../util';
import { Module } from '../../util/Constants';

interface GitHubCommit {
  sha: string;
  node_id: string;
  commit: CommitBase;
}

interface CommitBase {
  author: Author;
  committer: Author;
  message: string;
  tree: CommitTree;
  url: string;
  comment_count: number;
  verification: {
    verified: boolean;
    reason: string;
    signature: string;
    payload: string;
  }
}

interface Author {
  email: string;
  date: string;
  name: string;
}

interface CommitTree {
  url: string;
  sha: string;
}

export default class SourceCommand extends Command {
  constructor() {
    super({
      description: 'Grabs the current commits from the GitHub repository',
      aliases: ['commits', 'sauce'],
      module: Module.Core,
      name: 'source'
    });
  }

  @Cooldown(5000)
  async run(ctx: CommandContext) {
    const res = await this.bot.http.get('https://api.github.com/repos/nowoel/Aoba/commits').execute();

    try {
      const all = res.json<GitHubCommit[]>();
      const data = all.slice(0, 5);

      const commits = data
        .map(commit => `[\`${commit.sha.slice(0, 7)}\`](https://github.com/nowoel/Aoba/commit/${commit.sha}) **=>** ${commit.commit.message} (${commit.commit.author.name} at ${dateformat(new Date(commit.commit.author.date)).parse('mm/dd/yyyy hh:MM:ss TT')})`)
        .join('\n');

      const embed = this.bot.getEmbed()
        .setTitle('GitHub Commits')
        .setDescription(stripIndents`
          **Do you wanna contribute t-to my source code?**
          <https://github.com/nowoel/Aoba>

          ${commits}
        `);

      return ctx.embed(embed);
    }
    catch(ex) {
      const error = ex.stack ? ex.stack.split('\n')[0] : ex.message;
      this.bot.logger.error('Unable to run the `source` command', ex);
      return ctx.send(`I'm so sorry **${ctx.author.username}**, I h-have disappointed you... (\`${error}\`)`);
    }
  }
}