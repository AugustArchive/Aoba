import { Command } from '..';

interface CommandUsage {
  [command: string]: number;
}

export default class CommandStatisticsManager {
  public commandsExecuted: number = 0;
  public commandUsages: CommandUsage = {};
  public messagesSeen: number = 0;

  /**
   * Increments the amount of commands that were executed
   */
  inc(cmd: Command) {
    if (!this.commandUsages.hasOwnProperty(cmd.info.name)) this.commandUsages[cmd.info.name] = 0;

    this.commandsExecuted++;
    this.commandUsages[cmd.info.name]++;
  }
}