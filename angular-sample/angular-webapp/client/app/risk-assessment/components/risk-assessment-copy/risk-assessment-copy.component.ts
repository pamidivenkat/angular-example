import { UserService } from '../../../shared/services/user-services';
import { RouteParams } from '../../../shared/services/route-params';
import { CompanySiteView } from "../../../root-module/models/company-site-view";
import { BaseComponent } from '../../../shared/base-component';
import { Site } from '../../../shared/models/site.model';
import { FormBuilderService } from '../../../shared/services/form-builder.service';
import { RiskAssessment } from '../../models/risk-assessment';
import { RiskAssessmentCopyForm, CopyRAFieldWrapper, RiskAssessmentCopyFormValidations } from '../../models/risk-assessment-copy-form';
import * as Immutable from 'immutable';
import { LocaleService, TranslationService } from 'angular-l10n';
import { Store } from "@ngrx/store";
import * as fromRoot from '../../../shared/reducers';
import { UserLoadAction } from "../../../shared/actions/lookup.actions";
import { ClaimsHelperService } from '../../../shared/helpers/claims-helper';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import { FormGroup } from '@angular/forms/forms';
import { AeSelectItem } from "../../../atlas-elements/common/models/ae-select-item";
import { IFormBuilderVM } from "../../../shared/models/iform-builder-vm";
import { BehaviorSubject, Observable } from 'rxjs/Rx';
import { isNullOrUndefined } from 'util';
import { RiskAssessmentStatus } from "../../common/risk-assessment-status.enum";
import { LoadCompanyStructureAction } from "../../../root-module/actions/company-structure.actions";
import { createSelectOptionFromArrayList } from '../../../employee/common/extract-helpers';
import { ReviewPeriod } from "../../common/review-period";
import { RiskAssessmentService } from "../../services/risk-assessment-service";
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs/Rx';


