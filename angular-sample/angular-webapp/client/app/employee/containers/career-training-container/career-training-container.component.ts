import { EmployeeConstants } from './../../employee-constants';
import { Observable } from 'rxjs/Rx';
import { ClaimsHelperService } from '../../../shared/helpers/claims-helper';
import { LocaleService, TranslationService } from 'angular-l10n';
import { BaseComponent } from '../../../shared/base-component';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewEncapsulation } from '@angular/core';
import * as fromRoot from '../../../shared/reducers';
import { Store } from '@ngrx/store';

@Component({
  selector: 'career-training-container',
  templateUrl: './career-training-container.component.html',
  styleUrls: ['./career-training-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class CareerTrainingContainerComponent extends BaseComponent implements OnInit {

  private _educationHistoryUrl: string = EmployeeConstants.Routes.EducationHistory;
  private _qualificationHistoryUrl: string = EmployeeConstants.Routes.QualificationHistroy;
  private _trainingHistoryUrl: string = EmployeeConstants.Routes.TrainingHistroy;
  private _salaryHistoryUrl: string = EmployeeConstants.Routes.SalaryHistory;
  private _jobHistoryUrl: string = EmployeeConstants.Routes.JobHistory;
  private _previousEmployementUrl: string = EmployeeConstants.Routes.PreviousEmployment;

  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _cdRef: ChangeDetectorRef
    , private _store: Store<fromRoot.State>
    , private _claimsHelper: ClaimsHelperService) {
    super(_localeService, _translationService, _cdRef);
  }

  getEducationHistoryUrl(): string {
    return this._educationHistoryUrl;
  }
  getQualificationistoryUrl(): string {
    return this._qualificationHistoryUrl;
  }
  getTrainingHistoryUrl(): string {
    return this._trainingHistoryUrl;
  }
  getSalaryHistoryUrl(): string {
    return this._salaryHistoryUrl;
  }
  getJobHistoryUrl(): string {
    return this._jobHistoryUrl;
  }
  getPreviousEmploymentUrl(): string {
    return this._previousEmployementUrl;
  }

  ngOnInit() {
  }

}
