import { IFormBuilderVM } from './../models/iform-builder-vm';
import { controlPath } from '@angular/forms/src/directives/shared';
import { isNullOrUndefined } from 'util';
import { AbstractControl, ValidatorFn, Validators } from '@angular/forms';
import { StringHelper } from '../helpers/string-helper';
export class CommonValidators {
    static getErrorMessages() {
        return {

            required: (context) => `${this.getLabelText(context)} is required`,
            email: (context) => `Incorrect email format`,
            phoneUK: (context) => `Telephone is not valid`,
            procedureName: (context) => `Name already exists`,
            postcode: (context) => `Postcode is not valid`,
            maxlength: (context) => `Max length exceeding`,
            datecompare: (context) => `Did not match required criteria`,
            duplicateEmail: (context) => 'Email already exist',
            isUnique: (context) => 'Already exist, please try new',
            invalidDate: (context) => `${context.labelText} has incorrect date format, should be dd/mm/yyyy`,
            nofutureDate: (context) => `${context.labelText} should not be a future date`
        }
    }

    static getLabelText(ctx) {
        if (isNullOrUndefined(ctx) ||
            (!isNullOrUndefined(ctx) &&
                StringHelper.isNullOrUndefinedOrEmpty(ctx.labelText))) {
            return 'This field';
        }
        return ctx.labelText;
    }

    static email(): ValidatorFn {
        return (control) => {
            let email = control.value ? control.value : null;
            let pattern = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            if (!isNullOrUndefined(email)) {
                if (!pattern.test(email)) {
                    return { 'email': true };
                }
            }
            return null
        };
    }

    static validDate(): ValidatorFn {
        return (control) => {
            let email = control.value ? control.value : null;
            let pattern = /^([0-9]{2})\/([0-9]{2})\/([0-9]{4})$/;
            if (!isNullOrUndefined(email)) {
                if (!pattern.test(email)) {
                    return { 'invalidDate': true };
                }
            }
            return null
        };
    }

    static futureDate(): ValidatorFn {
        return (control) => {
            let date = control.value ? control.value : null;
            if (!isNullOrUndefined(date)) {
                if (new Date(date) > new Date()) {
                    return { 'nofutureDate': true };
                }
            }
            return null
        };
    }

    static phoneUK(): ValidatorFn {
        return (control) => {
            let phoneNumber = control.value ? control.value : null
            let pattern = /^(((\+44\s?\d{4}|\(?0\d{4}\)?)\s?\d{3}\s?\d{3})|((\+44\s?\d{3}|\(?0\d{3}\)?)\s?\d{3}\s?\d{4})|((\+44\s?\d{2}|\(?0\d{2}\)?)\s?\d{4}\s?\d{4}))(\s?\#(\d{4}|\d{3}))?$/;
            if (!isNullOrUndefined(phoneNumber)) {
                if (!pattern.test(phoneNumber)) {
                    return { 'phoneUK': true };
                }
            }
            return null;
        };
    }

    static min(minValue: number): ValidatorFn {
        return (control: AbstractControl): { [key: string]: boolean } => {
            let value = control.value ? control.value : null;
            if (!isNullOrUndefined(value)) {
                if (isNaN(value))
                    return null;
                if (Number(value) >= minValue)
                    return null
                return { 'min': true };


            }
            return null;
        };
    }

    static max(maxValue: number): ValidatorFn {
        return (control: AbstractControl): { [key: string]: boolean } => {
            let value = control.value ? control.value : null;
            if (!isNullOrUndefined(value)) {
                if (isNaN(value))
                    return null;
                if (Number(value) <= maxValue)
                    return null
                return { 'max': true };
            }
            return null;
        };
    }

    static whiteSpaceCheck(): ValidatorFn {
        return (control: AbstractControl): { [key: string]: boolean } => {
            let value: string = <string>control.value;

            return !StringHelper.isNullOrUndefinedOrEmpty(value) ? null : {
                'hasWhiteSpace': true
            };
        };
    }

    static postcode(): ValidatorFn {
        return (control) => {
            let postcode = control.value ? control.value : null;
            let pattern = /[A-Z]{1,2}[0-9][0-9A-Z]?\s?[0-9][A-Z]{2}/gi;
            if (!isNullOrUndefined(postcode)) {
                if (!pattern.test(postcode)) {
                    return { 'postcode': true };
                }
            }
            return null
        };
    }

    static dateCompare(baseDate: AbstractControl, expressionLambda: (base, target) => boolean): ValidatorFn {
        return (control: AbstractControl): { [key: string]: boolean } => {
            let baseDateValue = baseDate.value ? baseDate.value : null;
            let targetDateValue = control.value ? control.value : null;
            if (isNullOrUndefined(baseDateValue)) {
                return { 'datecompare': true };
            } else if (isNullOrUndefined(targetDateValue)) {
                return null;
            } else {
                if (expressionLambda(baseDateValue, targetDateValue)) {
                    return { 'datecompare': true };
                }
            }
            return null;
        }
    }

    static required = Validators.required;
    static requiredTrue = Validators.requiredTrue;
    static minLength = Validators.minLength;
    static maxLength = Validators.maxLength;
    static pattern = Validators.pattern;
    static nullValidator = Validators.nullValidator;
    static compose = Validators.compose;

}
