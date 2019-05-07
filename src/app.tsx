import './errorHandler';

import { setConfig } from '@react-form-fields/native-base/config';
import ConfigBuilder from '@react-form-fields/native-base/config/builder';
import lang from '@react-form-fields/native-base/lang/pt-br';
import { Root, StyleProvider } from 'native-base';
import * as React from 'react';
import { AppRegistry, Keyboard, YellowBox } from 'react-native';
import { NavigationState } from 'react-navigation';
import { Loader } from '~/components/Shared/Loader';
import * as loaderOperador from '~/rxjs-operators/loader';
import { setupServices } from '~/services';
import logService from '~/services/log';
import { theme } from '~/theme';
import getTheme from '~/theme/native-base/components';

import Navigator from './components/Navigator';
import getCurrentRouteState from './helpers/currentRouteState';

const config = new ConfigBuilder()
  .fromLang(lang)
  .build();

setConfig(config);

YellowBox.ignoreWarnings([
  'Warning: FieldDatepicker has a method',
  'Warning: componentWillMount is deprecated',
  'Warning: componentWillUpdate is deprecated',
  'Warning: componentWillReceiveProps is deprecated',
  'Warning: isMounted',
  'Module RNGoogleSignin',
  'Module SQLite',
  'Module RCTImageLoader requires'
]);

interface IState {
  loading: boolean;
}

class App extends React.Component<any, IState> {
  private navigator: any;
  private loader: Loader;
  private theme: any;

  constructor(props: any) {
    super(props);

    this.theme = getTheme(theme);
    this.state = { loading: true };
  }

  async componentDidMount(): Promise<void> {
    loaderOperador.setup(this.loader);

    await this.setState({ loading: false });
    setupServices(this.navigator);
  }

  setLoaderRef = (loader: Loader) => {
    this.loader = loader;
  }

  onNavigationStateChange = (prevState: NavigationState, currentState: NavigationState): void => {
    Keyboard.dismiss();

    if (!currentState || !currentState.routes || !currentState.routes.length || prevState === currentState) return;
    logService.breadcrumb(getCurrentRouteState(currentState).routeName, 'navigation');
  }

  render(): JSX.Element {
    const { loading } = this.state;

    return (
      <StyleProvider style={this.theme}>
        <Root>
          <Loader ref={this.setLoaderRef} />
          {!loading &&
            <Navigator
              ref={(nav: any) => this.navigator = nav}
              onNavigationStateChange={this.onNavigationStateChange}
            />
          }
        </Root>
      </StyleProvider>
    );
  }

}

AppRegistry.registerComponent('reactApp', () => App);