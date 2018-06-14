import { CommonValidators } from './../../shared/validators/common-validators';
import { isNullOrUndefined } from 'util';
import { COSHHInventory } from './coshh-inventory';
import { BehaviorSubject } from 'rxjs/Rx';
import { Context } from 'vm';
import { ValidatorFn, Validators, AbstractControl } from '@angular/forms';
import {
    FormFieldType,
    IFormBuilderVM,
    IFormField,
    IFormFieldContext,
    IFormFieldWrapper
} from './../../shared/models/iform-builder-vm';
import * as Immutable from 'immutable';
import { EventEmitter } from "@angular/core";

export class CoshhInventoryForm implements IFormBuilderVM {
    public name: string;
    private _coshhInventoryObject: COSHHInventory;
    public fieldsArray: Array<CoshhInventoryFormFieldWrapper<any>> = new Array();

    constructor(name: string, coshhInventoryObject: COSHHInventory) {
        this.name = name;
        this._coshhInventoryObject = coshhInventoryObject;
    }

    public init(): Array<IFormFieldWrapper<any>> {
        this.fieldsArray.push(createFormFieldWrapperObject('Substance', '', createFormFieldObject('Substance', FormFieldType.InputString, this._coshhInventoryObject.Substance, [Validators.required])));
        this.fieldsArray.push(createFormFieldWrapperObject('Description', '', createFormFieldObject('Description', FormFieldType.TextArea, this._coshhInventoryObject.Description, [])));
        this.fieldsArray.push(createFormFieldWrapperObject('Manufacturer', '', createFormFieldObject('Manufacturer', FormFieldType.InputString, this._coshhInventoryObject.Manufacturer, [])));
        this.fieldsArray.push(createFormFieldWrapperObject('Quantity', '', createFormFieldObject('Quantity', FormFieldType.InputString, this._coshhInventoryObject.Quantity, [Validators.required])));
        this.fieldsArray.push(createFormFieldWrapperObject('What is the substance used for?', '', createFormFieldObject('UsedFor', FormFieldType.InputString, this._coshhInventoryObject.UsedFor, [Validators.required])));
        this.fieldsArray.push(createFormFieldWrapperObject('Exposure limits', '', createFormFieldObject('ExposureLimits', FormFieldType.InputString, this._coshhInventoryObject.ExposureLimits, [Validators.required])));
        this.fieldsArray.push(createFormFieldWrapperObject('Reference number ', '', createFormFieldObject('ReferenceNumber', FormFieldType.InputString, this._coshhInventoryObject.ReferenceNumber, [Validators.required])));
        return this.fieldsArray;
    }

    public getFields(): Immutable.List<IFormFieldWrapper<any>> {
        return Immutable.List(this.fieldsArray);
    }
}

export class CoshhInventoryFormFieldWrapper<T> implements IFormFieldWrapper<T> {
    labelText: string;
    templateRefId: string;
    context: IFormFieldContext;
    field: IFormBuilderVM | IFormField<T>;
}

export class CoshhInventoryFormField<T> implements IFormField<T> {
    name: string;
    type: FormFieldType;
    initialValue: T;
    validators: ValidatorFn | ValidatorFn[];
}

export class CoshhInventoryFormFieldContext implements IFormFieldContext {
    private _context: Map<string, any>;

    constructor(field: IFormBuilderVM | IFormField<any>) {
        this._context = new Map<string, any>();

        if (field.name === 'Substance') {
            this._context.set('required', true);
            this._context.set('placeholder', 'Enter the substance name');
            this._context.set('maxlength', 250);
        }

        if (field && field.name === 'Description') {
            this._context.set('rows', 5);
            this._context.set('placeholder', 'Enter the substance description');
            this._context.set('maxlength', 750);
        }

        if (field && field.name === 'Manufacturer') {
            this._context.set('placeholder', 'Manufacturer');
            this._context.set('maxlength', 200);
        }

        if (field && field.name === 'Quantity') {
            this._context.set('required', true);
            this._context.set('placeholder', 'Quantity');
            this._context.set('maxlength', 50);
        }

        if (field && field.name === 'UsedFor') {
            this._context.set('required', true);
            this._context.set('placeholder', 'Enter the substance used for');
            this._context.set('maxlength', 1000);
        }

        if (field && field.name === 'ExposureLimits') {
            this._context.set('required', true);
            this._context.set('placeholder', 'Exposure limits');
            this._context.set('maxlength', 200);
        }

        if (field && field.name === 'ReferenceNumber') {
            this._context.set('required', true);
            this._context.set('placeholder', 'Reference number');
            this._context.set('maxlength', 200);
        }
    }

    public getContextData(): Map<string, any> {
        return this._context;
    }
}

function createFormFieldWrapperObject<T>(labelText: string, templateRefId: string, field: IFormBuilderVM | IFormField<T>): CoshhInventoryFormFieldWrapper<T> {
    return {
        labelText: labelText,
        templateRefId: templateRefId,
        field: field,
        context: new CoshhInventoryFormFieldContext(field),
    }
}

function createFormFieldObject<T>(name: string, type: FormFieldType, initialValue: T, validators: ValidatorFn | ValidatorFn[]): CoshhInventoryFormField<T> {
    return {
        name: name,
        type: type,
        initialValue: initialValue,
        validators: validators
    }
}





