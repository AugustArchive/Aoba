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
 * @param paths A list of paths to include
 */
export const getArbitrayPath = (...paths: string[]) => `${process.cwd()}${sep}${paths.join(sep)}`;

// Export the constants as a "namespace"
export { Constants };
export * from './PermissionUtil';