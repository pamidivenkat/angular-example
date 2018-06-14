import { User } from "./../../company/user/models/user.model";
import { Responsiblity, PPECategory, PPECategoryGroup } from './../../shared/models/lookup.models';

import { RiskAssessment } from './../../risk-assessment/models/risk-assessment';
import { PlantAndEquipment } from '../../method-statements/plantandequipment/models/plantandequipment';
export class MethodStatement {
    Id: string;
    Name: string;
    StartDate: Date;
    EndDate: Date;
    ClientName: string;
    ClientAddress: string;
    SiteId: string;
    NewLocationOfWork: string;
    ClientTelephoneNumber: string;
    ClientReference: string;
    ProjectReference: string;
    SiteSupervisor: string;
    SiteSupervisorTelephone: string;
    PrincipalDesigner: string;
    PrincipalContractor: string;
    Description: string;
    IsExample: boolean;
    Prototype: any;
    PrototypeId: string;
    CompanyId: string;
    ApprovedBy: string;
    ApprovedDate: Date;
    Site: any;
    StatusId: MethodStatementStatus;
    ArchievedBy: string;
    ArchievedDate: Date;
    FacilitiesEffectedByWork: string;
    ForeseeAdverseEffects: string;
    MonitoringSystems: string;
    PlantEquipments: PlantAndEquipment[]; //TODO:this shouuld be replaced with plant and equipment model
    MSProcedures: MSProcedure[];
    MSPPE: MSPPE[];
    MSSafetyResponsibilities: MSSafetyRespAssigned[];
    MSRiskAssessmentMap: RiskAssessment[];//TODO this needs to be replaced with RISK Assessment model.....
    MSOtherRiskAssessments: MSOtherRiskAssessments[];
    CompanyLogoId: string;
    Author: User;
    ApprovedUser: User;
    CreatedOn: Date;
    constructor() {
        this.Id = '';
        this.Name = '';
        this.StartDate = null;
        this.EndDate = null;
        this.ClientName = '';
        this.ClientAddress = '';
        this.SiteId = ' ';
        this.NewLocationOfWork = '';
        this.ClientTelephoneNumber = '';
        this.ClientReference = '';
        this.ProjectReference = '';
        this.SiteSupervisor = '';
        this.SiteSupervisorTelephone = '';
        this.PrincipalDesigner = '';
        this.PrincipalContractor = '';
        this.Description = '';
        this.IsExample = false;
        this.Prototype = null;
        this.PrototypeId = '';
        this.CompanyId = '';
        this.ApprovedBy = '';
        this.ApprovedDate = null;
        this.Site = null;
        this.StatusId = null;
        this.ArchievedBy = '';
        this.ArchievedDate = null;
        this.FacilitiesEffectedByWork = '';
        this.ForeseeAdverseEffects = '';
        this.MonitoringSystems = '';
        this.PlantEquipments = []; //TODO:this shouuld be replaced with plant and equipment model
        this.MSProcedures = [];
        this.MSPPE = [];
        this.MSSafetyResponsibilities = [];
        this.MSRiskAssessmentMap = [];//TODO this needs to be replaced with RISK Assessment model.....
        this.MSOtherRiskAssessments = [];
        this.CompanyLogoId = '';
        this.ApprovedUser = null;
        this.Author = null;
        this.CreatedOn = null;
    }
}

export class MSProcedure {
    Id: string;
    Name: string;
    Description: string;
    ProcedureGroupId: string;
    PrototypeId: string;
    CompanyId: string;
    MethodStatementId: string;
    Code: ProcedureCode;
    OrderIndex: number;
    IsDeleted: boolean;
    IsExample: boolean;

    constructor() {
        this.Id = '';
        this.CompanyId = '';
        this.MethodStatementId = '';
        this.Name = '';
        this.Description = '';
        this.PrototypeId = '';
        this.ProcedureGroupId = '';
        this.Code = null;
        this.OrderIndex = null;
        this.IsDeleted = false;
        this.IsExample = false;
    }
}

export class MSPPE {
    Id: string;
    CompanyId: string;
    MethodStatementId: string;
    PPECategoryId: string;
    PPEOtherCategoryValue: string;
    PPECategory: PPECategory;
    LogoUrl: string;
    PPECategoryName: string;

    constructor() {
        this.Id = "";
        this.CompanyId = "";
        this.MethodStatementId = "";
        this.PPECategoryId = "";
        this.PPEOtherCategoryValue = "";
        this.PPECategory = null;
        this.LogoUrl = null;
        this.PPECategoryName = null;
    }
}

export class MSSafetyRespAssigned {
    Id: string;
    CompanyId: string;
    MethodStatementId: string;
    NameOfResponsible: string;
    ResponsiblePersonId: string;
    OtherResponsibilityValue: string;
    Responsibilities: Responsiblity[];
    CombinedName: string;
    SubItemText: string;
    IsDeleted: boolean;
    CreatedBy: string;
    CreatedOn: Date;
    FullName: string;
    ResponsiblePerson: User;
}

export class MSOtherRiskAssessments {
    Id: string;
    CompanyId: string;
    MethodStatementId: string;
    ReferenceNumber: string;
    Name: string;
}

export class MSPPEOther {
    name: string;
    OtherValue: string;
}


export class MethodStatements {
    constructor() {
        this.Id = "";
        this.Name = "";
        this.Description = null;
        this.ClientName = "";
        this.SiteName = "";
        this.StatusId = null;
        this.StartDate = null;
        this.EndDate = null;
        this.SiteId = "";
        this.IsExample = false;
        this.CompanyId = null;
        this.NewLocationOfWork = null;
    }
    Id: string;
    Name: string;
    Description: string;
    ClientName: string;
    SiteName: string;
    StatusId: MethodStatementStatus;
    StartDate: Date;
    EndDate: Date;
    SiteId: string;
    IsExample: boolean;
    CompanyId: string;
    NewLocationOfWork: string;
}

export enum ProcedureCode {
    SequenceOfEvents = 1,
    SafetyProcedures = 2
}

export class MSSupportingDocuments {
    Id: string;
    FileName: string;
    FileNameAndTitle: string;
    IconClass: string;
    CompanyId: string;
    Author: User;
    CreatedOn: Date;
    Size: number;
    PictureUrl: string;
    Title: string;
    Description: string;
}


export class MSRiskAssessment {
    Id: string;
    Name: string;
    ReferenceNumber: string;
    type: string;
    constructor() {
        this.Id = '';
        this.Name = '';
        this.ReferenceNumber = '';
        this.type = '';
    }
}

export class UpdateStatusModel {
    StatusId: number;
    ArchievedBy: string;
    MethodStatementId: string;
    Name: string;
    constructor() {
        this.StatusId = null;
        this.ArchievedBy = '';
        this.MethodStatementId = '';
    }
}

export class MethodStatementStat {
    Count: number;
    StatusId: number;
    constructor(statusId: number, count: number) {
        this.Count = count;
        this.StatusId = statusId;
    }
}

export enum MethodStatementStatus {
    Pending = 0,
    Live = 1,
    Completed = 3,
    Archieved = 4,
    Example = 5
}