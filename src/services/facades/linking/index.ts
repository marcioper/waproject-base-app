import { Linking } from 'react-native';
import SplashScreen from 'react-native-splash-screen';
import { NavigationDispatch, NavigationScreenProp } from 'react-navigation';
import * as rxjs from 'rxjs'; import { Observable, ReplaySubject } from 'rxjs';

import { appReady } from '../..';
import rxjsOperators from '~/rxjs-operators';

export interface ILinkingHandler {
  validate: (url: string) => boolean;
  handle: (url: string, dispatch: NavigationDispatch, appStarted: boolean) => Promise<void>;
}

export class LinkingService {
  private hasInitialUrl$: ReplaySubject<boolean>;
  private navigator: NavigationScreenProp<any>;
  private handlers: ILinkingHandler[] = [];

  constructor() {
    this.hasInitialUrl$ = new ReplaySubject(1);

    rxjs.of(true).pipe(
      rxjsOperators.switchMap(() => Linking.getInitialURL()),
      rxjsOperators.logError(),
      rxjsOperators.tap(url => this.execUrl(url, true))
    ).subscribe();

    Linking.addEventListener('url', ({ url }) => {
      this.execUrl(url, false);
    });
  }

  public setup(navigator: NavigationScreenProp<any>): void {
    this.navigator = navigator;
  }

  public registerHandler(handler: ILinkingHandler): void {
    this.handlers.push(handler);
  }

  public hasInitialUrl(): Observable<boolean> {
    return this.hasInitialUrl$.asObservable();
  }

  private execUrl(url: string, initial: boolean): any {
    const handler = this.getHandler(url);
    this.hasInitialUrl$.next(handler && initial);

    if (!handler) return;

    appReady().pipe(
      rxjsOperators.switchMap(() => handler.handle(url, this.navigator.dispatch, initial)),
      rxjsOperators.tap(() => SplashScreen.hide()),
      rxjsOperators.tap(() => this.hasInitialUrl$.next(false)),
      rxjsOperators.logError()
    ).subscribe();
  }

  private getHandler(url: string): ILinkingHandler {
    return this.handlers.find(h => h.validate(url));
  }
}

const linkingService = new LinkingService();
export default linkingService;
