
import { Context } from 'vm';
import { ValidatorFn, Validators } from '@angular/forms';
import {
    FormFieldType,
    IFormBuilderVM,
    IFormField,
    IFormFieldContext,
    IFormFieldWrapper
} from './../../shared/models/iform-builder-vm';
import * as Immutable from 'immutable';
import { BehaviorSubject } from "rxjs/Rx";
import { AeSelectItem } from './../../atlas-elements/common/models/ae-select-item';
import { AeDatasourceType } from './../../atlas-elements/common/ae-datasource-type';
import { EventEmitter } from "@angular/core";
import { PPECategoryGroup, PPECategory } from './../../shared/models/lookup.models';
import { MethodStatement } from './../../method-statements/models/method-statement';
import { isNullOrUndefined } from "util";

export class SafetyResponsibilityForm implements IFormBuilderVM {
    public name: string;
    public fieldsArray: Array<SafetyResponsibilityFieldWrapper<any>> = new Array();

    constructor(name: string) {
        this.name = name;
    }

    public init(): Array<IFormFieldWrapper<any>> {
        this.fieldsArray.push(createFormFieldWrapperObject('Name of responsible person', '', createFormFieldObject('ResponsiblePerson', FormFieldType.AutoComplete, '', [Validators.required])));
        this.fieldsArray.push(createFormFieldWrapperObject('Other responsible person name', '', createFormFieldObject('NameOfResponsible', FormFieldType.InputString, '', [Validators.required])));
        this.fieldsArray.push(createFormFieldWrapperObject('Responsibility assigned', '', createFormFieldObject('ResponsibilityAssigned', FormFieldType.AutoComplete, '', [Validators.required])));
        this.fieldsArray.push(createFormFieldWrapperObject('Other', '', createFormFieldObject('OtherResponsibilityValue', FormFieldType.InputString, '', [Validators.required])));

        return this.fieldsArray;
    }


    public getFields(): Immutable.List<IFormFieldWrapper<any>> {
        return Immutable.List(this.fieldsArray);
    }
}

export class SafetyResponsibilityFieldWrapper<T> implements IFormFieldWrapper<T> {
    labelText: string;
    templateRefId: string;
    context: IFormFieldContext;
    field: IFormBuilderVM | IFormField<T>;
}

export class SafetyResponsibilityFormField<T> implements IFormField<T> {
    name: string;
    type: FormFieldType;
    initialValue: T;
    validators: ValidatorFn | ValidatorFn[];
}

export class SafetyResponsibilityFormFieldContext implements IFormFieldContext {
    private _context: Map<string, any>;

    constructor(field: IFormField<any>) {
        this._context = new Map<string, any>();

        if (field.name === 'ResponsiblePerson') {
            this._context.set('required', true);
            this._context.set('placeholder', 'Name of responsible person');
            this._context.set('multiselect', false);
            this._context.set('dstype', AeDatasourceType.Remote);
            this._context.set('field', 'Text');
            this._context.set('valuefield', 'Value');
            this._context.set('minlength', 2);
            this._context.set('debounce', 2000);
            this._context.set('searchEvent', new EventEmitter<any>());;
            this._context.set('items', new BehaviorSubject<Array<any>>([]));
        }

        if (field.name === 'ResponsibilityAssigned') {
            this._context.set('required', true);
            this._context.set('placeholder', 'Select responsibility');
            this._context.set('multiselect', true);
            this._context.set('dstype', AeDatasourceType.Local);
            this._context.set('field', 'Name');
            this._context.set('valuefield', 'Id');
            this._context.set('searchEvent', new EventEmitter<any>());;
            this._context.set('items', new BehaviorSubject<Array<any>>([]));
        }


        if (field.name === 'NameOfResponsible') {
            this._context.set('required', true);
            this._context.set('placeholder', 'Type other responsible person name');
            this._context.set('property', 'visibility');
            this._context.set('propertyValue', new BehaviorSubject<boolean>(false));
        }
        if (field.name === 'OtherResponsibilityValue') {
            this._context.set('required', true);
            this._context.set('placeholder', 'Type other responsibility');
            this._context.set('property', 'visibility');
            this._context.set('propertyValue', new BehaviorSubject<boolean>(false));
        }

    }
    public getContextData(): Map<string, any> {
        return this._context;
    }
}

function createFormFieldWrapperObject<T>(labelText: string, templateRefId: string, field: IFormField<T>): SafetyResponsibilityFieldWrapper<T> {
    return {
        labelText: labelText,
        templateRefId: templateRefId,
        field: field,
        context: new SafetyResponsibilityFormFieldContext(field),
    }
}


function createFormFieldObject<T>(name: string, type: FormFieldType, initialValue: T, validators: ValidatorFn | ValidatorFn[]): SafetyResponsibilityFormField<T> {
    return {
        name: name,
        type: type,
        initialValue: initialValue,
        validators: validators
    }
}