import { Button, Container, Content, Icon, View } from 'native-base';
import * as React from 'react';
import { NavigationScreenConfig, NavigationScreenOptions } from 'react-navigation';
import BaseComponent from '~/components/Shared/Abstract/Base';
import ButtonHeaderProfile from '~/components/Shared/ButtonHeaderProfile';
import { classes } from '~/theme';

import WelcomeCard from './components/WelcomeCard';

export default class HomePage extends BaseComponent {
  static navigationOptions: NavigationScreenConfig<NavigationScreenOptions> = ({ navigation }) => {
    return {
      title: 'Início',
      tabBarLabel: 'Início',
      headerLeft: () => (
        <Button style={classes.headerButton} onPress={navigation.toggleDrawer}>
          <Icon name="menu" />
        </Button>
      ),
      headerRight: <ButtonHeaderProfile />,
      drawerIcon: ({ tintColor }) => <Icon name="home" style={{ color: tintColor }} />,
      tabBarIcon: ({ tintColor }) => <Icon name="home" style={{ color: tintColor }} />
    };
  };

  public render(): JSX.Element {
    return (
      <Container style={classes.cardsContainer}>
        <Content>
          <View style={classes.cardsPadding}>
            <WelcomeCard />
          </View>
        </Content>
      </Container>
    );
  }
}
