import { ValidatorFn } from '@angular/forms';
import * as Immutable from 'immutable';

import { type } from '../util';

export interface IFormBuilderVM {
    name: string;
    init(): Array<IFormFieldWrapper<any>>;
    getFields(): Immutable.List<IFormFieldWrapper<any>>;
}

export interface IFormFieldWrapper<T> {
    labelText: string;
    templateRefId: string;
    context: IFormFieldContext;
    field: IFormField<T> | IFormBuilderVM;
}

export interface IFormField<T> {
    name: string;
    type: FormFieldType;
    initialValue: T;
    validators: ValidatorFn | ValidatorFn[];
}

export interface IFormFieldContext {
    getContextData(): Map<string, any>;
}

export enum FormFieldType {
    InputString,
    InputNumber,
    InputEmail,
    CheckBox,
    Radio,
    RadioGroup,
    AutoComplete,
    AutoComplteMultiSelect,
    Select,
    ReadOnly,
    Date,
    Switch,
    TextArea,
    RichTextEditor,
    Custom,
    DisplayValue,
    FileUpload,
    CheckBoxGroup,
    DateWithTime
}
