import { CommonValidators } from '../../shared/validators/common-validators';
import * as Immutable from 'immutable';


import {
    FormFieldType,
    IFormBuilderVM,
    IFormField,
    IFormFieldContext,
    IFormFieldWrapper
} from '../../shared/models/iform-builder-vm';
import { ValidatorFn } from "@angular/forms";
import { Validators } from '@angular/forms';

export class TaskForm implements IFormBuilderVM {
    name: string;
    filedArray: Array<TaskFormFieldWrapper<any>> = new Array();

    /**
     *
     */
    constructor(name: string) {
        this.name = name;
    }

    getFields(): Immutable.List<IFormFieldWrapper<any>> {
        this.filedArray.push(createFormFieldWrapperObject("TaskCategoryId", "", createFormFieldObject("TaskCategoryId", FormFieldType.InputString, "", [])));
        this.filedArray.push(createFormFieldWrapperObject("Title", "", createFormFieldObject("Title", FormFieldType.InputString, "", [Validators.required])));
        this.filedArray.push(createFormFieldWrapperObject("Description", "", createFormFieldObject("Description", FormFieldType.InputString, "", [])));
        this.filedArray.push(createFormFieldWrapperObject("Priority", "", createFormFieldObject("Priority", FormFieldType.Select, "", [Validators.required])));
        this.filedArray.push(createFormFieldWrapperObject("DueDate", "", createFormFieldObject("DueDate", FormFieldType.InputString, "", [])));
        this.filedArray.push(createFormFieldWrapperObject("AssignedUsers", "", createFormFieldObject("AssignedUsers", FormFieldType.AutoComplteMultiSelect, "", [])));
        this.filedArray.push(createFormFieldWrapperObject("AssignToAll", "", createFormFieldObject("AssignToAll", FormFieldType.CheckBox, false, [])));
        this.filedArray.push(createFormFieldWrapperObject("SendNotification", "", createFormFieldObject("SendNotification", FormFieldType.CheckBox, false, [])));
        this.filedArray.push(createFormFieldWrapperObject("CostOfRectification", "", createFormFieldObject("CostOfRectification", FormFieldType.InputString, "0", [])));
        this.filedArray.push(createFormFieldWrapperObject("CompanyId", "", createFormFieldObject("CompanyId", FormFieldType.InputString, "", [])));
        this.filedArray.push(createFormFieldWrapperObject("Status", "", createFormFieldObject("Status", FormFieldType.InputString, "", [])));
        this.filedArray.push(createFormFieldWrapperObject("CorrectActionTaken", "", createFormFieldObject("CorrectActionTaken", FormFieldType.InputString, "", [Validators.maxLength(2000)])));
        this.filedArray.push(createFormFieldWrapperObject("PercentageCompleted", "", createFormFieldObject("PercentageCompleted", FormFieldType.InputNumber, "", [CommonValidators.min(0), CommonValidators.max(100)])));
        return Immutable.List(this.filedArray);
    }

    public init(): Array<IFormFieldWrapper<any>> {
        throw new Error('Not implemented yet.');
    }
}

export class TaskFormFieldWrapper<T> implements IFormFieldWrapper<T> {
    labelText: string;
    templateRefId: string;
    field: IFormBuilderVM | IFormField<T>;
    context: IFormFieldContext
}

export class TaskFormField<T> implements IFormField<T> {
    name: string;
    type: FormFieldType;
    initialValue: T;
    validators: ValidatorFn | ValidatorFn[];
}

function createFormFieldWrapperObject<T>(labelText: string, templateRefId: string, field: IFormBuilderVM | IFormField<T>): TaskFormFieldWrapper<T> {
    return {
        labelText: labelText,
        templateRefId: templateRefId,
        field: field,
        context: null
    }
}

function createFormFieldObject<T>(name: string,
    type: FormFieldType,
    initialValue: T,
    validators: ValidatorFn | ValidatorFn[]): TaskFormField<T> {
    return {
        name: name,
        type: type,
        initialValue: initialValue,
        validators: validators
    }
}