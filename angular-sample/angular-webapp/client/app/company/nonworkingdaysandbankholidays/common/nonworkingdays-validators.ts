import { AbstractControl } from '@angular/forms';
import { NonWorkingdaysModel, PublicHoliday } from './../models/nonworkingdays-model';
import { FormGroup, FormArray } from '@angular/forms';
import { isNullOrUndefined } from 'util';
import { DateTimeHelper } from '../../../shared/helpers/datetime-helper';
import { NonWorkingDaysAndPublicHolidayService } from '../services/nonworkingdaysandbankholiday.service';
import { StringHelper } from "../../../shared/helpers/string-helper";


export const duplicateNameValidator = (giveName: string, existingItems: NonWorkingdaysModel[]): boolean => {
    let exists = existingItems && existingItems.filter(obj => obj.Name == giveName);
    if (exists && exists.length > 0)
        return true;
    return false;
}

export const whiteSpaceFieldValidator = (control: AbstractControl): { [key: string]: boolean; } => {
    let value: string = <string>control.value;

    return !StringHelper.isNullOrUndefinedOrEmpty(value) ? null : {
        'hasWhiteSpace': true
    };
};

export const workingDaysCountValidator = (control: AbstractControl): { [key: string]: boolean; } => {
    let workingProfileArray = <FormArray>control;
    let isValid: boolean = false;
    if (!isNullOrUndefined(workingProfileArray)) {
        let selectedGroups = workingProfileArray.controls.filter((group: FormGroup) => {
            return <boolean>group.get('IsWorkingDay').value == true;
        });

        if (!isNullOrUndefined(selectedGroups) &&
            selectedGroups.length > 0) {
            isValid = true;
        }
    }

    return isValid ? null : {
        'validWorkingDaysCount': true
    };
};

export const duplicatePublicHolidayValidator = (publicHolidayService: NonWorkingDaysAndPublicHolidayService) => {
    return (control: AbstractControl) => {
        let publicHolidays = publicHolidayService.getPublicHolidays();
        if (!isNullOrUndefined(publicHolidays)) {
            let holidayDate: Date = <Date>control.value;
            if (!isNullOrUndefined(holidayDate)) {
                holidayDate = DateTimeHelper.getDatePart(holidayDate);
                let filteredDays = publicHolidays.filter((holiday) => {
                    return DateTimeHelper.getDatePart(new Date(holiday.HolidayDate)).getTime() ===
                        holidayDate.getTime() && holiday.IsDeleted == false;
                });
                if (!isNullOrUndefined(filteredDays) &&
                    filteredDays.length > 0) {
                    return {
                        'duplicatePublicHoliday': true
                    };
                }
            }
        }
        return null;
    };
};

export const duplicateProfileNameValidator = (publicHolidayService: NonWorkingDaysAndPublicHolidayService) => {
    return (control: AbstractControl) => {
        let profileName: string = <string>control.value;
        let isExists = publicHolidayService.checkProfileExists(profileName);
        if (isExists) {
            return {
                'duplicateProfileName': true
            };
        }
        return null;
    };
};
