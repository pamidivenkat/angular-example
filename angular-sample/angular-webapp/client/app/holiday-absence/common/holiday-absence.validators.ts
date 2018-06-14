import { AbstractControl, FormGroup } from "@angular/forms";
import { StringHelper } from "../../shared/helpers/string-helper";
import { isNullOrUndefined } from "util";
import { CommonHelpers } from './../../shared/helpers/common-helpers';
import { DateTimeHelper } from "../../shared/helpers/datetime-helper";

export const maxDurationValueValidator = (control: AbstractControl): { [key: string]: boolean; } => {
    let durationControl = control.get('Duration');
    let noofunitsControl = control.get('NoOfUnits');

    if (isNullOrUndefined(durationControl) || isNullOrUndefined(noofunitsControl)) {
        return null;
    }

    let durationValue: number = parseFloat(durationControl.value);
    let noofunitsValue: number = parseFloat(noofunitsControl.value);

    return (noofunitsValue <= durationValue) ? null : {
        "validmaxDuration": false
    };
};

export const minValueValidator = (control: AbstractControl): { [key: string]: boolean; } => {
    let controlValue: string = control.value;

    let value: number = parseFloat(controlValue);

    return (value > 0) ? null : {
        "validMinValue": false
    };
};

export const dateRangeValidator = (control: AbstractControl): { [key: string]: boolean; } => {
    let startDateControl = control.get('StartDate');
    let endDateControl = control.get('EndDate');

    if (isNullOrUndefined(startDateControl) ||
        isNullOrUndefined(endDateControl) ||
        isNullOrUndefined(endDateControl.value)) {
        return null;
    }

    return (DateTimeHelper.getDatePart(endDateControl.value) >=
        DateTimeHelper.getDatePart(startDateControl.value)) ? null : {
            "validRange": false
        };
};

export const toggleRequiredValidator = (control: AbstractControl): { [key: string]: boolean; } => {
    let controlValue = control.value;

    return (controlValue === true) ? null : {
        "validToggle": false
    };
};

export const properEndDateValidator = (formGroup: FormGroup): { [key: string]: boolean; } => {
    let startDateTimestamp, endDateTimestamp;
    for (let controlName in formGroup.controls) {
        if (controlName.toLowerCase().indexOf("startdate") !== -1) {
            startDateTimestamp = (formGroup.controls[controlName].value);
        }
        if (controlName.toLowerCase().indexOf("enddate") !== -1) {
            endDateTimestamp = (formGroup.controls[controlName].value);
        }
    }
    if (StringHelper.isNullOrUndefined(startDateTimestamp) && StringHelper.isNullOrUndefined(endDateTimestamp)) return null;

    if (StringHelper.isNullOrUndefined(startDateTimestamp) && !StringHelper.isNullOrUndefined(endDateTimestamp))
        return {
            "orphanedEndDate": false
        };
    if (!CommonHelpers.checkIsValidStartAndEndDates(startDateTimestamp, endDateTimestamp) && !StringHelper.isNullOrUndefined(startDateTimestamp) && !StringHelper.isNullOrUndefined(endDateTimestamp))
        return {
            "endDateLessThanStartDate": false
        };
    return null;
}
