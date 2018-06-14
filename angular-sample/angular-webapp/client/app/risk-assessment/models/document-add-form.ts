import { CommonValidators } from '../../shared/validators/common-validators';
import * as Immutable from 'immutable';


import { IFormBuilderVM, IFormFieldWrapper, IFormField, FormFieldType } from "../../shared/models/iform-builder-vm";
import { ValidatorFn } from "@angular/forms";
import { Validators } from '@angular/forms';

export class DocumentAddForm implements IFormBuilderVM {
    name: string;
    filedArray: Array<DocumentFormFieldWrapper<any>> = new Array();

    /**
     *
     */
    constructor(name: string) {
        this.name = name;
    }

    getFields(): Immutable.List<IFormFieldWrapper<any>> {
        this.filedArray.push(createFormFieldWrapperObject("Title", "", createFormFieldObject("Title", FormFieldType.InputString, "", [])));
        this.filedArray.push(createFormFieldWrapperObject("Description", "", createFormFieldObject("Description", FormFieldType.InputString, "", [])));
        return Immutable.List(this.filedArray);
    }

    public init(): Array<IFormFieldWrapper<any>> {
        throw new Error('Not implemented yet.');
    }
}

export class DocumentFormFieldWrapper<T> implements IFormFieldWrapper<T> {
    labelText: string;
    templateRefId: string;
    field: IFormBuilderVM | IFormField<T>;
    context: any
}

export class DocumentFormField<T> implements IFormField<T> {
    name: string;
    type: FormFieldType;
    initialValue: T;
    validators: ValidatorFn | ValidatorFn[];
}

function createFormFieldWrapperObject<T>(labelText: string, templateRefId: string, field: IFormBuilderVM | IFormField<T>): DocumentFormFieldWrapper<T> {
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
    validators: ValidatorFn | ValidatorFn[]): DocumentFormField<T> {
    return {
        name: name,
        type: type,
        initialValue: initialValue,
        validators: validators
    }
}