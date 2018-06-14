import { AeDatasourceType } from '../../atlas-elements/common/ae-datasource-type';
import { CommonValidators } from '../../shared/validators/common-validators';
import { BehaviorSubject } from 'rxjs/Rx';
import { AeSelectItem } from '../../atlas-elements/common/models/ae-select-item';
import { TrainingCourseService } from '../training-courses/services/training-courses.service';
import {
    FormFieldType,
    IFormBuilderVM,
    IFormField,
    IFormFieldContext,
    IFormFieldWrapper
} from '../../shared/models/iform-builder-vm';
import * as Immutable from 'immutable';
import { ValidatorFn, Validators, AbstractControl } from '@angular/forms';
import { EventEmitter } from "@angular/core";

export class TrainingCourseInviteForm implements IFormBuilderVM {
    public name: string;
    public fieldsArray: Array<TrainingCourseInviteFormWrapper<any>> = new Array();

    constructor(name: string) {
        this.name = name;
    }
    public init(): Array<IFormFieldWrapper<any>> {
        this.fieldsArray.push(createFormFieldWrapperObject('Assign to', '', createFormFieldObject('RegardingObjectType', FormFieldType.Select, null, [CommonValidators.required])));
        this.fieldsArray.push(createFormFieldWrapperObject('Dept(s)/site(s)', '', createFormFieldObject('RegardingObjects', FormFieldType.AutoComplete, null, [CommonValidators.required])));
        this.fieldsArray.push(createFormFieldWrapperObject('Users', '', createFormFieldObject('UserName', FormFieldType.AutoComplete, null, [CommonValidators.required])));
        return this.fieldsArray;
    }

    public getFields(): Immutable.List<IFormFieldWrapper<any>> {
        return Immutable.List(this.fieldsArray);
    }
}

export class TrainingCourseInviteFormWrapper<T> implements IFormFieldWrapper<T> {
    labelText: string;
    templateRefId: string;
    context: IFormFieldContext;
    field: IFormBuilderVM | IFormField<T>;
}

export class TrainingCourseInviteFormField<T> implements IFormField<T> {
    name: string;
    type: FormFieldType;
    initialValue: T;
    validators: ValidatorFn | ValidatorFn[];
}

export class TrainingCourseInviteesCommentsContext implements IFormFieldContext {
    private _context: Map<string, any>;

    constructor(field: IFormBuilderVM | IFormField<any>) {
        this._context = new Map<string, any>();

        if (field.name === 'UserName') {
            this._context.set('required', true);
            this._context.set('placeholder', 'Select user(s)');
            this._context.set('multiselect', true);
            this._context.set('dstype', AeDatasourceType.Local);
            this._context.set('field', 'Text');
            this._context.set('valuefield', 'Value');            
            this._context.set('searchEvent', new EventEmitter<any>());
            this._context.set('items', new BehaviorSubject<Array<any>>([]));
            this._context.set('property', 'visibility');
            this._context.set('propertyValue', new BehaviorSubject<boolean>(false));
        }

        if (field.name === 'RegardingObjectType') {
            this._context.set('required', true);
            this._context.set('options', new BehaviorSubject<Immutable.List<AeSelectItem<string>>>(Immutable.List<AeSelectItem<string>>([])));
            this._context.set('placeholder', 'Please select');
            this._context.set('onSelectChange', new EventEmitter<any>());
        }
        if (field.name === 'RegardingObjects') {
            this._context.set('required', true);
            this._context.set('placeholder', 'Select dept(s)/site(s)');
            this._context.set('multiselect', true);
            this._context.set('dstype', AeDatasourceType.Local);
            this._context.set('field', 'Text');
            this._context.set('valuefield', 'Value');
            this._context.set('searchEvent', new EventEmitter<any>());
            this._context.set('items', new BehaviorSubject<Array<any>>([]));
            this._context.set('property', 'visibility');
            this._context.set('propertyValue', new BehaviorSubject<boolean>(false));
        }
    }

    public getContextData(): Map<string, any> {
        return this._context;
    }
}

function createFormFieldWrapperObject<T>(labelText: string, templateRefId: string, field: IFormBuilderVM | IFormField<T>): TrainingCourseInviteFormWrapper<T> {
    return {
        labelText: labelText,
        templateRefId: templateRefId,
        field: field,
        context: new TrainingCourseInviteesCommentsContext(field),
    }
}

function createFormFieldObject<T>(name: string, type: FormFieldType, initialValue: T, validators: ValidatorFn | ValidatorFn[]): TrainingCourseInviteFormField<T> {
    return {
        name: name,
        type: type,
        initialValue: initialValue,
        validators: validators
    }
}