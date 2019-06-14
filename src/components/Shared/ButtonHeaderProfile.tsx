import { Button, Icon } from 'native-base';
import React from 'react';
import { StyleSheet } from 'react-native';
import WithNavigation from '~/decorators/withNavigation';
import { IUser } from '~/interfaces/models/user';
import  Toast from '~/facades/toast';
import RxOp from '~/rxjs-operators';
import userService from '~/services/user';
import { classes, theme } from '~/theme';

import BaseComponent from './Abstract/Base';

interface IState {
  user?: IUser;
  verified: boolean;
}

@WithNavigation()
export default class ButtonHeaderProfile extends BaseComponent<{}, IState> {
  constructor(props: any) {
    super(props);
    this.state = { verified: false };
  }

  componentWillMount(): void {
    userService.get().pipe(
      RxOp.logError(),
      RxOp.bindComponent(this)
    ).subscribe(({ data: user }) => {
      this.setState({ user, verified: true });
    }, err => Toast.error(err));
  }

  navigateLogin = () => this.navigate('Login');
  navigateProfile = () => this.navigate('Profile');

  render() {
    const { user, verified } = this.state;

    if (!verified) {
      return null;
    }

    if (!user) {
      return (
        <Button style={classes.headerButton} onPress={this.navigateLogin}>
          <Icon name='contact' style={styles.icon} />
        </Button>
      );
    }

    return (
      <Button style={classes.headerButton} onPress={this.navigateProfile}>
        <Icon name='contact' style={styles.icon} />
      </Button>
    );

  }
}

const styles = StyleSheet.create({
  avatarImg: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 15
  },
  icon: {
    fontSize: 28,
    color: theme.toolbarBtnTextColor
  }
});