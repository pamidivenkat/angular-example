import { EventEmitter } from '@angular/core';
import { AeDatasourceType } from '../../atlas-elements/common/ae-datasource-type';
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

export class RaAddUpdateSubstanceForm implements IFormBuilderVM {
    public name: string;
    public fieldsArray: Array<AddUpdateSubstanceFieldWrapper<any>> = new Array();

    constructor(name: string) {
        this.name = name;
    }

    public init(): Array<IFormFieldWrapper<any>> {
        this.fieldsArray.push(createFormFieldWrapperObject('Substance', '', createFormFieldObject('Substance', FormFieldType.InputString, '', [Validators.required])));
        this.fieldsArray.push(createFormFieldWrapperObject('Description', '', createFormFieldObject('Description', FormFieldType.TextArea, '', [])));
        this.fieldsArray.push(createFormFieldWrapperObject('Manufacturer', '', createFormFieldObject('Manufacturer', FormFieldType.InputString, '', [])));
        this.fieldsArray.push(createFormFieldWrapperObject('Quantity', '', createFormFieldObject('Quantity', FormFieldType.InputString, '', [])));
        this.fieldsArray.push(createFormFieldWrapperObject('Exposure limits', '', createFormFieldObject('ExposureLimits', FormFieldType.InputString, '', [])));
        this.fieldsArray.push(createFormFieldWrapperObject('Reference number', '', createFormFieldObject('ReferenceNumber', FormFieldType.InputString, '', [])));
        this.fieldsArray.push(createFormFieldWrapperObject('What is the substance used for?', '', createFormFieldObject('UsedFor', FormFieldType.InputString, '', [Validators.required])));
        this.fieldsArray.push(createFormFieldWrapperObject('People affected', '', createFormFieldObject('PeopleAffected', FormFieldType.InputString, '', [Validators.required])));
        this.fieldsArray.push(createFormFieldWrapperObject('Emergency contact number', '', createFormFieldObject('Mig_EmergencyContactNumber', FormFieldType.InputString, '', [])));
        this.fieldsArray.push(createFormFieldWrapperObject('', '', createFormFieldObject('AttachmentId', FormFieldType.ReadOnly, '', [])));
        return this.fieldsArray;
    }

    public getFields(): Immutable.List<IFormFieldWrapper<any>> {
        return Immutable.List(this.fieldsArray);
    }
}

export class AddUpdateSubstanceFieldWrapper<T> implements IFormFieldWrapper<T> {
    labelText: string;
    templateRefId: string;
    context: IFormFieldContext;
    field: IFormBuilderVM | IFormField<T>;
}

export class AddUpdateSubstanceField<T> implements IFormField<T> {
    name: string;
    type: FormFieldType;
    initialValue: T;
    validators: ValidatorFn | ValidatorFn[];
}

export class AddUpdateSubstanceContext implements IFormFieldContext {
    private _context: Map<string, any>;

    constructor(field: IFormBuilderVM | IFormField<any>) {
        this._context = new Map<string, any>();
        if (field.name === 'Substance') {
            this._context.set('required', true);
            this._context.set('placeholder', 'Substance');
            this._context.set('showInfoIcon', true);
            this._context.set('infoText', 'Any substance listed in your COSHH inventory can be selected from the drop down list.  Can\'t find what you need?  Just click the Add button above to add a new substance.');
        }
        if (field.name === 'Description') {
            this._context.set('required', false);
            this._context.set('placeholder', 'Add description');
        }

        if (field.name === 'Manufacturer') {
            this._context.set('required', false);
            this._context.set('placeholder', 'Manufacturer');
        }
        if (field.name === 'Quantity') {
            this._context.set('required', false);
            this._context.set('placeholder', 'Quantity');
        }
        if (field.name === 'ExposureLimits') {
            this._context.set('required', false);
            this._context.set('placeholder', 'Exposure limits');
        }
        if (field.name === 'ReferenceNumber') {
            this._context.set('required', false);
            this._context.set('placeholder', 'Reference number');
        }
        if (field.name === 'UsedFor') {
            this._context.set('required', true);
            this._context.set('placeholder', 'Used for');
        }

        if (field.name === 'PeopleAffected') {
            let infoText = `In this field describe how the substance can harm the people who come into contact with it.
Hazardous substances can potentially affect different parts of the body, e.g. the nervous system, organs, skin, tissue.
The effects can include: irritation, burns, allergic reactions/sensitisation (e.g. dermatitis, asthma), loss of consciousness due to exposure to toxic fumes, cancer, bacterial infection (e.g. Legionnaires’ Disease or Weils Disease).
The effects may be short term or long term. The way in which a substance enters the body and cause harm will depend on the physical form of the substance.
The toxicity, the environmental conditions, individual’s personal resistance and the level of personal exposure to the substance will determine this.`;
            this._context.set('required', true);
            this._context.set('placeholder', 'People affeced');
            this._context.set('showInfoIcon', true);
            this._context.set('infoText', infoText);
        }
        if (field.name === 'Mig_EmergencyContactNumber') {
            this._context.set('required', false);
            this._context.set('placeholder', 'Emergency contact number');
        }
    }
    public getContextData(): Map<string, any> {
        return this._context;
    }
}

function createFormFieldWrapperObject<T>(labelText: string, templateRefId: string, field: IFormBuilderVM | IFormField<T>): AddUpdateSubstanceFieldWrapper<T> {
    return {
        labelText: labelText,
        templateRefId: templateRefId,
        field: field,
        context: new AddUpdateSubstanceContext(field)
    }
}

function createFormFieldObject<T>(name: string, type: FormFieldType, initialValue: T, validators: ValidatorFn | ValidatorFn[]): AddUpdateSubstanceField<T> {
    return {
        name: name,
        type: type,
        initialValue: initialValue,
        validators: validators
    }
}
