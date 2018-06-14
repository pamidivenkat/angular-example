import { FormGroup } from '@angular/forms';


export const selectedAnyDistributedTo = (formGroup: FormGroup): { [key: string]: boolean; } => {

    let regardingObjectTypeCode = formGroup.controls['RegardingObjectTypeCode'].value;
    let regardigngObjects = formGroup.controls['RegardingObjects'].value;
    let employees = formGroup.controls['Employee'].value;

    if ((regardingObjectTypeCode == '3' || regardingObjectTypeCode == '4018' || regardingObjectTypeCode == '4') && (!regardigngObjects || regardigngObjects.length <= 0))
        return {
            "selectedAnyDistributedTo": true
        };

    if ((regardingObjectTypeCode == '17') && (!employees || employees.length <= 0))
        return {
            "selectedAnyDistributedTo": true
        };
    return null;
}

