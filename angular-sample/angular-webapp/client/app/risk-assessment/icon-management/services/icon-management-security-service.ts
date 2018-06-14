import { ClaimsHelperService } from '../../../shared/helpers/claims-helper';
import { Injectable } from '@angular/core';

@Injectable()
export class IconManagementSecurityService {

    constructor(private _claimsHelperService: ClaimsHelperService) { }

    public canView(): boolean {
        return this._claimsHelperService.hasHSContentAdministratorPermission();
    }
}