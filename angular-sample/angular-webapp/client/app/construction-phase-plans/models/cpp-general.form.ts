import { RiskAssessment } from './../../risk-assessment/models/risk-assessment';
import { ConstructionPhasePlan } from './construction-phase-plans';
import { CommonValidators } from './../../shared/validators/common-validators';
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
import { BehaviorSubject, Observable } from "rxjs/Rx";
import { AeSelectItem } from './../../atlas-elements/common/models/ae-select-item';
import { AeDatasourceType } from "./../../atlas-elements/common/ae-datasource-type";
import { EventEmitter } from "@angular/core";

export class CppGeneralForm implements IFormBuilderVM {
    public name: string;
    public fieldsArray: Array<CppGeneralFormFieldWrapper<any>> = new Array();
    public constructionPhasePlan: ConstructionPhasePlan;
    private _sites$: Observable<AeSelectItem<string>[]>;

    constructor(name: string, model: ConstructionPhasePlan, sites$: Observable<AeSelectItem<string>[]>) {
        this.name = name;
        this.constructionPhasePlan = model;
        this._sites$ = sites$;
    }

    public init(): Array<IFormFieldWrapper<any>> {
        this.fieldsArray.push(createFormFieldWrapperObject('Construction phase plan name', '', createFormFieldObject('Name', FormFieldType.InputString, null, [Validators.required])));
        this.fieldsArray.push(createFormFieldWrapperObject('Intent / Introduction', '', createFormFieldObject('Intent', FormFieldType.TextArea, null, [Validators.required])));
        this.fieldsArray.push(createFormFieldWrapperObject('Plant & equipment text', '', createFormFieldObject('PET', FormFieldType.TextArea, null, null)));
        this.fieldsArray.push(createFormFieldWrapperObject('RASelector', 'RASelector', createFormFieldObject('RASelector', FormFieldType.Custom, [], null)));
        this.fieldsArray.push(createFormFieldWrapperObject('Safety precautions', 'SafetyPrecautions', createFormFieldObject('CPPSafetyPrecautions', FormFieldType.Custom, [], null)));
        this.fieldsArray.push(createFormFieldWrapperObject('Sequence of events', 'SequenceOfEvents', createFormFieldObject('CPPEvents', FormFieldType.Custom, [], null)));
        this.fieldsArray.push(createFormFieldWrapperObject('Is this CDM project notifiable to the HSE?', '', createFormFieldObject('HSENotifiable', FormFieldType.Select, null, [Validators.required])));
        this.fieldsArray.push(createFormFieldWrapperObject('For domestic', '', createFormFieldObject('IsDomestic', FormFieldType.Select, null, [Validators.required])));
        this.fieldsArray.push(createFormFieldWrapperObject('Owner', '', createFormFieldObject('OwnerId', FormFieldType.AutoComplete, null, [Validators.required])));
        this.fieldsArray.push(createFormFieldWrapperObject('Start date', '', createFormFieldObject('StartDate', FormFieldType.Date, null, [Validators.required])));
        this.fieldsArray.push(createFormFieldWrapperObject('Review date', '', createFormFieldObject('ReviewDate', FormFieldType.Date, null, null)));
        this.fieldsArray.push(createFormFieldWrapperObject('Affected staff members', '', createFormFieldObject('WhoIsImpacted', FormFieldType.InputString, null, [Validators.required])));
        this.fieldsArray.push(createFormFieldSitesWrapperObject('Affected site locations', '', createFormFieldObject('CPPSites', FormFieldType.AutoComplete, null, [Validators.required]), this._sites$));
        this.fieldsArray.push(createFormFieldWrapperObject('New location of work', '', createFormFieldObject('OtherLocation', FormFieldType.InputString, null, [Validators.required])));
        this.fieldsArray.push(createFormFieldWrapperObject('Location and protection of any services', '', createFormFieldObject('LPS', FormFieldType.TextArea, null, null)));
        this.fieldsArray.push(createFormFieldWrapperObject('Monitoring systems', '', createFormFieldObject('MonitoringSystems', FormFieldType.TextArea, null, null)));
        this.fieldsArray.push(createFormFieldWrapperObject('Further information/observations', '', createFormFieldObject('Information', FormFieldType.TextArea, null, null)));
        return this.fieldsArray;
    }

    public getFields(): Immutable.List<IFormFieldWrapper<any>> {
        return Immutable.List(this.fieldsArray);
    }
}

export class CppGeneralFormFieldWrapper<T> implements IFormFieldWrapper<T> {
    labelText: string;
    templateRefId: string;
    context: IFormFieldContext;
    field: IFormBuilderVM | IFormField<T>;
}

export class CppGeneralFormFormField<T> implements IFormField<T> {
    name: string;
    type: FormFieldType;
    initialValue: T;
    validators: ValidatorFn | ValidatorFn[];
}

export class CppGeneralFormFieldContext implements IFormFieldContext {
    private _context: Map<string, any>;

