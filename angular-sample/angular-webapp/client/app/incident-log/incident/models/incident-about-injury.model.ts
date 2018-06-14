import { Incident } from './incident.model';
import {
    IncidentType,
    InjuryType,
    WorkspaceTypes,
    WorkProcess,
    MainFactor,
    IncidentLocation,
    InjuredPart
} from './../../../shared/models/lookup.models';
import { Site } from './../../../company/sites/models/site.model';
import { Address } from './../../../employee/models/employee.model';

export class AboutInjury {
    Id: string;
    CompanyId: string;
    IncidentTypeId: string;
    Incident: Incident;
    IncidentType: IncidentType;
    InjuryTypes: InjuryType[];
    WorkSpaceTypeId: string;
    WorkSpace: WorkspaceTypes;
    SiteId: string;
    Site: Site;
    AddressId: string;
    Address: Address;
    PictureId: string;
    HowDidHappen: string;
    WhenHappened: Date;
    WhereHappened: string;
    WhenReported?: Date;
    WorkProcessId: string;
    WorkProcess: WorkProcess;
    MainFactorId: string;
    MainFactor: MainFactor;
    OtherWorkProcess: string;
    OtherMainFactor: string;
    Latitude: number;
    Longitude: number;
    Geography: any;
    IncidentLocation?: IncidentLocation;
    ActionsTaken: string;
    InjuryDescription: string;
    InjuredParts: InjuredPart[];
    FirstAidAssessor: string;
    PersonIncharge: string;
    StaffPresent: string;
    ActionTakenForMinor?: number;

    Author: any;
    Modifier: any;
    CreatedBy: string;
    CreatedOn: Date;
    IsDeleted: boolean;
    LCid: number;
    ModifiedBy: string;
    ModifiedOn: Date;
    Version: number;

    constructor() {
        this.Id = null;
        this.CompanyId = null;
        this.IncidentTypeId = null;
        this.Incident = null;
        this.IncidentType = null;
        this.InjuryTypes = [];
        this.WorkSpaceTypeId = null;
        this.WorkSpace = null;
        this.SiteId = null;
        this.Site = null;
        this.Id = null;
        this.AddressId = null;
        this.Address = new Address();
        this.PictureId = null;
        this.HowDidHappen = null;
        this.WhenHappened = null;
        this.WhereHappened = null;
        this.WhenReported = null;
        this.WorkProcessId = null;
        this.WorkProcess = null;
        this.MainFactorId = null;
        this.MainFactor = null;
        this.OtherWorkProcess = null;
        this.OtherMainFactor = null;
        this.Latitude = null;
        this.Longitude = null;
        this.Geography = null;
        this.IncidentLocation = null;
        this.ActionsTaken = null;
        this.InjuryDescription = null;
        this.InjuredParts = [];
        this.FirstAidAssessor = null;
        this.PersonIncharge = null;
        this.StaffPresent = null;
        this.ActionTakenForMinor = null;

        this.Author = null;
        this.Modifier = null;
        this.CreatedBy = null;
        this.CreatedOn = null;
        this.IsDeleted = false;
        this.LCid = 0;
        this.ModifiedBy = null;
        this.ModifiedOn = null;
        this.Version = null;
    }
}
