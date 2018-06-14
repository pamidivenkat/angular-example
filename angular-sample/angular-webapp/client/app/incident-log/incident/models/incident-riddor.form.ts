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
import { BehaviorSubject } from 'rxjs/Rx';
import { AeSelectItem } from './../../../atlas-elements/common/models/ae-select-item';
import { AeDatasourceType } from './../../../atlas-elements/common/ae-datasource-type';
import { EventEmitter } from '@angular/core';

export class IncidentRIDDORForm implements IFormBuilderVM {
    public name: string;
    public fieldsArray: Array<IncidentRIDDORFormFieldWrapper<any>> = new Array();

    constructor(name: string, ) {
        this.name = name;
    }

    public init(): Array<IFormFieldWrapper<any>> {
        this.fieldsArray.push(createFormFieldWrapperObject(
            'Is RIDDOR required?'
            , ''
            , createFormFieldObject('IsRIDDORRequired', FormFieldType.Switch, '', [])));
        this.fieldsArray.push(createFormFieldWrapperObject(
            'Main industry'
            , ''
            , createFormFieldObject('MainIndustryId', FormFieldType.Select, '', [])));
        this.fieldsArray.push(createFormFieldWrapperObject(
            'Other main industry'
            , ''
            , createFormFieldObject('OtherMainIndustry', FormFieldType.InputString, '', [])));
        this.fieldsArray.push(createFormFieldWrapperObject(
            'Main activity'
            , ''
            , createFormFieldObject('MainActivityId', FormFieldType.Select, '', [])));
        this.fieldsArray.push(createFormFieldWrapperObject(
            'Other main activity'
            , ''
            , createFormFieldObject('OtherMainActivity', FormFieldType.InputString, '', [])));
        this.fieldsArray.push(createFormFieldWrapperObject(
            'Sub activity'
            , ''
            , createFormFieldObject('SubActivityId', FormFieldType.Select, '', [])));
        this.fieldsArray.push(createFormFieldWrapperObject(
            'Other sub activity'
            , ''
            , createFormFieldObject('OtherSubActivity', FormFieldType.InputString, '', [])));
        this.fieldsArray.push(createFormFieldWrapperObject('Work process', '', createFormFieldObject('WorkProcessId', FormFieldType.Select, '', [])));
        this.fieldsArray.push(createFormFieldWrapperObject('Other work process', '', createFormFieldObject('OtherWorkProcess', FormFieldType.InputString, '', [])));
        this.fieldsArray.push(createFormFieldWrapperObject('Root cause', '', createFormFieldObject('MainFactorId', FormFieldType.Select, '', [])));
        this.fieldsArray.push(createFormFieldWrapperObject('Other root cause', '', createFormFieldObject('OtherMainFactor', FormFieldType.InputString, '', [])));
        this.fieldsArray.push(createFormFieldWrapperObject(
            'RIDDOR reported by'
            , ''
            , createFormFieldObject('RIDDORReportedById', FormFieldType.AutoComplete, '', [])));
        this.fieldsArray.push(createFormFieldWrapperObject(
            'How was it reported to the HSE?'
            , ''
            , createFormFieldObject('RIDDORReportedMedium', FormFieldType.Select, '', [])));
        this.fieldsArray.push(createFormFieldWrapperObject(
            'Date reported'
            , ''
            , createFormFieldObject('RIDDORReportedDate', FormFieldType.Date, '', [])));
        this.fieldsArray.push(createFormFieldWrapperObject(
            'Country'
            , ''
            , createFormFieldObject('CountryId', FormFieldType.Select, '', [])));
        this.fieldsArray.push(createFormFieldWrapperObject(
            'County'
            , ''
            , createFormFieldObject('CountyId', FormFieldType.Select, '', [])));
        this.fieldsArray.push(createFormFieldWrapperObject(
            'Local authority'
            , ''
            , createFormFieldObject('LocalAuthorityId', FormFieldType.Select, '', [])));



        return this.fieldsArray;
    }


    public getFields(): Immutable.List<IFormFieldWrapper<any>> {
        return Immutable.List(this.fieldsArray);
    }
}

export class IncidentRIDDORFormFieldWrapper<T> implements IFormFieldWrapper<T> {
    labelText: string;
    templateRefId: string;
    context: IFormFieldContext;
    field: IFormBuilderVM | IFormField<T>;
}

export class IncidentRIDDORFormField<T> implements IFormField<T> {
    name: string;
    type: FormFieldType;
    initialValue: T;
    validators: ValidatorFn | ValidatorFn[];
}

export class IncidentRIDDORFormFieldContext implements IFormFieldContext {
    private _context: Map<string, any>;

