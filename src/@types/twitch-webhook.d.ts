// TypeScript type definitions for project: twitch-webhooks
// Project: https://github.com/true-dubach/node-twitch-webhook
// Definitions by:
//    - Noel <augu@voided.pw>
import { ServerResponse, Server } from 'http';
import { EventEmitter } from 'events';

declare class TwitchWebhook extends EventEmitter {
  private _subscriptions: { [x: string]: any };
  private _apiPathname: string;
  private _options: WebhookOptions;
  private _apiUrl: string;
  private _hubUrl: string;
  private _server: Server;
  public isListening(): boolean;
  public listen(...args: any[]): Promise<void>;
  public close(): Promise<void>;
  public errors: {
    FatalError: FatalError;
    WebhookError: WebhookError;
    RequestDenied: RequestDenied;
    BaseError: Error;
  };
}

declare class FatalError extends Error {}
declare class WebhookError extends Error {}
declare class RequestDenied extends Error {
  public response: ServerResponse;
}

interface WebhookOptions {
  lease_seconds?: number;
  baseApiUrl?: string;
  client_id: string;
  callback: string;
  secret?: boolean;
  listen?: boolean | {
    autoStart?: boolean;
    host?: string;
    port?: number;
    https?: boolean;
  };
}

export = TwitchWebhook;