import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
} from "axios";
import { ERROR_CODE } from "../globals";
import { OdeContext } from "./types";
import { IHttpResponse, IHttpParams } from "../transport/interfaces";

const loadedScripts: { [url: string]: boolean } = {};

export class HttpService {
  // Axios automatically manages the XSRF-TOKEN cookie and the X-XSRF-TOKEN HTTP header.
  private axios: AxiosInstance;

  private _latestResponse: any;

  constructor(private context: OdeContext, params?: any) {
    this.axios = axios.create(params);
  }

  setCdn(cdnUrl: string): void {
    if (
      cdnUrl &&
      XMLHttpRequest &&
      !(XMLHttpRequest.prototype as any)["cdnUrl"]
    ) {
      (XMLHttpRequest.prototype as any)["cdnUrl"] = cdnUrl;
      (XMLHttpRequest.prototype as any).baseOpen =
        XMLHttpRequest.prototype.open;
      XMLHttpRequest.prototype.open = function () {
        const url = arguments[1] as string;
        //PUBLIC infra
        if (url.startsWith("/infra/public")) {
          arguments[1] = cdnUrl + url;
        }
        //PUBLIC files (/.*/public)
        const match = /^\/([^\/]*)\/public/.test(url);
        if (match) {
          arguments[1] = cdnUrl + url;
        }
        //ASSETS files
        if (url.startsWith("/assets")) {
          arguments[1] = cdnUrl + url;
        }
        //SKIP PUBLIC CONF
        if (url == "/conf/public") {
          arguments[1] = url;
        }
        //SKIP HTTP
        if (url.startsWith("http")) {
          arguments[1] = url;
        }
        return (this as any).baseOpen.apply(this, arguments);
      };
    }
  }

  private toAxiosConfig(params?: IHttpParams): AxiosRequestConfig {
    if (!params) {
      return this.axios.defaults;
    } else {
      const p: AxiosRequestConfig = Object.assign({}, this.axios.defaults);

      if (params.headers) {
        p.headers = Object.assign({}, this.axios.defaults.headers);
        Object.assign(p.headers, params.headers);
      }

      if (params.responseType) {
        p.responseType = params.responseType;
      }

      if (params.queryParams) {
        // Axios will serialize parameters, see https://github.com/axios/axios#request-config
        p.params = Object.assign({}, params.queryParams);
      }

      /* TODO : manage params.requestName through an events[]. See infra-front http.ts */

      return p;
    }
  }

  private toCdnUrl(url: string) {
    const CDN_DOMAIN: string = this.context.conf().getCdnUrl() || "";
    // If CDN domain is defined, and requested url is not /public/conf (SKIP PUBLIC CONF)
    if (CDN_DOMAIN!.length > 0 && url !== "/conf/public") {
      const originalURL = "" + url;
      //PUBLIC infra or ASSETS files
      if (
        originalURL.startsWith("/infra/public") ||
        originalURL.startsWith("/assets")
      ) {
        url = CDN_DOMAIN + originalURL;
      } else {
        //PUBLIC files (/.*/public)
        const match = /^\/([^\/]*)\/public/.test(originalURL);
        if (match) {
          url = CDN_DOMAIN + originalURL;
        }
      }
    }
    return url;
  }

  private mapAxiosError<R>(error: AxiosError<R>, params?: IHttpParams): R {
    console.error("[HttpService]", error);
    // AxiosError.response and our HttpResponse share the same properties.
    // So we can use it directly, saving CPU and memory.
    // Otherwise, we would map the axios response to our own model.
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      this._latestResponse = error.response;
    } else if (error.request) {
      // The request was made but no response was received
      // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
      // http.ClientRequest in node.js
      this._latestResponse = {
        status: 408,
        statusText: ERROR_CODE.TIME_OUT,
      };
    } else {
      // Something happened in setting up the request that triggered an Error
      this._latestResponse = {
        status: 500,
        statusText: ERROR_CODE.UNKNOWN,
      };
    }

    /* TODO : manage params.requestName through an events[]. See infra-front http.ts */

    // Notify error unless disabled.
    if (!params || params.disableNotifications === false) {
      // FIXME This really should be an rxjs Subject
      // notify.onEvent( EVENT_NAME.HTTP_ERROR ).next( new HttpErrorNotice(''+this._latestResponse.status, this._latestResponse.statusText) );
    }

