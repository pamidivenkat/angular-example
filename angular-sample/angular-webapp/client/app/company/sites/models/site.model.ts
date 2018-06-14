import { Address } from '../../../employee/models/employee.model';
import { Sector } from '../../../shared/models/sector';
import { County } from './../../../shared/models/lookup.models';
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
    IsCQCProPurchased: boolean;
}