import { stringify } from 'querystring';
import { Constants } from '../../util';
import Response from './HttpResponse';
import { URL } from 'url';
import https from 'https';
import http from 'http';

export type HttpMethod = 'get' | 'post' | 'delete' | 'put' | 'patch' | 'trace' | 'connect' | 'options';
export interface HttpRequestOptions {
  timeout?: number;
  headers?: { [x: string]: any };
  data?: any;
}

export default class HttpRequest {
  /**
   * Variable to send data as
   */
  public sendDataAs?: 'json' | 'text' | 'buffer' | 'form' | string;

  /**
   * The request options
   */
  public options: HttpRequestOptions;

  /**
   * The method to use
   */
  public method: HttpMethod;

  /**
   * The request URL
   */
  public url: URL;

  /**
   * Creates a new Request instance
   * @param url The url to request to
   * @param method The method to use
   * @param options Any external options to use
   */
  constructor(url: string, method: HttpMethod, options: HttpRequestOptions) {
    if (typeof url !== 'string') throw new SyntaxError(`HttpRequest#url requires the URL to be a string, gotten ${typeof url}`);

    this.sendDataAs = options.data ? typeof options.data === 'string' ? 'text' : options.data instanceof Object ? 'json' : undefined : undefined;
    this.options = Object.assign<HttpRequestOptions, HttpRequestOptions>({
      headers: {},
      timeout: 30000,
      data: null
    }, options);
    this.method = method;
    this.url = new URL(url);
  }

  /**
   * Sends a body payload to the server
   * @param data The data to send
   * @param sendDataAs Variable to represent the data as
   * @returns The request instance for chaining methods
   */
  body(data: any, sendDataAs?: 'json' | 'text' | 'form' | 'buffer') {
    this.options.data = sendDataAs === 'form' ? stringify(data) : typeof data === 'string' ? data : data instanceof Object && !Buffer.isBuffer(data) ? JSON.stringify(data) : data instanceof Buffer ? data.toString() : undefined;
    this.sendDataAs = sendDataAs ? sendDataAs.toLowerCase() : typeof data === 'string' ? 'text' : !Buffer.isBuffer(data) ? 'json' : undefined;
  
    return this;
  }

  /**
   * Sends a header to the server
   * @param name The header name
   * @param value The header value
   * @returns The request instance for chaining methods
   */
  header(name: string, value: string): this;

  /**
   * Sends a header to the server
   * @param name A list of headers as an Object
   * @returns The request instance for chaining methods
   */
  header(name: { [x: string]: string; }): this;
  header(name: string | { [x: string]: string; }, value?: string) {
    // Add the header object if not in the options object
    if (!this.options.headers) this.options.headers = {};

    if (name instanceof Object) {
      for (const key of Object.keys(name)) {
        this.options.headers![key] = name[key];
      }
    }
    else {
      this.options.headers![name] = value!;
    }

    return this;
  }

  /**
   * Adds a timeout to abort the request if something went wrong
   * @param ms The amount of milliseconds to abort the request
   */
  timeout(ms: number = 30000) {
    this.options.timeout = ms;
    return this;
  }

  /**
   * Appends a query to the URL
   * @param name The object of all the queries to supply
   */
  query(name: { [x: string]: string; }): this;

  /**
   * Appends a query to the URL
   * @param name The query name
   * @param value The query value
   */
  query(name: string, value: string): this;
  query(name: string | { [x: string]: string; }, value? :string) {
    if (name instanceof Object) {
      for (const queryName of Object.keys(name)) {
        this.url.searchParams.append(queryName, name[queryName]);
      }
    }
    else {
      this.url.searchParams.append((name as string), value!);
    }

    return this;
  }

  /**
   * Sends the request to the server and returns a Response instance
   */
  execute() {
    return new Promise<Response>((resolve, reject) => {
      if (!this.options.headers!['User-Agent']) this.options.headers!['User-Agent'] = `Aoba/DiscordBot (v${Constants.version}, https://github.com/nowoel/Aoba)`;
      if (this.options.data) {
        if (
          this.sendDataAs === 'json' ||
          this.options.data instanceof Object &&
          !this.options.headers!['content-type']
        ) this.options.headers!['content-type'] = 'application/json';

        if (this.sendDataAs === 'form') {
          if (!this.options.headers!['content-type']) this.options.headers!['content-type'] = 'application/x-www-form-urlencoded';
          if (!this.options.headers!['content-length']) this.options.headers!['content-length'] = Buffer.byteLength(this.options.data);
        }
      }

      const request = this.url.protocol === 'https:' ? https.request : http.request;
      const options = {
        protocol: this.url.protocol,
        headers: this.options.headers!,
        method: this.method.toUpperCase(),
        path: `${this.url.pathname}${this.url.search}`,
        port: this.url.port,
        host: this.url.host
      };

      const onRequest = (core: http.IncomingMessage) => {
        const res = new Response(core);
        core
          .on('data', chunk => res.addChunk(chunk))
          .on('error', error => reject(error))
          .on('end', () => resolve(res));
      };

      const req = request(options, onRequest);
      if (this.options.timeout) req.setTimeout(this.options.timeout, () => {
        req.abort();
        reject(new Error('Request was aborted due to reaching the timeout threshold'));
      });

      if (this.options.data) {
        if (this.sendDataAs === 'json') req.write(JSON.stringify(this.options.data));
        else if (this.options.data instanceof Object) req.write(JSON.stringify(this.options.data));
        else req.write(this.options.data);
      }

      req.end();
    });
  }
}