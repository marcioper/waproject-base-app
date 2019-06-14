import { AsyncStorage } from 'react-native';
import * as Rx from 'rxjs'; import { Observable } from 'rxjs';

import RxOp from '~/rxjs-operators';
import { apiResponseFormatter } from '~/formatters/apiResponse';

export class StorageService {

  public get<T = any>(key: string): Observable<T> {
    return Rx.of(true).pipe(
      RxOp.switchMap(() => AsyncStorage.getItem(key)),
      RxOp.map(data => data ? apiResponseFormatter(JSON.parse(data)) : null)
    );
  }

  public set<T = any>(key: string, value: T): Observable<T> {
    return Rx.of(true).pipe(
      RxOp.switchMap(() => AsyncStorage.setItem(key, JSON.stringify(value))),
      RxOp.map(() => value)
    );
  }

  public clear(regexp: RegExp): Observable<void> {
    return Rx.of(true).pipe(
      RxOp.switchMap(() => AsyncStorage.getAllKeys()),
      RxOp.switchMap(keys => {
        if (regexp) {
          keys = keys.filter(k => regexp.test(k));
        }

        if (!keys.length) return Rx.of(null);
        return AsyncStorage.multiRemove(keys);
      })
    );
  }

}

const storageService = new StorageService();
export default storageService;