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
import { isNullOrUndefined } from "util";
import { StringHelper } from "./../../../shared/helpers/string-helper";
import { Option } from "./option";
import { BehaviorSubject, Observable } from "rxjs/Rx";
import { AeSelectItem } from "./../../../atlas-elements/common/models/ae-select-item";
import { EventEmitter } from "@angular/core";
import { ValidationType } from "./validation-type";
import { AeDatasourceType } from "./../../../atlas-elements/common/ae-datasource-type";


export class IncidentFormalInvestigationForm implements IFormBuilderVM {
    public name: string;
    public fieldsArray: Array<IncidentFormalInvestigationFormFieldWrapper<any>>;
    private _inputFields: Array<IncidentFormalInvestigationFormFieldModel<any>>;
    public isGroup: boolean;
    private _groupFields: boolean;
    private _groups: Map<string, Array<any>>;
    constructor(name: string, fields?: Array<IncidentFormalInvestigationFormFieldModel<any>>, groupFields: boolean = true, isGroup: boolean = false) {
        this.name = name;
        this._inputFields = fields;
        this._groups = new Map<string, Array<any>>();
        this.isGroup = isGroup;
        this._groupFields = groupFields;
    }

    public init(): Array<IFormFieldWrapper<any>> {
        this.fieldsArray = new Array<IncidentFormalInvestigationFormFieldWrapper<any>>();
        if (this._groupFields) {
            this.fieldsArray.push(createFormFieldWrapperObject('Is a formal investigation required?', "", createFormFieldObject('IsInvestigationRequired', FormFieldType.Switch, 'Is a formal investigation required?', false, null)));
        }

        if (!isNullOrUndefined(this._inputFields) && this._inputFields.length > 0) {
            this._inputFields.forEach(field => {
                if (this._groupFields && !StringHelper.isNullOrUndefined(field.sectionName)) {
                    let grpName = field.sectionName;
                    if (!this._groups.has(grpName)) {
                        let grpFields = this._inputFields.filter(m => m.sectionName === grpName);
                        this._groups.set(grpName, grpFields);
                        this.fieldsArray.push(createFormFieldWrapperObject(grpName, "", new IncidentFormalInvestigationForm(grpName, grpFields, false, true)));
                    }
                }
                else {
                    this.fieldsArray.push(createFormFieldWrapperObject(field.labelText, "", createFormFieldObject(field.name, field.type, field.labelText, field.initialValue, field.validators, field.options), field.validators));
                }

            });
        }
        return this.fieldsArray;
    }

    public getFields(): Immutable.List<IFormFieldWrapper<any>> {
        return Immutable.List(this.fieldsArray);
    }
}

export class IncidentFormalInvestigationFormFieldWrapper<T> implements IFormFieldWrapper<T> {
    labelText: string;
    templateRefId: string;
    context: IFormFieldContext;
    field: IFormBuilderVM | IFormField<T>;
}

export class IncidentFormalInvestigationFormField<T> implements IFormField<T> {
    name: string;
    type: FormFieldType;
    labelText: string;
    initialValue: T;
    validators: ValidatorFn | ValidatorFn[];
    options: Array<Option>;
    constructor(name: string, type: FormFieldType, labelText: string, value?: T, validators?: ValidatorFn | ValidatorFn[], options?: Array<Option>) {
        this.name = name;
        this.type = type;
        this.labelText = labelText;
        this.initialValue = value;
        this.validators = validators;
        this.options = options;
    }
}

export class IncidentFormalInvestigationFormFieldModel<T> {
    name: string;
    type: FormFieldType;
    labelText: string;
    initialValue: T;
    validators?: string;
    sectionName: string;
    options: Array<Option>;
    constructor(name: string, type: FormFieldType, labelText: string, value?: T, validators?: string, sectionName?: string, options?: Array<Option>) {
        this.name = name;
        this.type = type;
        this.labelText = labelText;
        this.initialValue = value;
        this.validators = validators;
        this.sectionName = sectionName;
        this.options = options;
    }
}

export class IncidentFormalInvestigationFormFieldContext implements IFormFieldContext {
    private _context: Map<string, any>;
    constructor(field: IncidentFormalInvestigationFormField<any> | IFormBuilderVM
        , Validators?: string) {
        this._context = new Map<string, any>();
        this._setContextData(<IncidentFormalInvestigationFormField<any>>field, Validators);
    }

