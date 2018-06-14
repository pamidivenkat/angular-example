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
import { EventEmitter } from "@angular/core";
import { isNullOrUndefined } from "util";

export class MSOtherRiskAssessmentForm implements IFormBuilderVM {
    public name: string;
    public fieldsArray: Array<MSOtherRiskAssessmentFieldWrapper<any>> = new Array();

    constructor(name: string) {
        this.name = name;
    }

    public init(): Array<IFormFieldWrapper<any>> {

        for (var item in [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]) {
            this.fieldsArray.push(createFormFieldWrapperObject('Reference number', '', createFormFieldObject('OtherNumber' + item, FormFieldType.InputString, '', []), null));
            this.fieldsArray.push(createFormFieldWrapperObject('Assessment name', '', createFormFieldObject('OtherName' + item, FormFieldType.InputString, '', []), null));
        }

        return this.fieldsArray;
    }

    public getFields(): Immutable.List<IFormFieldWrapper<any>> {
        return Immutable.List(this.fieldsArray);
    }
}

export class MSOtherRiskAssessmentFieldWrapper<T> implements IFormFieldWrapper<T> {
    labelText: string;
    templateRefId: string;
    context: IFormFieldContext;
    field: IFormBuilderVM | IFormField<T>;
}

export class MSOtherRiskAssessmentFormField<T> implements IFormField<T> {
    name: string;
    type: FormFieldType;
    initialValue: T;
    validators: ValidatorFn | ValidatorFn[];
}

export class MSOtherRiskAssessmentFormFieldContext implements IFormFieldContext {
    private _context: Map<string, any>;

    constructor(field: IFormField<any>, data: any[]) {
        this._context = new Map<string, any>();
        if (field.type === FormFieldType.InputString) {
            if (field.name.toLocaleLowerCase().includes('othernumber')) {
                this._context.set('placeholder', 'Reference number');

            }
            if (field.name.toLocaleLowerCase().includes('othername')) {
                this._context.set('placeholder', 'Assessment name');

            }

        }
    }
    public getContextData(): Map<string, any> {
        return this._context;
    }
}

function createFormFieldWrapperObject<T>(labelText: string, templateRefId: string, field: IFormField<T>, data: any[]): MSOtherRiskAssessmentFieldWrapper<T> {
    return {
        labelText: labelText,
        templateRefId: templateRefId,
        field: field,
        context: new MSOtherRiskAssessmentFormFieldContext(field, data),
    }
}

function createFormFieldObject<T>(name: string, type: FormFieldType, initialValue: T, validators: ValidatorFn | ValidatorFn[]): MSOtherRiskAssessmentFormField<T> {
    return {
        name: name,
        type: type,
        initialValue: initialValue,
        validators: validators
    }
}