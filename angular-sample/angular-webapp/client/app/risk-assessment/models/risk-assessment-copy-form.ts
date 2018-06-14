import { AeDatasourceType } from '../../atlas-elements/common/ae-datasource-type';
import { AeSelectItem } from '../../atlas-elements/common/models/ae-select-item';
import {
    FormFieldType,
    IFormBuilderVM,
    IFormField,
    IFormFieldContext,
    IFormFieldWrapper,
} from '../../shared/models/iform-builder-vm';
import { CommonValidators } from '../../shared/validators/common-validators';
import { Context } from 'vm';
import { EventEmitter, ChangeDetectorRef } from '@angular/core';
import { ValidatorFn, Validators, AbstractControl } from '@angular/forms';
import * as Immutable from 'immutable';
import { BehaviorSubject } from 'rxjs/Rx';
import { RiskAssessmentService } from "../services/risk-assessment-service";
import { isNullOrUndefined } from "util";


export class RiskAssessmentCopyForm implements IFormBuilderVM {
    private _isExample: boolean;
    public name: string;
    public fieldsArray: Array<CopyRAFieldWrapper<any>> = new Array();

    constructor(name: string
        , example: boolean
        , private riskAssessmentService: RiskAssessmentService
        , private _cdRef: ChangeDetectorRef) {
        this.name = name;
        this._isExample = example;
    }

    public init(): Array<IFormFieldWrapper<any>> {
        this.fieldsArray.push(createFormFieldWrapperObject('Assessment name', '', createFormFieldObject('Name', FormFieldType.InputString, '', [Validators.required]), this._isExample));
        this.fieldsArray.push(createFormFieldWrapperObject('Reference', '', createFormFieldObject('ReferenceNumber', FormFieldType.InputString, '', this._isExample ? [Validators.required, RiskAssessmentCopyFormValidations.checkReferenceNumber(this.riskAssessmentService, this._cdRef)] : [RiskAssessmentCopyFormValidations.checkReferenceNumber(this.riskAssessmentService, this._cdRef)]), this._isExample));
        this.fieldsArray.push(createFormFieldWrapperObject('Assessment date', '', createFormFieldObject('AssessmentDate', FormFieldType.Date, '', [Validators.required]), this._isExample));
        this.fieldsArray.push(createFormFieldWrapperObject('Company for which risk assessment should be copied', '', createFormFieldObject('CompanyId', FormFieldType.Select, '', [Validators.required]), this._isExample));
        this.fieldsArray.push(createFormFieldWrapperObject('Assessor', '', createFormFieldObject('AssessorId', FormFieldType.AutoComplete, '', [Validators.required]), this._isExample));
        this.fieldsArray.push(createFormFieldWrapperObject('Affected site locations', '', createFormFieldObject('SiteId', FormFieldType.Select, '', [Validators.required]), this._isExample));
        this.fieldsArray.push(createFormFieldWrapperObject('Add affected site locations', '', createFormFieldObject('SiteLocation', FormFieldType.InputString, '', [Validators.required]), this._isExample));
        return this.fieldsArray;
    }

    public getFields(): Immutable.List<IFormFieldWrapper<any>> {
        return Immutable.List(this.fieldsArray);
    }
}

export class CopyRAFieldWrapper<T> implements IFormFieldWrapper<T> {
    labelText: string;
    templateRefId: string;
    context: IFormFieldContext;
    field: IFormBuilderVM | IFormField<T>;
}

export class CopyRAField<T> implements IFormField<T> {
    name: string;
    type: FormFieldType;
    initialValue: T;
    validators: ValidatorFn | ValidatorFn[];
}

export class CopyRAContext implements IFormFieldContext {
    private _context: Map<string, any>;