    constructor(field: IFormBuilderVM | IFormField<any>) {
        this._context = new Map<string, any>();
        if (field.name === 'Name') {
            this._context.set('required', true);
            this._context.set('placeholder', 'Enter the name of the construction phase plan');
            this._context.set('maxlength', 200);
            this._context.set('showRemainingCharacterCount', false);
        }
        else if (field.name === 'Intent') {
            this._context.set('required', true);
        }
        else if (field.name === 'HSENotifiable') {
            this._context.set('required', true);
            this._context.set('placeholder', 'Please select');
            this._context.set('options', new BehaviorSubject<Immutable.List<AeSelectItem<string>>>(Immutable.List<AeSelectItem<string>>([new AeSelectItem<string>('Yes', '1', false), new AeSelectItem<string>('No', '0', false)])));
            this._context.set('showInfoIcon', true);
            this._context.set('infoText', 'If the job will last longer than 500 person days, or 30 working days (with more than 20 people working at the same time), it will need to be notified to HSE.');
        }
        else if (field.name === 'IsDomestic') {
            this._context.set('required', true);
            this._context.set('placeholder', 'Please select');
            this._context.set('options', new BehaviorSubject<Immutable.List<AeSelectItem<string>>>(Immutable.List<AeSelectItem<string>>([new AeSelectItem<string>('Domestic', '1', false), new AeSelectItem<string>('Commercial', '0', false)])));
        }
        else if (field.name === 'OwnerId') {
            this._context.set('required', true);
            this._context.set('placeholder', 'Select the owner of the construction phase plan');
            this._context.set('multiselect', false);
            this._context.set('dstype', AeDatasourceType.Remote);
            this._context.set('field', 'Text');
            this._context.set('valuefield', 'Value');
            this._context.set('minlength', 2);
            this._context.set('debounce', 2000);
            this._context.set('searchEvent', new EventEmitter<any>());;
            this._context.set('items', new BehaviorSubject<Array<any>>([]));
        }
        else if (field.name === 'StartDate') {
            this._context.set('required', true);
        }
        else if (field.name === 'WhoIsImpacted') {
            this._context.set('required', true);
            this._context.set('placeholder', 'Enter the affected staff members');
        }
        else if (field.name === 'RASelector') {
            this._context.set('selectedRAs', new BehaviorSubject<Immutable.List<RiskAssessment>>(null));
        }
        else if (field.name === 'LPS') {
            this._context.set('maxlength', 500);
            this._context.set('showRemainingCharacterCount', false);
        }
        else if (field.name === 'MonitoringSystems') {
            this._context.set('maxlength', 500);
            this._context.set('showRemainingCharacterCount', false);
        }
        else if (field.name === 'OtherLocation') {
            this._context.set('placeholder', 'New location of work');
            this._context.set('required', true);
            this._context.set('maxlength', 500);
            this._context.set('showRemainingCharacterCount', false);
            this._context.set('property', "visibility");
            this._context.set('propertyValue', new BehaviorSubject<boolean>(false));
        }
         else if (field.name === 'Information') {
            this._context.set('maxlength', 500);
            this._context.set('showRemainingCharacterCount', false);
        }


    }
    public getContextData(): Map<string, any> {
        return this._context;
    }
}


export class CppSitesGeneralFormFieldContext implements IFormFieldContext {
    private _context: Map<string, any>;

    constructor(field: IFormBuilderVM | IFormField<any>, sites$) {
        this._context = new Map<string, any>();
        this._context.set('required', true);
        this._context.set('placeholder', 'Select affected site locations');
        this._context.set('multiselect', true);
        this._context.set('dstype', AeDatasourceType.Local);
        this._context.set('field', 'Text');
        this._context.set('valuefield', 'Value');
        this._context.set('items', new BehaviorSubject<AeSelectItem<string>[]>(null));
        this._context.set('onSelectEvent', new EventEmitter<any>());;
        this._context.set('onUnSelect', new EventEmitter<any>());;
        this._context.set('onClearSelect', new EventEmitter<any>());;

    }
    public getContextData(): Map<string, any> {
        return this._context;
    }
}


function createFormFieldWrapperObject<T>(labelText: string, templateRefId: string, field: IFormBuilderVM | IFormField<T>): CppGeneralFormFieldWrapper<T> {
    return {
        labelText: labelText,
        templateRefId: templateRefId,
        field: field,
        context: new CppGeneralFormFieldContext(field),
    }
}


function createFormFieldSitesWrapperObject<T>(labelText: string, templateRefId: string, field: IFormBuilderVM | IFormField<T>, sites$: Observable<AeSelectItem<string>[]>): CppGeneralFormFieldWrapper<T> {
    return {
        labelText: labelText,
        templateRefId: templateRefId,
        field: field,
        context: new CppSitesGeneralFormFieldContext(field, sites$),
    }
}

function createFormFieldObject<T>(name: string, type: FormFieldType, initialValue: T, validators: ValidatorFn | ValidatorFn[]): CppGeneralFormFormField<T> {
    return {
        name: name,
        type: type,
        initialValue: initialValue,
        validators: validators
    }
}