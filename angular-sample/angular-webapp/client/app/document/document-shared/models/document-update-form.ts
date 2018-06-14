import { AeDatasourceType } from '../../../atlas-elements/common/ae-datasource-type';
import { AeSelectItem } from './../../../atlas-elements/common/models/ae-select-item';
import { BehaviorSubject } from 'rxjs/Rx';
import { IFormFieldContext } from './../../../shared/models/iform-builder-vm';
import { CommonValidators } from './../../../shared/validators/common-validators';
import * as Immutable from 'immutable';


import { IFormBuilderVM, IFormFieldWrapper, IFormField, FormFieldType } from './../../../shared/models/iform-builder-vm';
import { ValidatorFn } from "@angular/forms";
import { Validators } from '@angular/forms';
import { EventEmitter } from "@angular/core";

export class DocumentUpdateForm implements IFormBuilderVM {
    name: string;
    public fieldsArray: Array<DocumentUpdateFormFieldWrapper<any>> = new Array();

    /**
     *
     */
    constructor(name: string) {
        this.name = name;
    }

    public init(): Array<IFormFieldWrapper<any>> {
        this.fieldsArray.push(createFormFieldWrapperObject("Title", "", createFormFieldObject("Title", FormFieldType.InputString, "", [Validators.required])));
        this.fieldsArray.push(createFormFieldWrapperObject("Description", "", createFormFieldObject("Description", FormFieldType.TextArea, "", [])));
        this.fieldsArray.push(createFormFieldWrapperObject("Notes", "", createFormFieldObject("Comment", FormFieldType.TextArea, "", [])));
        this.fieldsArray.push(createFormFieldWrapperObject("ExpiryDate", "", createFormFieldObject("ExpiryDate", FormFieldType.Date, "", [])));
        this.fieldsArray.push(createFormFieldWrapperObject("Is reminder required", "", createFormFieldObject("IsReminderRequired", FormFieldType.Switch, "", [])));
        this.fieldsArray.push(createFormFieldWrapperObject("Reminder in days", "", createFormFieldObject("ReminderInDays", FormFieldType.InputNumber, "", [])));
        this.fieldsArray.push(createFormFieldWrapperObject("Category", "", createFormFieldObject("Category", FormFieldType.Select, "", [Validators.required])));
        this.fieldsArray.push(createFormFieldWrapperObject("Folder location", "", createFormFieldObject("folderLocation", FormFieldType.DisplayValue, "", [])));
        this.fieldsArray.push(createFormFieldWrapperObject("Site", "", createFormFieldObject("DocumentSite", FormFieldType.AutoComplete, "", [])));
        this.fieldsArray.push(createFormFieldWrapperObject("Employee", "", createFormFieldObject("Employee", FormFieldType.AutoComplete, "", [])));
        this.fieldsArray.push(createFormFieldWrapperObject("Sensitivity", "", createFormFieldObject("Sensitivity", FormFieldType.Select, "", [])));
        return this.fieldsArray;
    }

    public getFields(): Immutable.List<IFormFieldWrapper<any>> {
        return Immutable.List(this.fieldsArray);
    }


}

export class DocumentUpdateFormFieldWrapper<T> implements IFormFieldWrapper<T> {
    labelText: string;
    templateRefId: string;
    field: IFormBuilderVM | IFormField<T>;
    context: any
}

export class DocumentUpdateFormField<T> implements IFormField<T> {
    name: string;
    type: FormFieldType;
    initialValue: T;
    validators: ValidatorFn | ValidatorFn[];
}

function createFormFieldWrapperObject<T>(labelText: string, templateRefId: string, field: IFormBuilderVM | IFormField<T>): DocumentUpdateFormFieldWrapper<T> {
    return {
        labelText: labelText,
        templateRefId: templateRefId,
        field: field,
        context: new DocumentUpdateFormFieldContext(field)
    }
}

export class DocumentUpdateFormFieldContext implements IFormFieldContext {
    private _context: Map<string, any>;

    constructor(field: IFormBuilderVM | IFormField<any>) {
        this._context = new Map<string, any>();
        if (field.name === 'Title') {
            this._context.set('required', true);
            this._context.set('placeholder', 'File Title');
        }

        if (field.name === 'Category') {
            this._context.set('required', true);
            this._context.set('options', new BehaviorSubject<Immutable.List<AeSelectItem<string>>>(Immutable.List<AeSelectItem<string>>([])));
            this._context.set('placeholder', 'Please select');
            this._context.set('onSelectChange', new EventEmitter<any>());
        }

        if (field.name === 'folderLocation') {
            this._context.set('property', "visibility");
            this._context.set('propertyValue', new BehaviorSubject<boolean>(false));
            this._context.set('displayValue', new BehaviorSubject<string>(null));
            this._context.set('customCss', 'message message--okay slideout-msg');
        }

        if (field.name === 'Description') {
            this._context.set('maxlength', 500);
            this._context.set('showRemainingCharacterCount', true);
        }
        if (field.name === 'ExpiryDate') {
            this._context.set('onDateChange', new EventEmitter<any>());
            this._context.set('onBlur', new EventEmitter<any>());
        }
        if (field.name === 'IsReminderRequired') {
            this._context.set('property', "visibility");
            this._context.set('propertyValue', new BehaviorSubject<boolean>(false));
            this._context.set('onSwitchChange', new EventEmitter<any>());
        }
        if (field.name === 'ReminderInDays') {
            this._context.set('property', "visibility");
            this._context.set('propertyValue', new BehaviorSubject<boolean>(false));
        }
        if (field.name === 'DocumentSite') {
            this._context.set('property', "visibility");
            this._context.set('propertyValue', new BehaviorSubject<boolean>(false));
            this._context.set('placeholder', 'Select site');
            this._context.set('multiselect', false);
            this._context.set('dstype', AeDatasourceType.Local);
            this._context.set('field', 'Text');
            this._context.set('valuefield', 'Value');
            this._context.set('items', new BehaviorSubject<Array<any>>([]));
        }
        if (field.name === 'Employee') {
            this._context.set('requiredValue', new BehaviorSubject<boolean>(false));
            this._context.set('property', "visibility");
            this._context.set('propertyValue', new BehaviorSubject<boolean>(false));
            this._context.set('placeholder', 'Select employee');
            this._context.set('multiselect', false);
            this._context.set('dstype', AeDatasourceType.Remote);
            this._context.set('field', 'Text');
            this._context.set('valuefield', 'Value');
            this._context.set('minlength', 2);
            this._context.set('debounce', 2000);
            this._context.set('searchEvent', new EventEmitter<any>());
            this._context.set('items', new BehaviorSubject<Array<any>>([]));
        }

        if (field.name === 'Sensitivity') {
            this._context.set('required', true);
            this._context.set('property', "visibility");
            this._context.set('propertyValue', new BehaviorSubject<boolean>(false));
            this._context.set('options', new BehaviorSubject<Immutable.List<AeSelectItem<string>>>(Immutable.List<AeSelectItem<string>>([])));
            this._context.set('onSelectChange', new EventEmitter<any>());

        }
    }
    public getContextData(): Map<string, any> {
        return this._context;
    }
}


function createFormFieldObject<T>(name: string,
    type: FormFieldType,
    initialValue: T,
    validators: ValidatorFn | ValidatorFn[]): DocumentUpdateFormField<T> {
    return {
        name: name,
        type: type,
        initialValue: initialValue,
        validators: validators
    }
}