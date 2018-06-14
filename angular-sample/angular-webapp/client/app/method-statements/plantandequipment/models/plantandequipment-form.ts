import { isNullOrUndefined } from 'util';
import { ProcedureGroup } from '../../../shared/models/proceduregroup';
import { AeSelectItem } from '../../../atlas-elements/common/models/ae-select-item';
import { BehaviorSubject } from 'rxjs/Rx';
import { Context } from 'vm';
import { ValidatorFn, Validators, AbstractControl } from '@angular/forms';
import { CommonValidators } from '../../../shared/validators/common-validators';

import {
    FormFieldType,
    IFormBuilderVM,
    IFormField,
    IFormFieldContext,
    IFormFieldWrapper
} from '../../../shared/models/iform-builder-vm';
import * as Immutable from 'immutable';
//import { ProcedureService } from "../services/procedure.service";
import { PlantAndEquipment } from "./../models/plantandequipment";

export class PlantAndEquipmentForm implements IFormBuilderVM {
    public name: string;
    public fieldsArray: Array<PlantAndEquipmentFieldWrapper<any>> = new Array();
    private _plantAndEquipmentObject: PlantAndEquipment;
    //private _procedureService: ProcedureService;

    constructor(name: string, plantAndEquipmentObject: PlantAndEquipment) {
        this.name = name;
        this._plantAndEquipmentObject = plantAndEquipmentObject;
        //  this._procedureService = procedureService;
    }

    public init(): Array<IFormFieldWrapper<any>> {
        this.fieldsArray.push(createFormFieldWrapperObject('Name ', '', createFormFieldObject('Name', FormFieldType.InputString, this._plantAndEquipmentObject.Name, [Validators.required])));
        this.fieldsArray.push(createFormFieldWrapperObject('Asset / reference no', '', createFormFieldObject('AssetRefNo', FormFieldType.InputString, this._plantAndEquipmentObject.AssetRefNo,[])));
        this.fieldsArray.push(createFormFieldWrapperObject('What is the item used for ? ', '', createFormFieldObject('UsedFor', FormFieldType.TextArea, this._plantAndEquipmentObject.UsedFor, [Validators.required])));
        this.fieldsArray.push(createFormFieldWrapperObject('Special requirements', '', createFormFieldObject('SpecialRequirements', FormFieldType.TextArea, this._plantAndEquipmentObject.SpecialRequirements, [])));
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

export class PlantAndEquipmentFormField<T> implements IFormField<T> {
    name: string;
    type: FormFieldType;
    initialValue: T;
    validators: ValidatorFn | ValidatorFn[];
}

export class PlantAndEquipmentFormFieldContext implements IFormFieldContext {
    private _context: Map<string, any>;

    constructor(field: IFormBuilderVM | IFormField<any>) {
        this._context = new Map<string, any>();

        if (field.name === 'Name') {
            this._context.set('required', true);
            this._context.set('placeholder', 'Name');
            this._context.set('maxlength', 50);
        }

        if (field && field.name === 'AssetRefNo') {
            this._context.set('placeholder', 'Asset / reference no');
            this._context.set('maxlength', 50);
        }
        if (field && field.name === 'UsedFor') {
            this._context.set('required', true);
            this._context.set('rows', 5);
            this._context.set('placeholder', 'Used for');
            this._context.set('maxlength', 1000);
        }
        if (field && field.name === 'SpecialRequirements') {
            this._context.set('rows', 5);
            this._context.set('placeholder', 'Special requirements');
            this._context.set('maxlength', 1000);
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
        context: new PlantAndEquipmentFormFieldContext(field),
    }
}

function createFormFieldObject<T>(name: string, type: FormFieldType, initialValue: T, validators: ValidatorFn | ValidatorFn[]): PlantAndEquipmentFormField<T> {
    return {
        name: name,
        type: type,
        initialValue: initialValue,
        validators: validators
    }
}




