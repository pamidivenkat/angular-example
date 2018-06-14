import { isNullOrUndefined } from 'util';
import { BehaviorSubject } from 'rxjs/Rx';
import { Context } from 'vm';
import { ValidatorFn, Validators, AbstractControl } from '@angular/forms';
import {
    FormFieldType,
    IFormBuilderVM,
    IFormField,
    IFormFieldContext,
    IFormFieldWrapper
} from '../../shared/models/iform-builder-vm';
import * as Immutable from 'immutable';
import { EmailModel } from "./../models/email.model";
import { AeDatasourceType } from "../../atlas-elements/common/ae-datasource-type";
import { EventEmitter } from "@angular/core";

export class EmailForm implements IFormBuilderVM {
    public name: string;
    public fieldsArray: Array<EmailFieldWrapper<any>> = new Array();
    private _emailObject: EmailModel;

    constructor(name: string, emailModel: EmailModel) {
        this.name = name;
        this._emailObject = emailModel;
    }

    public init(): Array<IFormFieldWrapper<any>> {
        this.fieldsArray.push(createFormFieldWrapperObject('To', '', createFormFieldObject('To', FormFieldType.AutoComplete, '', [])));
        this.fieldsArray.push(createFormFieldWrapperObject('Cc', '', createFormFieldObject('Cc', FormFieldType.AutoComplete, '', [])));
        this.fieldsArray.push(createFormFieldWrapperObject('From', '', createFormFieldObject('From', FormFieldType.AutoComplete, '', [])));
        this.fieldsArray.push(createFormFieldWrapperObject('Subject', '', createFormFieldObject('Subject', FormFieldType.InputString, this._emailObject.Subject, [Validators.required])));
        this.fieldsArray.push(createFormFieldWrapperObject(' ', '', createFormFieldObject('Body', FormFieldType.RichTextEditor, this._emailObject.Body, [Validators.required])));
        return this.fieldsArray;
    }

    public getFields(): Immutable.List<IFormFieldWrapper<any>> {
        return Immutable.List(this.fieldsArray);
    }
}

export class EmailFieldWrapper<T> implements IFormFieldWrapper<T> {
    labelText: string;
    templateRefId: string;
    context: IFormFieldContext;
    field: IFormBuilderVM | IFormField<T>;
}

export class EmailFormField<T> implements IFormField<T> {
    name: string;
    type: FormFieldType;
    initialValue: T;
    validators: ValidatorFn | ValidatorFn[];
}

export class EmailFormFieldContext implements IFormFieldContext {
    private _context: Map<string, any>;

    constructor(field: IFormBuilderVM | IFormField<any>) {
        this._context = new Map<string, any>();

        if (field.name === 'To') {
            this._context.set('placeholder', 'Enter email or type for options');
            this._context.set('multiselect', false);
            this._context.set('dstype', AeDatasourceType.Local);
            this._context.set('field', 'FullName');
            this._context.set('required', true);
            this._context.set('minlength', 2);
            this._context.set('onInputEvent', new EventEmitter<any>());
            this._context.set('searchEvent', new EventEmitter<any>());
            this._context.set('valuefield', 'Id');
            this._context.set('items', new BehaviorSubject<Array<any>>([]));
            this._context.set('onInputEvent', new EventEmitter<any>());
            this._context.set('errorMessages', {
                'required': 'Please enter valid email'
            });
        }

        if (field.name === 'Cc') {
            this._context.set('placeholder', 'Enter email or type for options');
            this._context.set('multiselect', false);
            this._context.set('dstype', AeDatasourceType.Local);
            this._context.set('field', 'FullName');
            this._context.set('minlength', 2);
            this._context.set('valuefield', 'Id');
            this._context.set('onInputEvent', new EventEmitter<any>());
            this._context.set('items', new BehaviorSubject<Array<any>>([]));
        }
        if (field.name === 'From') {
            this._context.set('placeholder', 'Enter email or type for options');
            this._context.set('multiselect', false);
            this._context.set('dstype', AeDatasourceType.Local);
            this._context.set('field', 'FullName');
            this._context.set('required', true);
            this._context.set('minlength', 2);
            this._context.set('valuefield', 'Id');
            this._context.set('onInputEvent', new EventEmitter<any>());
            this._context.set('items', new BehaviorSubject<Array<any>>([]));
            this._context.set('errorMessages', {
                'required': 'Please enter valid email'
            });
        }
        if (field && field.name === 'Subject') {
            this._context.set('required', true);
            this._context.set('placeholder', 'Subject');
            this._context.set('maxlength', 500);
        }

        if (!isNullOrUndefined(field) && field.name === 'Body') {
            this._context.set('onEditorReady', new EventEmitter<any>());
        }
    }

    public getContextData(): Map<string, any> {
        return this._context;
    }
}

function createFormFieldWrapperObject<T>(labelText: string, templateRefId: string, field: IFormBuilderVM | IFormField<T>): EmailFieldWrapper<T> {
    return {
        labelText: labelText,
        templateRefId: templateRefId,
        field: field,
        context: new EmailFormFieldContext(field),
    }
}

function createFormFieldObject<T>(name: string, type: FormFieldType, initialValue: T, validators: ValidatorFn | ValidatorFn[]): EmailFormField<T> {
    return {
        name: name,
        type: type,
        initialValue: initialValue,
        validators: validators
    }
}


export class EmailValidations {
    static referenceValue: string;
    static siteIdValue: string;
    static dupRefValue: boolean;

    static validateEmailFields(): ValidatorFn {
        return (control: AbstractControl): { [key: string]: boolean; } => {
            let email = control.value ? control.value : null;
            let pattern = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            if (!isNullOrUndefined(email)) {
                if (!pattern.test(email)) {
                    return { 'email': true };
                }
            }
            return null;
        };
    }
}




