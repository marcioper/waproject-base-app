import ValidationContext from '@react-form-fields/native-base/components/ValidationContext';
import FieldText from '@react-form-fields/native-base/components/Text';
import { Button, Container, Content, Form, Icon, List } from 'native-base';
import * as React from 'react';
import { NavigationScreenConfig, NavigationScreenOptions } from 'react-navigation';
import FormComponent, { IStateForm } from '~/components/Shared/Abstract/Form';
import { IUser } from '~/interfaces/models/user';
import Toast from '~/facades/toast';
import RxOp from '~/rxjs-operators';
import userService from '~/services/user';
import { classes } from '~/theme';

interface IState extends IStateForm<IUser> {
}

export default class UserEditPage extends FormComponent<{}, IState> {
  static navigationOptions: NavigationScreenConfig<NavigationScreenOptions> = ({ navigation }) => {
    return {
      title: 'Atualizar Perfil',
      headerRight: (
        <Button style={classes.headerButton} onPress={navigation.getParam('onSave')}>
          <Icon name='save' />
        </Button>
      )
    };
  }

  constructor(props: any) {
    super(props);

    this.state = {
      model: { ...(this.params.user || {}) },
    };
  }

  componentDidMount() {
    this.navigation.setParams({ onSave: this.onSave });
  }

  onSave = (): void => {
    this.isFormValid().pipe(
      RxOp.tap(valid => !valid && Toast.error('Revise os campos')),
      RxOp.filter(valid => valid),
      RxOp.switchMap(() => userService.save(this.state.model as IUser).pipe(RxOp.loader())),
      RxOp.logError(),
      RxOp.bindComponent(this)
    ).subscribe(() => {
      this.navigateBack();
    }, err => Toast.error(err));
  }

  render(): JSX.Element {
    let { model } = this.state;

    return (
      <Container>
        <Content padder keyboardShouldPersistTaps='handled'>
          <Form>
            <ValidationContext ref={this.bindValidationContext}>
              <List>
                <FieldText
                  label='Nome'
                  icon='person'
                  validation='string|required|min:3|max:50'
                  value={model.firstName}
                  ref={this.setFieldRef('firstName')}
                  next={this.getFieldRef('lastName')}
                  onChange={this.updateModel((value, model) => model.firstName = value)}
                />

                <FieldText
                  label='Sobrenome'
                  icon='empty'
                  validation='string|max:50'
                  value={model.lastName}
                  ref={this.setFieldRef('lastName')}
                  next={this.getFieldRef('email')}
                  onChange={this.updateModel((value, model) => model.lastName = value)}
                />

                <FieldText
                  label='Email'
                  icon='mail'
                  validation='string|email|max:150'
                  keyboardType='email-address'
                  value={model.email}
                  ref={this.setFieldRef('email')}
                  next={this.getFieldRef('gender')}
                  onChange={this.updateModel((value, model) => model.email = value)}
                />

              </List>
            </ValidationContext>
          </Form>
        </Content>
      </Container>
    );
  }
}
