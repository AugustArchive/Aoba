import { Aoba, Logger, Task } from '..';
import { promises as fs } from 'fs';
import { Collection } from '@augu/immutable';
import * as utils from '../../util';

export default class TaskManager extends Collection<Task> {
  /**
   * The logger instance
   */
  private logger: Logger;

  /**
   * The path to all tasks
   */
  public path: string;

  /**
   * The bot instance itself
   */
  public bot: Aoba;

  /**
   * Creates a new instance of the Task manager
   * @param bot The bot instance
   */
  constructor(bot: Aoba) {
    super();

    this.logger = new Logger();
    this.path = utils.getArbitrayPath('tasks');
    this.bot = bot;
  }

  async configure() {
    this.logger.info('Now building all tasks...');

    const files = await fs.readdir(this.path);
    this.logger.info(`Found ${files.length} tasks!`);
    for (const file of files) {
      const instance = await import(utils.getArbitrayPath('tasks', file));
      const task: Task = instance.default ? new instance.default() : new instance();

      task.inject(this.bot);
      this.set(task.info.name, task);
      this.logger.info(`Built task ${task.info.name}!`);
    }
  }
}