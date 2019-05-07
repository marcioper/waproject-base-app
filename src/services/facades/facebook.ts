import { AccessToken, LoginManager } from 'react-native-fbsdk';
import * as rxjs from 'rxjs'; import { Observable } from 'rxjs';

import rxjsOperators from '~/rxjs-operators';
import logService, { LogService } from '../log';

export class FacebookService {
  constructor(private logService: LogService) { }

  public login(): Observable<string> {
    return rxjs.of(true).pipe(
      rxjsOperators.tap(() => this.logService.breadcrumb('Facebook Login')),
      rxjsOperators.tap(() => LoginManager.logOut()),
      rxjsOperators.switchMap(() => LoginManager.logInWithReadPermissions(['public_profile', 'email'])),
      rxjsOperators.switchMap(({ isCancelled }) => {
        return isCancelled ?
          rxjs.of({ accessToken: null }) :
          AccessToken.getCurrentAccessToken();
      }),
      rxjsOperators.catchError(err => {
        if (err.message === 'Login Failed') return rxjs.empty();
        return Observable.throw(err);
      }),
      rxjsOperators.map(({ accessToken }) => accessToken),
      rxjsOperators.tap(a => this.logService.breadcrumb(`Facebook Login ${a ? 'Completed' : 'Cancelled'}`))
    );
  }

}

const facebookService = new FacebookService(logService);
export default facebookService;