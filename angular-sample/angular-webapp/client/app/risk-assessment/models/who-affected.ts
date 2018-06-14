import { WhoIsAffected } from '../common/who-is-effected-enum';
export class WhoAffected {
    Id: string;
    CompanyId: string;
    Affected: WhoIsAffected;
    RiskAssessmentHazardId: string;
    AffectedText: string;
    IsDeleted: boolean;
}