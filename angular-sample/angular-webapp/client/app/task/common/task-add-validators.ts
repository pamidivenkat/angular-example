import { StringHelper } from '../../shared/helpers/string-helper';
import { AbstractControl, FormControl } from '@angular/forms';
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

    var invalidChars = controlValue.replace(/[0-9!@#\$%\^\&*\)?|\]\(+=._~]/g, '*');
    if (invalidChars.indexOf('*') != -1) {
        return {
            "validName": false
        };
    }
    return null;
};