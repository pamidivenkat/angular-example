

import { Company } from "../models/company";
import { Site } from "../sites/models/site.model";
import { isNullOrUndefined } from "util";
import { LoadSitesAction } from "../../shared/actions/company.actions";

export function extractCompany(response: any): any {
    let data = response.json();
    let companyDetails: Company
    if (data) {
        companyDetails = new Company();
        companyDetails.CompanyName = isNullOrUndefined(data.Name) ? "None" : data.Name;
        companyDetails.CompanyId = data.Id;
        companyDetails.TradingName = isNullOrUndefined(data.TradingAsName) ? "None" : data.TradingAsName;
        companyDetails.CustomerSince = isNullOrUndefined(data.ContractStartDate) ? "None" : data.ContractStartDate;
        companyDetails.Sector = isNullOrUndefined(data.Sector) ? "None" : data.Sector.Name;
        companyDetails.MainContactNo = isNullOrUndefined(data.Phone) ? "" : data.Phone;
        companyDetails.Website = isNullOrUndefined(data.SiteUrl) ? "None" : data.SiteUrl;
        companyDetails.PictureId = data.PictureId;
        companyDetails.SectorId = isNullOrUndefined(data.Sector) ? "None" : data.Sector.Id;
    }
    return companyDetails;
}

