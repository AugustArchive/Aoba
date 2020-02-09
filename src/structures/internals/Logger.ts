import { inspect } from 'util';
import leeks from 'leeks.js';

type LogMessage = (string | object)[];
enum LogLevel {
  INFO,
  WARN,
  ERROR,
  DISCORD,
  DATABASE
}

const MONTHS: { [x: number]: string } = {
  0: 'Jan',
  1: 'Feb',
  2: 'Mar',
  3: 'Apr',
  4: 'May',
  5: 'Jun',
  6: 'Jul',
  7: 'Aug',
  8: 'Sept',
  9: 'Oct',
  10: 'Nov',
  11: 'Dec'
};

export class Logger {
  /**
   * The colors from leeks.js
   */
  public colors: typeof leeks.colors = leeks.colors;

  /**
   * Gets the current date
   */
  private getCurrentDate() {
    const now = new Date();

    const hours = `0${now.getHours()}`.slice(-2);
    const minutes = `0${now.getMinutes()}`.slice(-2);
    const seconds = `0${now.getSeconds()}`.slice(-2);
    const ampm = now.getHours() >= 12 ? 'PM' : 'AM';
    const month = MONTHS[now.getMonth()];
    const day = now.getDate();
    const year = now.getFullYear();

    // Example: Feb 9, 2020 at 15:01:45PM
    return this.colors.gray(`${month} ${day}, ${year} at ${hours}:${minutes}:${seconds}${ampm}`);
  }

  /**
   * Prints a message to the console
   * @param level The level to use
   * @param message The message content to send
   */
  private write(level: LogLevel, ...message: LogMessage) {
    let lvlText!: string;

    switch (level) {
      case LogLevel.INFO: {
        lvlText = this.colors.cyan(`INFO/${process.pid}`);
      } break;

      case LogLevel.WARN: {
        lvlText = this.colors.yellow(`WARN/${process.pid}`);
      } break;

      case LogLevel.ERROR: {
        lvlText = this.colors.red(`ERROR/${process.pid}`);
      } break;

      case LogLevel.DISCORD: {
        lvlText = leeks.hex('#', `DISCORD/${process.pid}`);
      } break;

      case LogLevel.DATABASE: {
        lvlText = leeks.hex('#', `DATABASE/${process.pid}`);
      } break;
    }

    const date = this.getCurrentDate();
    const msg = message.map(m => m instanceof Object ? inspect(m) : m);

    process.stdout.write(`${date} ${lvlText} => ${msg}\n`);
  }

  info(message: LogMessage) {
    return this.write(LogLevel.INFO, ...message);
  }

  warn(message: LogMessage) {
    return this.write(LogLevel.WARN, ...message);
  }

  error(message: LogMessage) {
    return this.write(LogLevel.ERROR, ...message);
  }

  discord(message: LogMessage) {
    return this.write(LogLevel.DISCORD, ...message);
  }

  database(message: LogMessage) {
    return this.write(LogLevel.DATABASE, ...message);
  }
}