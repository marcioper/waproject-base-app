import { Toast as CoreToast } from 'native-base';
import { IS_ANDROID } from '~/config';
import { errorMessageFormatter } from '~/formatters/errorMessage';

import { InteractionManager } from './interactionManager';

type typeToast = 'danger' | 'success' | 'warning';

export default class Toast {
  static show(text: string, duration: number = 5000, type: typeToast = null): void {
    InteractionManager.runAfterInteractions(() => {
      CoreToast.show({
        text,
        position: IS_ANDROID ? 'bottom' : 'top',
        buttonText: 'OK',
        duration,
        type
      });
    });
  }

  static error(err: any): void {
    this.show(errorMessageFormatter(err), 0, 'danger');
  }
}