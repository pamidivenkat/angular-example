import { Site } from "../../../shared/models/site.model";
import { IncidentType } from "../../../shared/models/lookup.models";
import { Incident } from "./incident.model";

export class AboutIncident {
    Id: string;
    CompanyId: string;
    IncidentTypeId: string;
    SiteId?: string;
    IncidentDetails: string;
    CreatedBy: string;
    CreatedOn: Date;
    IsDeleted: boolean;
    LCid: number;
    ModifiedBy: string;
    ModifiedOn: Date;
    Version: number;
    Site?: Site;
    IncidentType: IncidentType;
    Incident: Incident;
    Author: any;
    Modifier: any;
}

export class IncidentDetailsVM {
    InjuryTypes: Array<string>;
    InjuredParts: Array<string>;
    HowDidHappen: string;
    InjuryDescription: string;
    WhenHappened: Date;
    WhenReported: Date;
    WhereHappened: string;
    SiteId: string;
    OtherSite: string;
    AddressLine1: string;
    AddressLine2: string;
    Town: string;
    County: any;
    Postcode: string;
    Premises: string;
    IsIncidentCoveredByCCTV: boolean;
    ConditionOfArea: string;
    IsMedicalAssistanceRequired: string;
    MedicalAssistanceDetails: string;
    ActionsTaken: string;
    IsRiskAssessmentUpdated: boolean;
    UpdatedDate: Date;
    DiagnosedDiseaseCategory: string;
    DiagnosedDisease: string;
    WhenAmbulanceAttended: Date;
    WhenPoliceAttended: Date;
    HasWitness: boolean;
    Witnesses: Array<Witness>;
    DrugsFound: boolean;
    Assisted: boolean;
    PoliceCalled: boolean;
    IncidentEvents: string;
    DetailsOfDrugsFound: string;
    PropertyDamaged: string;
    AssistedDetails: string;
    CrimeNumber: string;
}


export class Witness {
    FullName?: string;
    Telephone?: string;
    JobRole?: string;
    constructor(fname?: string, telephone?: string, title?: string) {
        this.FullName = fname;
        this.Telephone = telephone;
        this.JobRole = title;
    }
}