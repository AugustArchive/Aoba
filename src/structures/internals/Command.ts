import { Aoba, CommandContext, SubcommandDefinition } from '..';
import { Collection } from '@augu/immutable';
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

interface CommandStatic {
  [x: string]: any;
}

export abstract class Command {
  /**
   * A list of user permissions to use this command
   */
  public userPermissions: string[];

  /**
   * A list of the bot (Aoba)'s permissions to use this command
   */
  public botPermissions: string[];

  /**
   * A list of avaliable subcommands from the `Subcommand` decorator
   */
  public subcommands: Collection<SubcommandDefinition>;

  /**
   * The command's description
   */
  public description: string;

  /**
   * If the command should be ran in a guild
   */
  public guildOnly: boolean;

  /**
   * If the command should be ran by the owners
   */
  public ownerOnly: boolean;

  /**
   * If the command is disabled
   */
  public disabled: CommandDisabled;

  /**
   * Any other names for the command
   */
  public aliases: string[];

  /**
   * The module name
   */
  public module: Constants.Module;

  /**
   * The usage of the command (use Command#signature to get the full format)
   */
  public usage: string;

  /**
   * The command's name
   */
  public name: string;

  /**
   * The bot instance itself
   */
  public bot!: Aoba;

  /**
   * Creates a new Command instance
   * @param info The information
   */
  constructor(info: CommandInfo) {
    this.userPermissions = info.userPermissions || [];
    this.botPermissions = info.botPermissions || [];
    this.subcommands = new Collection();
    this.description = info.description;
    this.guildOnly = info.guildOnly || false;
    this.ownerOnly = info.ownerOnly || false;
    this.disabled = info.disabled || { is: false, reason: 'No reason provided.' };
    this.aliases = info.aliases || [];
    this.module = info.module;
    this.usage = info.usage || '';
    this.name = info.name;
  }

  /**
   * Injects the bot instance to the command
   */
  inject(bot: Aoba) {
    this.bot = bot;
    Object.freeze(this.static); // Make the "static" object immutable when the bot instance is injected
  }

  /**
   * The command's signature
   */
  get signature() {
    return this.usage === '' ? `aoba ${this.name} ${this.usage}` : `aoba ${this.name} ${this.usage}`;
  }

  /** Returns an immutable object */
  get static(): CommandStatic {
    return {};
  }

  /**
   * Runs the command
   * @param ctx The command context
   */
  public abstract run(ctx: CommandContext): Promise<any>;
}