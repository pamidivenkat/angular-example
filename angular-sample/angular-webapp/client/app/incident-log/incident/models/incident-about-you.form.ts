import { CommonValidators } from './../../../shared/validators/common-validators';
import { Context } from 'vm';
import { ValidatorFn, Validators } from '@angular/forms';
import {
    FormFieldType,
    IFormBuilderVM,
    IFormField,
    IFormFieldContext,
    IFormFieldWrapper
} from './../../../shared/models/iform-builder-vm';
import * as Immutable from 'immutable';
import { BehaviorSubject } from "rxjs/Rx";
import { AeSelectItem } from './../../../atlas-elements/common/models/ae-select-item';
import { AeDatasourceType } from "./../../../atlas-elements/common/ae-datasource-type";
import { EventEmitter } from "@angular/core";

export class IncidentAboutYouForm implements IFormBuilderVM {
    public name: string;
    public fieldsArray: Array<IncidentAboutYouFormFieldWrapper<any>> = new Array();

    constructor(name: string) {
        this.name = name;
    }

    public init(): Array<IFormFieldWrapper<any>> {
        this.fieldsArray.push(createFormFieldWrapperObject('Incident reported by', '', createFormFieldObject('ReportedBy', FormFieldType.AutoComplete, '', [])));
        this.fieldsArray.push(createFormFieldWrapperObject('Work address', '', createFormFieldObject('AddressLine1', FormFieldType.InputString, '', [])));
        this.fieldsArray.push(createFormFieldWrapperObject('', '', createFormFieldObject('AddressLine2', FormFieldType.InputString, '', [])));
        this.fieldsArray.push(createFormFieldWrapperObject('Town/city', '', createFormFieldObject('Town', FormFieldType.InputString, '', [])));
        this.fieldsArray.push(createFormFieldWrapperObject('County', '', createFormFieldObject('CountyId', FormFieldType.Select, '', [])));
        this.fieldsArray.push(createFormFieldWrapperObject('Postcode', '', createFormFieldObject('Postcode', FormFieldType.InputString, '', [CommonValidators.postcode()])));

        return this.fieldsArray;
    }

    public getFields(): Immutable.List<IFormFieldWrapper<any>> {
        return Immutable.List(this.fieldsArray);
    }
}

export class IncidentAboutYouFormFieldWrapper<T> implements IFormFieldWrapper<T> {
    labelText: string;
    templateRefId: string;
    context: IFormFieldContext;
    field: IFormBuilderVM | IFormField<T>;
}

export class IncidentAboutYouFormField<T> implements IFormField<T> {
    name: string;
    type: FormFieldType;
    initialValue: T;
    validators: ValidatorFn | ValidatorFn[];
}

export class IncidentAboutYouFormFieldContext implements IFormFieldContext {
    private _context: Map<string, any>;

    constructor(field: IFormBuilderVM | IFormField<any>) {
        this._context = new Map<string, any>();

        if (field.name === 'ReportedBy') {
            this._context.set('required', true);
            this._context.set('placeholder', 'Select incident reported by');
            this._context.set('multiselect', false);
            this._context.set('dstype', AeDatasourceType.Remote);
            this._context.set('field', 'Text');
            this._context.set('valuefield', 'Value');
            this._context.set('minlength', 2);
            this._context.set('debounce', 2000);
            this._context.set('searchEvent', new EventEmitter<any>());;
            this._context.set('items', new BehaviorSubject<Array<any>>([]));
            this._context.set('onInputEvent', new EventEmitter<any>());;
        }
        if (field.name === 'AddressLine1') {
            this._context.set('required', true);
            this._context.set('placeholder', 'Work address');
        }
        if (field.name === 'AddressLine2') {
            this._context.set('placeholder', 'Address 2');
        }
        if (field.name === 'Town') {
            this._context.set('required', true);
            this._context.set('placeholder', 'Town/city');
        }
        if (field.name === 'CountyId') {
            this._context.set('required', true);
            this._context.set('placeholder', 'Please select');
            this._context.set('options', new BehaviorSubject<Immutable.List<AeSelectItem<string>>>(Immutable.List<AeSelectItem<string>>([])));
        }
        if (field.name === 'Postcode') {
            this._context.set('required', true);
            this._context.set('placeholder', 'Postcode');
        }
    }
    public getContextData(): Map<string, any> {
        return this._context;
    }
}

function createFormFieldWrapperObject<T>(labelText: string, templateRefId: string, field: IFormBuilderVM | IFormField<T>): IncidentAboutYouFormFieldWrapper<T> {
    return {
        labelText: labelText,
        templateRefId: templateRefId,
        field: field,
        context: new IncidentAboutYouFormFieldContext(field),
    }
}

function createFormFieldObject<T>(name: string, type: FormFieldType, initialValue: T, validators: ValidatorFn | ValidatorFn[]): IncidentAboutYouFormField<T> {
    return {
        name: name,
        type: type,
        initialValue: initialValue,
        validators: validators
    }
}