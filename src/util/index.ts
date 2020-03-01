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

/**
 * Humanizes milliseconds to a uptime string
 * @param ms The amount of milliseconds to convert
 */
export function humanize(ms: number) {
  const weeks = Math.floor(ms / 1000 / 60 / 60 / 24 / 7);
  ms -= weeks * 1000 * 60 * 60 * 24 * 7;

  const days = Math.floor(ms / 1000 / 60 / 60 / 24);
  ms -= days * 1000 * 60 * 60 * 24;

  const hours = Math.floor(ms / 1000 / 60 / 60);
  ms -= hours * 1000 * 60 * 60;

  const mins = Math.floor(ms / 1000 / 60);
  ms -= mins * 1000 * 60;

  const sec = Math.floor(ms / 1000);

  let humanized = '';
  if (weeks > 0) humanized += `${weeks}w`;
  if (days > 0) humanized += `${days}d`;
  if (hours > 0) humanized += `${hours}h`;
  if (mins > 0) humanized += `${mins}m`;
  if (sec > 0) humanized += `${sec}s`;

  return humanized;
}

// Export the constants as a "namespace"
export { Constants };
export * from './PermissionUtil';
export * from './dateformat';