import { Address } from './../../../employee/models/employee.model';

export class InjuredPerson {
    Address: Address;
    AddressId: string;
    DateOfBirth: Date;
    Gender: number;
    Id: string;
    InjuredPartyId: string;
    IsPregnant: boolean;
    Name: string;
    Occupation: string;
    OtherInjuredParty: string;
    StartDate: Date;
    UserId: string;
    CompanyId: string;

    constructor() {
        this.Id = null;
        this.CompanyId = null;
        this.UserId = null;
        this.AddressId = null;
        this.Occupation = null;
        this.IsPregnant = false;
        this.Name = null;
        this.Address = new Address();
        this.DateOfBirth = null;
        this.StartDate = null;
        this.OtherInjuredParty = null;
        this.UserId = null;
        this.InjuredPartyId = null;
    }
}

export class InjuredParty {
    Id: string;
    Name: string;
}

export class SelectedEmployeeDetails {
    Address: Address;
    DateOfBirth: Date;
    StartDate: Date;
    Occupation: string;
    Gender : number;
    constructor() {
        this.Address = new Address();
        this.StartDate = null;
        this.DateOfBirth = null;
    }
}