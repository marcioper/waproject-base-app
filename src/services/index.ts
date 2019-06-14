import './facades/linking/handlers/register';
import './notification/handlers/register';

import { NavigationScreenProp } from 'react-navigation';
import { BehaviorSubject, Observable } from 'rxjs';
import RxOp from '~/rxjs-operators';

import apiService from './api';
import linkingService from './linking';
import logService from './log';
import notificationService from './notification';
import tokenService from './token';
import userService from './user';

const setupCompleted$ = new BehaviorSubject(false);
const appDidOpen$ = new BehaviorSubject(false);

export function setupServices(navigator: NavigationScreenProp<any>): void {
  notificationService.setup(navigator);
  linkingService.setup(navigator);

  tokenService.getUser().pipe(
    RxOp.tap(user => logService.setUser(user)),
    RxOp.logError()
  ).subscribe(() => { }, () => { });

  notificationService.getToken().pipe(
    RxOp.distinctUntilChanged(),
    RxOp.switchMap(token => apiService.connection().pipe(
      RxOp.filter(c => c),
      RxOp.first(),
      RxOp.map(() => token))
    ),
    RxOp.combineLatest(userService.isLogged()),
    RxOp.filter(([, isLogged]) => isLogged),
    RxOp.map(([token]) => token),
    RxOp.filter(token => !!token),
    RxOp.switchMap(token => userService.updateNotificationToken(token)),
    RxOp.logError()
  ).subscribe(() => { }, () => { });

  setupCompleted$.next(true);
}

export function appOpened(): void {
  appDidOpen$.next(true);
}

export function appReady(): Observable<void> {
  return appDidOpen$.pipe(
    RxOp.combineLatest(setupCompleted$),
    RxOp.filter(([appDidOpen, setupCompleted]) => appDidOpen && setupCompleted),
    RxOp.map(() => { })
  );
}

export function appDefaultNavigation(): Observable<boolean> {
  return notificationService.hasInitialNotification().pipe(
    RxOp.combineLatest(linkingService.hasInitialUrl()),
    RxOp.map(([hasNotification, hasInitialUrl]) => !hasNotification && !hasInitialUrl)
  );
}