import { Alert as CoreAlert } from 'react-native';
import { errorMessageFormatter } from '~/formatters/errorMessage';
import RxOp from '~/rxjs-operators';
import * as Rx from 'rxjs';

export default class Alert {
  static show(title: string, message: string, okText: string = 'OK'): Rx.Observable<boolean> {
    return Rx.of(true).pipe(
      RxOp.switchMap(() => {
        return new Promise<boolean>(resolve => {
          setTimeout(() => {
            CoreAlert.alert(title, message, [
              { text: okText, onPress: () => resolve(true) }
            ], { onDismiss: () => resolve(false) });
          }, 500);
        });
      })
    );
  }

  static error(err: any, okText: string = 'OK', extraText: string = null): Rx.Observable<boolean> {
    return this.show(
      'Erro',
      errorMessageFormatter(err) + (extraText ? `\n\n${extraText}` : ''),
      okText);
  }

  static confirm(title: string, message: string, okText: string = 'OK', cancelText: string = 'Cancelar'): Rx.Observable<boolean> {
    return Rx.of(true).pipe(
      RxOp.switchMap(() => {
        return new Promise<boolean>(resolve => {
          CoreAlert.alert(title, message, [
            { text: cancelText, style: 'cancel', onPress: () => resolve(false) },
            { text: okText, onPress: () => resolve(true) }
          ], { onDismiss: () => resolve(false) });
        });
      })
    );
  }
}