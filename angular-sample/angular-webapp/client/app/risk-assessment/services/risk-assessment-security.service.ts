import { isNullOrUndefined } from 'util';
import { RiskAssessmentConstants } from '../risk-assessment-constants';
import { Injectable } from '@angular/core';
import { RouteParams } from './../../shared/services/route-params';
import { ClaimsHelperService } from './../../shared/helpers/claims-helper';

@Injectable()
export class RiskAssessmentSecurityService {

    constructor(private _claimsHelper: ClaimsHelperService, private _routeParams: RouteParams) {
    }

    public canView(tabName: string): boolean {
        switch (tabName) {
            case RiskAssessmentConstants.Routes.OverDue:
            case RiskAssessmentConstants.Routes.Pending:
            case RiskAssessmentConstants.Routes.Live:
                return !isNullOrUndefined(this._routeParams.Cid) || !this._claimsHelper.canCreateExampleRiskAssessments();
            case RiskAssessmentConstants.Routes.Examples:
            case RiskAssessmentConstants.Routes.Archived:
                return !isNullOrUndefined(this._routeParams.Cid) || this._claimsHelper.canCreateExampleRiskAssessments() || this._claimsHelper.hasRiskAssessments();
            default:
                break;
        }

    }

    public canCreateExampleRiskAssessments(): boolean {
        return this._claimsHelper.canCreateExampleRiskAssessments();
    }
    public canCreateRiskAssessments(): boolean {
        return !isNullOrUndefined(this._routeParams.Cid) || this._claimsHelper.hasRiskAssessments();
    }
}