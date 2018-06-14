import { CPPSafetyPrecautions } from './construction-phase-plans';
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
import { BehaviorSubject, Observable } from "rxjs/Rx";
import { AeSelectItem } from './../../atlas-elements/common/models/ae-select-item';
import { AeDatasourceType } from "./../../atlas-elements/common/ae-datasource-type";
import { EventEmitter } from "@angular/core";

export class AddSafetyPrecautionsForm implements IFormBuilderVM {
    public name: string;
    public fieldsArray: Array<AddSafetyPrecautionsFormFieldWrapper<any>> = new Array();
    public cppSafetyPrecautions: CPPSafetyPrecautions;

    constructor(name: string, model: CPPSafetyPrecautions) {
        this.name = name;
        this.cppSafetyPrecautions = model;
    }

    public init(): Array<IFormFieldWrapper<any>> {
        this.fieldsArray.push(createFormFieldWrapperObject('Emergency procedures user', '', createFormFieldObject('EmergencyRespUserId', FormFieldType.AutoComplete, [], null), this.cppSafetyPrecautions));
        this.fieldsArray.push(createFormFieldWrapperObject('Other emergency procedures user', '', createFormFieldObject('EmergencyRespOtherUser', FormFieldType.InputString, null, null), this.cppSafetyPrecautions));

        this.fieldsArray.push(createFormFieldWrapperObject('First aid user', '', createFormFieldObject('FirstAidRespUserId', FormFieldType.AutoComplete, [], null), this.cppSafetyPrecautions));
        this.fieldsArray.push(createFormFieldWrapperObject('Other first aid user', '', createFormFieldObject('FirstAidRespOtherUser', FormFieldType.InputString, null, null), this.cppSafetyPrecautions));

        this.fieldsArray.push(createFormFieldWrapperObject('Is Asbestos On Premises?', '', createFormFieldObject('IsAsbestos', FormFieldType.Select, '', [Validators.required]), this.cppSafetyPrecautions));
        this.fieldsArray.push(createFormFieldWrapperObject('What welfare facilities are provided?', '', createFormFieldObject('WelfareFacilities', FormFieldType.TextArea, null, [Validators.required]), this.cppSafetyPrecautions));
        this.fieldsArray.push(createFormFieldWrapperObject('How is everyone kept up to date?', '', createFormFieldObject('Communication', FormFieldType.TextArea, null, [Validators.required]), this.cppSafetyPrecautions));


        this.fieldsArray.push(createFormFieldWrapperObject('Fire response user', '', createFormFieldObject('FireRespUserId', FormFieldType.AutoComplete, [], null), this.cppSafetyPrecautions));
        this.fieldsArray.push(createFormFieldWrapperObject('Other fire response user', '', createFormFieldObject('FireRespOtherUser', FormFieldType.InputString, null, null), this.cppSafetyPrecautions));

        this.fieldsArray.push(createFormFieldWrapperObject('Reporting of Accidents/Incidents user', '', createFormFieldObject('AccidentRespUserId', FormFieldType.AutoComplete, [], null), this.cppSafetyPrecautions));
        this.fieldsArray.push(createFormFieldWrapperObject('Other reporting of Accidents/Incidents user', '', createFormFieldObject('AccidentRespOtherUser', FormFieldType.InputString, null, null), this.cppSafetyPrecautions));

        this.fieldsArray.push(createFormFieldWrapperObject('What PPE is required?', '', createFormFieldObject('PPE', FormFieldType.TextArea, null, [Validators.required]), this.cppSafetyPrecautions));
        this.fieldsArray.push(createFormFieldWrapperObject('What site security is there?', '', createFormFieldObject('SiteSecurity', FormFieldType.TextArea, null, [Validators.required]), this.cppSafetyPrecautions));

        return this.fieldsArray;
    }

    public getFields(): Immutable.List<IFormFieldWrapper<any>> {
        return Immutable.List(this.fieldsArray);
    }
}

export class AddSafetyPrecautionsFormFieldWrapper<T> implements IFormFieldWrapper<T> {
    labelText: string;
    templateRefId: string;
    context: IFormFieldContext;
    field: IFormBuilderVM | IFormField<T>;
}

export class AddSafetyPrecautionsFormField<T> implements IFormField<T> {
    name: string;
    type: FormFieldType;
    initialValue: T;
    validators: ValidatorFn | ValidatorFn[];
}



