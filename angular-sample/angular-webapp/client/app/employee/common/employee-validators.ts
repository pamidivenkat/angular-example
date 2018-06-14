import { CommonHelpers } from './../../shared/helpers/common-helpers';
import { StringHelper } from '../../shared/helpers/string-helper';

import { AbstractControl, FormControl, FormGroup } from '@angular/forms';
import { isNullOrUndefined } from "util";
export const niNumberValidator = (control: AbstractControl): { [key: string]: boolean; } => {
    let controlValue: string = control.value;

    if (StringHelper.isNullOrUndefinedOrEmpty(controlValue)) return null;

    var exp1 = /^[A-CEGHJ-NOPR-TW-Z]{1}[A-CEGHJ-NPR-TW-Z]{1}[0-9]{6}[A-D\s]{1}/i;
    var exp2 = /(^GB)|(^BG)|(^NK)|(^KN)|(^TN)|(^NT)|(^ZZ).+/i;

    return (controlValue.length >= 9 && controlValue.replace(/ /g, '') && controlValue.match(exp1) && !controlValue.match(exp2)) ? null : {
        "validNINumber": false
    };
};

export const nameFieldValidator = (control: AbstractControl): { [key: string]: boolean; } => {
    let controlValue: string = control.value;

    if (StringHelper.isNullOrUndefinedOrEmpty(controlValue)) return null;

    var invalidChars = controlValue.replace(/[0-9!@#\$%\^\&*\)?|\]\(+=._~;\\\/]/g, '*');
    if (invalidChars.indexOf('*') != -1) {
        return {
            "validName": false
        };
    }
    return null;
};

export const onlySpaceValidator = (control: AbstractControl): { [key: string]: boolean; } => {
    let controlValue: string = control.value;

    if (!controlValue) return null;
    if (controlValue.length == 0) return null;

    if (StringHelper.isNullOrUndefinedOrEmpty(controlValue)) return {
        "onlySpace": false
    };
    return null;
};

export const endDateAfterOrEqualValidator = (formGroup: FormGroup): { [key: string]: boolean; } => {
    let startDateTimestamp, endDateTimestamp;
    for (let controlName in formGroup.controls) {
        if (controlName.toLowerCase().indexOf("startdate") !== -1) {
            startDateTimestamp = (formGroup.controls[controlName].value);
        }
        if (controlName.toLowerCase().indexOf("enddate") !== -1) {
            endDateTimestamp = (formGroup.controls[controlName].value);
        }
    }
    if (StringHelper.isNullOrUndefined(startDateTimestamp) || StringHelper.isNullOrUndefined(endDateTimestamp)) return null;
    if (!CommonHelpers.checkIsValidStartAndEndDates(startDateTimestamp, endDateTimestamp))
        return {
            "endDateLessThanStartDate": false
        };
    return null;
}

export const dateCompletedValidator = (formGroup: FormGroup): { [key: string]: boolean; } => {
    let startDateTimestamp, endDateTimestamp;

    startDateTimestamp = formGroup.controls['DateStarted'].value
    endDateTimestamp = formGroup.controls['DateCompleted'].value

    if (StringHelper.isNullOrUndefined(startDateTimestamp) || StringHelper.isNullOrUndefined(endDateTimestamp)) return null;
    if (!CommonHelpers.checkIsValidStartAndEndDates(startDateTimestamp, endDateTimestamp))
        return {
            "dateCompletedlValidator": false
        };
    return expiryDateValidator(formGroup);
    //return null;
}

export const expiryDateValidator = (formGroup: FormGroup): { [key: string]: boolean; } => {
    let startDateTimestamp, endDateTimestamp;

    startDateTimestamp = formGroup.controls['DateCompleted'].value
    endDateTimestamp = formGroup.controls['ExpiryDate'].value

    if (StringHelper.isNullOrUndefined(startDateTimestamp) || StringHelper.isNullOrUndefined(endDateTimestamp)) return null;
    if (!CommonHelpers.checkIsValidStartAndEndDates(startDateTimestamp, endDateTimestamp))
        return {
            "expiryDateValidator": false
        };
    return null;
}

export const startDateValidator = (formGroup: FormGroup): { [key: string]: boolean; } => {
    let startDateTimestamp, endDateTimestamp;

    startDateTimestamp = formGroup.controls['StartDate'].value
    endDateTimestamp = formGroup.controls['PassDate'].value

    if (StringHelper.isNullOrUndefined(startDateTimestamp) || StringHelper.isNullOrUndefined(endDateTimestamp)) return null;
    if (!CommonHelpers.checkIsValidStartAndEndDates(startDateTimestamp, endDateTimestamp))
        return {
            "startDateValidator": false
        };
    return completionDateValidator(formGroup);
}

export const completionDateValidator = (formGroup: FormGroup): { [key: string]: boolean; } => {
    let startDateTimestamp, endDateTimestamp;

    startDateTimestamp = formGroup.controls['PassDate'].value
    endDateTimestamp = formGroup.controls['ExpiryDate'].value

    if (StringHelper.isNullOrUndefined(startDateTimestamp) || StringHelper.isNullOrUndefined(endDateTimestamp)) return null;
    if (!CommonHelpers.checkIsValidStartAndEndDates(startDateTimestamp, endDateTimestamp))
        return {
            "completionDateValidator": false
        };
    return null;
}

export const emailFieldValidator = (control: AbstractControl): { [key: string]: boolean; } => {
    let controlValue: string = control.value;

    if (StringHelper.isNullOrUndefinedOrEmpty(controlValue)) return null;

    var regExp = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    return controlValue.match(regExp) ? null : {
        "validEmail": false
    };
};

export const telephoneNumberFieldValidator = (control: AbstractControl): { [key: string]: boolean; } => {
    let controlValue: string = control.value;

    if (StringHelper.isNullOrUndefinedOrEmpty(controlValue)) return null;

    var regExp = /^(((\+44\s?\d{4}|\(?0\d{4}\)?)\s?\d{3}\s?\d{3})|((\+44\s?\d{3}|\(?0\d{3}\)?)\s?\d{3}\s?\d{4})|((\+44\s?\d{2}|\(?0\d{2}\)?)\s?\d{4}\s?\d{4}))(\s?\#(\d{4}|\d{3}))?$/

    return controlValue.match(regExp) ? null : {
        "validTelephoneNumber": false
    };
};

export const mobileNumberFieldValidator = (control: AbstractControl): { [key: string]: boolean; } => {
    let controlValue: string = control.value;

    if (StringHelper.isNullOrUndefinedOrEmpty(controlValue)) return null;

    var regExp = /^((\(?0\d{4}\)?\s?\d{3}\s?\d{3})|(\(?0\d{3}\)?\s?\d{3}\s?\d{4})|(\(?0\d{2}\)?\s?\d{4}\s?\d{4}))(\s?\#(\d{4}|\d{3}))?$/;

    return controlValue.match(regExp) ? null : {
        "validMobileNumber": false
    };
};



export const userNameFieldValidator = (control: AbstractControl): { [key: string]: boolean; } => {
    let controlValue: string = control.value;

    if (StringHelper.isNullOrUndefinedOrEmpty(controlValue)) return null;

    var regExp = /^^[A-Za-z0-9]+$/;

    return controlValue.match(regExp) ? null : {
        "validUserName": false
    };
};


export const userNameMaxLengthValidator = (control: AbstractControl): { [key: string]: boolean; } => {
    let controlValue: string = control.value;

    if (StringHelper.isNullOrUndefinedOrEmpty(controlValue)) return null;

    var regExp = /^.{6,24}$/;

    return controlValue.match(regExp) ? null : {
        "validUserName": false
    };
};



export const passwordPatternValidator = (control: AbstractControl): { [key: string]: boolean; } => {
    let controlValue: string = control.value;

    if (StringHelper.isNullOrUndefinedOrEmpty(controlValue)) return null;

    var regExp = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[\\!@#\$%({}<\>._\-=\s+|?><,\^&\*~)])(?=.{8,20})/;

    return controlValue.match(regExp) ? null : {
        "validPassword": false
    };
};

export const dateOfBirthValidator = (formGroup: FormGroup): { [key: string]: boolean; } => {
    let startDateTimestamp, endDateTimestamp;

    startDateTimestamp = formGroup.controls['DOB'].value;
    endDateTimestamp = new Date();

    if (StringHelper.isNullOrUndefined(startDateTimestamp)) return null;
    if (!CommonHelpers.checkIsValidStartAndEndDates(startDateTimestamp, endDateTimestamp))
        return {
            "validDOB": false
        };
    return null;
}

export class PasswordValidation {

    static MatchPassword(control: AbstractControl): { [key: string]: boolean; } {
        let password = control.get('Password').value;
        let confirmPassword = control.get('ConfirmPassword').value;
        if (password != confirmPassword) {
            control.get('ConfirmPassword').setErrors({ MatchPassword: true })
            return {
                "validPasswordMatch": false
            };

        } else {

            return null
        }


    }

    static IsEmpEmailRequired(control: AbstractControl): { [key: string]: boolean; } {
        let hasEmail = control.get('HasEmail').value;
        let empEmail = control.get('EmpEmailUser').value;
        if (hasEmail && (empEmail == '' || isNullOrUndefined(empEmail))) {
            control.get('EmpEmailUser').setErrors({ IsEmpEmailRequired: true })
            return {
                "validEmpEmailUser": false
            }
        } else {
            return null
        }
    }

    static IsEmailRequired(control: AbstractControl): { [key: string]: boolean; } {
        let hasEmail = control.get('HasEmail').value;
        let createUser = control.get('CreateUser').value;
        let email= control.get('Email').value;
        if (hasEmail && createUser && (email == '' || isNullOrUndefined(email))) {
            control.get('Email').setErrors({ IsEmailRequired: true })
            return {
                "validEmailCondition": false
            };
        } else {

            return null
        }
    }

     static IsUserNameRequired(control: AbstractControl): { [key: string]: boolean; } {
        let userCreationMode = control.get('UserCreateMode').value;
        let createUser = control.get('CreateUser').value;
        let userName= control.get('UserName').value;
         let hasEmail= control.get('HasEmail').value;
        if (createUser && userCreationMode==1 && !hasEmail && (userName == '' || isNullOrUndefined(userName))) {
            control.get('UserName').setErrors({ IsUserNameRequired: true })
            return {
                "validEmailCondition": false
            };
        } else {

            return null
        }
    }

    static IsPasswordRequired(control: AbstractControl): { [key: string]: boolean; } {
        let userCreationMode = control.get('UserCreateMode').value;
        let createUser = control.get('CreateUser').value;
        let password = control.get('Password').value;
        
        if (userCreationMode == 1 && createUser && (password == '' || isNullOrUndefined(password))) {
            control.get('Password').setErrors({ IsPasswordRequired: true })
            return {
                "validPasswordCondition": false
            };
        } else {


            return null
        }
    }
}

export const hoursPerWeekFieldValidator = (control: AbstractControl): { [key: string]: boolean; } => {
    let controlValue: string = control.value;

    if (StringHelper.isNullOrUndefinedOrEmpty(controlValue)) return null;

    var regExp = /(\d+(\.\d+)?)/;

    if (controlValue.match(regExp)) {
        var inputNum = parseInt(controlValue);
        if (inputNum >= 1 && inputNum <= 168) {
            return null;
        }
        else {
            return {
                "validHoursPerWeek": false
            };
        }
    }
    else {
        return controlValue.match(regExp) ? null : {
            "validHoursPerWeek": false
        }
    }
};

