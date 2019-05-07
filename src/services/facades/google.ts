import { GoogleSignin } from 'react-native-google-signin';
import * as rxjs from 'rxjs'; import { Observable } from 'rxjs';

import rxjsOperators from '~/rxjs-operators';
import { googleApi } from '~/config';
import logService, { LogService } from '../log';

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
      rxjsOperators.tap(() => this.logService.breadcrumb('Google Login')),
      rxjsOperators.switchMap(() => GoogleSignin.signIn()),
      rxjsOperators.catchError(err => {
        return [-5, 12501].includes(err.code) ? rxjs.of({ accessToken: null }) : rxjs.throwError(err);
      }),
      rxjsOperators.map(({ accessToken }) => accessToken),
      rxjsOperators.tap(a => this.logService.breadcrumb(`Google Login ${a ? 'Completed' : 'Cancelled'}`))
    );
  }

}

const googleService = new GoogleService(logService, googleApi);
export default googleService;