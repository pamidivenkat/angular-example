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
import { nameFieldValidator } from "../../../employee/common/employee-validators";

export class IncidentInjuredPersonForm implements IFormBuilderVM {
    public name: string;
    public fieldsArray: Array<IncidentInjuredPersonFormFieldWrapper<any>> = new Array();

    constructor(name: string) {
        this.name = name;
        //this.init();
    }

    public init(): Array<IFormFieldWrapper<any>> {
        this.fieldsArray.push(createFormFieldWrapperObject('Injured party', '', createFormFieldObject('InjuredPartyId', FormFieldType.Select, '', [])));
        this.fieldsArray.push(createFormFieldWrapperObject('If other please specify', '', createFormFieldObject('OtherInjuryParty', FormFieldType.InputString, '', [])));
        this.fieldsArray.push(createFormFieldWrapperObject('Name', '', createFormFieldObject('SelectedUser', FormFieldType.AutoComplete, '', [])));
        this.fieldsArray.push(createFormFieldWrapperObject('Name', '', createFormFieldObject('Name', FormFieldType.InputString, '', [nameFieldValidator])));
        this.fieldsArray.push(createFormFieldWrapperObject('Job role', '', createFormFieldObject('JobRole', FormFieldType.InputString, '', [])))
        this.fieldsArray.push(createFormFieldWrapperObject('Employee start date', '', createFormFieldObject('StartDate', FormFieldType.Date, '', [])));
        this.fieldsArray.push(createFormFieldWrapperObject('Date of birth', '', createFormFieldObject('DateOfBirth', FormFieldType.Date, '', [])));
        this.fieldsArray.push(createFormFieldWrapperObject('Home address', '', createFormFieldObject('AddressLine1', FormFieldType.InputString, '', [])));
        this.fieldsArray.push(createFormFieldWrapperObject('', '', createFormFieldObject('AddressLine2', FormFieldType.InputString, '', [])));
        this.fieldsArray.push(createFormFieldWrapperObject('Town', '', createFormFieldObject('Town', FormFieldType.InputString, '', [])));
        this.fieldsArray.push(createFormFieldWrapperObject('County', '', createFormFieldObject('CountyId', FormFieldType.Select, '', [])));
        this.fieldsArray.push(createFormFieldWrapperObject('Postcode', '', createFormFieldObject('Postcode', FormFieldType.InputString, '', [CommonValidators.postcode()])));
        this.fieldsArray.push(createFormFieldWrapperObject('Telephone number', '', createFormFieldObject('MobilePhone', FormFieldType.InputString, '', [])));
        this.fieldsArray.push(createFormFieldWrapperObject('Gender', '', createFormFieldObject('Gender', FormFieldType.Select, '', [])));
        this.fieldsArray.push(createFormFieldWrapperObject('New or expectant mother', '', createFormFieldObject('IsPregnant', FormFieldType.Switch, '', [])));
        return this.fieldsArray;
    }


    public getFields(): Immutable.List<IFormFieldWrapper<any>> {
        return Immutable.List(this.fieldsArray);
    }
}

export class IncidentInjuredPersonFormFieldWrapper<T> implements IFormFieldWrapper<T> {
    labelText: string;
    templateRefId: string;
    context: IFormFieldContext;
    field: IFormBuilderVM | IFormField<T>;
}

export class IncidentInjuredPersonFormField<T> implements IFormField<T> {
    name: string;
    type: FormFieldType;
    initialValue: T;
    validators: ValidatorFn | ValidatorFn[];
}

export class IncidentInjuredPersonFormFieldContext implements IFormFieldContext {
    private _context: Map<string, any>;

    constructor(field: IFormBuilderVM | IFormField<any>) {
        this._context = new Map<string, any>();
        if (field.name === 'InjuredPartyId') {
            this._context.set('required', true);
            this._context.set('placeholder', 'Please select');
            this._context.set('options', new BehaviorSubject<Immutable.List<AeSelectItem<string>>>(Immutable.List<AeSelectItem<string>>([])));
        }
        if (field.name === 'OtherInjuryParty') {
            this._context.set('required', true);
            this._context.set('property', "visibility");
            this._context.set('placeholder', '');
            this._context.set('propertyValue', new BehaviorSubject<boolean>(false));
        }

        if (field.name === 'SelectedUser') {
            this._context.set('required', true);
            this._context.set('placeholder', 'Select employee');
            this._context.set('multiselect', false);
            this._context.set('dstype', AeDatasourceType.Remote);
            this._context.set('field', 'Text');
            this._context.set('minlength', 2);
            this._context.set('valuefield', 'Value');
            this._context.set('searchEvent', new EventEmitter<any>());
            this._context.set('items', new BehaviorSubject<Array<any>>([]));
            this._context.set('property', "visibility");
            this._context.set('propertyValue', new BehaviorSubject<boolean>(false));
        }
        
        if (field.name === "DateOfBirth") {
            let thisYear = (new Date().getFullYear() + 1).toString();
            this._context.set('yearRange', '1950:' + thisYear);
        }
        if (field.name === 'StartDate') {
            this._context.set('property', "visibility");
            this._context.set('propertyValue', new BehaviorSubject<boolean>(false));
        }
        if (field.name === 'Name') {
            this._context.set('required', true);
            this._context.set('property', "visibility");
            this._context.set('placeholder', 'Name');
            this._context.set('propertyValue', new BehaviorSubject<boolean>(true));
             this._context.set('errorMessages', {
                'validName': 'This field must contain only alphabetical characters.'
            });
        }
        if (field.name === 'AddressLine1') {
            this._context.set('required', true);
            this._context.set('placeholder', 'Home address');
        }
        if (field.name === 'AddressLine2') {
            this._context.set('placeholder', 'Address line 2');
        }
        if (field.name === 'Town') {
            this._context.set('placeholder', 'Town');
        }
        if (field.name === 'CountyId') {
            this._context.set('required', true);
            this._context.set('placeholder', 'Please select');
            this._context.set('options', new BehaviorSubject<Immutable.List<AeSelectItem<string>>>(Immutable.List<AeSelectItem<string>>([])));
        }
        if (field.name === 'Postcode') {
            this._context.set('required', true);
            this._context.set('placeholder', 'Postal code');
        }
        if (field.name === 'JobRole') {
            this._context.set('required', true);
            this._context.set('placeholder', 'Job role');
        }
        if (field.name === 'Gender') {
            this._context.set('required', true);
            this._context.set('placeholder', 'Please select');
            this._context.set('options', new BehaviorSubject<Immutable.List<AeSelectItem<string>>>(Immutable.List<AeSelectItem<string>>([])));
        }
        if (field.name === 'MobilePhone') {
            this._context.set('required', false);
            this._context.set('placeholder', 'Telephone number');
        }
        if (field.name === 'IsPregnant') {
            this._context.set('property', "visibility");
            this._context.set('propertyValue', new BehaviorSubject<boolean>(false));
        }


    }
    public getContextData(): Map<string, any> {
        return this._context;
    }
}

function createFormFieldWrapperObject<T>(labelText: string, templateRefId: string, field: IFormBuilderVM | IFormField<T>): IncidentInjuredPersonFormFieldWrapper<T> {
    return {
        labelText: labelText,
        templateRefId: templateRefId,
        field: field,
        context: new IncidentInjuredPersonFormFieldContext(field),
    }
}

function createFormFieldObject<T>(name: string, type: FormFieldType, initialValue: T, validators: ValidatorFn | ValidatorFn[]): IncidentInjuredPersonFormField<T> {
    return {
        name: name,
        type: type,
        initialValue: initialValue,
        validators: validators
    }
}