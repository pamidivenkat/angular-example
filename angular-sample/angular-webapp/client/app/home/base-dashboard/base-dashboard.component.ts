import { ClaimsHelperService } from '../../shared/helpers/claims-helper';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'at-base-dashboard',
  templateUrl: './base-dashboard.component.html',
  styleUrls: ['./base-dashboard.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class BaseDashboardComponent implements OnInit {

  constructor(private _claimsHelper: ClaimsHelperService) { }

  isHRManagerOrServiceOwner(): boolean {
    return this._claimsHelper.isHRManagerOrServiceOwner();
  }

  isHSServiceOwnerOrCoordinator(): boolean {
    return this._claimsHelper.isHSServiceOwnerOrCoordinator();
  }

  isHolidayAuthorizerOrManager(): boolean {
    return this._claimsHelper.isHolidayAuthorizerOrManager();
  }

  ngOnInit() {
  }

}
