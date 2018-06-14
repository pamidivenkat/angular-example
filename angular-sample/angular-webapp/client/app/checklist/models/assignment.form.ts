import { User } from '../../company/user/models/user.model';
import { CheckListAssignment } from './checklist-assignment.model';
import { EventEmitter } from '@angular/core';
import { AeDatasourceType } from '../../atlas-elements/common/ae-datasource-type';
import { AeSelectItem } from '../../atlas-elements/common/models/ae-select-item';
import { BehaviorSubject } from 'rxjs/Rx';
import { CommonValidators } from '../../shared/validators/common-validators';
import { ValidatorFn, Validators } from '@angular/forms/forms';
import {
    FormFieldType,
    IFormBuilderVM,
    IFormField,
    IFormFieldContext,
    IFormFieldWrapper
} from '../../shared/models/iform-builder-vm';
import * as Immutable from 'immutable';

export class AssignmentForm implements IFormBuilderVM {
    public name: string;
    public fieldsArray: Array<IFormFieldWrapper<any>> = new Array();

    constructor(name: string) {
        this.name = name;
    }

    public init(): Array<IFormFieldWrapper<any>> {

        this.fieldsArray.push(createFormFieldWrapperObject('Assigned To', '', createFormFieldObject('AssignedTo', FormFieldType.AutoComplete, null, [CommonValidators.required])));
        this.fieldsArray.push(createFormFieldWrapperObject('Site', '', createFormFieldObject('Site', FormFieldType.Select, null, [CommonValidators.required])));
        this.fieldsArray.push(createFormFieldWrapperObject('Add Affected site locations', '', createFormFieldObject('SiteLocation', FormFieldType.InputString, null, [CommonValidators.required])));
        this.fieldsArray.push(createFormFieldWrapperObject('Is Recurring?', '', createFormFieldObject('IsRecurring', FormFieldType.Switch, false, [])));
        this.fieldsArray.push(createFormFieldWrapperObject('Frequency', '', createFormFieldObject('Frequency', FormFieldType.Select, null, [CommonValidators.required])));
        this.fieldsArray.push(createFormFieldWrapperObject('Scheduled Date', '', createFormFieldObject('ScheduledDate', FormFieldType.Date, null, [CommonValidators.required])));
        return this.fieldsArray;
    }

    public getFields(): Immutable.List<IFormFieldWrapper<any>> {
        return Immutable.List(this.fieldsArray);
    }
}

export class ReferralCommentsContext implements IFormFieldContext {
    private _context: Map<string, any>;

    constructor(field: IFormField<any> | IFormBuilderVM) {
        this._context = new Map<string, any>();
        if (field.name === 'AssignedTo') {
            this._context.set('required', true);
            this._context.set('required', true);
            this._context.set('placeholder', 'Select user');
            this._context.set('multiselect', false);
            this._context.set('dstype', AeDatasourceType.Remote);
            this._context.set('field', 'Text');
            this._context.set('valuefield', 'Value');
            this._context.set('minlength', 2);
            this._context.set('searchEvent', new EventEmitter<any>());;
            this._context.set('items', new BehaviorSubject<Array<any>>([]));
        }
        if (field.name === 'Site') {
            this._context.set('required', true);
            this._context.set('options', new BehaviorSubject<Immutable.List<AeSelectItem<string>>>(Immutable.List<AeSelectItem<string>>([])));
            this._context.set('placeholder', 'Please Select');
        }
        if (field.name === 'Frequency') {
            this._context.set('required', true);
            this._context.set('options', new BehaviorSubject<Immutable.List<AeSelectItem<number>>>(Immutable.List<AeSelectItem<number>>([])));
            this._context.set('placeholder', 'Please Select');
            this._context.set('property', 'visibility');
            this._context.set('propertyValue', new BehaviorSubject<boolean>(false));
        }
        if (field.name === 'ScheduledDate') {
            this._context.set('required', true);
            this._context.set('minDate', new Date());
        }
        if (field.name === 'SiteLocation') {
            this._context.set('required', true);
            this._context.set('property', 'visibility');
            this._context.set('propertyValue', new BehaviorSubject<boolean>(false));
            this._context.set('placeholder', 'Site location');
        }
    }

    public getContextData(): Map<string, any> {
        return this._context;
    }
}

function createFormFieldWrapperObject<T>(labelText: string, templateRefId: string, field: IFormBuilderVM | IFormField<T>): IFormFieldWrapper<T> {
    return {
        labelText: labelText,
        templateRefId: templateRefId,
        field: field,
        context: new ReferralCommentsContext(field),

    }
}

function createFormFieldObject<T>(name: string, type: FormFieldType, initialValue: T, validators: ValidatorFn | ValidatorFn[]): IFormField<T> {
    return {
        name: name,
        type: type,
        initialValue: initialValue,
        validators: validators
    }
}