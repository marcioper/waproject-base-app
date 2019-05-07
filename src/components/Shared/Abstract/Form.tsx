import ValidationContext from '@react-form-fields/native-base/components/ValidationContext';
import * as rxjs from 'rxjs';

import BaseComponent from './Base';

export interface IStateForm<T = any> {
  model?: Partial<T>;
  formSubmitted?: boolean;
}

export default abstract class FormComponent<P, S extends IStateForm> extends BaseComponent<P, S> {
  public state: Readonly<S>;
  protected fields: {
    [key: string]: {
      register: (field: any) => void;
      ref: any;
    }
  } = {};
  protected validationContext: ValidationContext;

  constructor(props: any) {
    super(props);
    this.state = { model: {}, formSubmitted: false } as Readonly<S>;
  }

  public setFieldRef = (fieldName: string) => {
    if (!this.fields[fieldName]) {
      this.fields[fieldName] = {
        register: (field: any) => this.fields[fieldName].ref = field,
        ref: null
      };
    }

    return this.fields[fieldName].register;
  }

  public getFieldRef = (fieldName: string) => {
    return () => this.fields[fieldName].ref;
  }

  public bindValidationContext = (validationContext: ValidationContext): void => {
    this.validationContext = validationContext;
  }

  public isFormValid = (): rxjs.Observable<boolean> => {
    return rxjs.of(this.validationContext.isValid());
  }

  protected updateModel = (handler: (value: any, model: S['model']) => void) => {
    return async (value: any) => {
      const model = { ...this.state.model as any };
      handler(value, model);

      await this.setState({ model }, true);
    };
  }

}