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
import { AeDatasourceType } from "../../atlas-elements/common/ae-datasource-type";
import { EventEmitter } from '@angular/core';

export class AddUpdateHelpContentForm implements IFormBuilderVM {
    public name: string;
    public fieldsArray: Array<AddUpdateHelpContentFormFieldWrapper<any>> = new Array();

    constructor(name: string) {
        this.name = name;
       
    }

    public init(): Array<IFormFieldWrapper<any>> {
        this.fieldsArray.push(createFormFieldWrapperObject('Title', '', createFormFieldObject('Title', FormFieldType.InputString, '', [Validators.required])));
        this.fieldsArray.push(createFormFieldWrapperObject('Help area', '', createFormFieldObject('HelpAreaId', FormFieldType.Select, '', [Validators.required])));
        this.fieldsArray.push(createFormFieldWrapperObject('Publish date', '', createFormFieldObject('PublishDate', FormFieldType.Date, '', [Validators.required])));
        this.fieldsArray.push(createFormFieldWrapperObject('Body', '', createFormFieldObject('Body', FormFieldType.RichTextEditor, '', [Validators.required])));
        

        return this.fieldsArray;
    }

    public getFields(): Immutable.List<IFormFieldWrapper<any>> {
        return Immutable.List(this.fieldsArray);
    }
}

export class AddUpdateHelpContentFormFieldWrapper<T> implements IFormFieldWrapper<T> {
    labelText: string;
    templateRefId: string;
    context: IFormFieldContext;
    field: IFormBuilderVM | IFormField<T>;
}

export class AddUpdateHelpContentFormField<T> implements IFormField<T> {
    name: string;
    type: FormFieldType;
    initialValue: T;
    validators: ValidatorFn | ValidatorFn[];
}

export class AddUpdateHelpContentFormContext implements IFormFieldContext {
    private _context: Map<string, any>;

    constructor(field: IFormBuilderVM | IFormField<any>) {
        this._context = new Map<string, any>();

        if (field.name === 'HelpAreaId') {
            this._context.set('required', true);
            this._context.set('placeholder', 'Please select');
            this._context.set('options', new BehaviorSubject(Immutable.List<AeSelectItem<string>>([])));

        }
        if (field.name === 'Title') {
            this._context.set('property', 'visibility');
            this._context.set('required', true);
        }
         if (field.name === 'PublishDate') {
            this._context.set('required', true);
            this._context.set('minDate', new Date());
        }
         if (field.name === 'Body') {
            this._context.set('required', true);
        }


    }
    public getContextData(): Map<string, any> {
        return this._context;
    }
}

function createFormFieldWrapperObject<T>(labelText: string, templateRefId: string, field: IFormBuilderVM | IFormField<T>): AddUpdateHelpContentFormFieldWrapper<T> {
    return {
        labelText: labelText,
        templateRefId: templateRefId,
        field: field,
        context: new AddUpdateHelpContentFormContext(field)
    }
}

function createFormFieldObject<T>(name: string, type: FormFieldType, initialValue: T, validators: ValidatorFn | ValidatorFn[]): AddUpdateHelpContentFormField<T> {
    return {
        name: name,
        type: type,
        initialValue: initialValue,
        validators: validators
    }
}
