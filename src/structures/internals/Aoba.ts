import { Client as DiscordClient } from 'eris';

export interface Config {
  databaseUrl: string;
  environment: 'development' | 'production';
  discord: {
    prefixes: string[];
    token: string;
  };
  redis: {
    host: string;
    port: number;
    db: number;
  };
  keys: {
    youtube: string;
    twitch: string;
    mixer: string;
  };
}
export class Aoba {
  
}