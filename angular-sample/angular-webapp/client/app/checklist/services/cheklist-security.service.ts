import { ChecklistConstants } from '../checklist-constants';
import { Injectable } from '@angular/core';
import { RouteParams } from './../../shared/services/route-params';
import { ClaimsHelperService } from './../../shared/helpers/claims-helper';

@Injectable()
export class ChecklistSecurityService {

    constructor(private _claimsHelper: ClaimsHelperService, private _routeParams: RouteParams) {
    }

    public canView(tabName: string): boolean {
        switch (tabName) {
            case ChecklistConstants.Routes.TodaysChecklist:
            case ChecklistConstants.Routes.Scheduled:
            case ChecklistConstants.Routes.CompleteIncompleteStatus:
                return this._claimsHelper.canActionChecklist();
            case ChecklistConstants.Routes.CompanyChecklists:
            case ChecklistConstants.Routes.Archived:
                return this._claimsHelper.canCreateChecklist() || (this._claimsHelper.HasCid && this._claimsHelper.isHSConsultant());
            case ChecklistConstants.Routes.Examples:
                return this._claimsHelper.canCreateChecklist() || this._claimsHelper.CanCreateExampleChecklist();
            case ChecklistConstants.Routes.ArchivedExample:
                return this._claimsHelper.CanCreateExampleChecklist() && !this._claimsHelper.HasCid;
            default:
                break;
        }

    }
}