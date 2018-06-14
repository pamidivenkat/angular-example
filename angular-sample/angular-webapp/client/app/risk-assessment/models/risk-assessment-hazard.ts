import { HazardCategory } from '../common/hazard-category-enum';
import { RiskAssessmentControl } from './risk-assessment-control';
import { WhoAffected } from './who-affected';

export class RiskAssessmentHazard {
    Id: string;
    CompanyId: string;
    Name: string;
    PictureId: string;
    IsShared: boolean;
    Description: string;
    PeopleAffected: string;
    PrototypeId: string;
    IsSharedPrototype: boolean;
    Likelihood: number;
    Severity: number;
    RiskAssessmentId: string;
    HowManyAffected: string;
    OthersAffected: string;
    HazardCategory: HazardCategory;
    WhoAffecteds: WhoAffected[];
    IsDeleted: boolean;
    Category: number;
    Affected: string;
    IsExample: boolean;
}