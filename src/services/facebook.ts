import { AccessToken, LoginManager } from 'react-native-fbsdk';
import * as rxjs from 'rxjs'; import { Observable } from 'rxjs';

import RxOp from '~/rxjs-operators';
import logService, { LogService } from './log';

export class FacebookService {
  constructor(private logService: LogService) { }

  public login(): Observable<string> {
    return rxjs.of(true).pipe(
      RxOp.tap(() => this.logService.breadcrumb('Facebook Login')),
      RxOp.tap(() => LoginManager.logOut()),
      RxOp.switchMap(() => LoginManager.logInWithReadPermissions(['public_profile', 'email'])),
      RxOp.switchMap(({ isCancelled }) => {
        return isCancelled ?
          rxjs.of({ accessToken: null }) :
          AccessToken.getCurrentAccessToken();
      }),
      RxOp.catchError(err => {
        if (err.message === 'Login Failed') return rxjs.empty();
        return Observable.throw(err);
      }),
      RxOp.map(({ accessToken }) => accessToken),
      RxOp.tap(a => this.logService.breadcrumb(`Facebook Login ${a ? 'Completed' : 'Cancelled'}`))
    );
  }

}

const facebookService = new FacebookService(logService);
export default facebookService;