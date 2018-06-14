import { Address } from './adress';
import { Input } from '@angular/core';
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
import { BehaviorSubject } from "rxjs/BehaviorSubject";
import { AeSelectItem } from "../common/models/ae-select-item";

export class AddressForm implements IFormBuilderVM {
    public name: string;
    private _addressFormVMData: Address;
    public fieldsArray: Array<AddressFieldWrapper<any>> = new Array();

    constructor(name: string, address: Address) {
        this.name = name;
        this._addressFormVMData = address
        //this.init();
    }
    public init(): Array<IFormFieldWrapper<any>> {
        this.fieldsArray.push(createFormFieldWrapperObject('Address line 1', '', createFormFieldObject('AddressLine1', FormFieldType.InputString, this._addressFormVMData.AddressLine1, [])));
        this.fieldsArray.push(createFormFieldWrapperObject('Address line 2', '', createFormFieldObject('AddressLine2', FormFieldType.InputString, this._addressFormVMData.AddressLine2, [])));
        this.fieldsArray.push(createFormFieldWrapperObject('Address line 3', '', createFormFieldObject('AddressLine3', FormFieldType.InputString, this._addressFormVMData.AddressLine3, [])));
        this.fieldsArray.push(createFormFieldWrapperObject('Town / City', '', createFormFieldObject('Town', FormFieldType.InputString, this._addressFormVMData.Town, [])));
        this.fieldsArray.push(createFormFieldWrapperObject('County', '', createFormFieldObject('CountyId', FormFieldType.Select, this._addressFormVMData.CountyId, [])));
        this.fieldsArray.push(createFormFieldWrapperObject('Postcode', '', createFormFieldObject('Postcode', FormFieldType.InputString, this._addressFormVMData.Postcode, [])));
        this.fieldsArray.push(createFormFieldWrapperObject('Country', '', createFormFieldObject('CountryId', FormFieldType.Select, this._addressFormVMData.CountryId, [])));
        this.fieldsArray.push(createFormFieldWrapperObject('Home phone', '', createFormFieldObject('HomePhone', FormFieldType.InputString, this._addressFormVMData.HomePhone, [])));
        this.fieldsArray.push(createFormFieldWrapperObject('Mobile phone', '', createFormFieldObject('MobilePhone', FormFieldType.InputString, this._addressFormVMData.MobilePhone, [])));
        return this.fieldsArray;
    }

    public getFields(): Immutable.List<IFormFieldWrapper<any>> {
        return Immutable.List(this.fieldsArray);
    }
}

export class AddressFieldWrapper<T> implements IFormFieldWrapper<T> {
    labelText: string;
    templateRefId: string;
    context: IFormFieldContext;
    field: IFormBuilderVM | IFormField<T>;
}

export class AddressField<T> implements IFormField<T> {
    name: string;
    type: FormFieldType;
    initialValue: T;
    validators: ValidatorFn | ValidatorFn[];
}

export class AddressFormContext implements IFormFieldContext {
    private _context: Map<string, any>;
    constructor(field: IFormBuilderVM | IFormField<any>) {
        this._context = new Map<string, any>();
        if (field.name === 'CountyId' || field.name === 'CountryId') {
            this._context.set('placeholder', 'Please select');
            this._context.set('options', new BehaviorSubject<any>(Immutable.List<AeSelectItem<string>>([])));
        }
    }

    public getContextData(): Map<string, any> {
        return this._context;
    }
}

function createFormFieldWrapperObject<T>(labelText: string, templateRefId: string, field: IFormBuilderVM | IFormField<T>): AddressFieldWrapper<T> {
    return {
        labelText: labelText,
        templateRefId: templateRefId,
        field: field,
        context: new AddressFormContext(field),

    }
}

function createFormFieldObject<T>(name: string, type: FormFieldType, initialValue: T, validators: ValidatorFn | ValidatorFn[]): AddressField<T> {
    return {
        name: name,
        type: type,
        initialValue: initialValue,
        validators: validators
    }
}