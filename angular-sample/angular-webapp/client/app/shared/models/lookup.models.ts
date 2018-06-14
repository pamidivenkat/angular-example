import { UserPermission } from "../../company/user/models/user-permissions-view-vm";

export class County {
    Id: string;
    Name: string;
}

export class Country {
    Id: string;
    Name: string;
}

export class UserList {
    Id: string;
    FirstName: string;
    LastName: string;
}

export class EmployeeRelations {
    Id: string;
    Name: string;
}

export class EthnicGroup {
    Id: string;
    Name: string;
    EthnicGroupTypeId: string;
    EthnicGroupValueType: number;
    SequenceId: number;
    EthnicGroupTypeSequenceId: number;
    EthnicGroupTypeName: string;
}

export class AbsenceStatus {
    Id: string;
    Name: string;
    Code: AbsenceStatusCode;
    IsRequestedStatus: boolean;

    constructor() {
        this.Id = '';
        this.Name = '';
        this.Code = null;
        this.IsRequestedStatus = false;
    }
}

export enum AbsenceStatusCode {
    Requested = 1,
    Resubmitted = 2,
    Escalated = 3,
    Approved = 4,
    Declined = 5,
    Cancelled = 6,
    Requestforchange = 7,
    Requestforcancellation = 8
}

export class IncidentCategory {
    Id: string;
    Name: string;
    Code: number;
    Fields: string;
    constructor() {
        this.Id = '';
        this.Name = '';
        this.Code = null;
        this.Fields = null;
    }
}
export class UserProfile {
    Id: string;
    Name: string;
    IsExample: boolean;
    IsForGroupCompany: boolean;
    IsForGroupFranchiseCompany: boolean;
    WillUpdateExistingUsers: boolean;
    Permissions: Array<UserPermission>;

    constructor() {
        this.Id = '';
        this.Name = '';
        this.IsExample = false;
        this.IsForGroupCompany = false;
        this.IsForGroupFranchiseCompany = false;
        this.WillUpdateExistingUsers = false;
        this.Permissions = [];
    }
}

export class AbsenceCode {
    public Id: string;
    public Name: string;
    public Code: number;
}

export class WorkspaceTypes {
    Id: string;
    Name: string;
    PictureId: string;
    isSelected: boolean;
}

export class AdditionalService {
    public Id: string;
    public Title: string;
    public Code: number;
    public OrderNumber: number;
}

export class MainActivity {
    public Name: string;
    public Id: string;
    public MainIndustryId: string;

    constructor() {
        this.Name = '';
        this.Id = '';
        this.MainIndustryId = '';
    }
}

export class SubActivity {
    public Name: string;
    public Id: string;
    public MainActivityId: string;

    constructor() {
        this.Name = '';
        this.Id = '';
        this.MainActivityId = '';
    }
}

export class GeoLocation {
    public Name: string;
    public Id: string;
    public CountryId: string;

    constructor() {
        this.Name = '';
        this.Id = '';
        this.CountryId = '';
    }
}

export class LocalAuthority {
    public Name: string;
    public Id: string;
    public GeoRegionId: string;

    constructor() {
        this.Name = '';
        this.Id = '';
        this.GeoRegionId = '';
    }
}

export enum OperationModes {
    Add = 1,
    Update = 2
}

export enum Gender {
    Male = 1,
    Female = 2
}

export class Responsiblity {
    Id: string;
    Name: string;
    Description: string;
    Code: number;
    OrderIndex: number
}

export class PPECategory {
    public Id: string;
    public Name: string;
    public Description: string;
    public Code: number;
    public OrderIndex: number;
    public LogoId: string;
    public PPECategoryGroupId: string;
    public PPECategoryGroup: PPECategoryGroup;
}

export class PPECategoryGroup {
    public Id: string;
    public Name: string;
    public Description: string;
    public Code: number;
    public OrderIndex: number;
    public LogoId: string;
    public PPECategories: PPECategory[]
}

export class IncidentType {
    public Id: string;
    public Name: string;
    public ShouldRIDDOR: boolean;
    public IncidentCategoryId: string;
    public IncidentCategory: IncidentCategory;
}

export class InjuryType {
    Id: string;
    Name: string;
    NeedRIDDOR: boolean;
}

export class InjuredPart {
    Id: string;
    Name: string;
}

export class WorkProcess {
    Id: string;
    Name: string;
}

export class MainFactor {
    Id: string;
    Name: string;
}

export enum IncidentLocation {
    ElsewhereInYourOrganization = 1,
    AtSomeOneElsePremises = 2,
    InPublicPlace = 3
}
