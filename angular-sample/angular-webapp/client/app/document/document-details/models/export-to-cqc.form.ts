import { CommonValidators } from './../../../shared/validators/common-validators';
import { Context } from 'vm';
import { ValidatorFn, Validators, AbstractControl, AsyncValidatorFn } from '@angular/forms';
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
import { AeDatasourceType } from "./../../../atlas-elements/common/ae-datasource-type";
import { EventEmitter } from "@angular/core";
import { ExportToCQC } from "../../document-details/models/export-to-cqc-model";
import { DocumentExporttocqcService } from "../../document-details/services/document-export-to-cqc.service";
import { isNullOrUndefined } from "util";

export class ExportToCQCForm implements IFormBuilderVM {
    public name: string;

    public fieldsArray: Array<ExportToCQCProFormFieldWrapper<any>> = new Array();
    private _exportToCQCFormmObject: ExportToCQC;
    private _cqcProService: DocumentExporttocqcService;

    constructor(name: string, exportToCQCFormmObject: ExportToCQC, cqcProService: DocumentExporttocqcService) {
        this.name = name;
        this._exportToCQCFormmObject = exportToCQCFormmObject;
        this._cqcProService = cqcProService;
    }


    public init(): Array<IFormFieldWrapper<any>> {
        this.fieldsArray.push(createFormFieldWrapperObject('Site ', '', createFormFieldObject('SiteId', FormFieldType.Select, this._exportToCQCFormmObject.SiteId, [Validators.required])));
        this.fieldsArray.push(createFormFieldWrapperObject('Reference ', '', createFormFieldObject('Reference', FormFieldType.InputString, this._exportToCQCFormmObject.Reference, [Validators.required, CommonValidators.min(5), CommonValidators.max(50)])));
        this.fieldsArray.push(createFormFieldWrapperObject('File type ', '', createFormFieldObject('FileTypeId', FormFieldType.Select, this._exportToCQCFormmObject.FileTypeId, [])));
        this.fieldsArray.push(createFormFieldWrapperObject('Title ', '', createFormFieldObject('Title', FormFieldType.InputString, this._exportToCQCFormmObject.Title, [Validators.required, CommonValidators.min(5), CommonValidators.max(50)])));
        this.fieldsArray.push(createFormFieldWrapperObject('File name', '', createFormFieldObject('PolicyFile', FormFieldType.DisplayValue, this._exportToCQCFormmObject.PolicyFile, [])));
        this.fieldsArray.push(createFormFieldWrapperObject('Description', '', createFormFieldObject('Description', FormFieldType.TextArea, this._exportToCQCFormmObject.Description, [])));
        this.fieldsArray.push(createFormFieldWrapperObject('CQC pro care user ', '', createFormFieldObject('OwnerId', FormFieldType.Select, this._exportToCQCFormmObject.OwnerId, [Validators.required])));
        this.fieldsArray.push(createFormFieldWrapperObject('Expiry date ', '', createFormFieldObject('ExpiryDate', FormFieldType.Date, this._exportToCQCFormmObject.ExpiryDate, [Validators.required])));
        return this.fieldsArray;
    }


    public getFields(): Immutable.List<IFormFieldWrapper<any>> {
        return Immutable.List(this.fieldsArray);
    }
}

export class ExportToCQCProFormFieldWrapper<T> implements IFormFieldWrapper<T> {
    labelText: string;
    templateRefId: string;
    context: IFormFieldContext;
    field: IFormBuilderVM | IFormField<T>;
}

export class ExportToCQCProFormField<T> implements IFormField<T> {
    name: string;
    type: FormFieldType;
    initialValue: T;
    validators: ValidatorFn | ValidatorFn[];
}

export class ExportToCQCProFormFieldContext implements IFormFieldContext {
    private _context: Map<string, any>;

