import { RouteParams } from '../../../shared/services/route-params';
import { ClaimsHelperService } from '../../../shared/helpers/claims-helper';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { LocaleService, TranslationService } from 'angular-l10n';
import { isNullOrUndefined } from 'util';

import { AeClassStyle } from '../../../atlas-elements/common/ae-class-style.enum';
import * as fromConstants from '../../../shared/app.constants';
import { BaseComponent } from '../../../shared/base-component';
import * as fromRoot from '../../../shared/reducers/index';
import { ReviewPeriod } from '../../common/review-period';
import { RiskAssessmentStatus } from '../../common/risk-assessment-status.enum';
import { RiskAssessment } from '../../models/risk-assessment';

@Component({
  selector: 'risk-assessment-detail',
  templateUrl: './risk-assessment-detail.component.html',
  styleUrls: ['./risk-assessment-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RiskAssessmentDetailComponent extends BaseComponent implements OnInit {
  private _RiskAssessmentVm: RiskAssessment;
  private _lightClass: AeClassStyle = AeClassStyle.Light;

  get lightClass() {
    return this._lightClass;
  }

  @Input()
  set RiskAssessmentVm(value: RiskAssessment) {
    this._RiskAssessmentVm = value;
  }
  get RiskAssessmentVm() {
    return this._RiskAssessmentVm;
  }
 
  // Public Output bindings
  @Output('onCancel') _onCancel: EventEmitter<string> = new EventEmitter<string>();

  // constructor
  constructor(_localeService: LocaleService,
    _translationService: TranslationService,
    _cdRef: ChangeDetectorRef,
    private _router: Router,
    private _params: RouteParams,
    private _claims: ClaimsHelperService,
    private _store: Store<fromRoot.State>) {
    super(_localeService, _translationService, _cdRef);
  }
  // End of constructor

  ngOnInit() {
  }

  public isRATypeGeneral(id): boolean {
    return ((fromConstants.generalRiskAssessmentTypeId === id.toLowerCase())
      || (fromConstants.generalMigratedRiskAssessmentTypeId === id.toLowerCase()))
  }
  public getRATypeName(id): string {
    let raName = '';
    if (!isNullOrUndefined(id)) {
      let riskAssessmentId = id.toLowerCase();
      switch (riskAssessmentId) {
        case fromConstants.generalRiskAssessmentTypeId: {
          raName = this._translationService.translate('ASSESSMENT_TYPE_NAME.GENERAL');
          break;
        }
        case fromConstants.generalMigratedRiskAssessmentTypeId: {
          raName = this._translationService.translate('ASSESSMENT_TYPE_NAME.GENERAL_MIGRATED');
          break;
        }
        case fromConstants.coshhRiskAssessmentTypeId: {
          raName = this._translationService.translate('ASSESSMENT_TYPE_NAME.COSHH');
          break;
        }
        case fromConstants.coshhMigratedRiskAssessmentTypeId: {
          raName = this._translationService.translate('ASSESSMENT_TYPE_NAME.COSHH_MIGRATED');
          break;
        }

      }

    }
    return raName;

  }

  public hasStatus(referenceStatus, currentStatus) {
    return referenceStatus === currentStatus;
  }

  getStatusName(): string {
    return RiskAssessmentStatus[this._RiskAssessmentVm.StatusId];
  }

  onDetailCancel(event) {
    this._onCancel.emit('event');
  }

  onFullView(item: RiskAssessment) {
    let navigationExtras: NavigationExtras = {
      queryParamsHandling: 'merge'
    };
    if (item.StatusId === RiskAssessmentStatus.Pending) {
      this._router.navigate(['/risk-assessment/edit/' + item.Id], navigationExtras);
    } else if (item.IsExample && this._claims.canCreateExampleRiskAssessments() && isNullOrUndefined(this._params.Cid)) {
      this._router.navigate(['/risk-assessment/edit/example/' + item.Id], navigationExtras);
    } else if (item.IsExample) {
      this._router.navigate(['/risk-assessment/example/' + item.Id], navigationExtras);
    } else {
      this._router.navigate(['/risk-assessment/' + item.Id], navigationExtras);
    }
  }
  getReviewPeriod(num) {
    switch (num) {
      case ReviewPeriod.Daily:
        return "Daily";
      case ReviewPeriod.Weekly:
        return "Weekly";
      case ReviewPeriod.Monthly:
        return "Monthly";
      case ReviewPeriod.Annually:
        return "Annually";
      default:
        return "Custom";
    }

  }

}
