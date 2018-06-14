import { isNullOrUndefined } from 'util';
import { ActivatedRoute } from '@angular/router';
import { EmployeeJobLoadAction } from './../../../actions/employee.actions';
import { EmployeeJobUpdateAction } from '../../../actions/employee.actions';
import { EmployeeSecurityService } from './../../../services/employee-security-service';
import {
  Component
  , OnInit
  , OnDestroy
  , ChangeDetectionStrategy
  , ViewEncapsulation
  , ChangeDetectorRef
  , Input
  , EventEmitter
  , Output
} from '@angular/core';
import { BaseComponent } from '../../../../shared/base-component';
import { Observable, Subscription, BehaviorSubject } from 'rxjs/Rx';
import { EmployeeJobDetails } from '../../models/job-details.model';
import { LocaleService, TranslationService } from 'angular-l10n';
import { Store } from '@ngrx/store';
import { ClaimsHelperService } from '../../../../shared/helpers/claims-helper';
import * as fromRoot from '../../../../shared/reducers';
import { AeClassStyle } from '../../../../atlas-elements/common/ae-class-style.enum';
import { Department } from './../../../../calendar/model/calendar-models';
import { Site } from '../../../../shared/models/site.model'
import * as Immutable from 'immutable';
import { AeSelectItem } from './../../../../atlas-elements/common/models/ae-select-item';
import { EmployeeHolidayWorkingProfile, HolidayUnitType } from './../../../../holiday-absence/models/holiday-absence.model';

import { ObjectHelper } from './../../../../shared/helpers/object-helper';
import { MessengerService } from './../../../../shared/services/messenger.service';
import { calculateYearsAndMonthsFromToday } from './../../../../employee/common/extract-helpers';
import { EmployeeSettings } from './../../../../shared/models/company.models';

