import Axios, {AxiosError} from 'axios';
import {Inject} from 'react-ts-di';

import ServerConfig from '../../.config/server-config.json';
import {Toast} from '../toast';

interface ServerConfig {
  baseUrl: string;
  port: number;
  protocol: string;
  mode: string;
}

type Request<R> = () => R;

export type Response<R> = Promise<ResValueArea<R>>;

type Requests<R> = {
  [index in HttpType]: Request<R>;
};

interface Doer<R> {
  Do(): Response<R>;
}

export type ResValueArea<R = any> = Expectable<R> &
  Successable<R> &
  Result<R> &
  Pipable<R>;

export type ExpectableCB = (err: AxiosError | undefined) => string | void;

export interface Expectable<R> {
  expect: OnExpect<R>;
}

export type OnExpect<R> = (cb?: ExpectableCB) => ResValueArea<R>;

export interface Successable<R> {
  success: OnSuccess<R>;
}

export interface Pipable<R> {
  pipe: OnSuccess<R>;
}

export type OnSuccess<R = any> = (cb: OnSuccessCB<R>) => ResValueArea<R>;
export type OnSuccessCB<R, T = any> = (data: R | undefined) => T;

export interface Result<R> extends Successable<R> {
  data?: R;
  ok: boolean;
}

export type ExpectFn = () => string | void;
export type SimpleHTTPMethod = 'GET' | 'HEAD';
export type ComplexHTTPMethod = 'POST' | 'PUT' | 'DELETE' | 'PATCH';
export type HTTPMethod = SimpleHTTPMethod | ComplexHTTPMethod;
export type HttpType = 'SimpleHTTPMethod' | 'ComplexHTTPMethod';

interface DispatchPayload<T> {
  method: HTTPMethod;
  path: string;
  data?: T;
  contentType?: ContentType;
}

export enum ContentType {
  Form = 'application/x-www-form-urlencoded',
}

const {baseUrl, port, protocol, mode} = ServerConfig as ServerConfig;

export function getBaseURL(): string {
  return `${baseUrl}:${port === 80 ? '' : port}/${
    mode === 'dev' ? 'apis/' : ''
  }`;
}

export function getAbsPath(): string {
  return `${protocol}://${getBaseURL()}`;
}

export class HttpClient {
  private addr: string;

  @Inject
  private toast!: Toast;

  constructor() {
    this.addr = getAbsPath();
  }

  protected create<T, R>(type: HttpType, payload: DispatchPayload<T>): Doer<R> {
    const {path, data, contentType, method} = payload;
    const lowerCaseMethod = method.toLowerCase();

    const requests: Requests<R> = {
      ComplexHTTPMethod: () =>
        Axios[lowerCaseMethod]<R>(this.join(path), data || {}, {
          headers: {
            'Content-Type': contentType || ContentType.Form,
          },
        }),
      SimpleHTTPMethod: () =>
        Axios[lowerCaseMethod]<R>(this.join(path), {
          params: data,
        }),
    };

    return {
      Do: () => this.Do<R>(() => requests[type]()),
    };
  }

  private Do<R>(request: Request<R>): Response<R> {
    let err: AxiosError | undefined;
    let data: R | undefined;

    const sendRequest = async (): Promise<ResValueArea<R>> => {
      try {
        data = await request();
      } catch (e) {
        err = e;
      }

      const valueArea: ResValueArea<R> = {
        data,
        ok: !!err,
        success: onSuccuss,
        expect: onExpect,
        pipe,
      };
      const that = this;

      function pipe(cb: OnSuccessCB<R>): ResValueArea {
        return {
          ...valueArea,
          data: cb(data),
        };
      }

      function onSuccuss(cb: OnSuccessCB<R>): ResValueArea {
        return {
          ...valueArea,
          data: err ? data : cb(data),
        };
      }

      function onExpect(cb: ExpectableCB): ResValueArea {
        const errMsg = (cb || (() => {}))(err);

        // 抛出 caller 希望抛出的错误信息
        // else 吞并异常
        if (errMsg && err) {
          that.toast.error(errMsg);
        }

        return valueArea;
      }

      return valueArea;
    };

    return sendRequest();
  }

  private join(path: string): string {
    const parsedPath = path.replace(/^\/(.*)/, (_, cap) => cap);

    return `${this.addr}${parsedPath}`;
  }
}

const noopFn: any = () => {};
export const noop: ResValueArea = {
  success: noopFn,
  expect: noopFn,
  data: undefined,
  ok: false,
  pipe: noopFn,
};
