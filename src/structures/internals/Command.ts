import { Aoba, CommandContext } from '.';
import { Constants } from '../../util';

interface CommandInfo {
  /**
   * A list of user permissions to use this command
   */
  userPermissions?: string[];

  /**
   * A list of the bot (Aoba)'s permissions to use this command
   */
  botPermissions?: string[];

  /**
   * The command's description
   */
  description: string;

  /**
   * If the command should be ran in a guild
   */
  guildOnly?: boolean;

  /**
   * If the command should be ran by the owners
   */
  ownerOnly?: boolean;

  /**
   * If the command is disabled
   */
  disabled?: CommandDisabled;

  /**
   * Any other names for the command
   */
  aliases?: string[];

  /**
   * The module name
   */
  module: Constants.Module;

  /**
   * The usage of the command (use Command#signature to get the full format)
   */
  usage?: string;

  /**
   * The command's name
   */
  name: string;
}

interface CommandDisabled {
  /**
   * A reason the command is disabled
   */
  reason: string;

  /**
   * If it should be disabled
   */
  is: boolean;
}

export abstract class Command {
  /**
   * The information used for the command
   */
  public info: CommandInfo;

  /**
   * The bot instance itself
   */
  public bot!: Aoba;

  /**
   * Creates a new Command instance
   * @param info The information
   */
  constructor(info: CommandInfo) {
    this.info = info;
  }

  /**
   * Injects the bot instance to the command
   */
  inject(bot: Aoba) {
    this.bot = bot;
  }

  /**
   * The command's signature
   */
  get signature() {
    const prefix = this.bot.config.getPrefixes();
    return this.info.usage !== '' ? `${prefix[0]}${this.info.name} ${this.info.usage}` : `${prefix[0]}${this.info.name}`;
  }

  /**
   * Runs the command
   * @param ctx The command context
   */
  public abstract run(ctx: CommandContext): Promise<void>;
}