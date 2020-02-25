import { CommandContext, Command } from '../../structures';
import { stripIndents } from 'common-tags';
import { Constants } from '../../util';
import sys from '@augu/sysinfo';

export default class DebugCommand extends Command {
  constructor() {
    super({
      description: 'Shows useless information for debugging purposes',
      ownerOnly: true,
      module: Constants.Module.Core,
      name: 'debug'
    });
  }

  async run(ctx: CommandContext) {
    const cpus = sys.getCPUCount();
    const cpuInfo = sys.getCPUInfo();
    const cpuUsage = sys.getCPUUsage();
    const platform = sys.getPlatform();

    let workstation: sys.Workstation | null = null;
    let services: string[] = [];
    if (platform === 'Windows') {
      workstation = sys.getWindowsWorkstation();
      services = sys.getWindowsServices();
    }

    const embed = this.bot.getEmbed()
      .setTitle('Debug Panel')
      .setDescription(stripIndents`
        \`\`\`prolog
          CPU Count ${workstation !== null ? '   ' : ' '}=> ${cpus}
          CPU Info  ${workstation !== null ? '   ' : ' '}=> ${cpuInfo.firstModel}
          CPU Usage ${workstation !== null ? '   ' : ' '}=> ${cpuUsage}%
          Platform  ${workstation !== null ? '   ' : ' '}=> ${platform}
          ${workstation !== null ? `Desktop Name => ${workstation.desktopName} (${workstation.since})` : ''}
          ${services.length ? `Services     => ${services.length} Running` : ''}
        \`\`\`
      `);

    return void ctx.embed(embed);
  }
}
