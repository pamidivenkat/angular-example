import { FormFieldType } from '../models/iform-builder-vm';
export class FormHelper {
    static getFieldType(fieldtype: number): FormFieldType {
        return <FormFieldType>fieldtype;
    }
}
