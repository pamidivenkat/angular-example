import { LoadEmployeeStatAction } from './../../actions/employee.actions';
import { EmployeeStatType, LastUpdated } from './../../models/employee-stat';
import { Observable } from 'rxjs/Rx';
import { EmployeeSecurityService } from './../../services/employee-security-service';
import { Subscription } from 'rxjs/Subscription';
import { ActivatedRoute, Router, NavigationExtras } from '@angular/router';
import { EmployeeConstants } from './../../employee-constants';
import {
  EmployeeContactsLoadAction,
  EmployeeContactsUpdateAction,
  EmployeeEmergencyContactsCreateAction,
  EmployeeEmergencyContactsLoadAction,
  EmployeeLoadAction,
  EmployeeTabChangeAction
} from '../../actions/employee.actions';
import { MessageType } from '../../../atlas-elements/common/ae-message.enum';
import { ClaimsHelperService } from '../../../shared/helpers/claims-helper';
import { Store } from '@ngrx/store';
import { LocaleService, TranslationService } from 'angular-l10n';
import { BaseComponent } from '../../../shared/base-component';
import {
  AfterContentInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  ViewEncapsulation
} from '@angular/core';
import * as fromRoot from '../../../shared/reducers';
import * as employeeActions from '../../actions/employee.actions';
import { ClearJobTitleAction } from '../../../shared/actions/company.actions';
import { isNullOrUndefined } from 'util';

@Component({
  selector: 'employee-container',
  templateUrl: './employee-container.component.html',
  styleUrls: ['./employee-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class EmployeeContainerComponent extends BaseComponent implements OnInit, OnDestroy {
  // Private field declaration
  private _showSuccessMessage: boolean;
  private _messageType: MessageType = MessageType.Info;
  private _personalUrl = EmployeeConstants.Routes.Personal;
  private _jobUrl = EmployeeConstants.Routes.Job;
  private _timelineUrl = EmployeeConstants.Routes.Timeline;
  private _benefitsUrl = EmployeeConstants.Routes.Benefits;
  private _contactsUrl = EmployeeConstants.Routes.Contact;
  private _careerAdnTrainingUrl = EmployeeConstants.Routes.CareerAndTraining;
  private _calendarUrl = EmployeeConstants.Routes.EmployeeCalendar;
  private _bankUrl = EmployeeConstants.Routes.Bank;
  private _vehicleUrl = EmployeeConstants.Routes.Vehicle;
  private _administrationUrl = EmployeeConstants.Routes.Administration;
  private _queriedEmpId$: Observable<string>;
  private _subScription: Subscription;
  private _lastUpdated$: Observable<LastUpdated>;
  private _employeeId: string;
  private _lastModifiedUserName: string;
  private _lastModifiedOn: Date;
  private _lastUpdatedSubscription: Subscription;
  // End of private field declaration

  //constructor start
  /**
   * Creates an instance of EmployeeContainerComponent.
   * @param {LocaleService} _localeService 
   * @param {TranslationService} _translationService 
   * @param {ChangeDetectorRef} _cdRef 
   * @param {Store<fromRoot.State>} _store 
   * @param {ClaimsHelperService} _claimsHelper 
   * 
   * @memberOf EmployeeContainerComponent
   */
  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _cdRef: ChangeDetectorRef
    , private _store: Store<fromRoot.State>
    , private _claimsHelper: ClaimsHelperService
    , private _route: ActivatedRoute
    , private _router: Router
    , private _employeeSecurityService: EmployeeSecurityService) {
    super(_localeService, _translationService, _cdRef);
    this._store.dispatch(new ClearJobTitleAction(true));
    this.id = 'employee-tabs';
    this.name = 'employee-tabs';
  }
  //end of constructor
  get lastUpdated$(): Observable<LastUpdated> {
    return this._lastUpdated$;
  }

  get lastModifiedByUserName() {
    return this._lastModifiedUserName;
  }
  get lastModifiedOn() {
    return this._lastModifiedOn;
  }
  // public method start
  ngOnInit() {
    this._lastUpdatedSubscription = this._store.let(fromRoot.getEmployeeLastUpdatedData).subscribe(s => {
      if (!isNullOrUndefined(s)) {
        if (!isNullOrUndefined(s.ModifiedBy)) {
          this._lastModifiedUserName = s.ModifiedBy.FirstName + ' ' + s.ModifiedBy.LastName;
        }
        this._lastModifiedOn = s.ModifiedOn;
        this._cdRef.markForCheck();
      }
    });
    this._store.let(fromRoot.getEmployeeUpdateStatus).subscribe(status => {
      this._showSuccessMessage = status;
    });
    this._queriedEmpId$ = this._store.let(fromRoot.getEmployeeId);
    this._subScription = this._queriedEmpId$.subscribe(empId => {
      this._employeeId = empId;
      if (empId) {
        this._store.dispatch(new EmployeeLoadAction({ EmployeeId: empId }));
      }
    });
  }
  ngOnDestroy() {
    if (this._subScription)
      this._subScription.unsubscribe();
  }
  canViewLastUpdatedBy() {
    return this._claimsHelper.isHolidayAuthorizerOrManager() || this._claimsHelper.isHRManagerOrServiceOwner() || this._claimsHelper.canViewDeptEmps() || this._claimsHelper.canManageDeptEmps();
  }
  getPersonalUrl(): string {
    return this._personalUrl;
  }
  getJobUrl(): string {
    return this._jobUrl;
  }
  getTimelineUrl(): string {
    return this._timelineUrl;
  }
  getContactUrl(): string {
    return this._contactsUrl;
  }
  getCareerAndTrainingUrl(): string {
    return this._careerAdnTrainingUrl;
  }
  getCalendarUrl(): string {
    return this._calendarUrl;
  }
  getBankUrl(): string {
    return this._bankUrl;
  }
  getBenefitsUrl(): string {
    return this._benefitsUrl;
  }
  getVehicleUrl(): string {
    return this._vehicleUrl;
  }
  getAdministrationUrl(): string {
    return this._administrationUrl;
  }
  canView(tabName: string) {
    return this._employeeSecurityService.CanView(tabName, this._employeeId);
  }
  manageAbsences(): boolean {
    return (this._claimsHelper.isHRManagerOrServiceOwner() || this._claimsHelper.isHolidayAuthorizerOrManager())
      && (this._claimsHelper.canManageDeptEmps() || this._claimsHelper.canAddHolidayOnbehalf());
  }
  manageAbsencesButtonClick() {
    this._router.navigate(['absence-management/requests/employee/', this._employeeId])
  }
  // end of public method
}
