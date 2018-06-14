export class BankDetails {
    Id: string;
    Name: string;
    AccountName: string;
    AccountNumber: string;
    BankCode: string;
    IsSalaryAccount: boolean;
    AddressLine1: string;
    AddressLine2: string;
    Town: string;
    CountyId: string;
    CountryId: string;
    Postcode: string;
    PhoneNumber: string;
    EmployeeId: string;
    CompanyId: string;

    constructor() {
        this.Id = "",
        this.Name = "",
        this.AccountName = "",
        this.AccountNumber = "",
        this.BankCode = "",
        this.IsSalaryAccount = false,
        this.AddressLine1 = "",
        this.AddressLine2 = "",
        this.Town = "",
        this.CountyId = "",
        this.CountryId = "",
        this.EmployeeId = "",
        this.Postcode = "",
        this.PhoneNumber = "",
        this.EmployeeId = "",
        this.CompanyId = ""
    }
}