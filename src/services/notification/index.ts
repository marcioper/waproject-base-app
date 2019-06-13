import SplashScreen from 'react-native-splash-screen';
import { NavigationScreenProp } from 'react-navigation';
import * as Rx from 'rxjs'; import { Observable, ReplaySubject, Subject } from 'rxjs';

import { appReady } from '../';
import { INotificationHandler } from '~/interfaces/notification';
import RxOp from '~/rxjs-operators';
import firebaseService, { FirebaseService, INotificationInfoRemote } from '../facades/firebase';
import storageService, { StorageService } from '../facades/storage';
import tokenService, { TokenService } from '../token';
import { Notification } from 'react-native-firebase/notifications';

export class NotificationService {
  private navigator: NavigationScreenProp<any>;

  private token$: ReplaySubject<string>;
  private hasInitialNotification$: ReplaySubject<boolean>;
  private newNotification$: Subject<Notification>;

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
      RxOp.logError()
    )
      .subscribe(token => this.token$.next(token));

    this.firebaseService.onNewNotification().pipe(
      RxOp.logError(),
      RxOp.switchMap(n => this.received(n.notification, n.initial, n.opened))
    ).subscribe();

    this.storageService.get('notification-token').pipe(
      RxOp.filter(t => !!t),
      RxOp.logError()
    ).subscribe(token => this.token$.next(token));

    this.token$.pipe(
      RxOp.distinctUntilChanged(),
      RxOp.filter(t => !!t),
      RxOp.logError(),
      RxOp.switchMap(t => this.storageService.set('notification-token', t))
    ).subscribe();
  }

  public setup(navigator: NavigationScreenProp<any>): void {
    this.navigator = navigator;
  }

  public getToken(): Observable<string> {
    return this.token$.pipe(
      RxOp.distinctUntilChanged(),
      RxOp.sampleTime(500)
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

  private received(notification: INotificationInfoRemote, appStarted: boolean, opened: boolean): Observable<boolean> {
    return this.checkNotification(notification).pipe(
      RxOp.tap(valid => {
        if (!appStarted) return;
        this.hasInitialNotification$.next(valid);
      }),
      RxOp.filter(valid => valid),
      RxOp.tap(() => this.newNotification$.next(notification)),
      RxOp.switchMap(() => {
        return opened || appStarted ?
          this.execNotification(notification, appStarted) :
          this.firebaseService.createLocalNotification(notification);
      }),
      RxOp.tap(() => SplashScreen.hide()),
      RxOp.tap(() => this.hasInitialNotification$.next(false))
    );
  }

  private checkNotification(notification: Notification): Observable<boolean> {
    if (notification) {
      return Rx.of(true);
    }

    if (!notification || !notification.data.action || !this.handlers[notification.data.action]) {
      return Rx.of(false);
    }

    if (!notification.data.userId) {
      return Rx.of(true);
    }

    return this.tokenService.getUser().pipe(
      RxOp.first(),
      RxOp.map(user => {
        if (!user) return false;
        return Number(notification.data.userId) == user.id;
      })
    );
  }

  private execNotification(notification: Notification, appStarted: boolean = false): Observable<boolean> {
    return appReady().pipe(
      RxOp.switchMap(() => {
        const { dispatch } = this.navigator;
        if (!notification.data || !notification.data.action || !this.handlers[notification.data.action]) {
          return Promise.resolve();
        }

        return this.handlers[notification.data.action](dispatch, notification, appStarted);
      }),
      RxOp.map(() => true)
    );
  }

}

const notificationService = new NotificationService(storageService, tokenService, firebaseService);
export default notificationService;