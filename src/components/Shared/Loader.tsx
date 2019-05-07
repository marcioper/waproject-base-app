import { Spinner, View } from 'native-base';
import * as React from 'react';
import { Modal, StyleSheet } from 'react-native';
import { theme } from '~/theme';

interface IState {
  refs: string[];
}

interface IProps { }

export class Loader extends React.PureComponent<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = { refs: [] };
  }

  show = (ref: string): void => {
    if (typeof ref !== 'string') {
      throw new Error('Loader.show needs a ref string value');
    }

    const { refs } = this.state;
    if (refs.includes(ref)) return;

    this.setState({ refs: [...refs, ref] });
  }

  hide = (ref: string): void => {
    if (typeof ref !== 'string') {
      throw new Error('Loader.hide needs a ref string value');
    }

    const { refs } = this.state;
    const index = refs.indexOf(ref);
    if (index === -1) return;

    refs.splice(index, 1);
    this.setState({ refs: [...refs] });
  }

  handleRequestClose = () => { };

  render(): JSX.Element {
    return (
      <Modal
        animationType='fade'
        transparent={true}
        visible={!!this.state.refs.length}
        onRequestClose={this.handleRequestClose}
      >
        <View style={styles.container}>
          <Spinner size='large' color={theme.accent} />
        </View>
      </Modal>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ scale: 1.5 }]
  }
});