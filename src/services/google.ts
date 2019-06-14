import { GoogleSignin } from 'react-native-google-signin';
import * as rxjs from 'rxjs';
import { Observable } from 'rxjs';

import RxOp from '~/rxjs-operators';
import { GOOGLE_API } from '~/config';
import logService, { LogService } from './log';

export class GoogleService {
  constructor(
    private logService: LogService,
    googleApi: { iosClientId: string, webClientId: string }
  ) {
    const options = { ...googleApi, offlineAccess: true };

    GoogleSignin
      .hasPlayServices()
      .then(() => GoogleSignin.configure(options))
      .catch(err => logService.handleError(err));
  }

  public login(): Observable<string> {
    return rxjs.of(true).pipe(
      RxOp.tap(() => this.logService.breadcrumb('Google Login')),
      RxOp.switchMap(() => GoogleSignin.signIn()),
      RxOp.switchMap(() => GoogleSignin.getTokens()),
      RxOp.catchError(err => {
        return [-5, 12501].includes(err.code) ? rxjs.of({ accessToken: null }) : rxjs.throwError(err);
      }),
      RxOp.map(({ accessToken }) => accessToken),
      RxOp.tap(a => this.logService.breadcrumb(`Google Login ${a ? 'Completed' : 'Cancelled'}`))
    );
  }

}

const googleService = new GoogleService(logService, GOOGLE_API);
export default googleService;