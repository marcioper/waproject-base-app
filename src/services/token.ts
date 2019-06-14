import * as base64 from 'base-64';
import { Observable, ReplaySubject } from 'rxjs';
import { IAuthToken } from '~/interfaces/authToken';
import { enRoles } from '~/interfaces/models/user';
import { IUserToken } from '~/interfaces/tokens/user';
import RxOp from '~/rxjs-operators';

import storageService, { StorageService } from '~/facades/storage';

export class TokenService {
  private tokens: IAuthToken;
  private authToken$: ReplaySubject<IAuthToken>;

  constructor(private storageService: StorageService) {
    this.authToken$ = new ReplaySubject(1);

    this.storageService.get('authToken').pipe(
      RxOp.logError()
    ).subscribe(tokens => {
      this.tokens = tokens;
      this.authToken$.next(tokens);
    });
  }

  public getToken(): Observable<IAuthToken> {
    return this.authToken$.pipe(RxOp.distinctUntilChanged());
  }

  public getUser(): Observable<IUserToken> {
    return this.getToken().pipe(
      RxOp.map(tokens => {
        if (!tokens) return;

        const user: IUserToken = JSON.parse(base64.decode(tokens.accessToken.split('.')[1]));

        user.fullName = `${user.firstName} ${user.lastName}`;
        user.canAccess = (...roles: enRoles[]) => {
          if (!roles || roles.length === 0) {
            return true;
          }

          if (roles.includes(enRoles.sysAdmin) && !user.roles.includes(enRoles.sysAdmin)) {
            return false;
          }

          if (user.roles.some(r => ['sysAdmin', 'admin'].includes(r))) {
            return true;
          }

          return roles.some(r => user.roles.includes(r));
        };

        return user;
      })
    );
  }

  public setToken(tokens: IAuthToken): Observable<void> {
    return this.storageService.set('authToken', tokens).pipe(
      RxOp.map(() => {
        this.tokens = tokens;
        this.authToken$.next(tokens);
      })
    );
  }

  public clearToken(): Observable<void> {
    return this.setToken(null).pipe(RxOp.map(() => null));
  }

  public setAccessToken(accessToken: string): Observable<void> {
    this.tokens.accessToken = accessToken;

    return this.storageService.set('authToken', this.tokens).pipe(
      RxOp.map(() => {
        this.authToken$.next(this.tokens);
      })
    );
  }

  public isAuthenticated(): Observable<boolean> {
    return this.getToken().pipe(
      RxOp.map(token => !!token),
      RxOp.distinctUntilChanged()
    );
  }
}

const tokenService = new TokenService(storageService);
export default tokenService;