    constructor(field: IFormBuilderVM | IFormField<any>) {
        this._context = new Map<string, any>();
        if (field.name === 'MainIndustryId') {
            this._context.set('required', true);
            this._context.set('placeholder', 'Please select');
            this._context.set('options',
                new BehaviorSubject<Immutable.List<AeSelectItem<string>>>(Immutable.List<AeSelectItem<string>>([])));
            this._context.set('property', 'visibility');
            this._context.set('propertyValue', new BehaviorSubject<boolean>(false));
        }

        if (field.name === 'OtherMainIndustry') {
            this._context.set('required', true);
            this._context.set('property', 'visibility');
            this._context.set('placeholder', 'Other main industry');
            this._context.set('propertyValue', new BehaviorSubject<boolean>(false));
        }

        if (field.name === 'MainActivityId') {
            this._context.set('required', true);
            this._context.set('placeholder', 'Please select');
            this._context.set('options',
                new BehaviorSubject<Immutable.List<AeSelectItem<string>>>(Immutable.List<AeSelectItem<string>>([])));

            this._context.set('property', 'visibility');
            this._context.set('propertyValue', new BehaviorSubject<boolean>(false));
        }

        if (field.name === 'OtherMainActivity') {
            this._context.set('required', true);
            this._context.set('property', 'visibility');
            this._context.set('placeholder', 'Other main activity');
            this._context.set('propertyValue', new BehaviorSubject<boolean>(false));
        }

        if (field.name === 'SubActivityId') {
            this._context.set('required', true);
            this._context.set('placeholder', 'Please select');
            this._context.set('options',
                new BehaviorSubject<Immutable.List<AeSelectItem<string>>>(Immutable.List<AeSelectItem<string>>([])));

            this._context.set('property', 'visibility');
            this._context.set('propertyValue', new BehaviorSubject<boolean>(false));
        }

        if (field.name === 'OtherSubActivity') {
            this._context.set('required', true);
            this._context.set('property', 'visibility');
            this._context.set('placeholder', 'Other sub activity');
            this._context.set('propertyValue', new BehaviorSubject<boolean>(false));
        }

        if (field.name === 'IsRIDDORRequired') {
            this._context.set('required', true);
        }

        if (field.name === 'RIDDORReportedById') {
            this._context.set('required', true);
            this._context.set('placeholder', 'Select user');
            this._context.set('multiselect', false);
            this._context.set('dstype', AeDatasourceType.Remote);
            this._context.set('field', 'Text');
            this._context.set('minlength', 2);
            this._context.set('valuefield', 'Value');
            this._context.set('searchEvent', new EventEmitter<any>());
            this._context.set('items', new BehaviorSubject<Array<any>>([]));
            this._context.set('property', 'visibility');
            this._context.set('propertyValue', new BehaviorSubject<boolean>(false));
        }

        if (field.name === 'RIDDORReportedDate') {
            this._context.set('required', true);
            this._context.set('readonlyInput', true);
            this._context.set('property', 'visibility');
            this._context.set('propertyValue', new BehaviorSubject<boolean>(false));
        }

        if (field.name === 'CountyId') {
            this._context.set('required', true);
            this._context.set('placeholder', 'Please select');
            this._context.set('options',
                new BehaviorSubject<Immutable.List<AeSelectItem<string>>>(Immutable.List<AeSelectItem<string>>([])));
            this._context.set('property', 'visibility');
            this._context.set('propertyValue', new BehaviorSubject<boolean>(false));
        }

        if (field.name === 'CountryId') {
            this._context.set('required', true);
            this._context.set('placeholder', 'Please select');
            this._context.set('options',
                new BehaviorSubject<Immutable.List<AeSelectItem<string>>>(Immutable.List<AeSelectItem<string>>([])));
            this._context.set('property', 'visibility');
            this._context.set('propertyValue', new BehaviorSubject<boolean>(false));
        }

        if (field.name === 'LocalAuthorityId') {
            this._context.set('required', true);
            this._context.set('placeholder', 'Please select');
            this._context.set('options',
                new BehaviorSubject<Immutable.List<AeSelectItem<string>>>(Immutable.List<AeSelectItem<string>>([])));
            this._context.set('property', 'visibility');
            this._context.set('propertyValue', new BehaviorSubject<boolean>(false));
        }

        if (field.name === 'RIDDORReportedMedium') {
            this._context.set('required', true);
            this._context.set('placeholder', 'Please select');
            this._context.set('options',
                new BehaviorSubject<Immutable.List<AeSelectItem<string>>>(Immutable.List<AeSelectItem<string>>([])));
            this._context.set('property', 'visibility');
            this._context.set('propertyValue', new BehaviorSubject<boolean>(false));
        }

        if (field.name === 'WorkProcessId') {
            this._context.set('required', true);
            this._context.set('placeholder', 'Please select');
            this._context.set('options',
                new BehaviorSubject<Immutable.List<AeSelectItem<string>>>(Immutable.List<AeSelectItem<string>>([])));
            this._context.set('property', 'visibility');
            this._context.set('propertyValue', new BehaviorSubject<boolean>(false));
        }

        if (field.name === 'OtherWorkProcess') {
            this._context.set('required', true);
            this._context.set('property', 'visibility');
            this._context.set('placeholder', 'Other work process');
            this._context.set('propertyValue', new BehaviorSubject<boolean>(false));
        }

        if (field.name === 'MainFactorId') {
            this._context.set('required', true);
            this._context.set('placeholder', 'Please select');
            this._context.set('options',
                new BehaviorSubject<Immutable.List<AeSelectItem<string>>>(Immutable.List<AeSelectItem<string>>([])));
            this._context.set('property', 'visibility');
            this._context.set('propertyValue', new BehaviorSubject<boolean>(false));
        }

        if (field.name === 'OtherMainFactor') {
            this._context.set('required', true);
            this._context.set('property', 'visibility');
            this._context.set('placeholder', 'Other root cause');
            this._context.set('propertyValue', new BehaviorSubject<boolean>(false));
        }

    }
    public getContextData(): Map<string, any> {
        return this._context;
    }
}

function createFormFieldWrapperObject<T>(labelText: string, templateRefId: string, field: IFormBuilderVM | IFormField<T>):
    IncidentRIDDORFormFieldWrapper<T> {
    return {
        labelText: labelText,
        templateRefId: templateRefId,
        field: field,
        context: new IncidentRIDDORFormFieldContext(field),
    }
}

function createFormFieldObject<T>(name: string, type: FormFieldType, initialValue: T, validators: ValidatorFn | ValidatorFn[]):
    IncidentRIDDORFormField<T> {
    return {
        name: name,
        type: type,
        initialValue: initialValue,
        validators: validators
    }
}