export class EmployeeGroupAssociation {
    EmployeeGroupName: string;
    EmployeeGroupId: string;
    SiteId: string;
    AssociatedEmployees: AssociatedEmployees[];
    ReloadData: boolean;
    ContractId: string;
}

export class AssociatedEmployees {
    Id: string;
    FirstName: string;
    MiddleName: string;
    Surname: string;
    Job: any;
    IsDeleted: boolean;
    FullName: string;
}

export class EmployeeSearchData {
    Id: string;
    FullName: string;
    SiteName: string;
    SiteId: string;
}