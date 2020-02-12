import { Browser } from 'puppeteer';

/**
 * A function to retrieve information with `this` being the Chromium instance
 */
export type DocumentationFunction<T> = (this: Browser, url: string) => Promise<T>;

// Export all documentation
export * from './DiscordJS';