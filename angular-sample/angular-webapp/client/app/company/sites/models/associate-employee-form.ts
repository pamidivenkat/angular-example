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
import { AeDatasourceType } from './../../../atlas-elements/common/ae-datasource-type';
import { EventEmitter } from "@angular/core";
import { isNullOrUndefined } from "util";

export class AssociateEmployeeForm implements IFormBuilderVM {

    public name: string;
    public fieldsArray: Array<AssociateEmployeeFieldWrapper<any>> = new Array();

    constructor(name: string) {
        this.name = name;
    }

    public init(): Array<IFormFieldWrapper<any>> {

        this.fieldsArray.push(createFormFieldWrapperObject('Employee:', '', createFormFieldObject('Employee', FormFieldType.AutoComplete, '', [Validators.required])));        
        return this.fieldsArray;
    }

    public getFields(): Immutable.List<IFormFieldWrapper<any>> {
        return Immutable.List(this.fieldsArray);
    }

}

export class AssociateEmployeeFormFieldContext implements IFormFieldContext {
    private _context: Map<string, any>;

    constructor(field: IFormField<any>) {
        this._context = new Map<string, any>();

        if (field.name === 'Employee') {
            this._context.set('required', true);
            this._context.set('placeholder', 'Select employee');
            this._context.set('multiselect', true);
            this._context.set('dstype', AeDatasourceType.Local);
            this._context.set('field', 'Text');
            this._context.set('valuefield', 'Value');
            this._context.set('items', new BehaviorSubject<AeSelectItem<string>[]>([]));
        }


    }
    public getContextData(): Map<string, any> {
        return this._context;
    }
}


export class AssociateEmployeeFieldWrapper<T> implements IFormFieldWrapper<T> {
    labelText: string;
    templateRefId: string;
    context: IFormFieldContext;
    field: IFormBuilderVM | IFormField<T>;
}

export class AssociateEmployeeFormField<T> implements IFormField<T> {
    name: string;
    type: FormFieldType;
    initialValue: T;
    validators: ValidatorFn | ValidatorFn[];
}

function createFormFieldWrapperObject<T>(labelText: string, templateRefId: string, field: IFormField<T>): AssociateEmployeeFieldWrapper<T> {
    return {
        labelText: labelText,
        templateRefId: templateRefId,
        field: field,
        context: new AssociateEmployeeFormFieldContext(field),
    }
}

function createFormFieldObject<T>(name: string, type: FormFieldType, initialValue: T, validators: ValidatorFn | ValidatorFn[]): AssociateEmployeeFormField<T> {
    return {
        name: name,
        type: type,
        initialValue: initialValue,
        validators: validators
    }
}