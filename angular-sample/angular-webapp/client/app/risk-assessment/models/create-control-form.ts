import { ValidatorFn, Validators } from '@angular/forms';
import * as Immutable from 'immutable';
import { FormFieldType, IFormBuilderVM, IFormField, IFormFieldWrapper } from '../../shared/models/iform-builder-vm';
import { CommonValidators } from '../../shared/validators/common-validators';

export class CreateControlForm implements IFormBuilderVM {
    name: string;
    fieldArray: Array<IFormFieldWrapper<any>> = new Array();

    /**
     *
     */
    constructor(name: string) {
        this.name = name;
    }

    init(): Array<IFormFieldWrapper<any>> {
        throw new Error('Not implemented yet.');
    }

    getFields(): Immutable.List<IFormFieldWrapper<any>> {
        this.fieldArray.push(createFormFieldWrapperObject('Name', '', createFormFieldObject('Name', FormFieldType.InputString, '', [Validators.required])));
        this.fieldArray.push(createFormFieldWrapperObject('Description', '', createFormFieldObject('Description', FormFieldType.TextArea, '', [])));

        return Immutable.List(this.fieldArray);
    }

}

function createFormFieldWrapperObject<T>(labelText: string, templateRefId: string, field: IFormBuilderVM | IFormField<T>): IFormFieldWrapper<T> {
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
    validators: ValidatorFn | ValidatorFn[]): IFormField<T> {
    return {
        name: name,
        type: type,
        initialValue: initialValue,
        validators: validators
    }
}