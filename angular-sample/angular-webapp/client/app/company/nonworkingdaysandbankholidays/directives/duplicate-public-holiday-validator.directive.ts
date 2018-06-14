import { Directive, forwardRef } from '@angular/core';
import { NG_VALIDATORS, FormControl } from '@angular/forms';
import { NonWorkingDaysAndPublicHolidayService } from '../services/nonworkingdaysandbankholiday.service';
import { duplicatePublicHolidayValidator } from '../common/nonworkingdays-validators';

@Directive({
    selector: '[duplicatePublicHoliday][ngModel],[duplicatePublicHoliday][formControlName]',
    providers: [
        {
            provide: NG_VALIDATORS
            , useExisting: forwardRef(() => DuplicatePublicHolidayValidatorDirective)
            , multi: true
        }
    ]
})
export class DuplicatePublicHolidayValidatorDirective {
    validator: Function;
    constructor(private _publicHolidayService: NonWorkingDaysAndPublicHolidayService) {
        this.validator = duplicatePublicHolidayValidator(_publicHolidayService);
    }

    validate(c: FormControl) {
        return this.validator(c);
    }
}
