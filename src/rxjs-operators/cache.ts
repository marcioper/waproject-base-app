import * as Rx from 'rxjs';
import * as RxOp from 'rxjs/operators';
import cacheService from '~/services/cache';

interface IOptions {
  refresh: boolean;
  persist: boolean;
  expirationMinutes: number;
}

export interface ICacheResult<T = any> {
  updating: boolean;
  data: T;
}

export function cache<T>(key: string, options: Partial<IOptions> = {}) {
  const defaultOptions: IOptions = {
    refresh: false,
    persist: true,
    expirationMinutes: 5
  };

  return (source: Rx.Observable<T>) => source.lift<ICacheResult<T>>(new CacheOperator(key, { ...defaultOptions, ...options }));
}

class CacheOperator<T> implements Rx.Operator<T, T> {
  constructor(
    private key: string,
    private options: IOptions
  ) { }

  public call(subscriber: Rx.Subscriber<any>, source: Rx.Observable<any>): Rx.Subscription {
    let useCache = !this.options.refresh;

    return cacheService.watchData(this.key).pipe(
      RxOp.map(cache => useCache ? cache : null),
      RxOp.switchMap(cache => {
        if (cache && !cacheService.isExpirated(cache)) {
          return Rx.of({ updating: false, data: cache.data });
        }

        return source.pipe(
          RxOp.switchMap(data => {
            useCache = true;
            return cacheService.saveData(this.key, data, this.options);
          }),
          RxOp.filter(() => false),
          !cache ? RxOp.tap() : RxOp.startWith({ updating: true, data: cache.data })
        );
      })
    ).subscribe(subscriber);
  }
}