import { isArray } from 'rxjs/util/isArray';
import { isNullOrUndefined } from 'util';
import { CommonValidators } from '../validators/common-validators';
import { CommonHelpers } from '../helpers/common-helpers';
import { IFormBuilderVM, FormFieldType, IFormField, IFormFieldWrapper } from '../models/iform-builder-vm';
import { FormBuilder, FormControl, FormGroup, ValidatorFn } from '@angular/forms';
import { Injectable } from '@angular/core';
import * as Immutable from 'immutable';

@Injectable()
export class FormBuilderService {

    // Constructors
    constructor(private _fb: FormBuilder) { }
    // End of Constructors

    // Public Methods
    /**
     * build
     */
    public build(metadData: IFormBuilderVM): FormGroup {
        let fields = metadData.getFields();
        let formGroup = this._createFormGroup(fields);
        return formGroup;
    }

    public reset(form: FormGroup) {
        for (let key in form.controls) {
            form.controls[key].setValue('');
        }
    }
    // End of Public Methods

    // Private Methods

    private _createFormGroup<T>(fields: Immutable.List<IFormFieldWrapper<T>>): FormGroup {
        let controls = {};
        fields.map(fieldWrapper => {
            let field = fieldWrapper.field;
            if (CommonHelpers.isIFormBuilderTypeGaurd(field)) {
                field.init();
                let groupedFields = field.getFields();
                if (!isNullOrUndefined(groupedFields)) {
                    groupedFields.map(wrapper => {
                        let wrapperField = wrapper.field;
                        controls[wrapperField.name] = this._createFormControl(<IFormField<any>>wrapperField);
                    });
                }
            }
            else if (CommonHelpers.isIFormFieldTypeGaurd(field)) {
                controls[field.name] = this._createFormControl(field);
            }
        });
        return this._fb.group(controls);;
    }

    private _createFormControl<T>(field: IFormField<T>): FormControl {
        return new FormControl(field.initialValue, this._getValidators(field));
    }

    private _getValidators<T>(field: IFormField<T>): ValidatorFn[] {
        let givenValidators = this._getGivenValidators(field);
        switch (field.type) {
            case FormFieldType.InputEmail:
                givenValidators.push(CommonValidators.email());
                CommonValidators.compose(givenValidators)
                break;
            default:
                break;
        }
        return givenValidators;
    }

    private _getGivenValidators<T>(field: IFormField<T>): Array<ValidatorFn> {
        if (isNullOrUndefined(field.validators)) {
            return new Array<ValidatorFn>();
        } else {
            if (isArray(field.validators)) {
                return Array.from(field.validators);
            } else {
                let validators = new Array<ValidatorFn>();
                validators.push(field.validators);
            }
        }
    }
    // End of Private Methods



}
