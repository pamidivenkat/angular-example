import { EventEmitter } from '@angular/core';
import { AeDatasourceType } from '../../atlas-elements/common/ae-datasource-type';
import { AeSelectItem } from '../../atlas-elements/common/models/ae-select-item';
import { BehaviorSubject } from 'rxjs/Rx';
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

export class RiskAssessmentHazardForm implements IFormBuilderVM {
    public name: string;
    public fieldsArray: Array<RAHazardFieldWrapper<any>> = new Array();

    constructor(name: string) {
        this.name = name;
    }

    public init(): Array<IFormFieldWrapper<any>> {
        this.fieldsArray.push(createFormFieldWrapperObject('Name', '', createFormFieldObject('Name', FormFieldType.InputString, '', [Validators.required])));
        this.fieldsArray.push(createFormFieldWrapperObject('Description', '', createFormFieldObject('Description', FormFieldType.TextArea, '', [])));
        this.fieldsArray.push(createFormFieldWrapperObject('Who is affected?', '', createFormFieldObject('WhoAffecteds', FormFieldType.AutoComplete, '', [Validators.required])));
        this.fieldsArray.push(createFormFieldWrapperObject(' Others (please specify)', '', createFormFieldObject('OthersAffected', FormFieldType.InputString, '', [Validators.required])));
        this.fieldsArray.push(createFormFieldWrapperObject('How many are affected?', '', createFormFieldObject('HowManyAffected', FormFieldType.InputString, '', [])));
        this.fieldsArray.push(createFormFieldWrapperObject('How are people affected?', '', createFormFieldObject('PeopleAffected', FormFieldType.TextArea, '', [])));
        return this.fieldsArray;
    }

    public getFields(): Immutable.List<IFormFieldWrapper<any>> {
        return Immutable.List(this.fieldsArray);
    }
}

export class RAHazardFieldWrapper<T> implements IFormFieldWrapper<T> {
    labelText: string;
    templateRefId: string;
    context: IFormFieldContext;
    field: IFormBuilderVM | IFormField<T>;
}

export class RAHazardField<T> implements IFormField<T> {
    name: string;
    type: FormFieldType;
    initialValue: T;
    validators: ValidatorFn | ValidatorFn[];
}

export class RAHazardContext implements IFormFieldContext {
    private _context: Map<string, any>;

    constructor(field: IFormBuilderVM | IFormField<any>) {
        this._context = new Map<string, any>();
        if (field.name === 'Name') {
            this._context.set('required', true);
            this._context.set('placeholder', 'Hazard name');
        }
        if (field.name === 'Description') {
            this._context.set('required', false);
            this._context.set('placeholder', 'Add description');
        }
        if (field.name === 'WhoAffecteds') {
            this._context.set('required', true);
            this._context.set('placeholder', 'Who is affected');
            this._context.set('multiselect', true);
            this._context.set('dstype', AeDatasourceType.Local);
            this._context.set('field', 'Name');
            this._context.set('valuefield', 'Affected');
            this._context.set('searchEvent', new EventEmitter<any>());;
            this._context.set('items', new BehaviorSubject<Array<any>>([]));
            this._context.set('showInfoIcon', true);
            this._context.set('infoText', 'Who may be at risk from the identified hazards associated with the activity/task being assessed.This could be your employees or members of the public.Select the relevant ones from the list provided');
        }
        if (field.name === 'OthersAffected') {
            this._context.set('required', true);
            this._context.set('placeholder', 'Specify others affected');
            this._context.set('property', 'visibility');
            this._context.set('propertyValue', new BehaviorSubject<boolean>(false));
        }
        if (field.name === 'HowManyAffected') {
            this._context.set('required', false);
            this._context.set('placeholder', 'How many are affected');
            this._context.set('showInfoIcon', true);
            this._context.set('infoText', 'The more people that could be affected by the hazard, the higher the risk is.');
        }
        if (field.name === 'PeopleAffected') {
            this._context.set('required', false);
            this._context.set('placeholder', 'How are people affected');
            this._context.set('showInfoIcon', true);
            this._context.set('infoText', 'You should also provide an indication of how people might be harmed by the hazards.');
        }
    }
    public getContextData(): Map<string, any> {
        return this._context;
    }
}

function createFormFieldWrapperObject<T>(labelText: string, templateRefId: string, field: IFormBuilderVM | IFormField<T>): RAHazardFieldWrapper<T> {
    return {
        labelText: labelText,
        templateRefId: templateRefId,
        field: field,
        context: new RAHazardContext(field)
    }
}

function createFormFieldObject<T>(name: string, type: FormFieldType, initialValue: T, validators: ValidatorFn | ValidatorFn[]): RAHazardField<T> {
    return {
        name: name,
        type: type,
        initialValue: initialValue,
        validators: validators
    }
}
