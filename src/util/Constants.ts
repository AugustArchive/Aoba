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
  Developer = 'Developer',
  Settings = 'Settings',
  Other = 'Other',
  Core = 'Core'
}