import { CommonValidators } from '../../shared/validators/common-validators';
import { Context } from 'vm';
import { ValidatorFn, Validators } from '@angular/forms';
import {
    FormFieldType,
    IFormBuilderVM,
    IFormField,
    IFormFieldContext,
    IFormFieldWrapper
} from '../../shared/models/iform-builder-vm';
import * as Immutable from 'immutable';

export class ReferralForm implements IFormBuilderVM {
    public name: string;
    public fieldsArray: Array<ReferralFieldWrapper<any>> = new Array();

    constructor(name: string) {
        this.name = name;
        this.init();
    }

    public init(): Array<IFormFieldWrapper<any>> {

        this.fieldsArray.push(createFormFieldWrapperObject('First name', '', createFormFieldObject('FirstName', FormFieldType.InputString, '', [Validators.required])));
        this.fieldsArray.push(createFormFieldWrapperObject('Last name', '', createFormFieldObject('LastName', FormFieldType.InputString, '', [Validators.required])));
        this.fieldsArray.push(createFormFieldWrapperObject('Company name', '', createFormFieldObject('CompanyName', FormFieldType.InputString, '', [Validators.required])));
        this.fieldsArray.push(createFormFieldWrapperObject('Telephone number', '', createFormFieldObject('TelephoneNumber', FormFieldType.InputString, '', [Validators.required, CommonValidators.phoneUK()])));
        this.fieldsArray.push(createFormFieldWrapperObject('Email', '', createFormFieldObject('Email', FormFieldType.InputEmail, '', [Validators.required])));
        this.fieldsArray.push(createFormFieldWrapperObject('Referral comments', '', createFormFieldObject('ReferralComments', FormFieldType.TextArea, '', [])));


        return this.fieldsArray;
    }

    public getFields(): Immutable.List<IFormFieldWrapper<any>> {
        return Immutable.List(this.fieldsArray);
    }
}

export class ReferralFieldWrapper<T> implements IFormFieldWrapper<T> {
    labelText: string;
    templateRefId: string;
    context: IFormFieldContext;
    field: IFormBuilderVM | IFormField<T>;
}

export class ReferralField<T> implements IFormField<T> {
    name: string;
    type: FormFieldType;
    initialValue: T;
    validators: ValidatorFn | ValidatorFn[];
}

export class ReferralCommentsContext implements IFormFieldContext {
    private _context: Map<string, any>;

    constructor(field: IFormBuilderVM | IFormField<any>) {
        this._context = new Map<string, any>();
        if (field.name === 'ReferralComments') {
            this._context.set('rows', 5);
        }
        if (field.name === 'FirstName') {
            this._context.set('required', true);
        }
        if (field.name === 'LastName') {
            this._context.set('required', true);
        }
        if (field.name === 'CompanyName') {
            this._context.set('required', true);
        }
        if (field.name === 'TelephoneNumber') {
            this._context.set('required', true);
        }
        if (field.name === 'Email') {
            this._context.set('required', true);
        }


    }
    public getContextData(): Map<string, any> {
        return this._context;
    }
}

function createFormFieldWrapperObject<T>(labelText: string, templateRefId: string, field: IFormBuilderVM | IFormField<T>): ReferralFieldWrapper<T> {
    return {
        labelText: labelText,
        templateRefId: templateRefId,
        field: field,
        context: new ReferralCommentsContext(field),

    }
}

function createFormFieldObject<T>(name: string, type: FormFieldType, initialValue: T, validators: ValidatorFn | ValidatorFn[]): ReferralField<T> {
    return {
        name: name,
        type: type,
        initialValue: initialValue,
        validators: validators
    }
}