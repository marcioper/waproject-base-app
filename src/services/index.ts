import './facades/linking/handlers/register';
import './notification/handlers/register';

import { NavigationScreenProp } from 'react-navigation';
import { BehaviorSubject, Observable } from 'rxjs';
import rxjsOperators from '~/rxjs-operators';

import apiService from './facades/api';
import linkingService from './facades/linking';
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
    rxjsOperators.tap(user => logService.setUser(user)),
    rxjsOperators.logError()
  ).subscribe(() => { }, () => { });

  notificationService.getToken().pipe(
    rxjsOperators.distinctUntilChanged(),
    rxjsOperators.switchMap(token => apiService.connection().pipe(
      rxjsOperators.filter(c => c),
      rxjsOperators.first(),
      rxjsOperators.map(() => token))
    ),
    rxjsOperators.combineLatest(userService.isLogged()),
    rxjsOperators.filter(([, isLogged]) => isLogged),
    rxjsOperators.map(([token]) => token),
    rxjsOperators.filter(token => !!token),
    rxjsOperators.switchMap(token => userService.updateNotificationToken(token)),
    rxjsOperators.logError()
  ).subscribe(() => { }, () => { });

  setupCompleted$.next(true);
}

export function appOpened(): void {
  appDidOpen$.next(true);
}

export function appReady(): Observable<void> {
  return appDidOpen$.pipe(
    rxjsOperators.combineLatest(setupCompleted$),
    rxjsOperators.filter(([appDidOpen, setupCompleted]) => appDidOpen && setupCompleted),
    rxjsOperators.map(() => { })
  );
}

export function appDefaultNavigation(): Observable<boolean> {
  return notificationService.hasInitialNotification().pipe(
    rxjsOperators.combineLatest(linkingService.hasInitialUrl()),
    rxjsOperators.map(([hasNotification, hasInitialUrl]) => !hasNotification && !hasInitialUrl)
  );
}