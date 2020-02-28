/**
 * Gets the latest version of Aoba
 */
export const version: string = require('../../package.json').version;

/**
 * Gets the support server URL
 */
export const server: string = 'https://discord.gg/yDnbEDH';

/**
 * Enum of all modules avaliable
 */
export enum Module {
  Settings = 'Settings',
  Search = 'Search',
  Other = 'other',
  Core = 'Core',
  Docs = 'Documentation'
}

/**
 * Enum of all documentation sites' APIs
 * 
 * Avaliable sites:
 * 
 * - discord.js.org
 */
export enum DocSites {
  DiscordJS = 'https://djsdocs.sorta.moe/v2/embed?${query}'
}