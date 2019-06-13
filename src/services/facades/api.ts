import axios, { AxiosResponse, Method } from 'axios';
import { NetInfo } from 'react-native';
import * as rxjs from 'rxjs'; import { Observable, ReplaySubject } from 'rxjs';

import { ApiError } from '~/errors/api';
import { NoInternetError } from '~/errors/noInternet';
import rxjsOperators from '~/rxjs-operators';
import { API_ENDPOINT } from '~/config';
import logService, { LogService } from '../log';
import tokenService, { TokenService } from '../token';

export class ApiService {
  private connection$: ReplaySubject<boolean>;

  constructor(
    private apiEndpoint: string,
    private logService: LogService,
    private tokenService: TokenService
  ) {
    this.connection$ = new ReplaySubject(1);
    this.watchNetwork();
  }

  public get<T = any>(url: string, params?: any): Observable<T> {
    return this.request('GET', url, params);
  }

  public post<T = any>(url: string, body: any): Observable<T> {
    return this.request('POST', url, body);
  }

  public delete<T = any>(url: string, params?: any): Observable<T> {
    return this.request('DELETE', url, params);
  }

  public connection(): Observable<boolean> {
    return this.connection$.pipe(
      rxjsOperators.distinctUntilChanged()
    );
  }

  private request<T>(method: Method, url: string, data: any = null): Observable<T> {
    return this.connection$.pipe(
      rxjsOperators.sampleTime(500),
      rxjsOperators.first(),
      rxjsOperators.switchMap(connected => {
        return !connected ?
          rxjs.throwError(new NoInternetError()) :
          this.tokenService.getToken().pipe();
      }),
      rxjsOperators.first(),
      rxjsOperators.map(tokens => {
        return !tokens ? {} : {
          Authorization: `bearer ${tokens.accessToken}`,
          RefreshToken: tokens.refreshToken
        };
      }),
      rxjsOperators.switchMap(headers => {
        return axios.request({
          baseURL: this.apiEndpoint,
          url,
          method,
          timeout: 30000,
          headers: {
            'Content-type': 'application/json',
            ...headers
          },
          params: method === 'GET' ? data : null,
          data: method === 'POST' ? data : null
        });
      }),
      rxjsOperators.switchMap(res => this.checkNewToken(res)),
      rxjsOperators.map(response => response.data),
      rxjsOperators.catchError(err => {
        return !err.config ?
          rxjs.throwError(err) :
          rxjs.throwError(new ApiError(err.config, err.response, err));
      })
    );
  }

  private checkNewToken(response: AxiosResponse): Observable<AxiosResponse> {
    const accessToken = response.headers['x-token'];

    if (!accessToken) {
      return rxjs.of(response);
    }

    this.logService.breadcrumb('Api New Token', 'manual', accessToken);

    return this.tokenService
      .setAccessToken(accessToken)
      .pipe(rxjsOperators.map(() => response));
  }

  private watchNetwork(): void {
    NetInfo.isConnected.fetch().then(isConnected => this.connection$.next(isConnected));
    NetInfo.isConnected.addEventListener('connectionChange', isConnected => {
      this.connection$.next(isConnected);
    });
  }

}

const apiService = new ApiService(API_ENDPOINT, logService, tokenService);
export default apiService;