@Component({
  selector: 'risk-assessment-copy',
  templateUrl: './risk-assessment-copy.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RiskAssessmentCopyComponent extends BaseComponent implements OnInit, OnDestroy {
  private _currentRiskAssessment: RiskAssessment;
  private _riskAssessmentCopyForm: FormGroup;
  private _riskAssessmentCopyFormVM: IFormBuilderVM;
  private _isFormSubmitted: boolean = false;
  private _formName: string;
  private _fields: Array<CopyRAFieldWrapper<any>>;
  private _siteOptions$: BehaviorSubject<Immutable.List<AeSelectItem<string>>>;
  private _companyOptions$: BehaviorSubject<Immutable.List<AeSelectItem<string>>>;
  private _assessorOptions$: BehaviorSubject<Array<any>>;
  private _siteVisibility: BehaviorSubject<boolean>;
  private _siteLocationVisibility: BehaviorSubject<boolean>;
  private _assessmentDateVisibility: BehaviorSubject<boolean>;
  private _companyVisibility: BehaviorSubject<boolean>;
  private _assessorVisibility: BehaviorSubject<boolean>;
  private _isExampleRA: boolean = false;
  private _showLiveCopyButton: boolean = false;
  private _showCompanyDropDown: boolean = false;
  private _isAdminView: boolean = false;
  private _isCopyToSameCompany: boolean = true;
  private _isSingleCompany: boolean = false;
  private _allSites: CompanySiteView[];
  private _currentCompanyId: string;
  private _selectedCompanyId: string;
  private _activatedRoutesSubscription$: Subscription;

  @Input('currentRiskAssessment')
  set currentRiskAssessment(val: RiskAssessment) {
    this._currentRiskAssessment = val;
  }
  get currentRiskAssessment(): RiskAssessment {
    return this._currentRiskAssessment;
  }
 

  get riskAssessmentCopyFormVM(): IFormBuilderVM {
    return this._riskAssessmentCopyFormVM;
  }

  @Output('slideOutClose')
  private _slideOutClose: EventEmitter<boolean> = new EventEmitter<boolean>();

  @Output('copyRiskAssessment')
  private _copyRiskAssessment: EventEmitter<any> = new EventEmitter<any>();

  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _cdRef: ChangeDetectorRef
    , private _store: Store<fromRoot.State>
    , private _claimsHelper: ClaimsHelperService
    , private _riskAssessmentService: RiskAssessmentService
    , private _routeParams: RouteParams
    , private _userService: UserService
    , private _activatedRoute: ActivatedRoute
    , private _fb: FormBuilderService) {
    super(_localeService, _translationService, _cdRef)
  }

  ngOnInit() {
    this._currentCompanyId = this._routeParams.Cid || this._claimsHelper.getCompanyId();
    this._showCompanyDropDown = this._claimsHelper.canCopyRiskAssessmentToCompany();
    this._isAdminView = this._claimsHelper.canCopyRiskAssesmentAsAdmin();
    this._isExampleRA = this._currentRiskAssessment.IsExample;
    if (this._currentRiskAssessment.StatusId == RiskAssessmentStatus.Live) {
      this._showLiveCopyButton = this._isExampleRA ? false : true;
    }
    this._formName = 'copyRiskAssessmentForm';
    this._riskAssessmentCopyFormVM = new RiskAssessmentCopyForm(this._formName, this._isExampleRA, this._riskAssessmentService, this._cdRef);
    this._fields = this._riskAssessmentCopyFormVM.init();
    this._getVisibility();
    this._bindDropdownData();
  }

  ngOnDestroy() {
    if (!isNullOrUndefined(this._activatedRoutesSubscription$)) {
      this._activatedRoutesSubscription$.unsubscribe();
    }
    super.ngOnDestroy();
  }

  private _getVisibility() {
    let siteField = this._fields.find(f => f.field.name === 'SiteId');
    if (!isNullOrUndefined(siteField)) {
      this._siteVisibility = <BehaviorSubject<boolean>>siteField.context.getContextData().get('propertyValue');
    }

    let siteLocationField = this._fields.find(f => f.field.name === 'SiteLocation');
    if (!isNullOrUndefined(siteLocationField)) {
      this._siteLocationVisibility = <BehaviorSubject<boolean>>siteLocationField.context.getContextData().get('propertyValue');
    }

    let assessorField = this._fields.find(f => f.field.name === 'AssessorId');
    if (!isNullOrUndefined(assessorField)) {
      this._assessorVisibility = <BehaviorSubject<boolean>>assessorField.context.getContextData().get('propertyValue');
    }

    let companyField = this._fields.find(f => f.field.name === 'CompanyId');
    if (!isNullOrUndefined(companyField)) {
      this._companyVisibility = <BehaviorSubject<boolean>>companyField.context.getContextData().get('propertyValue');
    }

    let assessmentDateField = this._fields.find(f => f.field.name === 'AssessmentDate');
    if (!isNullOrUndefined(assessmentDateField)) {
      this._assessmentDateVisibility = <BehaviorSubject<boolean>>assessmentDateField.context.getContextData().get('propertyValue');
    }
  }

  private _bindDropdownData() {
    if (!this._isAdminView) {
      let assessorField = this._fields.find(f => f.field.name === 'AssessorId');
      if (!isNullOrUndefined(assessorField)) {
        this._assessorOptions$ = assessorField.context.getContextData().get('items');
        <EventEmitter<any>>assessorField.context.getContextData().get('searchEvent').subscribe((user) => {
          this._userService.getFilteredUserDataWithCid(user.query, this._selectedCompanyId).first().subscribe((data) => {
            (<BehaviorSubject<AeSelectItem<string>[]>>assessorField.context.getContextData().get('items')).next(data);
          });
        });
      }

      let siteField = this._fields.find(f => f.field.name === 'SiteId');
      if (!isNullOrUndefined(siteField)) {
        this._siteOptions$ = siteField.context.getContextData().get('options');
        this._store.let(fromRoot.getSiteStructureData).takeUntil(this._destructor$).subscribe((sites) => {
          if (!isNullOrUndefined(sites)) {
            this._allSites = sites.sort((a, b) => a.Name.localeCompare(b.Name));
            let sitesList = createSelectOptionFromArrayList(sites, "Id", "Name");
            sitesList.push(new AeSelectItem<string>('Select New Affected Site Location', '0'));
            this._siteOptions$.next(Immutable.List<AeSelectItem<string>>(sitesList));
          } else {
            this._store.dispatch(new LoadCompanyStructureAction(true));
          }
        });
      }
    }

    if (this._showCompanyDropDown) {
      let companyField = this._fields.find(f => f.field.name === 'CompanyId');
      if (!isNullOrUndefined(companyField)) {
        this._companyOptions$ = companyField.context.getContextData().get('options');
        this._store.let(fromRoot.getCompanyStructureData).takeUntil(this._destructor$).subscribe((companies) => {
          if (!isNullOrUndefined(companies)) {
            let allCompanies = companies.sort((a, b) => a.Name.localeCompare(b.Name));
            this._isSingleCompany = allCompanies.length < 2 ? true : false;
            let companiesList = createSelectOptionFromArrayList(allCompanies, "Id", "Name");
            this._companyOptions$.next(Immutable.List<AeSelectItem<string>>(companiesList));
          } else {
            this._store.dispatch(new LoadCompanyStructureAction(true));
          }
        });
      }
    }
  }

  private _calculateReviewDate(_assessmentDate: Date) {
    let dateFormValue = _assessmentDate;
    if (!dateFormValue) return;
    let assessmentDate = new Date(dateFormValue);
    let reviewPeriod: ReviewPeriod = <ReviewPeriod>(this._currentRiskAssessment.ReviewPeriod ? Number(this._currentRiskAssessment.ReviewPeriod) : ReviewPeriod.Annually);
    let reviewDate: Date;
    switch (reviewPeriod) {
      case ReviewPeriod.Daily:
        reviewDate = this._addDaysToDate(assessmentDate, 1);
        break;
      case ReviewPeriod.Weekly:
        reviewDate = this._addDaysToDate(assessmentDate, 7);
        break;
      case ReviewPeriod.Monthly:
        reviewDate = this._addDaysToDate(assessmentDate, 30);
        break;
      case ReviewPeriod.Annually:
        reviewDate = this._addDaysToDate(assessmentDate, 365);
        break;
    }
    return reviewDate;
  }

  private _addDaysToDate(date: Date, days: number) {
    date.setDate(date.getDate() + days);
    return date;
  }

  private _getCompanySites(_siteId) {
    if (!isNullOrUndefined(this._allSites)) {
      let selectedCompanySites = this._allSites.filter(obj => obj.ParentId.toLocaleLowerCase() === _siteId.toLowerCase());
      let sitesList = createSelectOptionFromArrayList(selectedCompanySites, "Id", "Name");
      sitesList.push(new AeSelectItem<string>('Select New Affected Site Location', '0'));
      this._siteOptions$.next(Immutable.List<AeSelectItem<string>>(sitesList));
    } else {
      this._siteOptions$ && this._siteOptions$.next(Immutable.List<AeSelectItem<string>>([]));
    }
  }

  formButtonNames() {
    return { Submit: 'Copy' };
  }
  onFormInit(fg: FormGroup) {
    this._riskAssessmentCopyForm = fg;
    this._riskAssessmentCopyForm.get('Name').setValue(this._currentRiskAssessment.Name);
    this._riskAssessmentCopyForm.get('SiteId').setValue(this._currentRiskAssessment.SiteId);

    if (this._isExampleRA || this._showLiveCopyButton) {
      this._assessmentDateVisibility.next(false);
    } else {
      this._assessmentDateVisibility.next(true);
      this._riskAssessmentCopyForm.get('AssessmentDate').setValue(new Date());
    }

    if (this._showCompanyDropDown) {
      this._companyVisibility.next(true);
      this._riskAssessmentCopyForm.get('CompanyId').setValue(this._currentCompanyId.toLowerCase());
      this._getCompanySites(this._currentCompanyId);

    } else {
      this._companyVisibility.next(false);
    }

    if (this._isAdminView) {
      this._siteVisibility.next(false);
      this._assessorVisibility.next(false);
    } else {
      this._siteVisibility.next(true);
      this._assessorVisibility.next(true);
    }

    this._siteLocationVisibility.next(false);
    if (!isNullOrUndefined(this._riskAssessmentCopyForm.get('SiteId'))) {
      this._riskAssessmentCopyForm.get('SiteId').valueChanges.subscribe((newVal) => {
        if (newVal === '0') {
          this._siteLocationVisibility.next(true);
        }
        else {
          this._siteLocationVisibility.next(false);
        }
      });
    }

    if (!isNullOrUndefined(this._riskAssessmentCopyForm.get('CompanyId'))) {
      this._riskAssessmentCopyForm.get('CompanyId').valueChanges.subscribe((newVal) => {
        if (newVal) {
          this._isCopyToSameCompany = (newVal == this._currentCompanyId) ? true : false;
          this._getCompanySites(newVal);
          this._selectedCompanyId = newVal;
        }
      });
    }

    if (!isNullOrUndefined(this._riskAssessmentCopyForm.get('ReferenceNumber'))) {
      this._riskAssessmentCopyForm.get('ReferenceNumber').valueChanges.subscribe((newVal) => {
        if (newVal) {
          this._riskAssessmentService.checkIsExistingReferenceNumber(newVal);
        }
      });
    }
  }

  onCopyFormSubmit() {
    this._isFormSubmitted = true;
    if (this._riskAssessmentCopyForm.valid) {
      let copiedRiskAssessment = this._riskAssessmentCopyForm.value;
      copiedRiskAssessment.Id = this._currentRiskAssessment.Id;
      copiedRiskAssessment.ReferenceNumber = copiedRiskAssessment.ReferenceNumber ? copiedRiskAssessment.ReferenceNumber : null;
      copiedRiskAssessment.IsExample = this._isAdminView;
      copiedRiskAssessment.Assessor = this._currentRiskAssessment.Assessor;
      copiedRiskAssessment.ReviewPeriod = this._currentRiskAssessment.ReviewPeriod;
      if (!this._isAdminView) {
        if (copiedRiskAssessment.SiteId == 0) {
          copiedRiskAssessment.Site = {};
        } else {
          copiedRiskAssessment.Site = {
            Id: copiedRiskAssessment.SiteId
          };
          copiedRiskAssessment.SiteLocation = null;
        }
      }
      let reviewDate = this._calculateReviewDate(copiedRiskAssessment.AssessmentDate);
      copiedRiskAssessment.ReviewDate = reviewDate;
      if (!isNullOrUndefined(this._riskAssessmentCopyForm.get('AssessorId'))) {
        copiedRiskAssessment.AssessorId = this._riskAssessmentCopyForm.get('AssessorId').value[0];
      }
      if (!isNullOrUndefined(this._riskAssessmentCopyForm.get('CompanyId'))) {
        copiedRiskAssessment.CompanyId = this._riskAssessmentCopyForm.get('CompanyId').value || this._currentCompanyId;
      } else {
        copiedRiskAssessment.CompanyId = this._currentCompanyId;
      }
      copiedRiskAssessment.example = this._isExampleRA;
      copiedRiskAssessment.copyToDifferentCompany = (this._isCopyToSameCompany || this._isSingleCompany) ? false : true;
      this._copyRiskAssessment.emit(copiedRiskAssessment);
    }
  }

  onCopyFormCancel(e) {
    this._slideOutClose.emit(false);
  }

}
