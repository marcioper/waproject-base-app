import { Client, Configuration } from 'bugsnag-react-native';
import { IS_DEV } from '~/config';
import { IUserToken } from '~/interfaces/tokens/user';

export class LogService {
  private bugsnag: any;

  constructor(private isDevelopment: boolean) {
    const config = new Configuration();
    config.notifyReleaseStages = ['production'];

    this.bugsnag = new Client(config);
  }

  public setUser(user: IUserToken): void {
    if (!user) {
      this.bugsnag.clearUser();
      return;
    }

    this.bugsnag.setUser(user.id.toString(), user.fullName);
  }

  public breadcrumb(text: string, type: string = 'manual', extraData: any = {}): void {
    extraData = extraData || {};
    delete extraData.type;

    console.log(type + ' ' + text);

    this.bugsnag.leaveBreadcrumb(text, { type, data: extraData });
  }

  public handleError(err: any, force: boolean = false): void {
    if (!err) return;

    if (typeof err === 'string') {
      err = new Error(err);
    }

    if (['NETWORK_ERROR'].includes(err.message)) {
      return;
    }

    if (err.ignoreLog && !force) {
      return;
    }

    if (this.isDevelopment) {
      console.error(err);
      console.log(err.metadata);
      return;
    }

    this.bugsnag.notify(err, function (report: any): void {
      report.metadata = { metadata: err.metadata, err };
    });
  }

}

const logService = new LogService(IS_DEV);
export default logService;