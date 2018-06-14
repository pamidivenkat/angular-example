import { StringHelper } from "../../../shared/helpers/string-helper";

export function isValidName(fieldValue: string): boolean {
    if (StringHelper.isNullOrUndefinedOrEmpty(fieldValue)) return true;
    var invalidChars = fieldValue.replace(/[0-9!@#\$%\^\&*\)?|\]\(+=._~;\\\/]/g, '*');
    if (invalidChars.indexOf('*') != -1) {
        return false;
    }
    return true;
};


export function isValidEmail(fieldValue: string): boolean {
    if (StringHelper.isNullOrUndefinedOrEmpty(fieldValue)) return true;
    let regExp = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return fieldValue.match(regExp) ? true : false;
}



export function isUserNameHasValidPattern(fieldValue: string): boolean {
    if (StringHelper.isNullOrUndefinedOrEmpty(fieldValue)) return true;
    let regExp = /^([a-zA-Z0-9]+)$/;
    let res1 = fieldValue.match(regExp);
    let res2 = (fieldValue.length >= 6) && (fieldValue.length <= 24);
    return res1 && res2 ? true : false;
}


export function isNiNumberValid(fieldValue: string): boolean {
    if (StringHelper.isNullOrUndefinedOrEmpty(fieldValue)) return true;
    var exp1 = /^[A-CEGHJ-NOPR-TW-Z]{1}[A-CEGHJ-NPR-TW-Z]{1}[0-9]{6}[A-D\s]{1}/i;
    var exp2 = /(^GB)|(^BG)|(^NK)|(^KN)|(^TN)|(^NT)|(^ZZ).+/i;
    return (fieldValue.length >= 9 && fieldValue.replace(/ /g, '') && fieldValue.match(exp1) && !fieldValue.match(exp2)) ? true : false;
}

