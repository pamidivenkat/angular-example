import { isNullOrUndefined } from 'util';
export class Employee {
    Id: string;
    Title: string;
    Salutation: string;
    FullName: string;
    FirstName: string;
    MiddleName: string;
    Surname: string;
    KnownAs: string;
    PreviousName: string;
    Gender: number;
    GenderText: string;
    DOB?: Date;
    EthnicGroup: EmployeeEthinicGroup;
    OtherEthnicity: string;
    Nationality: string;
    Age: string;
    EmployeePayrollDetails: EmployeePayrollDetails;
    UserId: string;
    HasContract: boolean;

    constructor() {
        this.Id = "";
        this.FirstName = "";
        this.MiddleName = "";
        this.Surname = "";
        this.DOB = new Date();
        this.Title = "";
        this.FullName = "";
        this.Salutation = "";
        this.Age = "";
        this.Nationality = "";
        this.OtherEthnicity = "";
        this.EthnicGroup = new EmployeeEthinicGroup();
        this.EmployeePayrollDetails = new EmployeePayrollDetails();
        this.GenderText = "";
        this.Gender = 0;
        this.PreviousName = "";
        this.KnownAs = "";
        this.UserId = "";
        this.HasContract = false;
    }
}

export class EmployeeEthinicGroup {
    Id: string;
    EmployeeId: string;
    CompanyId: string;
    EthnicGroupValueName: string;
    EthnicGroupValueId: string;
    Name: string;
    EthnicGroupValueType: number;
    EthnicGroupTypeId: string;

    constructor() {
        this.Id = "";
        this.EmployeeId = "";
        this.CompanyId = "";
        this.EthnicGroupValueName = "";
        this.EthnicGroupTypeId = "";
        this.EthnicGroupValueId = "";
        this.Name = "";
        this.EthnicGroupValueType = -1;
    }
}

export class EmployeePayrollDetails {
    Id: string;
    CompanyId: string;
    EmployeeId: string;
    TaxCode: string;
    NINumber: string;
    PensionScheme: string;

    constructor() {
        this.Id = "";
        this.CompanyId = "";
        this.EmployeeId = "";
        this.NINumber = "";
        this.TaxCode = "";
        this.PensionScheme = "";
    }
}


export class EmployeeContacts {
    Id: string;
    CompanyId: string;
    PersonalEmail: string;
    Email: string;
    AddressLine1: string;
    AddressLine2: string;
    AddressLine3: string;
    Town: string;
    CountyId: string;
    CountyName: string;
    CountryId: string;
    CountryName: string;
    Postcode: string;
    HomePhone: string;
    MobilePhone: string;
    FullAddress: string;
}

export class Address {
    Id: string;
    CompanyId: string;
    AddressLine1: string;
    AddressLine2: string;
    AddressLine3: string;
    Town: string;
    CountyId: string;
    Postcode: string;
    CountryId: string;
    Longitude: number;
    Latitude: number;
    HomePhone: string;
    MobilePhone: string;
    FullAddress: string;
    Email: string;

    constructor() {
        this.Id = null;
        this.CompanyId = null;
        this.AddressLine1 = null;
        this.AddressLine2 = null;
        this.AddressLine3 = null;
        this.Town = null;
        this.CountyId = null;
        this.Postcode = null;
        this.CountryId = null;
        this.Longitude = null;
        this.Latitude = null;
        this.HomePhone = null;
        this.MobilePhone = null;
        this.FullAddress = null;
        this.Email = null;
    }
}

export class EmployeeEmergencyContacts {
    Id: string;
    Name: string;
    EmployeeRelationId: string;
    AddressLine1: string;
    AddressLine2: string;
    Town: string;
    CountyId: string;
    Postcode: string;
    CountryId: string;
    HomePhone: string;
    MobilePhone: string;
    Notes: string;
    Email: string;
    IsPrimary: boolean;
    EmployeeId: string;
    CompanyId: string;
}
