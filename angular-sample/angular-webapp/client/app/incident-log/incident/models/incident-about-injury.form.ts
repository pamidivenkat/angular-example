import { CommonValidators } from './../../../shared/validators/common-validators';
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
import { AeSelectItem } from './../../../atlas-elements/common/models/ae-select-item';
import { AeDatasourceType } from "./../../../atlas-elements/common/ae-datasource-type";
import { EventEmitter } from "@angular/core";
import { IncidentFormField, OptionType } from "./incident-form-field";
import { isNullOrUndefined } from "util";
import { StringHelper } from "./../../../shared/helpers/string-helper";

export class IncidentAboutIncidentForm implements IFormBuilderVM {
    public name: string;
    public fieldsArray: Array<IncidentAboutInjuryFormFieldWrapper<any>> = new Array();
    public incidentTypeFields: Array<IncidentFormField>;
    public incidentTypeId: string;
    constructor(name: string, incidentTypeFields: Array<IncidentFormField>, incidentTypeId: string = '') {
        this.name = name;
        this.incidentTypeFields = incidentTypeFields;
        this.incidentTypeId = incidentTypeId;
    }

    public init(): Array<IFormFieldWrapper<any>> {
        this.fieldsArray.push(createFormFieldWrapperObject('Incident type', '', createFormFieldObject('IncidentTypeId', FormFieldType.Select, this.incidentTypeId, [])));
        if (!isNullOrUndefined(this.incidentTypeFields)) {
            this.incidentTypeFields.forEach(incidentTypeField => {
                this.fieldsArray.push(createFormFieldWrapperObject(incidentTypeField.LabelText, '', createFormFieldObject(incidentTypeField.Name, incidentTypeField.FieldType, !isNullOrUndefined(incidentTypeField.DefaultValue) ? incidentTypeField.DefaultValue : '', getValidations(incidentTypeField)), incidentTypeField));
                if (incidentTypeField.Name === "HasWitness") {
                    this.fieldsArray.push(createFormFieldWrapperObject('WitnessGrid', 'witnessTemplate', createFormFieldObject('WitnessFormField', FormFieldType.InputString, '', [])));
                }
            });
        }

        return this.fieldsArray;
    }

    public getFields(): Immutable.List<IFormFieldWrapper<any>> {
        return Immutable.List(this.fieldsArray);
    }
}

export class IncidentAboutInjuryFormFieldWrapper<T> implements IFormFieldWrapper<T> {
    labelText: string;
    templateRefId: string;
    context: IFormFieldContext;
    field: IFormBuilderVM | IFormField<T>;
}

export class IncidentAboutInjuryFormField<T> implements IFormField<T> {
    name: string;
    type: FormFieldType;
    initialValue: T;
    validators: ValidatorFn | ValidatorFn[];
}

export class IncidentAboutInjuryFormFieldContext implements IFormFieldContext {
    private _context: Map<string, any>;

