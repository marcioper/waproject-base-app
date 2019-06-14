import device from 'react-native-device-info';
import * as Rx from 'rxjs';
import { IUser } from '~/interfaces/models/user';
import { IUserToken } from '~/interfaces/tokens/user';
import RxOp, { ICacheResult } from '~/rxjs-operators';

import apiService, { ApiService } from './api';
import cacheService, { CacheService } from './cache';
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
      RxOp.switchMap(({ deviceId, deviceName, notificationToken }) => {
        return this.apiService.post('/auth/login', {
          email,
          password,
          deviceId,
          deviceName,
          notificationToken
        });
      }),
      RxOp.switchMap(tokens => this.tokenService.setToken(tokens))
    );
  }

  public loginSocial(provider: string, accessToken: string): Rx.Observable<void> {
    return this.getDeviceInformation().pipe(
      RxOp.switchMap(({ deviceId, deviceName, notificationToken }) => {
        return this.apiService.post('/auth/social/login', {
          deviceId,
          deviceName,
          provider,
          accessToken,
          notificationToken
        });
      }),
      RxOp.switchMap(tokens => this.tokenService.setToken(tokens))
    );
  }

  public get(refresh?: boolean): Rx.Observable<ICacheResult<IUser>> {
    return this.tokenService.getToken().pipe(
      RxOp.switchMap(token => {
        if (!token) {
          return Rx.of({ updating: false, data: null });
        }

        return this.apiService.get<IUser>('profile').pipe(
          RxOp.cache('service-profile', { refresh })
        );
      })
    );
  }

  public save(model: IUser): Rx.Observable<IUser> {
    return this.apiService.post<IUser>('profile', model).pipe(
      RxOp.cacheClean('service-profile')
    );
  }

  public isLogged(): Rx.Observable<boolean> {
    return this.userChanged().pipe(
      RxOp.map(t => !!t)
    );
  }

  public userChanged(): Rx.Observable<IUserToken> {
    return this.tokenService.getUser().pipe(
      RxOp.distinctUntilChanged((n, o) => (n || { id: null }).id === (o || { id: null }).id)
    );
  }

  public logout(): Rx.Observable<void> {
    return this.apiService
      .post('/auth/logout', { deviceId: device.getUniqueID() })
      .pipe(
        RxOp.switchMap(() => this.tokenService.clearToken()),
        RxOp.switchMap(() => this.cacheService.clear())
      );
  }

  public updateNotificationToken(notificationToken: string): Rx.Observable<void> {
    return this.getDeviceInformation().pipe(
      RxOp.switchMap(({ deviceId, deviceName }) => {
        return this.apiService.post('/auth/opened', { deviceId, notificationToken, deviceName });
      })
    );
  }

  private getDeviceInformation(): Rx.Observable<{ deviceId: string, deviceName: string, notificationToken: string }> {
    return this.notificationService.getToken().pipe(
      RxOp.first(),
      RxOp.map(notificationToken => {
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