import { setJSExceptionHandler } from 'react-native-exception-handler';
import RNRestart from 'react-native-restart';
import { isDevelopment } from '~/config';
import { alertError } from '~/providers/alert';
import { toastError } from '~/providers/toast';
import logService from '~/services/log';

setJSExceptionHandler((err: any, isFatal: boolean) => {
  if (!err) return;

  logService.handleError(err);

  if (!isFatal) {
    toastError(err);
    return;
  }

  alertError(err, 'Reabrir', 'É necessário reabrir o app')
    .subscribe(() => RNRestart.Restart());
}, !isDevelopment);