    constructor(field: IFormBuilderVM | IFormField<any>, example: boolean) {
        this._context = new Map<string, any>();
        if (field.name === 'Name') {
            this._context.set('required', true);
            this._context.set('placeholder', 'Risk assessment name');
        }
        if (field.name === 'ReferenceNumber') {
            this._context.set('required', example);
            this._context.set('placeholder', 'Reference number');
            this._context.set('errorMessages', {
                referencenumber: 'Reference number already exists',
                required: "Reference number is required"
            });

        }
        if (field.name === 'AssessmentDate') {
            this._context.set('required', !example);
            this._context.set('minDate', new Date());
            this._context.set('readonlyInput', true);
            this._context.set('property', 'visibility');
            this._context.set('propertyValue', new BehaviorSubject<boolean>(false));
        }
        if (field.name === 'CompanyId') {
            this._context.set('required', true);
            this._context.set('placeholder', 'Please select');
            this._context.set('options', new BehaviorSubject(Immutable.List<AeSelectItem<string>>([])));
            this._context.set('property', 'visibility');
            this._context.set('propertyValue', new BehaviorSubject<boolean>(false));
        }
        if (field.name === 'AssessorId') {
            this._context.set('required', true);
            this._context.set('placeholder', 'Assessor name');
            this._context.set('multiselect', false);
            this._context.set('dstype', AeDatasourceType.Remote);
            this._context.set('field', 'Text');
            this._context.set('valuefield', 'Value');
            this._context.set('minlength', 2);
            this._context.set('searchEvent', new EventEmitter<any>());;
            this._context.set('items', new BehaviorSubject<Array<any>>([]));
            this._context.set('property', 'visibility');
            this._context.set('propertyValue', new BehaviorSubject<boolean>(false));
        }

        if (field.name === 'SiteId') {
            this._context.set('required', true);
            this._context.set('placeholder', 'Please select');
            this._context.set('options', new BehaviorSubject(Immutable.List<AeSelectItem<string>>([])));
            this._context.set('property', 'visibility');
            this._context.set('propertyValue', new BehaviorSubject<boolean>(false));
        }
        if (field.name === 'SiteLocation') {
            this._context.set('required', true);
            this._context.set('placeholder', 'Affected site location');
            this._context.set('property', 'visibility');
            this._context.set('propertyValue', new BehaviorSubject<boolean>(false));
        }
    }
    public getContextData(): Map<string, any> {
        return this._context;
    }
}

function createFormFieldWrapperObject<T>(labelText: string, templateRefId: string, field: IFormBuilderVM | IFormField<T>, example: boolean): CopyRAFieldWrapper<T> {
    return {
        labelText: labelText,
        templateRefId: templateRefId,
        field: field,
        context: new CopyRAContext(field, example)
    }
}

function createFormFieldObject<T>(name: string, type: FormFieldType, initialValue: T, validators: ValidatorFn | ValidatorFn[]): CopyRAField<T> {
    return {
        name: name,
        type: type,
        initialValue: initialValue,
        validators: validators
    }
}

export class RiskAssessmentCopyFormValidations {
    static referenceNumber: string;
    static errorState = false;
    static checkReferenceNumber(riskAssessmentService: RiskAssessmentService, cdRef: ChangeDetectorRef) {
        return (control: AbstractControl): { [key: string]: boolean } => {
            let value = control.value ? control.value : null;
            if (!isNullOrUndefined(value) && RiskAssessmentCopyFormValidations.referenceNumber !== value) {
                RiskAssessmentCopyFormValidations.referenceNumber = value;
                RiskAssessmentCopyFormValidations.errorState = false;
                riskAssessmentService.checkIsExistingReferenceNumber(value).subscribe((val) => {
                    if (val) {
                        control.setErrors({ 'referencenumber': val });
                        RiskAssessmentCopyFormValidations.errorState = true;
                        cdRef.markForCheck();
                        return { 'referencenumber': val };
                    } else {
                        RiskAssessmentCopyFormValidations.errorState = false;
                    }
                });
            }
            return (!RiskAssessmentCopyFormValidations.errorState) ? null : { 'referencenumber': true };
        };
    }
}
