import { ValidatorFn } from '@angular/forms';
import {
    FormFieldType,
    IFormBuilderVM,
    IFormField,
    IFormFieldContext,
    IFormFieldWrapper
} from '../../shared/models/iform-builder-vm';
import * as Immutable from 'immutable';
export class RiskAssessmentProceduresForm implements IFormBuilderVM {
    public name: string;
    public fieldsArray: Array<ProceduresFormFieldWrapper<any>> = new Array();
    constructor(name: string) {
        this.name = name;
     }
    public init(): Array<IFormFieldWrapper<any>> {
        this.fieldsArray.push(createFormFieldWrapperObject('Procedures', '', createFormFieldObject('Procedures', FormFieldType.TextArea, '', [])));
        return this.fieldsArray;
    }
    public getFields(): Immutable.List<IFormFieldWrapper<any>> {
        return Immutable.List(this.fieldsArray);
    }
}

export class ProceduresFormFieldWrapper<T> implements IFormFieldWrapper<T> {
    labelText: string;
    templateRefId: string;
    context: IFormFieldContext;
    field: IFormBuilderVM | IFormField<T>;
}
export class ProceduresFormField<T> implements IFormField<T> {
    name: string;
    type: FormFieldType;
    initialValue: T;
    validators: ValidatorFn | ValidatorFn[];
}
export class ProceduresFormContext implements IFormFieldContext {
    private _context: Map<string, any>;
    constructor(field: IFormBuilderVM | IFormField<any>) {
        this._context = new Map<string, any>();
        if (field.name === 'Procedures') {
            this._context.set('maxlength', 4000);
            this._context.set('showRemainingCharacterCount', true);
            this._context.set('rows', 5);
        }
    }
    public getContextData(): Map<string, any> {
        return this._context;
    }
}
function createFormFieldWrapperObject<T>(labelText: string, templateRefId: string, field: IFormBuilderVM | IFormField<T>): ProceduresFormFieldWrapper<T> {
    return {
        labelText: labelText,
        templateRefId: templateRefId,
        field: field,
        context: new ProceduresFormContext(field)
    }
}

function createFormFieldObject<T>(name: string, type: FormFieldType, initialValue: T, validators: ValidatorFn | ValidatorFn[]): ProceduresFormField<T> {
    return {
        name: name,
        type: type,
        initialValue: initialValue,
        validators: validators
    }
}