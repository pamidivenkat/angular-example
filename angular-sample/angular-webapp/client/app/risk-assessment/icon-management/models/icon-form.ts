import { ControlIconCategory } from './control-icon-category.enum';
import { HazardIconCategory } from './hazard-icon-category.enum';
import { getAeSelectItemsFromEnum } from '../../../shared/helpers/extract-helpers';
import { AeSelectItem } from '../../../atlas-elements/common/Models/ae-select-item';
import { BehaviorSubject } from 'rxjs/Rx';
import { IconType } from './icon-type.enum';
import { ValidatorFn, Validators } from '@angular/forms';
import {
    FormFieldType,
    IFormBuilderVM,
    IFormField,
    IFormFieldContext,
    IFormFieldWrapper,
} from '../../../shared/models/iform-builder-vm';
import * as Immutable from 'immutable';

export class IconForm implements IFormBuilderVM {
    public name: string;
    public type: IconType;
    public fieldsArray: Array<IconFormFieldWrapper<any>> = new Array();

    constructor(name: string, type: IconType) {
        this.name = name;
        this.type = type;
    }

    public init(): Array<IFormFieldWrapper<any>> {
        this.fieldsArray.push(createFormFieldWrapperObject('PictureId', 'uploadicontemplate', createFormFieldObject('PictureId', FormFieldType.FileUpload, '', [Validators.required]), this.type));
        this.fieldsArray.push(createFormFieldWrapperObject('Category', '', createFormFieldObject('Category', FormFieldType.Select, '', [Validators.required]), this.type));
        this.fieldsArray.push(createFormFieldWrapperObject('Name', '', createFormFieldObject('Name', FormFieldType.InputString, '', [Validators.required, Validators.maxLength(50)]), this.type));
        this.fieldsArray.push(createFormFieldWrapperObject('Description', '', createFormFieldObject('Description', FormFieldType.TextArea, '', [Validators.required, Validators.maxLength(100)]), this.type));
        return this.fieldsArray;
    }

    public getFields(): Immutable.List<IFormFieldWrapper<any>> {
        return Immutable.List(this.fieldsArray);
    }
}

export class IconFormFieldWrapper<T> implements IFormFieldWrapper<T> {
    labelText: string;
    templateRefId: string;
    context: IFormFieldContext;
    field: IFormBuilderVM | IFormField<T>;
}

export class IconFormField<T> implements IFormField<T> {
    name: string;
    type: FormFieldType;
    initialValue: T;
    validators: ValidatorFn | ValidatorFn[];
}

export class IconFormContext implements IFormFieldContext {
    private _context: Map<string, any>;

    constructor(field: IFormBuilderVM | IFormField<any>, type: IconType) {
        this._context = new Map<string, any>();
        if (field.name === 'Name') {
            this._context.set('required', true);
            this._context.set('placeholder', 'Name');
            this._context.set('maxlength', 50);
            this._context.set('showRemainingCharacterCount', true);
        }
        if (field.name === 'Description') {
            this._context.set('required', true);
            this._context.set('placeholder', 'Description');
            this._context.set('maxlength', 100);
            this._context.set('showRemainingCharacterCount', true);
        }
        if (field.name === 'Category') {
            this._context.set('required', true);
            this._context.set('placeholder', 'Please select');
            this._context.set('options', new BehaviorSubject(Immutable.List<AeSelectItem<number>>(this.getCategories(type))));
        }
    }

    private getCategories(type: IconType) {
        return getAeSelectItemsFromEnum(type === IconType.Control ? ControlIconCategory : HazardIconCategory);
    }
    public getContextData(): Map<string, any> {
        return this._context;
    }
}

function createFormFieldWrapperObject<T>(labelText: string, templateRefId: string, field: IFormBuilderVM | IFormField<T>, type: IconType): IconFormFieldWrapper<T> {
    return {
        labelText: labelText,
        templateRefId: templateRefId,
        field: field,
        context: new IconFormContext(field, type)
    }
}



function createFormFieldObject<T>(name: string,
    type: FormFieldType,
    initialValue: T,
    validators: ValidatorFn | ValidatorFn[]): IconFormField<T> {
    return {
        name: name,
        type: type,
        initialValue: initialValue,
        validators: validators
    }
}