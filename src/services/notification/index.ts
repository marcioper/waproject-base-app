import SplashScreen from 'react-native-splash-screen';
import { NavigationScreenProp } from 'react-navigation';
import * as rxjs from 'rxjs'; import { Observable, ReplaySubject, Subject } from 'rxjs';

import { appReady } from '../';
import { INotificationHandler, INotificationInfo } from '~/interfaces/notification';
import rxjsOperators from '~/rxjs-operators';
import firebaseService, { FirebaseService, INotificationInfoRemote } from '../facades/firebase';
import storageService, { StorageService } from '../facades/storage';
import tokenService, { TokenService } from '../token';

export class NotificationService {
  private navigator: NavigationScreenProp<any>;

  private token$: ReplaySubject<string>;
  private hasInitialNotification$: ReplaySubject<boolean>;
  private newNotification$: Subject<INotificationInfo>;

  private handlers: { [key: string]: INotificationHandler } = {};

  constructor(
    private storageService: StorageService,
    private tokenService: TokenService,
    private firebaseService: FirebaseService
  ) {
    this.token$ = new ReplaySubject(1);
    this.newNotification$ = new Subject();
    this.hasInitialNotification$ = new ReplaySubject(1);

    this.firebaseService.onTokenRefresh().pipe(
      rxjsOperators.logError()
    )
      .subscribe(token => this.token$.next(token));

    this.firebaseService.onNewNotification().pipe(
      rxjsOperators.logError(),
      rxjsOperators.switchMap(n => this.received(n.notification, n.initial))
    ).subscribe();

    this.storageService.get('notification-token').pipe(
      rxjsOperators.filter(t => !!t),
      rxjsOperators.logError()
    ).subscribe(token => this.token$.next(token));

    this.token$.pipe(
      rxjsOperators.distinctUntilChanged(),
      rxjsOperators.filter(t => !!t),
      rxjsOperators.logError(),
      rxjsOperators.switchMap(t => this.storageService.set('notification-token', t))
    ).subscribe();
  }

  public setup(navigator: NavigationScreenProp<any>): void {
    this.navigator = navigator;
  }

  public getToken(): Observable<string> {
    return this.token$.pipe(
      rxjsOperators.distinctUntilChanged(),
      rxjsOperators.sampleTime(500)
    );
  }

  public hasInitialNotification(): Observable<boolean> {
    return this.hasInitialNotification$.asObservable();
  }

  public onNotification(): Observable<{ action?: string, data?: any; }> {
    return this.newNotification$.asObservable();
  }

  public registerHandler(action: string, handler: INotificationHandler): void {
    this.handlers[action] = handler;
  }

  private received(notification: INotificationInfoRemote, appStarted: boolean = false): Observable<boolean> {
    return this.checkNotification(notification).pipe(
      rxjsOperators.tap(valid => {
        if (!appStarted) return;
        this.hasInitialNotification$.next(valid);
      }),
      rxjsOperators.filter(valid => valid),
      rxjsOperators.tap(() => this.newNotification$.next(notification)),
      rxjsOperators.switchMap(() => {
        return notification.opened_from_tray || appStarted ?
          this.execNotification(notification, appStarted) :
          this.firebaseService.createLocalNotification(notification);
      }),
      rxjsOperators.tap(() => SplashScreen.hide()),
      rxjsOperators.tap(() => this.hasInitialNotification$.next(false))
    );
  }

  private checkNotification(notification: INotificationInfo): Observable<boolean> {
    if (!notification || !notification.action || !this.handlers[notification.action]) {
      return rxjs.of(false);
    }

    if (!notification.userId) {
      return rxjs.of(true);
    }

    return this.tokenService.getUser().pipe(
      rxjsOperators.first(),
      rxjsOperators.map(user => {
        if (!user) return false;
        return Number(notification.userId) == user.id;
      })
    );
  }

  private execNotification(notification: INotificationInfo, appStarted: boolean = false): Observable<boolean> {
    if (typeof notification.data === 'string') {
      notification.data = JSON.parse(notification.data);
    }

    return appReady().pipe(
      rxjsOperators.switchMap(() => {
        const { dispatch } = this.navigator;
        return this.handlers[notification.action](dispatch, notification, appStarted);
      }),
      rxjsOperators.map(() => true)
    );
  }

}

const notificationService = new NotificationService(storageService, tokenService, firebaseService);
export default notificationService;