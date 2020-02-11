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
  Settings = 'settings',
  Search = 'search',
  Core = 'core',
  Docs = 'documentation'
}

/**
 * Enum of all of Aoba's permission nodes
 */
export enum AobaPermissions {
  UseModuleSettings = 'use.module.settings',
  useModuleSearch = 'use.module.search',
  UseModuleCore = 'use.module.core',
  UseModuleDocs = 'use.module.docs',
  UseAllModules = 'use.module.*'
}

/**
 * Enum of all Discord permissions
 */
export enum DiscordPermissions {

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