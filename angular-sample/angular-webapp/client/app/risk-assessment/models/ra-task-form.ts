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

export class RaTaskForm implements IFormBuilderVM {
    public name: string;
    public fieldsArray: Array<TaskFieldWrapper<any>> = new Array();

    constructor(name: string) {
        this.name = name;
    }

    public init(): Array<IFormFieldWrapper<any>> {
        this.fieldsArray.push(createFormFieldWrapperObject('Title', '', createFormFieldObject('Title', FormFieldType.InputString, '', [Validators.required])));
        this.fieldsArray.push(createFormFieldWrapperObject('Description', '', createFormFieldObject('Description', FormFieldType.TextArea, '', [])));
        this.fieldsArray.push(createFormFieldWrapperObject('Task relative to hazard', '', createFormFieldObject('SelectedRAHazard', FormFieldType.Select, '', [])));
        this.fieldsArray.push(createFormFieldWrapperObject('Responsible person', '', createFormFieldObject('AssignedUser', FormFieldType.Select, '', [])));
        this.fieldsArray.push(createFormFieldWrapperObject('Due for completion', '', createFormFieldObject('DueDate', FormFieldType.Date, '', [])));
        this.fieldsArray.push(createFormFieldWrapperObject('Training required?', '', createFormFieldObject('SubActionType', FormFieldType.Select, '', [])));
        this.fieldsArray.push(createFormFieldWrapperObject('Course name', '', createFormFieldObject('SelectedCourse', FormFieldType.Select, '', [])));
        this.fieldsArray.push(createFormFieldWrapperObject('Individual to train', '', createFormFieldObject('IndividualToTrain', FormFieldType.InputString, '', [])));
        return this.fieldsArray;
    }

    public getFields(): Immutable.List<IFormFieldWrapper<any>> {
        return Immutable.List(this.fieldsArray);
    }
}

export class TaskFieldWrapper<T> implements IFormFieldWrapper<T> {
    labelText: string;
    templateRefId: string;
    context: IFormFieldContext;
    field: IFormBuilderVM | IFormField<T>;
}

export class TaskField<T> implements IFormField<T> {
    name: string;
    type: FormFieldType;
    initialValue: T;
    validators: ValidatorFn | ValidatorFn[];
}

export class TaskContext implements IFormFieldContext {
    private _context: Map<string, any>;
    constructor(field: IFormBuilderVM | IFormField<any>) {
        this._context = new Map<string, any>();
        if (field.name === 'Title') {
            this._context.set('required', true);
            this._context.set('placeholder', 'Task title');
        }
        if (field.name === 'Description') {
            this._context.set('required', false);
            this._context.set('placeholder', 'Add description');
        }
        if (field.name === 'SelectedRAHazard') {
            this._context.set('required', false);
            this._context.set('placeholder', 'Please select hazard');
            this._context.set('options', new BehaviorSubject(Immutable.List<AeSelectItem<string>>([])));
        }
        if (field.name === 'AssignedUser') {
            this._context.set('placeholder', 'Please select user');
            this._context.set('options', new BehaviorSubject(Immutable.List<AeSelectItem<string>>([])));
        }
        if (field.name === 'DueDate') {
            this._context.set('minDate', new Date());
            this._context.set('onBlur', new EventEmitter<any>());;
        }
        if (field.name === 'SubActionType') {
            this._context.set('required', false);
            this._context.set('placeholder', 'Please select');
            this._context.set('options', new BehaviorSubject(Immutable.List<AeSelectItem<string>>([])));
        }
        if (field.name === 'SelectedCourse') {
            this._context.set('required', false);
            this._context.set('placeholder', 'Please select course');
            this._context.set('options', new BehaviorSubject(Immutable.List<AeSelectItem<string>>([])));
            this._context.set('property', 'visibility');
            this._context.set('propertyValue', new BehaviorSubject<boolean>(false));
        }
        if (field.name === 'IndividualToTrain') {
            this._context.set('required', false);
            this._context.set('placeholder', 'Individual to train');
            this._context.set('property', 'visibility');
            this._context.set('propertyValue', new BehaviorSubject<boolean>(false));
        }
    }
    public getContextData(): Map<string, any> {
        return this._context;
    }
}

function createFormFieldWrapperObject<T>(labelText: string, templateRefId: string, field: IFormBuilderVM | IFormField<T>): TaskFieldWrapper<T> {
    return {
        labelText: labelText,
        templateRefId: templateRefId,
        field: field,
        context: new TaskContext(field)
    }
}

function createFormFieldObject<T>(name: string, type: FormFieldType, initialValue: T, validators: ValidatorFn | ValidatorFn[]): TaskField<T> {
    return {
        name: name,
        type: type,
        initialValue: initialValue,
        validators: validators
    }
}
