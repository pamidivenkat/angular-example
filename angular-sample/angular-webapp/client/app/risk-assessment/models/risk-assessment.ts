import { TaskActivity } from '../../task/models/task-activity';
import { Site } from '../../company/sites/models/site.model';
import { Document } from '../../document/models/document';
import { RAProcedures } from './risk-assessments-procedures';
import { WorkspaceTypes } from '../../shared/models/lookup.models';
import { Workspace } from '../../checklist/models/workspace.model';
import { Sector } from '../../shared/models/sector';
import { RAAdditionalControl } from './risk-assessment-additionalcontrols';
import { RiskAssessmentHazard } from './risk-assessment-hazard';
import { RiskAssessmentControl } from './risk-assessment-control';
import { RASubstance } from './risk-assessment-substance';
import { User } from '../../shared/models/user';
import { RiskAssessmentType } from './risk-assessment-type';
import { ReviewPeriod } from '../common/review-period';
import { RiskAssessmentStatus } from '../common/risk-assessment-status.enum';
import { AdditionalControlCategoryText } from "./additional-control-category-text";

export class RiskAssessment {
    Id: string;
    Name: string;
    ReferenceNumber: string;
    Description: string;
    CompanyId: string;
    AssessmentDate: any;
    ReviewDate: Date;
    StatusId: RiskAssessmentStatus;
    ReviewPeriod: ReviewPeriod;
    Likelihood: number;
    Severity: number;
    RiskAssessmentTypeId: string;
    SiteId: string;
    Site: Site;
    SiteLocation: string;
    HasAcknowledgement: boolean;
    IsExample: boolean;
    Comment: string;
    BusinessArea: string;
    IncludeRatingLegend: boolean;
    AssessorId: string;
    Assessor: User;
    Assessor_Name: string;
    Mig_WhoIsAtRisk: string;
    Mig_HowRiskControlled: string;
    ApprovedBy: string;
    ApprovedUser: User;
    IncludeHazardDescription: boolean;
    IncludeControlDescription: boolean;
    ApprovedDate: Date;
    RiskAssessmentType: RiskAssessmentType;
    RAProcedures: RAProcedures;
    RASubstances: RASubstance[];
    RAHazards: RiskAssessmentHazard[];
    RAControls: RiskAssessmentControl[];
    RAAdditionalControls: RAAdditionalControl[];
    RiskAssessmentSectors: Sector[];
    RiskAssessmentWorkspaceTypes: WorkspaceTypes[];
    Documents: Document[];
    SiteName: string;
    IsShared: boolean;
    Matrix: number;
    Measures: TaskActivity[];
    CompanyLogoId: string;
    AdditionalControlCategoryText: AdditionalControlCategoryText[];
    RARoutesOfExposures: RiskAssessmentHazard[];
    RAFurtherControlMeasuresTasks: TaskActivity[];
    ReviewPeriodDesc: string;
}

export enum Matrix {
    '3x3',
    '5x5',
    '9x9'
}