import { AeSelectItem } from "../../../atlas-elements/common/models/ae-select-item";
import { FormFieldType } from "../../../shared/models/iform-builder-vm";

export class IncidentFormField {
    Name: string;
    FieldType: FormFieldType;
    LabelText?: string;
    KeyField: boolean;
    Disabled: boolean;
    SelectionType: SelectionType;
    MaxLength?: number;
    Depends: Map<string, DependsUIField>;
    Options: Array<AeSelectItem<any>>;
    OptionType?: OptionType;
    DefaultValue?: any;
    PlaceHolderText?: string;
    AllowFutureDate?: boolean;
}


export class DependsUIField {
    Field: string;
    Properties: Array<Properties>;
    Condition: string;
}

export class Properties {
    Property: string;
    PropertyValue: any;
    Equality: EqualityType;
    Condition: string;
}

export enum SelectionType {
    single = 0,
    multiple = 1
}

export enum EqualityType {
    equal = 0,
    notEqual = 1,
    greater = 2,
    lesser = 3,
    greaterOrEqual = 4,
    lesserOrEqual = 5
}

export enum OptionType {
    number = 0,
    string = 1,
}