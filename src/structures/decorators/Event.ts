/**
 * The symbol to inject a list of events to the target listener
 */
const EventSymbol = Symbol('$events');
export interface EventDefinition {
  /**
   * The execution function, to run the event when pushed to the emitter
   * @param args The arguments to use when executing
   */
  exec(...args: any[]): Promise<void>;

  /**
   * The event name to use
   */
  event: string;
}

/**
 * Function to receive all of the events from the target listener
 * @param target The target listener
 */
export function getEventDefinitions(target: any): EventDefinition[] {
  if (target.constructor == null) return [];

  const definitions = target.constructor[EventSymbol];
  if (!Array.isArray(definitions)) return [];

  return definitions;
}

/**
 * Decorator to push the event into the emitter when the manager is
 * registering it
 * 
 * @param event The event name
 * @returns Factory function to emit the function when the emitter calls it
 */
export function Event(event: string): MethodDecorator {
  return (target: any, key: string | symbol, descriptor: TypedPropertyDescriptor<any>) => {
    const prop = String(key);

    if (target.prototype !== undefined) throw new SyntaxError(`All event definition functions cannot be static (${target.name}#${prop})`);
    if (!target.constructor[EventSymbol]) target.constructor[EventSymbol] = [];

    (target.constructor[EventSymbol] as EventDefinition[]).push({
      exec: descriptor.value,
      event
    });
  };
}