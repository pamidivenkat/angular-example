import { Site } from '../../company/sites/models/site.model';
import { Document } from './../../document/models/document';
import { RiskAssessment } from './../../risk-assessment/models/risk-assessment';
import { User } from '../../shared/models/user';
import { RiskAssessmentStatus } from './../../risk-assessment/common/risk-assessment-status.enum';

export class ConstructionPhasePlan {
	Id: string;
	Name: string;
	ReferenceNumber: string;
	StartDate: Date;
	EndDate: Date;
	ReviewDate: Date;
	CompanyId: string;
	Intent: string;
	WhoIsImpacted: string;
	PET: string;
	OwnerId: string;
	Owner: User
	StatusId: RiskAssessmentStatus;
	StatusDesc: string;
	CPPSafetyPrecautions: CPPSafetyPrecautions;
	CPPEvents: CPPEvent[];
	ConstructionPhasePlanRA: RiskAssessment[];
	CPPAdditionalInfo: CPPAdditionalInfo;
	UniqueId: number;
	OtherLocation: string;
	CPPSites: Site[];
	LPS: string;
	MonitoringSystems: string;
	Information: string;
	HSENotifiable: boolean;
	IsDomestic: boolean;
	IsExample: boolean;
	IsPristine: boolean;
	constructor() {
		this.Id = '';
		this.Name = ''
		this.ReferenceNumber = '';
		this.StartDate = null;
		this.EndDate = null;
		this.ReviewDate = null;
		this.CompanyId = '';
		this.Intent = '';
		this.WhoIsImpacted = '';
		this.PET = '';
		this.OwnerId = '';
		this.Owner = null;
		this.StatusId = RiskAssessmentStatus.Pending;
		this.StatusDesc = '';
		this.CPPSafetyPrecautions = null;
		this.CPPEvents = []
		this.ConstructionPhasePlanRA = [];
		this.CPPAdditionalInfo = null;
		this.UniqueId = null;
		this.OtherLocation = '';
		this.CPPSites = [];
		this.LPS = '';
		this.MonitoringSystems = '';
		this.Information = '';
		this.HSENotifiable = null;
		this.IsDomestic = null;
		this.IsExample = false;
	}
}

export class CPPSafetyPrecautions {
	Id: string;
	CompanyId: string;
	EmergencyRespUserId: string;
	FireRespUserId: string;
	FirstAidRespUserId: string;
	AccidentRespUserId: string;
	EmergencyRespUser: User;
	FireRespUser: User;
	FirstAidRespUser: User;
	AccidentRespUser: User;
	IsAsbestos: string;
	PPE: string;
	WelfareFacilities: string;
	SiteSecurity: string;
	Communication: string;
	EmergencyRespOtherUser: string;
	FireRespOtherUser: string;
	FirstAidRespOtherUser: string;
	AccidentRespOtherUser: string;
	constructor() {
		this.Id = '';
		this.CompanyId = '';
		this.EmergencyRespUserId = '';
		this.FireRespUserId = '';
		this.FirstAidRespUserId = '';
		this.AccidentRespUserId = '';
		this.EmergencyRespUser = null;
		this.FireRespUser = null;
		this.FirstAidRespUser = null;
		this.AccidentRespUser = null;
		this.IsAsbestos = '';
		this.PPE = '';
		this.WelfareFacilities = '';
		this.SiteSecurity = '';
		this.Communication = '';
		this.EmergencyRespOtherUser = '';
		this.FireRespOtherUser = '';
		this.FirstAidRespOtherUser = '';
		this.AccidentRespOtherUser = '';
	}
}

export class CPPEvent {
	Id: string;
	CompanyId: string;
	ConstructionPhasePlanId: string;
	StepDetail: string;
	Date: Date;
	Index: number;
	constructor() {
		this.Id = '';
		this.CompanyId = '';
		this.ConstructionPhasePlanId = '';
		this.StepDetail = '';
		this.Date = null;
		this.Index = 0;
	}
}

export class CPPAdditionalInfo {
	Id: string;
	CompanyId: string;
	NumberOfContractors: number;
	PrincipalDesigner: string;
	PrincipalContractor: string;
	Others: string;
	Client: string;
	Contractors: Contractor[];
	Documents: Document[];	
	constructor() {
		this.Id = '';
		this.CompanyId = '';
		this.NumberOfContractors = null;
		this.PrincipalDesigner = '';
		this.PrincipalContractor = '';
		this.Others = '';
		this.Client = '';
		this.Contractors = []
		this.Documents = [];
	}
}

export class Contractor {
	Id: string;
	CompanyId: string;
	Name: string;
	Position: string;
	CPPAdditionalInfoId: string;
	PositionIndex: number;
	IsDeleted: boolean;
	constructor() {
		this.Id = '';
		this.CompanyId = '';
		this.Name = '';
		this.Position = '';
		this.CPPAdditionalInfoId = '';
		this.PositionIndex = 0;
		this.IsDeleted = false;
	}
}
