import { Container, Text, View } from 'native-base';
import * as React from 'react';
import { Animated, Image, ImageBackground, StatusBar, StyleSheet } from 'react-native';
import { NavigationScreenOptions } from 'react-navigation';
import LoginFormComponent from '~/components/Screens/Login/components/Form';
import LoginSocialComponent from '~/components/Screens/Login/components/Social';
import BaseComponent from '~/components/Shared/Abstract/Base';
import imageBackground from '~/images/background.jpg';
import imageLogo from '~/images/logo.png';
import Toast from '~/facades/toast';
import RxOp from '~/rxjs-operators';
import facebookService from '~/services/facebook';
import googleService from '~/services/google';
import userService from '~/services/user';
import { theme } from '~/theme';

interface IState {
  animationFade: Animated.Value;
  animationTranslate: Animated.Value;
  animationContainer: any;
}

export default class LoginPage extends BaseComponent<{}, IState> {
  static navigationOptions: NavigationScreenOptions = {
    header: null
  };

  constructor(props: any) {
    super(props);

    const fade = new Animated.Value(0);
    const translate = new Animated.Value(-100);

    this.state = {
      animationFade: fade,
      animationTranslate: translate,
      animationContainer: { opacity: fade, transform: [{ translateY: translate }] }
    };
  }

  componentDidMount(): void {
    Animated.timing(this.state.animationFade, {
      toValue: 1,
      useNativeDriver: true
    }).start();

    Animated.timing(this.state.animationTranslate, {
      toValue: 0,
      useNativeDriver: true
    }).start();
  }

  handleForm = (model: { email: string, password: string }) => {
    userService.login(model.email, model.password).pipe(
      RxOp.loader(),
      RxOp.logError(),
      RxOp.bindComponent(this)
    ).subscribe(() => this.navigateToHome(), err => Toast.error(err));
  }

  handleLoginSocial = (provider: 'google' | 'facebook'): void => {
    const providers = {
      facebook: facebookService,
      google: googleService
    };

    providers[provider].login().pipe(
      RxOp.tap(a => console.log(a)),
      RxOp.filter(accessToken => !!accessToken),
      RxOp.switchMap(accessToken => userService.loginSocial(provider, accessToken)),
      RxOp.loader(),
      RxOp.logError(),
      RxOp.bindComponent(this)
    ).subscribe(() => this.navigateToHome(), err => Toast.error(err));
  }

  navigateToHome = (): void => {
    this.navigate('Home', null, true);
  }

  render(): JSX.Element {
    const { animationContainer } = this.state;

    return (
      <Container>
        <StatusBar barStyle='light-content' backgroundColor='#000000' />
        <View style={styles.container}>

          <ImageBackground source={imageBackground} style={styles.background}>
            <Animated.View style={[animationContainer, styles.background]}>

              <Image source={imageLogo} style={styles.logo} />
              <Text style={styles.welcome}>Bem-vindo!</Text>

              <LoginFormComponent onSubmit={this.handleForm} />
              <LoginSocialComponent onClick={this.handleLoginSocial} />

            </Animated.View>

          </ImageBackground>
        </View>
      </Container>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black'
  },
  logo: {
    height: 120,
    width: 120,
    marginBottom: 10
  },
  welcome: {
    fontSize: 30,
    textAlign: 'center',
    marginBottom: 5,
    color: 'white',
    backgroundColor: 'transparent',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10
  },
  background: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: theme.deviceHeight,
    width: theme.deviceWidth
  }
});