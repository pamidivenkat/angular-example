import { Country, County } from "../../shared/models/lookup.models";

export class Address {
    AddressLine1: string;
    AddressLine2: string;
    AddressLine3: string;
    Town: string;
    CountyId?: string;
    Postcode: string;
    CountryId?: string;
    Longitude: number;
    Latitude: number;
    HomePhone: string;
    MobilePhone: string;
    FullAddress: string;
    Email: string;
    CompanyId: string;
    CreatedOn: Date;
    ModifiedOn: Date;
    Id: string;
    CreatedBy: string;
    ModifiedBy: string;
    Country: Country;
    County: County;
}