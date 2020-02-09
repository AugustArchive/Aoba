import * as Constants from './Constants';

/**
 * Path seperator for the coressponding systems
 */
export const sep = process.platform === 'win32' ? '\\' : '/';

/**
 * Checker to see if a String includes `${}`
 * @param str The string to check
 */
export function includesMarker(str: string) {
  const regex = new RegExp('\\${(.*?)\\}');
  return regex.test(str);
}

/**
 * Gets a path from the current directory
 * @param path The path to append
 */
export const getArbitrayPath = (path: string) => `${process.cwd()}${sep}${path}`;

// Export the constants as a "namespace"
export { Constants };