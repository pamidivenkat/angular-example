import { Address } from './../../employee/models/employee.model';
import { Sector } from './sector';
import { County } from './lookup.models';

export class Site {
    Id: string;
    Name: string;
    LogoId: string;
    Logo: string;
    Sector: Sector;
    CompanyId: string;
    Address: Address;
    IsHeadOffice: boolean;
    SiteNameAndPostcode: string;
    County: County;
    IsActive: boolean;
    ParentId: string;
    IsCQCProPurchased: boolean;
    constructor(id: string,
        name: string,
        logoId: string,
        logo: string,
        sector: Sector,
        companyId: string,
        address: Address,
        isHeadOffice: boolean,
        siteNameAndPostcode: string,
        county: County,
        isActive: boolean,
        parentId: string,
        isCQCProPurchased: boolean) {
        this.Id = id;
        this.Name = name;
        this.LogoId = logoId;
        this.Logo = logo;
        this.Sector = sector;
        this.CompanyId = companyId;
        this.Address = address;
        this.IsHeadOffice = isHeadOffice;
        this.SiteNameAndPostcode = siteNameAndPostcode;
        this.County = county;
        this.IsActive = isActive;
        this.ParentId = parentId;
        this.IsCQCProPurchased = isCQCProPurchased;
    }
}