@Component({
  selector: 'job-details',
  templateUrl: './job-details.component.html',
  styleUrls: ['./job-details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class JobDetailsComponent extends BaseComponent implements OnInit, OnDestroy {
  // Private Fields
  private _employeeJobDetails$: Observable<EmployeeJobDetails>;
  private _noneText: string;
  private _noText: string;
  private _yesText: string;
  private _btnStyle: AeClassStyle = AeClassStyle.Light;
  private _showEmpJobDetailsUpdateForm: boolean = false;
  private _siteData$: Observable<Site[]>;
  private _departmentData$: Observable<Department[]>;
  private _employmentTypeData$: Observable<Immutable.List<AeSelectItem<string>>>;
  private _jobTitlesData$: Observable<AeSelectItem<string>[]>;
  private _snackbarObjectType: string;
  private _snackbarMessageTitle: string;
  private _updateJobDetailsCompleteSubscription: Subscription;
  private _employeeSettings$: Observable<EmployeeSettings>;
  private _employeeId: string;
  private _canUpdate$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private _canExpandSlideout: boolean = false;
  private _translationChnageSub: Subscription;
  private _employeeStateSub: Subscription;
  private _employeeJobDetails: EmployeeJobDetails;
  private _holidayEntitlement: number;
  // End of private Fields

  //Public Properties 
  @Input('employeeId')
  get EmployeeId(): string {
    return this._employeeId;
  }
  set EmployeeId(value: string) {
    this._employeeId = value;
  }

  get EmployeeJobDetails$(): Observable<EmployeeJobDetails> {
    return this._employeeJobDetails$;
  }
  set EmployeeJobDetails$(value: Observable<EmployeeJobDetails>) {
    this._employeeJobDetails$ = value;
  }
  get noneText(): string {
    return this._noneText;
  }
  get Sites$(): Observable<Site[]> {
    return this._siteData$;
  }
  set Sites$(value: Observable<Site[]>) {
    this._siteData$ = value;
  }
  get yesText(): string {
    return this._yesText;
  }
  get Departments$(): Observable<Department[]> {
    return this._departmentData$;
  }
  set Departments$(value: Observable<Department[]>) {
    this._departmentData$ = value;
  }
  get EmploymentTypes$(): Observable<Immutable.List<AeSelectItem<string>>> {
    return this._employmentTypeData$;
  }
  set EmploymentTypes$(value: Observable<Immutable.List<AeSelectItem<string>>>) {
    this._employmentTypeData$ = value;
  }
  get JobTitles$(): Observable<AeSelectItem<string>[]> {
    return this._jobTitlesData$;
  }
  set JobTitles$(value: Observable<AeSelectItem<string>[]>) {
    this._jobTitlesData$ = value;
  }
  get EmployeeSettings$(): Observable<EmployeeSettings> {
    return this._employeeSettings$;
  }
  set EmployeeSettings$(value: Observable<EmployeeSettings>) {
    this._employeeSettings$ = value;
  }
  get canUpdate$(): BehaviorSubject<boolean> {
    return this._canUpdate$;
  }
  get btnStyle(): AeClassStyle {
    return this._btnStyle;
  }
  get showEmpJobDetailsUpdateForm(): boolean {
    return this._showEmpJobDetailsUpdateForm;
  }
  get noText(): string {
    return this._noText;
  }
  get canExpandSlideout(): boolean {
    return this._canExpandSlideout;
  }
  get holidayEntitlement(): number {
    return this._holidayEntitlement;
  }
  //End of Public properties

  //constructor start
  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _cdRef: ChangeDetectorRef
    , private _store: Store<fromRoot.State>
    , private _messenger: MessengerService
    , private _claimsHelper: ClaimsHelperService
    , private _employeeSecurityService: EmployeeSecurityService
    , private _activatedRoute: ActivatedRoute
  ) {
    super(_localeService, _translationService, _cdRef);
  }
  //end of constructor

  //public method start
  ngOnInit() {
    this._canUpdateJob();
    this._siteData$ = this._store.let(fromRoot.getSiteData);
    this._departmentData$ = this._store.let(fromRoot.getAllDepartmentsData);
    this._employmentTypeData$ = this._store.let(fromRoot.getEmploymentTypeOptionListData);
    this._employeeJobDetails$ = this._store.let(fromRoot.getEmployeeJobDetails);
    this._jobTitlesData$ = this._store.let(fromRoot.getJobTitleOptionListData);
    this._employeeSettings$ = this._store.let(fromRoot.getEmployeeSettingsData);
    this._doAllTranslations();
    this._translationChnageSub = this._translationService.translationChanged.subscribe(
      () => {
        this._doAllTranslations();
      }
    );

    this._employeeJobDetails$.combineLatest(this._employeeJobDetails$).takeUntil(this._destructor$).subscribe(val => {
      if (!isNullOrUndefined(val[0]) && !isNullOrUndefined(val[1])) {
        this._employeeJobDetails = val[0];
        this._holidayEntitlement = isNullOrUndefined(val[0].HolidayEntitlement) ? val[1].HolidayEntitlement : val[0].HolidayEntitlement;
        this._cdRef.markForCheck();
      }
    });
  }
  ngOnDestroy() {
    if (this._employeeStateSub) {
      this._employeeStateSub.unsubscribe();
    }
    if (this._translationChnageSub) {
      this._translationChnageSub.unsubscribe();
    }
    super.ngOnDestroy();
  }
  getSlideoutState(): string {
    return this._showEmpJobDetailsUpdateForm ? 'expanded' : 'collapsed';
  }
  closeUpdateForm(e) {
    this._showEmpJobDetailsUpdateForm = false;
  }
  openEmpJobDetailsUpdateForm(e) {
    this._showEmpJobDetailsUpdateForm = true;
  }
  submitJobDetails(jobDetails: EmployeeJobDetails) {
    this._showEmpJobDetailsUpdateForm = false;
    var empId = this._employeeId;
    this._store.dispatch(new EmployeeJobUpdateAction({ jobDetails, empId }));

    this._updateJobDetailsCompleteSubscription = this._store.let(fromRoot.getEmployeeJobDetailsProgressStatus).subscribe(status => {
      if (!status) {
        if (this._updateJobDetailsCompleteSubscription) {
          this._updateJobDetailsCompleteSubscription.unsubscribe();
        }
      }
    });
  }

  public expandSlideout(e) {
    this._canExpandSlideout = true;
  }

  public collapseSlideout(e) {
    this._canExpandSlideout = false;
  }
  //End of public methods

  // Private methods start
  private _canUpdateJob() {
    const statePersonal = this._store.let(fromRoot.getEmployeePersonalData);
    this._employeeStateSub = statePersonal.subscribe((val) => {
      if (val) {
        this._canUpdate$.next(this._employeeSecurityService.CanUpdateJob(val.Id));
      }
    });
  }
  private _doAllTranslations() {
    this._noneText = ''; //this._translationService.translate('NONE');
    this._noText = this._translationService.translate('NO');
    this._yesText = this._translationService.translate('YES');
    this._snackbarObjectType = this._translationService.translate('EMPLOYEE_JOB_DETAILS.snackbar_object_type');
    this._snackbarMessageTitle = this._translationService.translate('EMPLOYEE_JOB_DETAILS.job_details');
  }

  getUnitTypeText() {
    if (!isNullOrUndefined(this._employeeJobDetails) &&
      !isNullOrUndefined(this._employeeJobDetails.CarryForwardedUnitType)) {
      return HolidayUnitType[this._employeeJobDetails.CarryForwardedUnitType];
    }
    return null;
  }

  calculateYearsAndMonthsFromToday(startDate: Date) {
    if (!isNullOrUndefined(startDate))
      return calculateYearsAndMonthsFromToday(startDate);
    return null;
  }
  // End of Private methods

}
