import { Directive, forwardRef } from '@angular/core';
import { NG_VALIDATORS, FormControl } from '@angular/forms';
import { NonWorkingDaysAndPublicHolidayService } from '../services/nonworkingdaysandbankholiday.service';
import { duplicateProfileNameValidator } from '../common/nonworkingdays-validators';

@Directive({
    selector: '[duplicateProfileName][ngModel],[duplicateProfileName][formControlName]',
    providers: [
        {
            provide: NG_VALIDATORS
            , useExisting: forwardRef(() => DuplicateNonWorkingdayProfileDirective)
            , multi: true
        }
    ]
})
export class DuplicateNonWorkingdayProfileDirective {
    validator: Function;
    constructor(private _publicHolidayService: NonWorkingDaysAndPublicHolidayService) {
        this.validator = duplicateProfileNameValidator(_publicHolidayService);
    }

    validate(c: FormControl) {
        return this.validator(c);
    }
}
