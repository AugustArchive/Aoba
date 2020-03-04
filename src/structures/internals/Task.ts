import { Aoba } from '.';

interface TaskMetadata {
  /**
   * The amount of milliseconds to run the task for
   */
  interval: number;

  /**
   * The name of the task
   */
  name: string;
}

export abstract class Task {
  /**
   * The metadata provided
   */
  public info: TaskMetadata;

  /**
   * The bot instance itself
   */
  public bot!: Aoba;

  /**
   * Creates a new Task instance
   * @param bot The bot instance
   * @param info The metadata
   */
  constructor(info: TaskMetadata) {
    this.info = info;
  }

  /**
   * Runs the task when the interval timeout is reached
   */
  public abstract run(): Promise<void>;

  inject(bot: Aoba) {
    this.bot = bot;
  }
}