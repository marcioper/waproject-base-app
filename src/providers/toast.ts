import { Toast } from 'native-base';
import { isAndroid } from '~/config';
import { errorMessageFormatter } from '~/formatters/errorMessage';

import { InteractionManager } from './interactionManager';

type typeToast = 'danger' | 'success' | 'warning';

export function toast(text: string, duration: number = 5000, type: typeToast = null): void {
  InteractionManager.runAfterInteractions(() => {
    Toast.show({
      text,
      position: isAndroid ? 'bottom' : 'top',
      buttonText: 'OK',
      duration,
      type
    });
  });
}

export function toastError(err: any): void {
  toast(errorMessageFormatter(err), 0, 'danger');
}