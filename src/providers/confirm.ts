import { Alert } from 'react-native';
import * as rxjs from 'rxjs'; import { Observable } from 'rxjs';

import rxjsOperators from '~/rxjs-operators';

export function confirm(title: string, message: string, okText: string = 'OK', cancelText: string = 'Cancelar'): Observable<boolean> {
  return rxjs.of(true).pipe(
    rxjsOperators.switchMap(() => {
      return new Promise<boolean>(resolve => {
        Alert.alert(title, message, [
          { text: cancelText, style: 'cancel', onPress: () => resolve(false) },
          { text: okText, onPress: () => resolve(true) }
        ], { onDismiss: () => resolve(false) });
      });
    })
  );
}