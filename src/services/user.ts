import device from 'react-native-device-info';
import * as Rx from 'rxjs';
import { IUser } from '~/interfaces/models/user';
import { IUserToken } from '~/interfaces/tokens/user';
import rxjsOperators, { ICacheResult } from '~/rxjs-operators';

import apiService, { ApiService } from './facades/api';
import cacheService, { CacheService } from './facades/cache';
import notificationService, { NotificationService } from './notification';
import tokenService, { TokenService } from './token';

export class UserService {
  constructor(
    private apiService: ApiService,
    private cacheService: CacheService,
    private notificationService: NotificationService,
    private tokenService: TokenService
  ) { }

  public login(email: string, password: string): Rx.Observable<void> {
    return this.getDeviceInformation().pipe(
      rxjsOperators.switchMap(({ deviceId, deviceName, notificationToken }) => {
        return this.apiService.post('/auth/login', {
          email,
          password,
          deviceId,
          deviceName,
          notificationToken
        });
      }),
      rxjsOperators.switchMap(tokens => this.tokenService.setToken(tokens))
    );
  }

  public loginSocial(provider: string, accessToken: string): Rx.Observable<void> {
    return this.getDeviceInformation().pipe(
      rxjsOperators.switchMap(({ deviceId, deviceName, notificationToken }) => {
        return this.apiService.post('/auth/social/login', {
          deviceId,
          deviceName,
          provider,
          accessToken,
          notificationToken
        });
      }),
      rxjsOperators.switchMap(tokens => this.tokenService.setToken(tokens))
    );
  }

  public get(refresh?: boolean): Rx.Observable<ICacheResult<IUser>> {
    return this.tokenService.getToken().pipe(
      rxjsOperators.switchMap(token => {
        if (!token) {
          return Rx.of({ updating: false, data: null });
        }

        return this.apiService.get<IUser>('profile').pipe(
          rxjsOperators.cache('service-profile', { refresh })
        );
      })
    );
  }

  public save(model: IUser): Rx.Observable<IUser> {
    return this.apiService.post<IUser>('profile', model).pipe(
      rxjsOperators.cacheClean('service-profile')
    );
  }

  public isLogged(): Rx.Observable<boolean> {
    return this.userChanged().pipe(
      rxjsOperators.map(t => !!t)
    );
  }

  public userChanged(): Rx.Observable<IUserToken> {
    return this.tokenService.getUser().pipe(
      rxjsOperators.distinctUntilChanged((n, o) => (n || { id: null }).id === (o || { id: null }).id)
    );
  }

  public logout(): Rx.Observable<void> {
    return this.apiService
      .post('/auth/logout', { deviceId: device.getUniqueID() })
      .pipe(
        rxjsOperators.switchMap(() => this.tokenService.clearToken()),
        rxjsOperators.switchMap(() => this.cacheService.clear())
      );
  }

  public updateNotificationToken(notificationToken: string): Rx.Observable<void> {
    return this.getDeviceInformation().pipe(
      rxjsOperators.switchMap(({ deviceId, deviceName }) => {
        return this.apiService.post('/auth/opened', { deviceId, notificationToken, deviceName });
      })
    );
  }

  private getDeviceInformation(): Rx.Observable<{ deviceId: string, deviceName: string, notificationToken: string }> {
    return this.notificationService.getToken().pipe(
      rxjsOperators.first(),
      rxjsOperators.map(notificationToken => {
        return {
          deviceId: device.getUniqueID(),
          deviceName: `${device.getBrand()} - ${device.getModel()} (${device.getSystemName()} ${device.getSystemVersion()})`,
          notificationToken
        };
      })
    );
  }

}

const userService = new UserService(apiService, cacheService, notificationService, tokenService);
export default userService;