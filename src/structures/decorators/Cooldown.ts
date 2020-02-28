/** Symbol to get the cooldown from */
const CooldownSymbol = Symbol('$cooldown');

/**
 * Function to fetch the amount of milliseconds set,
 * if there is none set, it'll default to `5000` (5 seconds)
 * @param target The parent class to fetch from
 */
export function getCooldownDefinitions(target: any): number {
  if (target.constructor == null) return 5000;

  const amount = target.constructor[CooldownSymbol];
  if (isNaN(amount)) return 5000;

  return amount;
}

/**
 * Adds a cooldown to the user executing the command
 * @param amount The amount of [milli]seconds to run the command
 */
export function Cooldown(amount: number): MethodDecorator {
  // Check if the amount is under 1000, then multiply it by 1000
  const cooldown = amount < 1000 ? amount * 1000 : amount;

  // Factory function to run this when the command is called
  return (target: any, prop: string | symbol) => {
    const property = String(prop);
    
    if (property !== 'run') throw new SyntaxError('All cooldown definitions must be in the "run" function');
    if (target.prototype !== undefined) throw new SyntaxError(`All cooldown definition functions cannot be static (${target.name}#${property})`);
    if (target.constructor[CooldownSymbol]) throw new SyntaxError(`Cooldown definition is already set in the parent class (${target.name}#${property})`);
    target.constructor[CooldownSymbol] = cooldown;
  };
}