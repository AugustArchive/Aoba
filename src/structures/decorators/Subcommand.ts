import { CommandContext } from '..';

/**
 * The subcommand symbol
 */
export const SubcommandSymbol = Symbol('$subcommands');
export interface SubcommandDefinition {
  /**
   * The subcommand's description
   */
  description: string;

  /**
   * The subcommand's target parent
   */
  parent: any;

  /**
   * The execution function
   */
  exec(ctx: CommandContext): Promise<void>;

  /**
   * The subcommand's name
   */
  name: string;
}

/**
 * Function to receive all of the events from the target listener
 * @param target The target listener
 */
export function getSubcommandDefinitions(target: any): SubcommandDefinition[] {
  if (target.constructor == null) return [];

  const definitions = target.constructor[SubcommandSymbol];
  if (!Array.isArray(definitions)) return [];

  return definitions;
}

/**
 * Decorator to push the subcommand into the command's target class
 * @param name The subcommand's name
 * @param desc The description of the subcommand
 * @returns Factory function to emit the function when command is called
 */
export function Subcommand(name: string, desc: string) {
  return (target: any, prop: string | symbol, descriptor: TypedPropertyDescriptor<any>) => {
    const property = String(prop);

    if (target.prototype !== undefined) throw new SyntaxError(`All subcommand definition functions cannot be static (${target.name}#${property})`);
    if (!target.constructor[SubcommandSymbol]) target.constructor[SubcommandSymbol] = [];

    (target.constructor[SubcommandSymbol] as SubcommandDefinition[]).push({
      description: desc,
      parent: target,
      name,
      exec: descriptor.value
    });
  };
}