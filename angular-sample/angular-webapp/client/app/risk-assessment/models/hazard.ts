import { Sector } from "../../shared/models/sector";
import { HazardCategory } from "../common/hazard-category-enum";

export class Hazard {
    Id: string;
    CompanyId: string;
    Name: string;
    PictureId: string;
    IsShared: boolean;
    Description: string;
    Color: string;
    Graphic: string;
    Shape: string;
    IsExample: boolean;
    Category: HazardCategory;
    HazardSectors: Array<Sector>;
    CreatedBy: string;
    CreatedOn: string;
    ModifiedOn: string;
    ModifiedBy: string;
    Version: string;
}

