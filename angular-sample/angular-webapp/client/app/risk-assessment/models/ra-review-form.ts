import {
    FormFieldType,
    IFormBuilderVM,
    IFormField,
    IFormFieldContext,
    IFormFieldWrapper
} from '../../shared/models/iform-builder-vm';
import { isNullOrUndefined } from 'util';
import { AeDatasourceType } from '../../atlas-elements/common/ae-datasource-type';
import { CommonValidators } from '../../shared/validators/common-validators';
import { BehaviorSubject } from 'rxjs/Rx';
import { AeSelectItem } from '../../atlas-elements/common/models/ae-select-item';
import * as Immutable from 'immutable';
import { ValidatorFn, Validators, AbstractControl } from '@angular/forms';
import { EventEmitter } from "@angular/core";

export class RaReviewForm implements IFormBuilderVM {
    public name: string;
    public _isExample: boolean;
    public fieldsArray: Array<RaReviewFormWrapper<any>> = new Array();

    constructor(name: string, example: boolean) {
        this.name = name;
        this._isExample = example;
    }
    public init(): Array<IFormFieldWrapper<any>> {
        this.fieldsArray.push(createFormFieldWrapperObject('General comment', '', createFormFieldObject('GeneralComment', FormFieldType.TextArea, null, []), this._isExample));
        this.fieldsArray.push(createFormFieldWrapperObject('Review period ', '', createFormFieldObject('ReviewPeriod', FormFieldType.Select, null, []), this._isExample));
        this.fieldsArray.push(createFormFieldWrapperObject('Review date', '', createFormFieldObject('ReviewDate', FormFieldType.Date, '', []), this._isExample));
        this.fieldsArray.push(createFormFieldWrapperObject('Review date', '', createFormFieldObject('ReviewDateDisplay', FormFieldType.DisplayValue, '', []), this._isExample));
        return this.fieldsArray;
    }

    public getFields(): Immutable.List<IFormFieldWrapper<any>> {
        return Immutable.List(this.fieldsArray);
    }
}

export class RaReviewFormWrapper<T> implements IFormFieldWrapper<T> {
    labelText: string;
    templateRefId: string;
    context: IFormFieldContext;
    field: IFormBuilderVM | IFormField<T>;
}

export class RaReviewFormField<T> implements IFormField<T> {
    name: string;
    type: FormFieldType;
    initialValue: T;
    validators: ValidatorFn | ValidatorFn[];
}

export class RaReviewContext implements IFormFieldContext {
    private _context: Map<string, any>;

    constructor(field: IFormBuilderVM | IFormField<any>, example: boolean) {
        this._context = new Map<string, any>();

        if (field.name === 'GeneralComment') {
            this._context.set('required', false);
        }
        if (field.name === 'ReviewPeriod') {
            this._context.set('required', false);
            this._context.set('options', new BehaviorSubject(Immutable.List<AeSelectItem<number>>([])));
        }
        if (field.name === 'ReviewDate') {
            this._context.set('property', 'visibility');
            this._context.set('minDate', new Date());
            this._context.set('readonlyInput', true);
            this._context.set('propertyValue', new BehaviorSubject<boolean>(false));
        }

        if (field.name === 'ReviewDateDisplay') {
            this._context.set('property', 'visibility');
            this._context.set('propertyValue', new BehaviorSubject<boolean>(false));
            this._context.set('displayValue', new BehaviorSubject<string>(null));
        }
    }

    public getContextData(): Map<string, any> {
        return this._context;
    }
}

function createFormFieldWrapperObject<T>(labelText: string, templateRefId: string, field: IFormBuilderVM | IFormField<T>, example: boolean): RaReviewFormWrapper<T> {
    return {
        labelText: labelText,
        templateRefId: templateRefId,
        field: field,
        context: new RaReviewContext(field, example),
    }
}

function createFormFieldObject<T>(name: string, type: FormFieldType, initialValue: T, validators: ValidatorFn | ValidatorFn[]): RaReviewFormField<T> {
    return {
        name: name,
        type: type,
        initialValue: initialValue,
        validators: validators
    }
}
