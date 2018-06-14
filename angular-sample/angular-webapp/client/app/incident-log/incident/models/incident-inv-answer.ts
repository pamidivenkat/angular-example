
import { Incident } from "../models/incident.model";
export class InvAnswer {
    Id: string;
    CreatedOn: Date;
    ModifiedOn: Date;
    CreatedBy: string;
    CompanyId: string;
    IncidentId: string;
    InvSectionId: string;
    InvQuestionId: string;
    Value: string;
    AttachedObjectId?: string;
    AttachedObjectTypeCode: string;
    AttachedObjectName: string;
    OriginalObjectName: string;
    Incident:Incident;
}