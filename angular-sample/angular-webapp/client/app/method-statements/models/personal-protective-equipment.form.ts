
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
import { BehaviorSubject } from "rxjs/Rx";
import { AeSelectItem } from './../../atlas-elements/common/models/ae-select-item';
import { AeDatasourceType } from './../../atlas-elements/common/ae-datasource-type';
import { EventEmitter } from "@angular/core";
import { PPECategoryGroup, PPECategory } from './../../shared/models/lookup.models';
import { MethodStatement } from './../../method-statements/models/method-statement';
import { isNullOrUndefined } from "util";

export class PersonalProtectveEquipmentForm implements IFormBuilderVM {
    public name: string;
    public fieldsArray: Array<PersonalProtectveEquipmentFieldWrapper<any>> = new Array();

    constructor(name: string) {
        this.name = name;
    }

    public init(): Array<IFormFieldWrapper<any>> {

        return this.fieldsArray;
    }

    public initFrom(data: PPECategoryGroup[], methodstatement?: MethodStatement): Array<IFormFieldWrapper<any>> {
        data.map(group => {
            let preSelectedCategories: PPECategory[] = [];
            if(!isNullOrUndefined(methodstatement)){
             preSelectedCategories = methodstatement.MSPPE && methodstatement.MSPPE.length > 0 ? methodstatement.MSPPE.map(a => {
                return a.PPECategory;
            }) : null;
            if (!isNullOrUndefined(preSelectedCategories) && preSelectedCategories.length > 0) {
                preSelectedCategories = preSelectedCategories.filter(p => !isNullOrUndefined(p) && p.PPECategoryGroupId === group.Id);
            }
            }
            this.fieldsArray.push(createFormFieldWrapperObject(group.Name, '', createFormFieldObject(group.Code.toString(), FormFieldType.AutoComplete, preSelectedCategories, []), group.PPECategories));
            this.fieldsArray.push(createFormFieldWrapperObject('Other', '', createFormFieldObject(group.Code.toString() + 'Other', FormFieldType.InputString, '', [Validators.required]), null));
        });
        return this.fieldsArray;
    }

    public getFields(): Immutable.List<IFormFieldWrapper<any>> {
        return Immutable.List(this.fieldsArray);
    }
}

export class PersonalProtectveEquipmentFieldWrapper<T> implements IFormFieldWrapper<T> {
    labelText: string;
    templateRefId: string;
    context: IFormFieldContext;
    field: IFormBuilderVM | IFormField<T>;
}

export class PersonalProtectveEquipmentFormField<T> implements IFormField<T> {
    name: string;
    type: FormFieldType;
    initialValue: T;
    validators: ValidatorFn | ValidatorFn[];
}

export class PersonalProtectveEquipmentFormFieldContext implements IFormFieldContext {
    private _context: Map<string, any>;

    constructor(field: IFormField<any>, data: any[]) {
        this._context = new Map<string, any>();
        if (field.type === FormFieldType.AutoComplete) {
            this._context.set('placeholder', 'Select ppe category');
            this._context.set('multiselect', true);
            this._context.set('dstype', AeDatasourceType.Local);
            this._context.set('field', 'Name');
            this._context.set('valuefield', 'Id');
            this._context.set('items', new BehaviorSubject<Array<any>>(data));
        }

        if (field.type === FormFieldType.InputString) {
            this._context.set('required', true);
            this._context.set('placeholder', 'Please enter other equipment here (if multiple separate them by semicolon)...');
            this._context.set('property', 'visibility');
            this._context.set('showInfoIcon', 'true');
            this._context.set('infoText', 'you can specify multiple other items separating them with semicolon');
            this._context.set('propertyValue', new BehaviorSubject<boolean>(false));
        }

    }
    public getContextData(): Map<string, any> {
        return this._context;
    }
}

function createFormFieldWrapperObject<T>(labelText: string, templateRefId: string, field: IFormField<T>, data: any[]): PersonalProtectveEquipmentFieldWrapper<T> {
    return {
        labelText: labelText,
        templateRefId: templateRefId,
        field: field,
        context: new PersonalProtectveEquipmentFormFieldContext(field, data),
    }
}

function createFormFieldObject<T>(name: string, type: FormFieldType, initialValue: T, validators: ValidatorFn | ValidatorFn[]): PersonalProtectveEquipmentFormField<T> {
    return {
        name: name,
        type: type,
        initialValue: initialValue,
        validators: validators
    }
}