    constructor(field: IFormBuilderVM | IFormField<any>, incidentTypeField?: IncidentFormField) {
        this._context = new Map<string, any>();
        if (field.name === 'IncidentTypeId') {
            this._context.set('required', true);
            this._context.set('isOptGroup', 'true');
            this._context.set('placeholder', 'Please select');
            this._context.set('options', new BehaviorSubject<Immutable.List<AeSelectItem<string>>>(Immutable.List<AeSelectItem<string>>([])));
        }
        if (!isNullOrUndefined(incidentTypeField)) {
            if (incidentTypeField.KeyField) {
                this._context.set('required', true);
            }
            if (!StringHelper.isNullOrUndefinedOrEmpty(incidentTypeField.PlaceHolderText)) {
                this._context.set('placeholder', incidentTypeField.PlaceHolderText);
            }

            if (!isNullOrUndefined(incidentTypeField.MaxLength) && (incidentTypeField.MaxLength > 0)) {
                this._context.set('maxlength', incidentTypeField.MaxLength);
                this._context.set('showRemainingCharacterCount', true);
            }
            if (!isNullOrUndefined(incidentTypeField.Options)) {
               let options;
                switch (incidentTypeField.OptionType) {
                    case OptionType.number:
                        options = <Array<AeSelectItem<number>>>incidentTypeField.Options;
                        this._context.set('options', new BehaviorSubject<Immutable.List<AeSelectItem<number>>>(Immutable.List<AeSelectItem<number>>(options)));
                        break;
                    case OptionType.string:
                        options = <Array<AeSelectItem<string>>>incidentTypeField.Options;
                        this._context.set('options', new BehaviorSubject<Immutable.List<AeSelectItem<string>>>(Immutable.List<AeSelectItem<string>>(options)));
                        break;
                }
            }

            if (!isNullOrUndefined(incidentTypeField.Depends)) {
                for (let key in incidentTypeField.Depends) {
                    if (key === 'DisableField') {
                        this._context.set('disableFieldValue', new BehaviorSubject<any>(true));
                    }
                    if (key === 'Visibility') {
                        this._context.set('property', 'visibility');
                        this._context.set('propertyValue', new BehaviorSubject<any>(false));
                    }
                }
            }

            if ((incidentTypeField.FieldType === FormFieldType.Date || incidentTypeField.FieldType === FormFieldType.DateWithTime)
             && !incidentTypeField.AllowFutureDate) {
                this._context.set('maxDate', new Date());
            }
        }
        if (field.name === 'InjuryTypes') {
            this._context.set('multiselect', true);
            this._context.set('dstype', AeDatasourceType.Local);
            this._context.set('field', 'Name');
            this._context.set('valuefield', 'Id');
            this._context.set('items', new BehaviorSubject<Array<any>>([]));
        }
        if (field.name === 'InjuredParts') {
            this._context.set('multiselect', true);
            this._context.set('dstype', AeDatasourceType.Local);
            this._context.set('field', 'Name');
            this._context.set('valuefield', 'Id');
            this._context.set('items', new BehaviorSubject<Array<any>>([]));
        }
        if (field.name === 'WhenHappened') {
            this._context.set('readonlyInput', true);
            this._context.set('showTime', true);
            this._context.set('hourFormat', '12');
        }
        if (field.name === 'WhenReported') {
            this._context.set('readonlyInput', true);
            this._context.set('showTime', true);
            this._context.set('hourFormat', '12');
            this._context.set('errorMessages', {
                'datecompare': 'Incident reported date should be greater than or equal to incident happened date'
            });
        }
        if (field.name === 'SiteId') {
           this._context.set('options', new BehaviorSubject<Immutable.List<AeSelectItem<string>>>(Immutable.List<AeSelectItem<string>>([])));
        }
        if (field.name === 'County') {
           this._context.set('options', new BehaviorSubject<Immutable.List<AeSelectItem<string>>>(Immutable.List<AeSelectItem<string>>([])));
        }
        if (field.name === 'WhenAmbulanceAttended') {
            this._context.set('readonlyInput', true);
            this._context.set('showTime', true);
            this._context.set('hourFormat', '12');
         }
        if (field.name === 'WhenPoliceAttended') {
            this._context.set('readonlyInput', true);
            this._context.set('showTime', true);
            this._context.set('hourFormat', '12');
        }
        if (field.name === 'DiagnosedDiseaseCategory') {
           this._context.set('options', new BehaviorSubject<Immutable.List<AeSelectItem<string>>>(Immutable.List<AeSelectItem<string>>([])));
        }


    }
    public getContextData(): Map<string, any> {
        return this._context;
    }
}

function createFormFieldWrapperObject<T>(labelText: string, templateRefId: string, field: IFormBuilderVM | IFormField<T>, incidentTypeField?: IncidentFormField): IncidentAboutInjuryFormFieldWrapper<T> {
    return {
        labelText: labelText,
        templateRefId: templateRefId,
        field: field,
        context: new IncidentAboutInjuryFormFieldContext(field, incidentTypeField),
    }
}

function createFormFieldObject<T>(name: string, type: FormFieldType, initialValue: T, validators: ValidatorFn | ValidatorFn[]): IncidentAboutInjuryFormField<T> {
    return {
        name: name,
        type: type,
        initialValue: initialValue,
        validators: validators
    }
}

function getValidations(field: IncidentFormField) {
    let validators = [];
    if (!isNullOrUndefined(field.MaxLength) && (field.MaxLength > 0)) {
        validators.push(Validators.maxLength(field.MaxLength));
    }
    if (field.Name == 'Postcode') {
        validators.push(CommonValidators.postcode());
    }
    return validators;
}