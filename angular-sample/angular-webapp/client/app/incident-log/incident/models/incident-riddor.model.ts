import { IncidentDetailsVM } from './../../..//incident-log/incident/models/incident-about-incident';

export class IncidentRIDDOR {
    public Id: string;
    public CompanyId: string;
    public LocalAuthorityId: string;
    public IsRIDDORRequired: boolean;
    public RIDDORReportedById: string;
    public RIDDORReportedByName: string;
    public RIDDORReportedMedium: RIDDORReportedMedium;
    public RIDDORReportedDate?: Date;
    public MainIndustryId: string;
    public MainActivityId: string;
    public SubActivityId: string;
    public OtherMainIndustry: string;
    public OtherMainActivity: string;
    public OtherSubActivity: string;
    public CountyId: string;
    public CountryId: string;
    public MainFactorId: string;
    public OtherMainFactor: string;
    public WorkProcessId: string;
    public OtherWorkProcess: string;
    public IsNotificationRequired: boolean;

    constructor() {
        this.Id = '';
        this.LocalAuthorityId = '';
        this.IsRIDDORRequired = false;
        this.RIDDORReportedById = '';
        this.RIDDORReportedMedium = null;
        this.RIDDORReportedDate = null;
        this.MainIndustryId = '';
        this.MainActivityId = '';
        this.SubActivityId = '';
        this.OtherMainIndustry = '';
        this.OtherMainActivity = '';
        this.OtherSubActivity = '';
        this.CountryId = '';
        this.CountyId = '';
        this.RIDDORReportedByName = '';
        this.CompanyId = '';
        this.MainFactorId = '';
        this.WorkProcessId = '';
        this.OtherMainFactor = '';
        this.OtherWorkProcess = '';
        this.IsNotificationRequired = false;
    }
}

export enum RIDDORReportedMedium {
    None = 0,
    Website = 1,
    Telephone = 2,
    Post = 3
}

export class RIDDOROnlineFormVM {
    public Id: string;
    public CompanyId: string;
    public FullAddress: string;
    public DateOfBirth: Date;
    public Email: string;
    public GenderText: string;
    public HomePhone: string;
    public IncidentTypeName: string;
    public InjuredPartsText: string;
    public InjuredPartyName: string;
    public InjuredPersonName: string;
    public InjuredPersonOccupation: string;
    public InjuryDescription: string;
    public InjuryTypesText: string;
    public MainFactorName: string;
    public Occupation: string;
    public ReportedByFirstname: string;
    public ReportedBySurname: string;
    public Telephone: string;
    public WhenHappened: Date;
    public WorkProcessName: string;
    public Age: string;
    public WhereHappened: string;
    public CompanyName: string;
    public AboutIncidentDetails: IncidentDetailsVM;
    public UserId:string;
    public ReportedByJobTitle:string;
    constructor() {
        this.Id = '';
        this.CompanyId = '';
        this.FullAddress = '';
        this.DateOfBirth = null;
        this.Email = '';
        this.GenderText = '';
        this.HomePhone = '';
        this.IncidentTypeName = '';
        this.InjuredPartsText = '';
        this.InjuredPartyName = '';
        this.InjuredPersonName = '';
        this.InjuredPersonOccupation = '';
        this.InjuryDescription = '';
        this.InjuryTypesText = '';
        this.MainFactorName = '';
        this.Occupation = '';
        this.ReportedByFirstname = '';
        this.ReportedBySurname = '';
        this.Telephone = '';
        this.WhenHappened = null;
        this.WorkProcessName = '';
        this.Age = '';
        this.WhereHappened = '';
        this.CompanyName = '';
        this.UserId=null;
        this.ReportedByJobTitle='';
        this.AboutIncidentDetails = new IncidentDetailsVM();
    }
}
