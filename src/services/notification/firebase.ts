import * as Rx from 'rxjs'; import { Observable, ReplaySubject } from 'rxjs';
import firebase from 'react-native-firebase';

import RxOp from '~/rxjs-operators';
import { IS_DEV } from '~/config';
import { Notification } from 'react-native-firebase/notifications';

export class FirebaseService {
  private lastId: string;
  private token$: ReplaySubject<string>;
  private notification$: ReplaySubject<{ notification: INotificationInfoRemote, initial: boolean, opened: boolean }>;

  constructor() {
    this.token$ = new ReplaySubject(1);
    this.notification$ = new ReplaySubject(1);

    this.init();

    this.token$.pipe(
      RxOp.tap(token => console.log(token)),
      RxOp.tap(() => firebase.messaging().subscribeToTopic('all')),
      RxOp.tap(() => IS_DEV && firebase.messaging().subscribeToTopic('app-development')),
      RxOp.logError()
    ).subscribe();
  }

  public async testLocalNotification(): Promise<void> {
    const notification = new firebase.notifications.Notification()
      .setTitle('Test Local')
      .setBody('Hey this is the body')
      .setSound('default');

    return firebase.notifications().displayNotification(notification);
  }

  public onTokenRefresh(): Observable<string> {
    return this.token$.asObservable();
  }

  public onNewNotification(): Observable<{ notification: INotificationInfoRemote, initial: boolean, opened: boolean }> {
    return this.notification$.asObservable();
  }

  public createLocalNotification(notification: INotificationInfoRemote): Observable<boolean> {
    const newNotification = new firebase.notifications.Notification()
      .setTitle(notification.title)
      .setBody(notification.body)
      .setData(notification.data)
      .setSound('default');

    return Rx.of(true).pipe(
      RxOp.switchMap(() => {
        return firebase.notifications().displayNotification(newNotification)
          .then(() => true)
          .catch(() => false);
      })
    );
  }

  private async init() {
    const hasPermission = await firebase.messaging().hasPermission();

    if (!hasPermission) {
      firebase.messaging().requestPermission().catch(() => { });
    }

    firebase.messaging().onTokenRefresh(token => this.token$.next(token));
    firebase.messaging().getToken().then(token => this.token$.next(token));

    firebase.notifications().getInitialNotification().then(this.notificationCallback(true, true));
    firebase.notifications().onNotification(this.notificationCallback(false, false));
    firebase.notifications().onNotificationOpened(this.notificationCallback(false, true));

  }

  private notificationCallback(initial: boolean, opened: boolean): any {
    return (notification: INotificationInfoRemote) => {
      console.log(notification);
      if (!notification && initial) {
        this.notification$.next({ notification: null, initial, opened });
        return;
      }

      if (notification.notificationId && this.lastId === notification.notificationId) return;

      this.lastId = notification.notificationId;
      this.notification$.next({ notification, initial, opened });
    };
  }
}

export interface INotificationInfoRemote extends Notification {
}

const firebaseService = new FirebaseService();
export default firebaseService;
