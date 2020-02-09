import HttpRequest, { HttpRequestOptions, HttpMethod } from './HttpRequest';

export class HttpClient {
  get(url: string, options: HttpRequestOptions = {}) {
    return new HttpRequest(url, 'get', options);
  }

  put(url: string, options: HttpRequestOptions = {}) {
    return new HttpRequest(url, 'put', options);
  }

  post(url: string, options: HttpRequestOptions = {}) {
    return new HttpRequest(url, 'post', options);
  }

  delete(url: string, options: HttpRequestOptions = {}) {
    return new HttpRequest(url, 'delete', options);
  }

  trace(url: string, options: HttpRequestOptions = {}) {
    return new HttpRequest(url, 'trace', options);
  }

  connect(url: string, options: HttpRequestOptions = {}) {
    return new HttpRequest(url, 'connect', options);
  }

  options(url: string, options: HttpRequestOptions = {}) { 
    return new HttpRequest(url, 'options', options);
  }
}