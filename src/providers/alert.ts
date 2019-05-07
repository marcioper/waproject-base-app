import { Alert } from 'react-native';
import * as rxjs from 'rxjs'; import { Observable } from 'rxjs';

import { errorMessageFormatter } from '~/formatters/errorMessage';
import rxjsOperators from '~/rxjs-operators';

export function alert(title: string, message: string, okText: string = 'OK'): Observable<boolean> {
  return rxjs.of(true).pipe(
    rxjsOperators.switchMap(() => {
      return new Promise<boolean>(resolve => {
        setTimeout(() => {
          Alert.alert(title, message, [
            { text: okText, onPress: () => resolve(true) }
          ], { onDismiss: () => resolve(false) });
        }, 500);
      });
    })
  );
}

export function alertError(err: any, okText: string = 'OK', extraText: string = null): Observable<boolean> {
  return alert(
    'Erro',
    errorMessageFormatter(err) + (extraText ? `\n\n${extraText}` : ''),
    okText);
}