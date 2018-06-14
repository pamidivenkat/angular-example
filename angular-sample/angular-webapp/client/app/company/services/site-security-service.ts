import { ClaimsHelperService } from '../../shared/helpers/claims-helper';

import { Injectable } from "@angular/core";

@Injectable()
export class ManageSiteSecurityService {

    constructor(private _claimsHelper: ClaimsHelperService) {
    }

    CanManageCompany(): boolean {
        return this._claimsHelper.canManageCompany();
    }
}