import * as Rx from 'rxjs';
import { IOrder } from '~/interfaces/models/order';
import RxOp, { ICacheResult } from '~/rxjs-operators';

import apiService, { ApiService } from './api';
import tokenService, { TokenService } from './token';

export class OrderService {
  constructor(private apiService: ApiService, private tokenService: TokenService) {}

  public get(refresh?: boolean): Rx.Observable<ICacheResult<IOrder>> {
    return this.tokenService.getToken().pipe(
      RxOp.switchMap(token => {
        if (!token) {
          return Rx.of({ updating: false, data: null });
        }

        return this.apiService.get<IOrder>('order').pipe(RxOp.cache('service-order', { refresh }));
      })
    );
  }

  public save(model: IOrder): Rx.Observable<IOrder> {
    return this.apiService.post<IOrder>('order', model).pipe(RxOp.cacheClean('service-order'));
  }
}

const orderService = new OrderService(apiService, tokenService);
export default orderService;
