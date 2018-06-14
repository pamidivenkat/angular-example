import { Option } from "../models/option";

export class InvQuestion {
    Id: string;
    CreatedOn: Date;
    CreatedBy: string;
    InvSectionId: string;
    Question: string;
    AnswerType: AnswerType;
    AttachObjectType: AttachObjectType;
    RelatedObject: RelatedObject;
    RelatedAttribute: string;
    Validations: string;
    Value: string;
    InvAnswerId: string;
    InvAnswerCreatedOn: Date;
    AttachedObjectId: string;
    AttachedObjectTypeCode: string;
    AttachedObjectName: string;
    Sequence: number;
    Options: Array<Option>;
    IsDeleted: boolean;
}



export enum AnswerType {
    RadioButton = 1,
    FreeText = 2,
    DropDown = 3,
    Numeric = 4,
    Date = 5,
    DateTime = 6,
    CheckBox = 7,
    TextArea = 10,
    HyperLink = 11,
    UploadDocument = 12
}

export enum AttachObjectType {
    RiskAssessment = 1,
    ConstructionPhasePlan = 2
}

export enum RelatedObject {
    IncidentReportedBy = 1,
    InjuredPerson = 2,
    AboutInjury = 3,
    IncidentReportedTo = 4,
    User = 5,
    IncidentComment = 6
}