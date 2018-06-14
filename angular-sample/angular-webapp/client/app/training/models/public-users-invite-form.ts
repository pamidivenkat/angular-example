import { ChangeDetectorRef } from '@angular/core';
import { AbstractControl, ValidatorFn } from '@angular/forms';
import * as Immutable from 'immutable';
import { isNullOrUndefined } from 'util';

import {
    FormFieldType,
    IFormBuilderVM,
    IFormField,
    IFormFieldContext,
    IFormFieldWrapper,
} from '../../shared/models/iform-builder-vm';
import { TrainingCourse } from '../../shared/models/training-course.models';
import { CommonValidators } from '../../shared/validators/common-validators';
import { TrainingCourseService } from '../training-courses/services/training-courses.service';

export class PublicUserInviteForm implements IFormBuilderVM {
    public name: string;
    public fieldsArray: Array<PublicUserInviteFormWrapper<any>> = new Array();
    private _trainingCourseObject: TrainingCourse;

    constructor(name: string
        , private trainingCoursesService: TrainingCourseService
        , private _cdRef: ChangeDetectorRef) {
        this.name = name;
    }
    public init(): Array<IFormFieldWrapper<any>> {
        this.fieldsArray.push(createFormFieldWrapperObject('First name ', '', createFormFieldObject('FirstName', FormFieldType.InputString, null, [CommonValidators.required])));
        this.fieldsArray.push(createFormFieldWrapperObject('Surname ', '', createFormFieldObject('Surname', FormFieldType.InputString, null, [CommonValidators.required])));
        this.fieldsArray.push(createFormFieldWrapperObject('Email', '', createFormFieldObject('Email', FormFieldType.InputEmail, null, [CommonValidators.required, PublicUserInviteValidators.checkDuplicateEmail(this.trainingCoursesService, this._cdRef)])));
        return this.fieldsArray;
    }

    public getFields(): Immutable.List<IFormFieldWrapper<any>> {
        return Immutable.List(this.fieldsArray);
    }
}

export class PublicUserInviteFormWrapper<T> implements IFormFieldWrapper<T> {
    labelText: string;
    templateRefId: string;
    context: IFormFieldContext;
    field: IFormBuilderVM | IFormField<T>;
}

export class PublicUserInviteFormField<T> implements IFormField<T> {
    name: string;
    type: FormFieldType;
    initialValue: T;
    validators: ValidatorFn | ValidatorFn[];
}

export class TrainingCourseInviteesCommentsContext implements IFormFieldContext {
    private _context: Map<string, any>;

    constructor(field: IFormBuilderVM | IFormField<any>) {
        this._context = new Map<string, any>();

        if (field.name === 'FirstName') {
            this._context.set('required', true);
            this._context.set('placeholder', 'First name');
        }
        if (field.name === 'Surname') {
            this._context.set('required', true);
            this._context.set('placeholder', 'Surname');
        }
        if (field.name === 'Email') {
            this._context.set('required', true);
            this._context.set('placeholder', 'Email');
        }
    }

    public getContextData(): Map<string, any> {
        return this._context;
    }
}

function createFormFieldWrapperObject<T>(labelText: string, templateRefId: string, field: IFormBuilderVM | IFormField<T>): PublicUserInviteFormWrapper<T> {
    return {
        labelText: labelText,
        templateRefId: templateRefId,
        field: field,
        context: new TrainingCourseInviteesCommentsContext(field),
    }
}

function createFormFieldObject<T>(name: string, type: FormFieldType, initialValue: T, validators: ValidatorFn | ValidatorFn[]): PublicUserInviteFormField<T> {
    return {
        name: name,
        type: type,
        initialValue: initialValue,
        validators: validators
    }
}

export class PublicUserInviteValidators {
    static enteredEmail: string;
    static checkDuplicateEmail(trainingCoursesService: TrainingCourseService, cdRef: ChangeDetectorRef) {
        return (control: AbstractControl): { [key: string]: boolean } => {
            let value = control.value ? control.value : null;
            if (!isNullOrUndefined(value) && value !== PublicUserInviteValidators.enteredEmail) {
                trainingCoursesService.checkDuplicateEmail(value).subscribe(val => {
                    if (!val) {
                        control.setErrors({ 'duplicateEmail': true });
                        cdRef.markForCheck();
                    }
                });
            }
            return null;
        };
    }
}