    constructor(field: IFormBuilderVM | IFormField<any>) {
        this._context = new Map<string, any>();
        if (field.name === 'SiteId') {
            this._context.set('required', true);
            this._context.set('placeholder', 'Please select');
            this._context.set('options', new BehaviorSubject<Immutable.List<AeSelectItem<string>>>(Immutable.List<AeSelectItem<string>>([])));
        }
        if (field.name === 'Reference') {
            this._context.set('required', true);
            this._context.set('placeholder', 'Reference');
            this._context.set('maxlength', 50);
            this._context.set('minlength', 5);
            this._context.set('errorMessages', {
                'required': "Reference is required ",
                'minlength': "At least 5 characters in length",
                'isUnique': "Already exist, please try new"            
            });
        }

        if (field.name === 'FileTypeId') {
            this._context.set('placeholder', 'Please select');
            this._context.set('options', new BehaviorSubject<Immutable.List<AeSelectItem<string>>>(Immutable.List<AeSelectItem<string>>([])));

        }
        if (field.name === 'Title') {
            this._context.set('required', true);
            this._context.set('placeholder', 'Title');
            this._context.set('maxlength', 50);
            this._context.set('minlength', 5);
            this._context.set('errorMessages', {
                'minlength': "At least 5 characters in length",
                'required': "Title is required "
            });
        }
        if (field.name === 'Description') {
            this._context.set('placeholder', 'Description');
        }
        if (field.name === 'OwnerId') {
            this._context.set('required', true);
            this._context.set('options', new BehaviorSubject<Immutable.List<AeSelectItem<string>>>(Immutable.List<AeSelectItem<string>>([])));
            this._context.set('placeholder', 'Please select');
        }
        if (field.name === 'ExpiryDate') {
            this._context.set('required', true);
            this._context.set('placeholder', 'Description');
            this._context.set('errorMessages', {
                'datecompare': "Should be greater than or equals to today",
                'required': "ExpiryDate is required "
            });
        }
        if (field.name === 'PolicyFile') {
            this._context.set('displayValue', new BehaviorSubject<string>(null));
        }

    }
    public getContextData(): Map<string, any> {
        return this._context;
    }
}

function createFormFieldWrapperObject<T>(labelText: string, templateRefId: string, field: IFormBuilderVM | IFormField<T>): ExportToCQCProFormFieldWrapper<T> {
    return {
        labelText: labelText,
        templateRefId: templateRefId,
        field: field,
        context: new ExportToCQCProFormFieldContext(field),
    }
}

function createFormFieldObject<T>(name: string, type: FormFieldType, initialValue: T, validators: ValidatorFn | ValidatorFn[]): ExportToCQCProFormField<T> {
    return {
        name: name,
        type: type,
        initialValue: initialValue,
        validators: validators
    }
}

export class CQCValidations {
    static referenceValue: string;
    static siteIdValue: string;
    static dupRefValue: boolean;
    static checkReference(siteId: AbstractControl, cqcProService: DocumentExporttocqcService): ValidatorFn {
        return (control: AbstractControl) => {
            let refrenceValue: string = control.value ? control.value : null;
            let siteIdValue = siteId.value;
            if (!isNullOrUndefined(refrenceValue) && (refrenceValue.length) > 4 && (CQCValidations.referenceValue != refrenceValue || CQCValidations.siteIdValue != siteIdValue)) {
                cqcProService.validCQCReference(refrenceValue, siteIdValue).subscribe(val => {
                    CQCValidations.referenceValue = refrenceValue;
                    CQCValidations.siteIdValue = siteIdValue;
                    CQCValidations.dupRefValue = val;
                    if (val) {
                        return { 'isUnique': true };
                    }
                    else {
                        return null;
                    }
                });
            }
            return null;
        }
    }

    static expiryDateValidations(today: Date, expressionLambda: (base, target) => boolean): ValidatorFn {
        return (control: AbstractControl): { [key: string]: boolean } => {
            let refrenceValue: string = control.value ? control.value : null;
            let baseDateValue = today;
            let targetDateValue = control.value ? control.value : null;
            if (isNullOrUndefined(baseDateValue)) {
                return { 'datecompare': true };
            } else if (isNullOrUndefined(targetDateValue)) {
                return { 'datecompare': true };
            } else {
                if (expressionLambda(baseDateValue, targetDateValue)) {
                    return { 'datecompare': true };
                }
            }
            return null;
        };
    }
}

