import ValidationContext from '@react-form-fields/native-base/components/ValidationContext';
import FieldText from '@react-form-fields/native-base/components/Text';
import { Button, Card, Text } from 'native-base';
import React from 'react';
import { StyleSheet } from 'react-native';
import FormComponent, { IStateForm } from '~/components/Shared/Abstract/Form';
import Toast from '~/facades/toast';
import RxOp from '~/rxjs-operators';
import { theme } from '~/theme';

interface IState extends IStateForm<{ email: string, password: string }> {

}

interface IProps {
  onSubmit: (model: { email: string, password: string }) => void;
}

export default class LoginFormComponent extends FormComponent<IProps, IState> {
  inputStyles = {
    container: styles.inputContainer
  };

  handleSubmit = () => {
    this.isFormValid().pipe(
      RxOp.filter(valid => valid),
      RxOp.logError(),
      RxOp.bindComponent(this)
    ).subscribe(() => {
      this.props.onSubmit(this.state.model as any);
    }, err => Toast.error(err));
  }

  render() {
    const { model } = this.state;

    return (
      <ValidationContext ref={this.bindValidationContext}>
        <Card style={styles.card}>

          <FieldText
            placeholder='Email'
            keyboardType='email-address'
            validation='required|email'
            value={model.email}
            ref={this.setFieldRef('email')}
            next={this.getFieldRef('password')}
            onChange={this.updateModel((v, m) => m.email = v)}
            styles={this.inputStyles}
          />

          <FieldText
            placeholder='Senha'
            secureTextEntry={true}
            validation='required'
            value={model.password}
            ref={this.setFieldRef('password')}
            onChange={this.updateModel((v, m) => m.password = v)}
            onSubmit={this.handleSubmit}
            styles={this.inputStyles}
          />

          <Button style={styles.button} full onPress={this.handleSubmit}>
            <Text>Entrar</Text>
          </Button>

        </Card>
      </ValidationContext>
    );
  }
}

const styles = StyleSheet.create({
  card: {
    flex: 0,
    padding: 20,
    paddingRight: 30,
    marginTop: 20,
    width: theme.deviceWidth - 60,
    justifyContent: 'flex-start'
  },
  inputContainer: {
    paddingTop: 0
  },
  button: {
    borderRadius: theme.borderRadiusBase,
    marginTop: 10
  }
});