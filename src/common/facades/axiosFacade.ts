import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios"

import StatusCode from "@consts/statusCodes"
import { ApiTimeOut } from "@consts/constants"

const headers: Readonly<Record<string, string | boolean>> = {
  Accept: "application/json",
  "Content-Type": "application/json; charset=utf-8",
  "Access-Control-Allow-Credentials": true,
  "X-Requested-With": "XMLHttpRequest",
}

export class Http {
  private instance: AxiosInstance | null = null
  private token: string
  private loginType: string

  constructor(token: string, loginType: string) {
    this.token = token
    this.loginType = loginType
  }

  private get http(): AxiosInstance {
    return this.instance != null ? this.instance : this.initHttp()
  }

  initHttp() {
    const http = axios.create({
      baseURL: process.env.API_BASE_URL,
      headers: {
        ...headers,
        'Authorization': `Bearer ${this.token}`,
        'X-Login-Type': this.loginType
      },
      withCredentials: true,
      timeout: ApiTimeOut,
    })

    http.interceptors.response.use(
      (response) => response,
      (error) => {
        const { response } = error
        return this.handleError(response)
      }
    )

    this.instance = http
    return http
  }

  request<T = any, R = AxiosResponse<T>>(config: AxiosRequestConfig): Promise<R> {
    return this.http.request(config)
  }

  get<T = any, R = AxiosResponse<T>>(url: string, config?: AxiosRequestConfig): Promise<R> {
    return this.http.get<T, R>(url, config)
  }

  post<T = any, R = AxiosResponse<T>>(
    url: string,
    data?: T,
    config?: AxiosRequestConfig
  ): Promise<R> {
    return this.http.post<T, R>(url, data, config)
  }

  patch<T = any, R = AxiosResponse<T>>(
    url: string,
    data?: T,
    config?: AxiosRequestConfig
  ): Promise<R> {
    return this.http.patch<T, R>(url, data, config)
  }

  put<T = any, R = AxiosResponse<T>>(
    url: string,
    data?: T,
    config?: AxiosRequestConfig
  ): Promise<R> {
    return this.http.put<T, R>(url, data, config)
  }

  delete<T = any, R = AxiosResponse<T>>(url: string, config?: AxiosRequestConfig): Promise<R> {
    return this.http.delete<T, R>(url, config)
  }

  private handleError(error: any) {
    const { status } = error

    switch (status) {
      case StatusCode.InternalServerError: {
        // TODO: Handle InternalServerError
        break
      }
      case StatusCode.Forbidden: {
        // TODO: Handle Forbidden
        break
      }
      case StatusCode.Unauthorized: {
        // TODO: Handle Unauthorized
        break
      }
      case StatusCode.TooManyRequests: {
        // TODO: Handle TooManyRequests
        break
      }
    }

    return Promise.reject(error)
  }
}
