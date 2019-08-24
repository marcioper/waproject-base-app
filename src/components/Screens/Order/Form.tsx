import ValidationContext from '@react-form-fields/native-base/components/ValidationContext';
import FieldText from '@react-form-fields/native-base/components/Text';
import { Button, Container, Content, Form, Icon, List } from 'native-base';
import * as React from 'react';
import { NavigationScreenConfig, NavigationScreenOptions } from 'react-navigation';
import FormComponent, { IStateForm } from '~/components/Shared/Abstract/Form';
import { IOrder } from '~/interfaces/models/order';
import Toast from '~/facades/toast';
import RxOp from '~/rxjs-operators';
import orderService from '~/services/order';
import { classes } from '~/theme';

interface IState extends IStateForm<IOrder> {}

export default class OrderSavePage extends FormComponent<{}, IState> {
  static navigationOptions: NavigationScreenConfig<NavigationScreenOptions> = ({ navigation }) => {
    return {
      title: 'Realizar Pedido',
      headerLeft: () => (
        <Button style={classes.headerButton} onPress={navigation.toggleDrawer}>
          <Icon name="menu" />
        </Button>
      ),
      headerRight: (
        <Button style={classes.headerButton} onPress={navigation.getParam('onSave')}>
          <Icon name="save" />
        </Button>
      ),
      drawerIcon: ({ tintColor }) => <Icon name="create" style={{ color: tintColor }} />
    };
  };

  constructor(props: any) {
    super(props);

    this.state = {
      model: { description: '' }
    };
  }

  componentDidMount() {
    this.navigation.setParams({ onSave: this.onSave });
  }

  cleanForm = () => {
    setTimeout(() => {
      this.setState({ model: { description: '', amount: 0, price: 0 } });
    }, 5000);
  };

  onSave = (): void => {
    this.isFormValid()
      .pipe(
        RxOp.tap(valid => !valid && Toast.show('Revise os campos', 0, 'danger')),
        RxOp.filter(valid => valid),
        RxOp.switchMap(() => orderService.save(this.state.model as IOrder).pipe(RxOp.loader())),
        RxOp.logError(),
        RxOp.bindComponent(this)
      )
      .subscribe(
        () => {
          Toast.show('Pedido realizado com sucesso!', 5000, 'success');
        },
        err => Toast.error(err),
        () => {
          this.cleanForm();
        }
      );
  };

  render(): JSX.Element {
    let { model } = this.state;

    return (
      <Container>
        <Content padder keyboardShouldPersistTaps="handled">
          <Form>
            <ValidationContext ref={this.bindValidationContext}>
              <List>
                <FieldText
                  label="Descrição"
                  validation="string|required|min:3|max:150"
                  value={model.description}
                  ref={this.setFieldRef('description')}
                  next={this.getFieldRef('amount')}
                  onChange={this.updateModel((value, model) => (model.description = value))}
                />

                <FieldText
                  label="Quantidade"
                  validation="numeric|required"
                  keyboardType="numeric"
                  value={model.amount}
                  ref={this.setFieldRef('amount')}
                  next={this.getFieldRef('price')}
                  onChange={this.updateModel((value, model) => (model.amount = value))}
                />

                <FieldText
                  label="Valor"
                  validation="numeric|required"
                  keyboardType="decimal-pad"
                  value={model.price}
                  ref={this.setFieldRef('email')}
                  onChange={this.updateModel((value, model) => (model.price = value))}
                />
              </List>
            </ValidationContext>
          </Form>
        </Content>
      </Container>
    );
  }
}
