
import { CommonValidators } from '../../shared/validators/common-validators';
import * as Immutable from 'immutable';


import {
    FormFieldType,
    IFormBuilderVM,
    IFormField,
    IFormFieldContext,
    IFormFieldWrapper
} from '../../shared/models/iform-builder-vm';
import { ValidatorFn } from "@angular/forms";
import { Validators } from '@angular/forms';

export class CreateHazardForm implements IFormBuilderVM {
    name: string;
    fieldArray: Array<HazardFormFieldWrapper<any>> = new Array();

    /**
     *
     */
    constructor(name: string) {
        this.name = name;
    }

    getFields(): Immutable.List<IFormFieldWrapper<any>> {
        this.fieldArray.push(createFormFieldWrapperObject('Name', '', createFormFieldObject('Name', FormFieldType.InputString, '', [Validators.required])));
        this.fieldArray.push(createFormFieldWrapperObject('Description', '', createFormFieldObject('Description', FormFieldType.TextArea, '', [])));
        this.fieldArray.push(createFormFieldWrapperObject('Who is affected?', '', createFormFieldObject('WhoAffecteds', FormFieldType.AutoComplete, '', [Validators.required])));
        this.fieldArray.push(createFormFieldWrapperObject(' Others(Please specify)', '', createFormFieldObject('OthersAffected', FormFieldType.InputString, '', [])));
        this.fieldArray.push(createFormFieldWrapperObject('How many affected?', '', createFormFieldObject('HowManyAffected', FormFieldType.InputString, '', [])));
        this.fieldArray.push(createFormFieldWrapperObject('How people affected?', '', createFormFieldObject('PeopleAffected', FormFieldType.TextArea, '', [])));
        return Immutable.List(this.fieldArray);
    }

    public init(): Array<IFormFieldWrapper<any>> {
        throw new Error('Not implemented yet.');
    }
}

export class HazardFormFieldWrapper<T> implements IFormFieldWrapper<T> {
    labelText: string;
    templateRefId: string;
    field: IFormBuilderVM | IFormField<T>;
    context: IFormFieldContext
}

export class CreateHazardFormField<T> implements IFormField<T> {
    name: string;
    type: FormFieldType;
    initialValue: T;
    validators: ValidatorFn | ValidatorFn[];
}

function createFormFieldWrapperObject<T>(labelText: string, templateRefId: string, field: IFormBuilderVM | IFormField<T>): HazardFormFieldWrapper<T> {
    return {
        labelText: labelText,
        templateRefId: templateRefId,
        field: field,
        context: null
    }
}

function createFormFieldObject<T>(name: string,
    type: FormFieldType,
    initialValue: T,
    validators: ValidatorFn | ValidatorFn[]): CreateHazardFormField<T> {
    return {
        name: name,
        type: type,
        initialValue: initialValue,
        validators: validators
    }
}