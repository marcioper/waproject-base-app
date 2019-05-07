import { Button, Icon, Text, View, ListItem, Body, Left, Right } from 'native-base';
import * as React from 'react';
import { StyleSheet } from 'react-native';
import { theme, classes } from '~/theme';

interface IProps {
  icon: string;
  message: string;
  button?: string;
  onPress?: () => void;
  small?: boolean;
}

export default class EmptyMessage extends React.PureComponent<IProps> {
  render(): JSX.Element {
    const { icon, message, button, onPress, small } = this.props;

    if (small) {
      return (
        <ListItem style={[classes.listItem, styles.listBody]}>
          <Left style={classes.listIconWrapper}>
            <Icon active name={icon} style={classes.listIcon} />
          </Left>
          <Body>
            <Text>{message}</Text>
          </Body>
          {onPress &&
            <Right>
              <Button accent icon transparent onPress={onPress}>
                <Icon active name='refresh' />
              </Button>
            </Right>
          }
        </ListItem>
      );
    }

    return (
      <View padder style={styles.container}>
        <Icon active name={icon} style={styles.icon} />
        <Text style={styles.message}>{message}</Text>
        {!!button &&
          <Button accent block style={styles.button} onPress={onPress}>
            <Text>{button}</Text>
          </Button>
        }
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  icon: {
    marginTop: 90,
    fontSize: 100,
    color: theme.darkGray
  },
  message: {
    marginTop: 5,
    fontSize: 18,
    opacity: 0.5,
    textAlign: 'center'
  },
  button: {
    marginTop: 20
  },
  listBody: {
    borderBottomWidth: 0
  }
});