import { isNullOrUndefined } from 'util';
import { Context } from 'vm';
import { ValidatorFn, Validators, AbstractControl } from '@angular/forms';
import {
    FormFieldType,
    IFormBuilderVM,
    IFormField,
    IFormFieldContext,
    IFormFieldWrapper
} from '../../../shared/models/iform-builder-vm';
import * as Immutable from 'immutable';
import { AeDatasourceType } from '../../../atlas-elements/common/ae-datasource-type';
import { BehaviorSubject } from "rxjs/Rx";
import { PlantAndEquipment } from '../../../method-statements/plantandequipment/models/plantandequipment';


export class PlantAndEquipmentForm implements IFormBuilderVM {
    
    public name: string;
    public fieldsArray: Array<PlantAndEquipmentFieldWrapper<any>> = new Array();

    constructor(name: string) {
        this.name = name;    
    }

    public init(): Array<IFormFieldWrapper<any>> {
        this.fieldsArray.push(createFormFieldWrapperObject('Add Item', 'addButton', createFormFieldObject('AddItem', FormFieldType.Custom, '', [])));
        this.fieldsArray.push(createFormFieldWrapperObject('Select an item from your Plant & equipment bank', '', createFormFieldObject('plantAndEquipment', FormFieldType.AutoComplete, null, [Validators.required])));
        
        return this.fieldsArray;
    }

    public getFields(): Immutable.List<IFormFieldWrapper<any>> {
        return Immutable.List(this.fieldsArray);
    }
}

export class PlantAndEquipmentFieldWrapper<T> implements IFormFieldWrapper<T> {
    labelText: string;
    templateRefId: string;
    context: IFormFieldContext;
    field: IFormBuilderVM | IFormField<T>;
}

export class PlantAndEquipmentField<T> implements IFormField<T> {
    name: string;
    type: FormFieldType;
    initialValue: T;
    validators: ValidatorFn | ValidatorFn[];
}

export class PlantAndEquipmentCommentsContext implements IFormFieldContext {
    private _context: Map<string, any>;

    constructor(field: IFormBuilderVM | IFormField<any>) {
        this._context = new Map<string, any>();

        if (field.name === 'plantAndEquipment') {
            this._context.set('required', true);
            this._context.set('placeholder', 'Please select');
            this._context.set('multiselect', true);
            this._context.set('dstype', AeDatasourceType.Local);
            this._context.set('field', 'Name');
            this._context.set('valuefield', 'Id');
            this._context.set('items', new BehaviorSubject<Array<PlantAndEquipment>>([]));
        }

    }

    public getContextData(): Map<string, any> {
        return this._context;
    }
}

function createFormFieldWrapperObject<T>(labelText: string, templateRefId: string, field: IFormBuilderVM | IFormField<T>): PlantAndEquipmentFieldWrapper<T> {
    return {
        labelText: labelText,
        templateRefId: templateRefId,
        field: field,
        context: new PlantAndEquipmentCommentsContext(field),
    }
}

function createFormFieldObject<T>(name: string, type: FormFieldType, initialValue: T, validators: ValidatorFn | ValidatorFn[]): PlantAndEquipmentField<T> {
    return {
        name: name,
        type: type,
        initialValue: initialValue,
        validators: validators
    }
}




