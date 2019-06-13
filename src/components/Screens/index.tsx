import * as React from 'react';
import { StatusBar, View } from 'react-native';
import SplashScreen from 'react-native-splash-screen';
import BaseComponent from '~/components/Shared/Abstract/Base';
import { IS_ANDROID } from '~/config';
import rxjsOperators from '~/rxjs-operators';
import { appDefaultNavigation, appOpened } from '~/services';
import tokenService from '~/services/token';
import { theme } from '~/theme';

export default class IndexPage extends BaseComponent {

  public componentWillMount(): void {
    appOpened();

    StatusBar.setBarStyle('light-content');
    IS_ANDROID && StatusBar.setBackgroundColor(theme.statusBarColor);

    appDefaultNavigation().pipe(
      rxjsOperators.first(),
      rxjsOperators.filter(ok => ok),
      rxjsOperators.switchMap(() => tokenService.isAuthenticated()),
      rxjsOperators.map(isAuthenticated => {
        setTimeout(() => SplashScreen.hide(), 500);
        this.navigate(isAuthenticated ? 'Home' : 'Home', null, true);
      }),
      rxjsOperators.logError(),
      rxjsOperators.bindComponent(this)
    ).subscribe();
  }

  public render(): JSX.Element {
    return <View />;
  }
}