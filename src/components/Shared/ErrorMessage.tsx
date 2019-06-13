import * as React from 'react';

import EmptyMessage from './EmptyMessage';

interface IState {
  icon: string;
  message: string;
}

interface IProps {
  error?: Error;
  button?: string;
  onPress?: () => void;
  small?: boolean;
}

export default class ErrorMessage extends React.PureComponent<IProps, IState> {
  static getDerivedStateFromProps({ error }: IProps, currentState: IState): IState {
    let icon, message;

    switch ((error || { message: '' }).message) {
      case 'no-internet':
      case 'NETWORK_ERROR':
        icon = 'ios-wifi';
        message = 'Sem conexão com a internet';
        break;
      case 'api-error':
        icon = 'thunderstorm';
        message = 'Não conseguimos se comunicar com o servidor';
        break;
      default:
        icon = 'bug';
        message = 'Algo deu errado...';
    }

    return {
      ...currentState,
      icon,
      message
    };
  }

  constructor(props: IProps) {
    super(props);
    this.state = { icon: '', message: '' };
  }

  render(): JSX.Element {
    const { icon, message } = this.state;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { error, ...props } = this.props;

    return <EmptyMessage icon={icon} message={message} {...props} />;
  }
}
