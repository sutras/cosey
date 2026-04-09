import { AxiosInstance, type AxiosRequestConfig } from 'axios';
import { type HttpConfig } from '../config/http';

export class Http {
  axiosFactory: () => AxiosInstance;
  axiosIns: AxiosInstance | null = null;
  controller: AbortController;
  config: AxiosRequestConfig | null = null;

  constructor(axiosFactory: () => AxiosInstance) {
    this.axiosFactory = axiosFactory;
    this.controller = new AbortController();
  }

  _request<T = any, D = any>(
    config: AxiosRequestConfig<D> & {
      coseyHttpConfig?: HttpConfig;
    },
    httpConfig?: HttpConfig,
  ) {
    if (!this.axiosIns) {
      this.axiosIns = this.axiosFactory();
    }

    config.coseyHttpConfig = httpConfig;

    return this.axiosIns.request<T, T, D>(config);
  }

  request<T = any, D = any>(config: AxiosRequestConfig<D>, httpConfig?: HttpConfig) {
    return this._request<T, D>(config, httpConfig);
  }

  get<T = any, D = any>(url: string, config?: AxiosRequestConfig<D>, httpConfig?: HttpConfig) {
    return this._request<T, D>(
      {
        ...config,
        url,
        method: 'get',
      },
      httpConfig,
    );
  }

  delete<T = any, D = any>(url: string, config?: AxiosRequestConfig<D>, httpConfig?: HttpConfig) {
    return this._request<T, D>(
      {
        ...config,
        url,
        method: 'delete',
      },
      httpConfig,
    );
  }

  head<T = any, D = any>(url: string, config?: AxiosRequestConfig<D>, httpConfig?: HttpConfig) {
    return this._request<T, D>(
      {
        ...config,
        url,
        method: 'head',
      },
      httpConfig,
    );
  }

  options<T = any, D = any>(url: string, config?: AxiosRequestConfig<D>, httpConfig?: HttpConfig) {
    return this._request<T, D>(
      {
        ...config,
        url,
        method: 'options',
      },
      httpConfig,
    );
  }

  post<T = any, D = any>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig<D>,
    httpConfig?: HttpConfig,
  ) {
    return this._request<T, D>(
      {
        ...config,
        url,
        data,
        method: 'post',
      },
      httpConfig,
    );
  }

  put<T = any, D = any>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig<D>,
    httpConfig?: HttpConfig,
  ) {
    return this._request<T, D>(
      {
        ...config,
        url,
        data,
        method: 'put',
      },
      httpConfig,
    );
  }

  patch<T = any, D = any>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig<D>,
    httpConfig?: HttpConfig,
  ) {
    return this._request<T, D>(
      {
        ...config,
        url,
        data,
        method: 'patch',
      },
      httpConfig,
    );
  }
}