    return this._latestResponse;
  }

  private mapAxiosResponse<R>(
    response: AxiosResponse<R>,
    params?: IHttpParams
  ): R {
    // AxiosResponse and our HttpResponse share the same properties.
    // So we can use it directly, saving CPU and memory.
    // Otherwise, we would map the axios response to our own model.
    this._latestResponse = response;
    /* TODO : manage params.requestName through an events[]. See infra-front http.ts */
    //FIXME: should we check response.status and only accept if range is 2xx ?
    return response.data;
  }

  get latestResponse(): IHttpResponse {
    return this._latestResponse;
  }

  async get<R = any>(url: string, params?: IHttpParams): Promise<R> {
    try {
      const r = await this.axios.get<R>(
        this.toCdnUrl(url),
        this.toAxiosConfig(params)
      );
      return this.mapAxiosResponse(r, params);
    } catch (e) {
      const result: R = this.mapAxiosError(e as AxiosError, params);
      return result;
    }
  }

  async post<R = any>(
    url: string,
    data?: any,
    params?: IHttpParams
  ): Promise<R> {
    try {
      const r = await this.axios.post<R>(url, data, this.toAxiosConfig(params));
      return this.mapAxiosResponse(r, params);
    } catch (e) {
      const result_1: R = this.mapAxiosError(e as AxiosError, params);
      return result_1;
    }
  }

  async postFile<R = any>(
    url: string,
    data: any,
    params?: IHttpParams
  ): Promise<R> {
    const p = this.toAxiosConfig(params);
    if (p.headers["Content-Type"]) {
      delete p.headers["Content-Type"];
    }
    try {
      const r = await this.axios.post<R>(url, data, {
        ...p,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return this.mapAxiosResponse(r, params);
    } catch (e) {
      const result: R = this.mapAxiosError(e as AxiosError, params);
      return result;
    }
  }

  async postJson<R = any>(
    url: string,
    json: any,
    params?: IHttpParams
  ): Promise<R> {
    const p = this.toAxiosConfig();
    p.headers["Content-Type"] = "application/json";
    try {
      const r = await this.axios.post<R>(url, json, this.toAxiosConfig(params));
      return this.mapAxiosResponse(r, params);
    } catch (e) {
      const result_1: R = this.mapAxiosError(e as AxiosError, params);
      return result_1;
    }
  }

  async put<R = any>(
    url: string,
    data?: any,
    params?: IHttpParams
  ): Promise<R> {
    try {
      const r = await this.axios.put<R>(url, data, this.toAxiosConfig(params));
      return this.mapAxiosResponse(r, params);
    } catch (e) {
      const result: R = this.mapAxiosError(e as AxiosError, params);
      return result;
    }
  }

  async putFile<R = any>(url: string, data: FormData, params?: IHttpParams) {
    try {
      const p = this.toAxiosConfig(params);
      if (p.headers["Content-Type"]) {
        delete p.headers["Content-Type"];
      }
      const res = await this.axios.put(url, data, {
        ...p,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return this.mapAxiosResponse(res, params);
    } catch (e) {
      const result: R = this.mapAxiosError(e as AxiosError, params);
      return result;
    }
  }

  async putJson<R = any>(
    url: string,
    json: any,
    params?: IHttpParams
  ): Promise<R> {
    const p = this.toAxiosConfig(params);
    p.headers["Content-Type"] = "application/json";
    try {
      const r = await this.axios.put<R>(url, json, p);
      return this.mapAxiosResponse(r, params);
    } catch (e) {
      const result: R = this.mapAxiosError(e as AxiosError, params);
      return result;
    }
  }
  async delete<R = any>(url: string, params?: IHttpParams): Promise<R> {
    try {
      const r = await this.axios.delete<R>(url, this.toAxiosConfig(params));
      return this.mapAxiosResponse(r, params);
    } catch (e) {
      const result_1: R = this.mapAxiosError(e as AxiosError, params);
      return result_1;
    }
  }

  async deleteJson<R = any>(url: string, json: any): Promise<R> {
    try {
      const r = await this.axios.delete<R>(url, { data: json });
      return this.mapAxiosResponse(r);
    } catch (e) {
      const result: R = this.mapAxiosError(e as AxiosError);
      return result;
    }
  }

  getScript<R = any>(
    url: string,
    params?: IHttpParams,
    variableName?: string
  ): Promise<R> {
    const resultName = variableName ?? "exports";
    const p = this.toAxiosConfig(params);
    p.headers["Accept"] = "application/javascript";
    return this.axios
      .get<string>(this.toCdnUrl(url), p)
      .then((r) => this.mapAxiosResponse(r, params))
      .then((r) => {
        try {
          const securedScript = `"use strict";var ${
            resultName.split(".")[0]
          }={};${r};return ${resultName};`;
          const result = Function(securedScript)();
          return result;
        } catch (e) {
          const result = r;
          return result;
        }
      })
      .catch<R>((e) => {
        this.mapAxiosError(e, params);
        throw e;
      });
  }

  loadScript(url: string, params?: IHttpParams): Promise<void> {
    return loadedScripts[url]
      ? Promise.resolve()
      : this.getScript(url, params).then((res) => {
          loadedScripts[url] = true;
        });
  }
}
