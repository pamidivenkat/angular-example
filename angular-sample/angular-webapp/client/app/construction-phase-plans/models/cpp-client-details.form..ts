import { EventEmitter } from '@angular/core';
import { BehaviorSubject } from 'rxjs/Rx';
import { Context } from 'vm';
import { ValidatorFn, Validators } from '@angular/forms';
import {
    FormFieldType,
    IFormBuilderVM,
    IFormField,
    IFormFieldContext,
    IFormFieldWrapper
} from './../../shared/models/iform-builder-vm';
import { AeSelectItem } from './../../atlas-elements/common/models/ae-select-item';
import * as Immutable from 'immutable';

export class CppClientDetailsForm implements IFormBuilderVM {
    public name: string;
    public fieldsArray: Array<CppClientDetailsFieldWrapper<any>> = new Array();

    constructor(name: string) {
        this.name = name;
    }

    public init(): Array<IFormFieldWrapper<any>> {
        this.fieldsArray.push(createFormFieldWrapperObject('Prinicipal designer', '', createFormFieldObject('PrincipalDesigner', FormFieldType.TextArea, null, null)));
        this.fieldsArray.push(createFormFieldWrapperObject('Principal contractor', '', createFormFieldObject('PrincipalContractor', FormFieldType.TextArea, null, null)));
        this.fieldsArray.push(createFormFieldWrapperObject('Other key designers', '', createFormFieldObject('Others', FormFieldType.TextArea, null, null)));
        this.fieldsArray.push(createFormFieldWrapperObject('Who fulfils / assumes the role of the client?', '', createFormFieldObject('Client', FormFieldType.TextArea, null, [Validators.required])));
        this.fieldsArray.push(createFormFieldWrapperObject('Number of Contractors on Project?', '', createFormFieldObject('NumberOfContractors', FormFieldType.Select, '', [Validators.required])));
        return this.fieldsArray;
    }

    public getFields(): Immutable.List<IFormFieldWrapper<any>> {
        return Immutable.List(this.fieldsArray);
    }
}

export class CppClientDetailsFieldWrapper<T> implements IFormFieldWrapper<T> {
    labelText: string;
    templateRefId: string;
    context: IFormFieldContext;
    field: IFormBuilderVM | IFormField<T>;
}

export class CppClientDetailsField<T> implements IFormField<T> {
    name: string;
    type: FormFieldType;
    initialValue: T;
    validators: ValidatorFn | ValidatorFn[];
}

export class CppClientDetailsFieldContext implements IFormFieldContext {
    private _context: Map<string, any>;

    constructor(field: IFormBuilderVM | IFormField<any>) {
        this._context = new Map<string, any>();
        if (field.name === 'Client') {
            this._context.set('required', true);
            //this._context.set('placeholder', 'Type ');
            this._context.set('maxlength', 200);
            this._context.set('showRemainingCharacterCount', false);
            this._context.set('property', "visibility");
            this._context.set('propertyValue', new BehaviorSubject<boolean>(true));
        }
        else if (field.name === 'PrincipalDesigner') {
            this._context.set('maxlength', 200);
        }
        else if (field.name === 'PrincipalContractor') {
            this._context.set('maxlength', 200);
        }
        else if (field.name === 'Others') {
            this._context.set('maxlength', 200);
        }
        else if (field.name === 'NumberOfContractors') {
            this._context.set('required', true);
            this._context.set('placeholder', 'Please select');
            this._context.set('options', new BehaviorSubject<Immutable.List<AeSelectItem<number>>>(Immutable.List<AeSelectItem<number>>([new AeSelectItem<number>('1', 1, false), new AeSelectItem<number>('2', 2, false), new AeSelectItem<number>('3', 3, false), new AeSelectItem<number>('4', 4, false), new AeSelectItem<number>('5', 5, false)])));
            this._context.set('onSelectChange', new EventEmitter<any>());
        }

    }
    public getContextData(): Map<string, any> {
        return this._context;
    }
}



function createFormFieldWrapperObject<T>(labelText: string, templateRefId: string, field: IFormBuilderVM | IFormField<T>): CppClientDetailsFieldWrapper<T> {
    return {
        labelText: labelText,
        templateRefId: templateRefId,
        field: field,
        context: new CppClientDetailsFieldContext(field),
    }
}

function createFormFieldObject<T>(name: string, type: FormFieldType, initialValue: T, validators: ValidatorFn | ValidatorFn[]): CppClientDetailsField<T> {
    return {
        name: name,
        type: type,
        initialValue: initialValue,
        validators: validators
    }
}