export class AddSafetyPrecautionsFormFieldContext implements IFormFieldContext {
    private _context: Map<string, any>;
    private _setSelectOptions(map: Map<string, any>) {
        map.set('required', false);
        map.set('placeholder', 'Select user');
        map.set('multiselect', false);
        map.set('dstype', AeDatasourceType.Remote);
        map.set('field', 'Text');
        map.set('valuefield', 'Value');
        map.set('minlength', 2);
        map.set('debounce', 2000);
        map.set('searchEvent', new EventEmitter<any>());;
        map.set('items', new BehaviorSubject<Array<any>>([]));
        map.set('onSelectEvent', new EventEmitter<any>());;
        map.set('onInputEvent', new EventEmitter<any>());;
    }

    private _setSelectOtherOptions(map: Map<string, any>) {
        map.set('property', "visibility");
        map.set('propertyValue', new BehaviorSubject<boolean>(false));
        map.set('maxlength', 200);
        map.set('showRemainingCharacterCount', false);
        map.set('placeholder', 'type other user');
    }

    constructor(field: IFormBuilderVM | IFormField<any>, model: CPPSafetyPrecautions) {
        this._context = new Map<string, any>();
        if (field.name === 'EmergencyRespUserId') {
            this._setSelectOptions(this._context);
            this._context.set('initialtext', model && model.EmergencyRespUser ? model.EmergencyRespUser.FullName : '');
        }
        else if (field.name === 'EmergencyRespOtherUser') {
            this._setSelectOtherOptions(this._context);
        }
        if (field.name === 'FirstAidRespUserId') {
            this._setSelectOptions(this._context);
            this._context.set('initialtext', model && model.FirstAidRespUser ? model.FirstAidRespUser.FullName : '');
        }
        else if (field.name === 'FirstAidRespOtherUser') {
            this._setSelectOtherOptions(this._context);
        }
        else if (field.name === 'IsAsbestos') {
            this._context.set('required', true);
            this._context.set('placeholder', 'Please select');
            this._context.set('options', new BehaviorSubject<Immutable.List<AeSelectItem<string>>>(Immutable.List<AeSelectItem<string>>([new AeSelectItem<string>('Yes', 'true', false), new AeSelectItem<string>('No', 'false', false)])));
        }
        else if (field.name === 'WelfareFacilities') {
            this._context.set('required', true);
            this._context.set('maxlength', 200);
            this._context.set('showRemainingCharacterCount', false);
        }
        else if (field.name === 'Communication') {
            this._context.set('required', true);
            this._context.set('maxlength', 200);
            this._context.set('showRemainingCharacterCount', false);
        }
        else if (field.name === 'FireRespUserId') {
            this._setSelectOptions(this._context);
            this._context.set('initialtext', model && model.FireRespUser ? model.FireRespUser.FullName : '');
        }
        else if (field.name === 'FireRespOtherUser') {
            this._setSelectOtherOptions(this._context);
        }
        else if (field.name === 'AccidentRespUserId') {
            this._setSelectOptions(this._context);
            this._context.set('initialtext', model && model.AccidentRespUser ? model.AccidentRespUser.FullName : '');
        }
        else if (field.name === 'AccidentRespOtherUser') {
            this._setSelectOtherOptions(this._context);
        }
        else if (field.name === 'PPE') {
            this._context.set('required', true);
            this._context.set('maxlength', 200);
            this._context.set('showRemainingCharacterCount', false);
        }
        else if (field.name === 'SiteSecurity') {
            this._context.set('required', true);
            this._context.set('maxlength', 200);
            this._context.set('showRemainingCharacterCount', false);
        }
    }
    public getContextData(): Map<string, any> {
        return this._context;
    }
}



function createFormFieldWrapperObject<T>(labelText: string, templateRefId: string, field: IFormBuilderVM | IFormField<T>, model: CPPSafetyPrecautions): AddSafetyPrecautionsFormFieldWrapper<T> {
    return {
        labelText: labelText,
        templateRefId: templateRefId,
        field: field,
        context: new AddSafetyPrecautionsFormFieldContext(field, model),
    }
}


function createFormFieldObject<T>(name: string, type: FormFieldType, initialValue: T, validators: ValidatorFn | ValidatorFn[]): AddSafetyPrecautionsFormField<T> {
    return {
        name: name,
        type: type,
        initialValue: initialValue,
        validators: validators
    }
}