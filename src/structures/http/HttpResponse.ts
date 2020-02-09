import { IncomingMessage, IncomingHttpHeaders, STATUS_CODES } from 'http';

export default class HttpResponse {
  /**
   * The core instance (which can be represented as a Stream)
   */
  private core: IncomingMessage;

  /**
   * The body as a Buffer
   */
  private body: Buffer;

  /**
   * Creates a new instance of the response class
   * @param core The core instance
   */
  constructor(core: IncomingMessage) {
    this.core = core;
    this.body = Buffer.alloc(0);
  }

  /**
   * The status code of the request
   */
  get statusCode() {
    return this.core.statusCode || 200;
  }

  /**
   * Gets the message from the corresponding status code
   */
  get statusCodeText() {
    return STATUS_CODES[this.statusCode]!;
  }

  /**
   * If the response was a success or not
   */
  get success() {
    return this.statusCode >= 200 || this.statusCode > 300;
  }

  /**
   * Adds a chunk to the body
   * @param chunk The chunk to add
   */
  addChunk(chunk: any) {
    this.body = Buffer.concat([this.body, chunk]);
  } 

  /**
   * Represents the body as a JSON value
   */
  json() {
    return JSON.parse(this.body.toString());
  }

  /**
   * Represents the body as a string
   */
  text() {
    return this.body.toString();
  }

  /**
   * Represents the body as a Stream
   */
  stream() {
    return this.core; // Yes this is a extended Stream instance
  }
}