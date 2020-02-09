import { ArgumentInfo } from '../internals';

/**
 * The symbol for all of the arguments
 */
const ArgumentSymbol = Symbol('$args');

/**
 * Gets the arguments from the target class
 * @param target The target to find the arguments
 * @returns An array of all of the arguments
 */
export function getArguments(target: any): ArgumentInfo[] {
  if (target.constructor == null) return [];

  const args = target.constructor[ArgumentSymbol];
  if (!Array.isArray(args)) return [];

  return args;
}

/**
 * Creates a new instance of the `$args` symbol from the target command
 * @param args A list of arguments to list
 * @returns A factory function to render the argument list
 */
export function Arguments(...args: ArgumentInfo[]): MethodDecorator {
  return (target: any, key: string | symbol) => {
    const property = String(key);

    if (target.prototype !== undefined) throw new SyntaxError(`Cannot publish arguments in the ${target.name} class due to the function being static`);
    if (property !== 'execute') throw new SyntaxError(`You must add to the argument list in the ${target.constructor.name} class' "execute" function`);

    if (!target.constructor[ArgumentSymbol]) target.constructor[ArgumentSymbol] = [];
    (target.constructor[ArgumentSymbol] as ArgumentInfo[]).push(...args);
  };
}