    private _setContextData(field: IncidentFormalInvestigationFormField<any>, validators?: string) {
        if (!StringHelper.isNullOrUndefinedOrEmpty(validators)) {
            if (this._isRequiredField(validators)) {
                this._context.set('required', true);
            }
            let requiredFieldMessage = "This field can't be empty";
            let maxlengthValidationMessage = this._getMaxLengthValidationMessage(getMaxLengthValidations(validators));
            this._context.set('errorMessages', {
                'required': requiredFieldMessage,
                'maxlength': maxlengthValidationMessage
            });
        }
        if (field.type === FormFieldType.Select) {
            this._context.set('placeholder', 'Please select');
            this._context.set('options', Observable.of(this._getOptions(field.options)));
        }
        if (field.type === FormFieldType.FileUpload) {
            this._context.set('uploadedFileData', new EventEmitter<any>());
            this._context.set('showFileName', false);
            if (!isNullOrUndefined(field.initialValue)) {
                this._context.set('fileName', field.initialValue);
                this._context.set('title', 'Upload');
                this._context.set('isDownloadable', true);
                this._context.set('downloadFileData', new EventEmitter<any>());
            }
        }
        if (field.type === FormFieldType.CheckBoxGroup) {
            this._context.set('options', Observable.of(this._getOptions(field.options)));
        }
        if (field.type === FormFieldType.RadioGroup) {
            this._context.set('options', Observable.of(this._getOptions(field.options)));
        }

        if (field.type === FormFieldType.DateWithTime) {
            this._context.set('showTime', true);
        }

        if (field.type === FormFieldType.AutoComplete) {
            this._context.set('showHyperLink', true);
            this._context.set('displayValue', new BehaviorSubject<string>(null));
            this._context.set('multiselect', false);
            this._context.set('dstype', AeDatasourceType.Local);
            this._context.set('field', 'Name');
            this._context.set('minlength', 1);
            this._context.set('onSelectEvent', new EventEmitter<any>());
            this._context.set('valuefield', 'Id');
            this._context.set('onAnchorClick', new EventEmitter<any>());
            this._context.set('items', new BehaviorSubject<Array<any>>([]));
        }
    }

    private _getMaxLengthValidationMessage(validationType: ValidationType): string {
        switch (validationType) {
            case ValidationType.MaxLength100:
                return "This field must be less than " + 100 + " characters";
            case ValidationType.MaxLength200:
                return "This field must be less than " + 200 + " characters";
            case ValidationType.MaxLength300:
                return "This field must be less than " + 300 + " characters";
            case ValidationType.MaxLength400:
                return "This field must be less than " + 400 + " characters";
            case ValidationType.MaxLength500:
                return "This field must be less than " + 500 + " characters";
            case ValidationType.MaxLength600:
                return "This field must be less than " + 600 + " characters";
        }
        return '';
    }
    private _isRequiredField(validators: string) {
        let validations = validators.split(',');
        let hasRequiredValidation = validations.findIndex(v => Number(v) === ValidationType.Required);
        return hasRequiredValidation !== -1;
    }

    public getContextData(): Map<string, any> {
        return this._context;
    }
    private _getOptions(options: Array<Option>) {
        let selectItems = options.sort((a, b) => {
            if (a.OrderIndex < b.OrderIndex) return -1;
            if (a.OrderIndex > b.OrderIndex) return 1;
            return 0;
        }).map(option => {
            let aeSelectItem = new AeSelectItem<string>(option.Text, option.Id)
            return aeSelectItem
        });
        return Immutable.List<AeSelectItem<string>>(!isNullOrUndefined(selectItems) ? selectItems : []);
    }
}

function createFormFieldWrapperObject<T>(labelText: string, templateRefId: string, field: IncidentFormalInvestigationFormField<T> | IFormBuilderVM, validators?: string): IncidentFormalInvestigationFormFieldWrapper<T> {
    return {
        labelText: labelText,
        templateRefId: templateRefId,
        field: field,
        context: new IncidentFormalInvestigationFormFieldContext(field, validators),
    }
}

function createFormFieldObject<T>(name: string, type: FormFieldType, labelText: string, initialValue: T, validators: string, options?: Array<Option>): IncidentFormalInvestigationFormField<T> {
    return {
        name: name,
        type: type,
        labelText: labelText,
        initialValue: initialValue,
        validators: getValidations(validators),
        options: options
    }
}

function getValidations(fieldvalidations: string) {
    let validationfns = [];
    if (StringHelper.isNullOrUndefinedOrEmpty(fieldvalidations))
        return validationfns;
    if (!isNullOrUndefined(getMaxLengthValidations(fieldvalidations))) {
        validationfns.push(Validators.maxLength(getMessageLength(getMaxLengthValidations(fieldvalidations))));
    }

    return validationfns;
}

function getMaxLengthValidations(validators: string) {
    let lengthValidationTypes = new Array<number>();
    let validations = validators.split(',');
    validations.forEach(v => {
        if (!StringHelper.isNullOrUndefinedOrEmpty(v) && v !== '1')
            lengthValidationTypes.push(Number(v));
    });
    if (lengthValidationTypes.length > 0) {
        lengthValidationTypes = lengthValidationTypes.sort((a, b) => a < b ? 1 : -1);
        return <ValidationType>lengthValidationTypes[0];
    }
    return null;
}



function getMessageLength(validationType: ValidationType) {
    switch (validationType) {
        case ValidationType.MaxLength100:
            return 100;
        case ValidationType.MaxLength200:
            return 200;
        case ValidationType.MaxLength300:
            return 300;
        case ValidationType.MaxLength400:
            return 400;
        case ValidationType.MaxLength500:
            return 500;
        case ValidationType.MaxLength600:
            return 600;
    }
    return 0;
}


