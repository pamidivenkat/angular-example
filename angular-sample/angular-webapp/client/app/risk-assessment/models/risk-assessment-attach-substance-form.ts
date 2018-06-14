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

export class RiskAssessmentAttachSubstanceForm implements IFormBuilderVM {
    public name: string;
    private _isExample: boolean;
    public fieldsArray: Array<RiskAssessmentAttachSubstanceFormFieldWrapper<any>> = new Array();

    constructor(name: string, example: boolean) {
        this.name = name;
        this._isExample = example;
    }

    public init(): Array<IFormFieldWrapper<any>> {
        this.fieldsArray.push(createFormFieldWrapperObject('Substance', '', createFormFieldObject('Substance', FormFieldType.Select, '', [Validators.required]), this._isExample));
        this.fieldsArray.push(createFormFieldWrapperObject('People affected', '', createFormFieldObject('PeopleAffected', FormFieldType.TextArea, '', [Validators.required]), this._isExample));

        return this.fieldsArray;
    }

    public getFields(): Immutable.List<IFormFieldWrapper<any>> {
        return Immutable.List(this.fieldsArray);
    }
}

export class RiskAssessmentAttachSubstanceFormFieldWrapper<T> implements IFormFieldWrapper<T> {
    labelText: string;
    templateRefId: string;
    context: IFormFieldContext;
    field: IFormBuilderVM | IFormField<T>;
}

export class RiskAssessmentAttachSubstanceFormField<T> implements IFormField<T> {
    name: string;
    type: FormFieldType;
    initialValue: T;
    validators: ValidatorFn | ValidatorFn[];
}

export class RiskAssessmentAttachSubstanceFormContext implements IFormFieldContext {
    private _context: Map<string, any>;

    constructor(field: IFormBuilderVM | IFormField<any>, example: boolean) {
        this._context = new Map<string, any>();

        if (field.name === 'Substance') {
            this._context.set('required', true);
            this._context.set('placeholder', 'Please select');
            this._context.set('options', new BehaviorSubject(Immutable.List<AeSelectItem<string>>([])));
            this._context.set('showInfoIcon', true);
            this._context.set('infoText', 'Any substance listed in your COSHH inventory can be selected from the drop down list.  Can\'t find what you need?  Just click the Add button above to add a new substance.');
        }
        if (field.name === 'PeopleAffected') {
            let infoText = `In this field describe how the substance can harm the people who come into contact with it.
Hazardous substances can potentially affect different parts of the body, e.g. the nervous system, organs, skin, tissue.
The effects can include: irritation, burns, allergic reactions/sensitisation (e.g. dermatitis, asthma), loss of consciousness due to exposure to toxic fumes, cancer, bacterial infection (e.g. Legionnaires’ Disease or Weils Disease).
The effects may be short term or long term. The way in which a substance enters the body and cause harm will depend on the physical form of the substance.
The toxicity, the environmental conditions, individual’s personal resistance and the level of personal exposure to the substance will determine this.`;
            this._context.set('property', 'visibility');
            this._context.set('required', true);
            this._context.set('showInfoIcon', true);
            this._context.set('infoText', infoText);
        }


    }
    public getContextData(): Map<string, any> {
        return this._context;
    }
}

function createFormFieldWrapperObject<T>(labelText: string, templateRefId: string, field: IFormBuilderVM | IFormField<T>, example: boolean): RiskAssessmentAttachSubstanceFormFieldWrapper<T> {
    return {
        labelText: labelText,
        templateRefId: templateRefId,
        field: field,
        context: new RiskAssessmentAttachSubstanceFormContext(field, example)
    }
}

function createFormFieldObject<T>(name: string, type: FormFieldType, initialValue: T, validators: ValidatorFn | ValidatorFn[]): RiskAssessmentAttachSubstanceFormField<T> {
    return {
        name: name,
        type: type,
        initialValue: initialValue,
        validators: validators
    }
}
