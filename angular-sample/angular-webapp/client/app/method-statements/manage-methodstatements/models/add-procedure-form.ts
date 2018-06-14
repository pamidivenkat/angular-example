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

export class AddProcedureForm implements IFormBuilderVM {
    public name: string;
    public fieldsArray: Array<AddProcedureFormFieldWrapper<any>> = new Array();

    constructor(name: string) {
        this.name = name;
        // this.init();
    }

    public init(): Array<IFormFieldWrapper<any>> {
        this.fieldsArray.push(createFormFieldWrapperObject('Name', '', createFormFieldObject('Name'
            , FormFieldType.InputString
            , ''
            , [Validators.required])));

        this.fieldsArray.push(createFormFieldWrapperObject('Description', '', createFormFieldObject('Description'
            , FormFieldType.RichTextEditor
            , ''
            , [])));
        return this.fieldsArray;
    }


    public getFields(): Immutable.List<IFormFieldWrapper<any>> {
        return Immutable.List(this.fieldsArray);
    }
}

export class AddProcedureFormFieldWrapper<T> implements IFormFieldWrapper<T> {
    labelText: string;
    templateRefId: string;
    context: IFormFieldContext;
    field: IFormBuilderVM | IFormField<T>;
}

export class AddProcedureFormField<T> implements IFormField<T> {
    name: string;
    type: FormFieldType;
    initialValue: T;
    validators: ValidatorFn | ValidatorFn[];
}

export class AddProcedureFormFieldContext implements IFormFieldContext {
    private _context: Map<string, any>;

    constructor(field: IFormBuilderVM | IFormField<any>) {
        this._context = new Map<string, any>();
        if (field.name === 'Name') {
            this._context.set('required', true);
            this._context.set('placeholder', 'Name');
        }
        if (field && field.name === 'Description') {
            this._context.set('rows', 5);
            this._context.set('placeholder', 'Description');
        }
    }
    public getContextData(): Map<string, any> {
        return this._context;
    }
}

function createFormFieldWrapperObject<T>(labelText: string
    , templateRefId: string
    , field: IFormBuilderVM | IFormField<T>): AddProcedureFormFieldWrapper<T> {
    return {
        labelText: labelText,
        templateRefId: templateRefId,
        field: field,
        context: new AddProcedureFormFieldContext(field),
    }
}

function createFormFieldObject<T>(name: string
    , type: FormFieldType
    , initialValue: T
    , validators: ValidatorFn | ValidatorFn[]): AddProcedureFormField<T> {
    return {
        name: name,
        type: type,
        initialValue: initialValue,
        validators: validators
    }
}
