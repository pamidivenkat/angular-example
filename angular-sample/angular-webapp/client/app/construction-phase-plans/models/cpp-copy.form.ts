import { EventEmitter } from '@angular/core';
import { BehaviorSubject } from 'rxjs/Rx';
import { Context } from 'vm';
import { ValidatorFn, Validators } from '@angular/forms';
import {
    FormFieldType,
    IFormBuilderVM,
    IFormField,
    IFormFieldContext,
    IFormFieldWrapper
} from './../../shared/models/iform-builder-vm';
import { AeSelectItem } from './../../atlas-elements/common/models/ae-select-item';
import * as Immutable from 'immutable';

export class CPPCopyForm implements IFormBuilderVM {
    public name: string;
    public fieldsArray: Array<CPPCopyFormFieldWrapper<any>> = new Array();

    constructor(name: string) {
        this.name = name;
    }

    public init(): Array<IFormFieldWrapper<any>> {
        this.fieldsArray.push(createFormFieldWrapperObject('Construction phase plan name', '', createFormFieldObject('Name', FormFieldType.InputString, null, [Validators.required])));
        this.fieldsArray.push(createFormFieldWrapperObject('Start date', '', createFormFieldObject('StartDate', FormFieldType.Date, null, [Validators.required])));
        this.fieldsArray.push(createFormFieldWrapperObject('Review date', '', createFormFieldObject('ReviewDate', FormFieldType.Date, null, [Validators.required])));
        return this.fieldsArray;
    }

    public getFields(): Immutable.List<IFormFieldWrapper<any>> {
        return Immutable.List(this.fieldsArray);
    }
}

export class CPPCopyFormFieldWrapper<T> implements IFormFieldWrapper<T> {
    labelText: string;
    templateRefId: string;
    context: IFormFieldContext;
    field: IFormBuilderVM | IFormField<T>;
}

export class CPPCopyFormField<T> implements IFormField<T> {
    name: string;
    type: FormFieldType;
    initialValue: T;
    validators: ValidatorFn | ValidatorFn[];
}

export class CPPCopyFormFieldContext implements IFormFieldContext {
    private _context: Map<string, any>;

    constructor(field: IFormBuilderVM | IFormField<any>) {
        this._context = new Map<string, any>();
        if (field.name === 'Name') {
            this._context.set('required', true);
            this._context.set('placeholder', 'Enter the name of the construction phase plan');
            this._context.set('maxlength', 200);
            this._context.set('showRemainingCharacterCount', false);
        }
        else if (field.name === 'StartDate') {
            this._context.set('required', true);
        }
        else if (field.name === 'ReviewDate') {
            this._context.set('required', true);
        }

    }
    public getContextData(): Map<string, any> {
        return this._context;
    }
}



function createFormFieldWrapperObject<T>(labelText: string, templateRefId: string, field: IFormBuilderVM | IFormField<T>): CPPCopyFormFieldWrapper<T> {
    return {
        labelText: labelText,
        templateRefId: templateRefId,
        field: field,
        context: new CPPCopyFormFieldContext(field),
    }
}

function createFormFieldObject<T>(name: string, type: FormFieldType, initialValue: T, validators: ValidatorFn | ValidatorFn[]): CPPCopyFormField<T> {
    return {
        name: name,
        type: type,
        initialValue: initialValue,
        validators: validators
    }
}