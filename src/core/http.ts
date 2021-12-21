import { ResponseBase } from 'src/types/base';
import 'whatwg-fetch';
import { stringify } from './index';

/**
 * Authorization: 格式为`Bearer ${鉴权token}`
 */
export interface HttpHeaders {
  Accept?: string;
  'Content-Type'?: string;
  Authorization?: string;
}

export interface HttpDefaults {
  headers: HttpHeaders;
  host: string;
  uploadPartDomain: string;
  service: string;
}

/**
 * 统一封装 http 请求
 * ts 类型声明还有待优化
 */
export class HttpClient {
  protected defaults: HttpDefaults = {
    uploadPartDomain: '',
    host: '',
    service: '',
    headers: {
      Accept: 'application/json, text/plain, */*',
      Authorization: '',
    }
  };

  get<T>(url: string, body?: any, headers?: HttpHeaders): Promise<T> {
    return this.request(url, 'GET', body || null, headers);
  }

  post<T>(url: string, body?: any, headers?: HttpHeaders): Promise<T> {
    return this.request(url, 'POST', body || null, headers);
  }

  put<T>(url: string, body?: any, headers?: HttpHeaders): Promise<T> {
    return this.request(url, 'PUT', body || null, headers);
  }

  delete<T>(url: string, headers?: HttpHeaders): Promise<T> {
    return this.request(url, 'DELETE', null, headers);
  }

  private urlComplete(url: string, method: string, body: any) {
    const { uploadPartDomain, host, service } = this.defaults;
    // 上传分片接口单独处理
    if (url.includes('upload-part')) {
      url = `${uploadPartDomain || host}/api/v1${url}`
    } else {
      url = `${host}/api/v1/${service}${url}`
    }
    if ((method === 'GET' && body)) {
      url = `${url}?${stringify(body)}`
    }
    return url;
  }

  private request<T>(
    url: string,
    method: string,
    body: any,
    headers?: HttpHeaders
  ): Promise<T> {
    const _url = this.urlComplete(url, method, body);
    const option: any = {
      method,
      headers: {
        ...this.defaults.headers,
        ...headers
      }
    }

    if (method !== 'GET') {
      if (option.headers?.['Content-Type'] && option.headers['Content-Type'].includes('multipart/form-data')) {
        // 如果加了multipart/form-data，浏览器就不会自动加boundary了
        delete (option.headers as any)['Content-Type'];
        const data = new FormData();
        Object.keys(body).map(key => {
          data.append(key, body[key])
        })
        option.body = data;
      } else {
        option.body = JSON.stringify(body)
      }
    }

    return fetch(_url, option)
      .then(res => res.json())
      .then((res: ResponseBase<T>) => {
        return new Promise((resolve, reject) => {
          if (res.code === '10000000') {
            resolve(res.data as T);
          } else {
            reject(res)
          }
        })
      })
  }

  set headers(v: HttpHeaders) {
    this.defaults.headers = Object.assign({}, this.defaults.headers, v);
  }

  get headers() {
    return this.defaults.headers;
  }

  set host(v: string) {
    this.defaults.host = v;
  }

  set uploadPartDomain(v: string) {
    this.defaults.uploadPartDomain = v;
  }

  set service(v: string) {
    this.defaults.service = v;
  }
}

export const http = new HttpClient();
