import { Site } from './../../../../shared/models/site.model';
import { BaseComponent } from '../../../../shared/base-component';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Router, NavigationExtras } from '@angular/router';
import { Store } from '@ngrx/store';
import { LocaleService, TranslationService } from 'angular-l10n';
import { Observable, Subscription } from 'rxjs/Rx';
import { isNullOrUndefined } from 'util';
import {
  EmployeeInformationLoadAction,
  LoadEmployeeAdministrationDetailsAction,
} from '../../../../employee/actions/employee.actions';
import { UserAdminDetails } from '../../../../employee/administration/models/user-admin-details.model';
import { EmployeeInformation } from '../../../../employee/models/employee-information';
import { LoadApplicableSitesAction } from '../../../../shared/actions/user.actions';
import { EmployeeDetailsAddAction } from './../../../../employee/employee-add/actions/employee-add.actions';
import { EmployeeFullEntity } from './../../../../employee/models/employee-full.model';
import {
  LoadAllDepartmentsAction,
  LoadEmployeeSettingsAction,
  LoadJobTitleOptioAction,
  LoadSitesAction,
  ClearJobTitleAction,
} from './../../../../shared/actions/company.actions';
import { EmployeeEthinicGroupLoadAction, EmploymentTypeLoadAction } from './../../../../shared/actions/lookup.actions';
import { StringHelper } from './../../../../shared/helpers/string-helper';
import { EthnicGroup } from './../../../../shared/models/lookup.models';
import * as fromRoot from './../../../../shared/reducers';


@Component({
  selector: 'employee-add-container',
  templateUrl: './employee-add-container.component.html',
  styleUrls: ['./employee-add-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmployeeAddContainerComponent extends BaseComponent implements OnInit, OnDestroy {
  private _ethnicGroupSubscription: Subscription;
  private _sitesLoaded$: Observable<Site[]>;
  private _sitesSubscription: Subscription;
  private _departmentsSubscription: Subscription;
  private _employmentTypesLoaded$: Observable<boolean>
  private _employmentTypesSubscription: Subscription;
  private _jobTitlesLoaded$: Observable<boolean>
  private _jobTitlesSubscription: Subscription;
  private _employeeSettingsLoaded$: Observable<boolean>
  private _employeeSettingsSubscription: Subscription;
  private _addEmployeeSuccessSubscription: Subscription;

  private _employeeAdminDetailsSubscription: Subscription;
  private _empInfoSubscription: Subscription;


  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _cdRef: ChangeDetectorRef
    , private _store: Store<fromRoot.State>
    , private _router: Router) {
    super(_localeService, _translationService, _cdRef);
    this._store.dispatch(new ClearJobTitleAction(true));
    this.id = 'Employee_Add_Container';
  }

  ngOnInit() {
    this._ethnicGroupSubscription = this._store.select(c => c.lookupState.EthnicGroupData).subscribe((ethnicGroupData) => {
      if (isNullOrUndefined(ethnicGroupData)) {
        this._store.dispatch(new EmployeeEthinicGroupLoadAction(true));
      }
    });

    this._sitesLoaded$ = this._store.let(fromRoot.getSiteData);
    this._sitesSubscription = this._sitesLoaded$.subscribe(sites => {
      if (!sites)
        this._store.dispatch(new LoadSitesAction(true));
    });

    this._departmentsSubscription = this._store.let(fromRoot.getAllDepartmentsData).subscribe(departmentsLoaded => {
      if (!departmentsLoaded)
        this._store.dispatch(new LoadAllDepartmentsAction());
    });

    this._employmentTypesLoaded$ = this._store.let(fromRoot.getEmploymentTypeListLoadingStatus);
    this._employmentTypesSubscription = this._employmentTypesLoaded$.subscribe(employmentTypesLoaded => {
      if (!employmentTypesLoaded)
        this._store.dispatch(new EmploymentTypeLoadAction(true));
    });

    this._jobTitlesLoaded$ = this._store.let(fromRoot.getJobTitleOptionListDataStatus);
    this._jobTitlesSubscription = this._jobTitlesLoaded$.subscribe(jobTitlesLoaded => {
      if (!jobTitlesLoaded)
        this._store.dispatch(new LoadJobTitleOptioAction(true));
    });

    this._employeeSettingsLoaded$ = this._store.let(fromRoot.getEmployeeSettingsLoadingState);
    this._employeeSettingsSubscription = this._employeeSettingsLoaded$.subscribe(employeeSettingsLoaded => {
      if (!employeeSettingsLoaded)
        this._store.dispatch(new LoadEmployeeSettingsAction(true));
    });

    this._addEmployeeSuccessSubscription = this._store.select(c => c.employeeAddState.NewEmployeeId).subscribe((newEmpId) => {
      if (!StringHelper.isNullOrUndefinedOrEmpty(newEmpId)) {
        let navigationExtras: NavigationExtras = {
          queryParamsHandling: 'merge'
        };
        let navigateUrl = "/employee/manage";
        this._router.navigate([navigateUrl], navigationExtras);
      }
    });

    // Get employee 

    this._empInfoSubscription = this._store.select(c => c.employeeState.InformationVM).subscribe((empInfoDetails) => {
      if (isNullOrUndefined(empInfoDetails)) {
        this._store.dispatch(new EmployeeInformationLoadAction(true));
      }
    });

  }

  ngOnDestroy() {
    if (this._ethnicGroupSubscription)
      this._ethnicGroupSubscription.unsubscribe();
    if (this._sitesSubscription)
      this._sitesSubscription.unsubscribe();
    if (this._departmentsSubscription)
      this._departmentsSubscription.unsubscribe();
    if (this._employmentTypesSubscription)
      this._employmentTypesSubscription.unsubscribe();
    if (this._jobTitlesSubscription)
      this._jobTitlesSubscription.unsubscribe();
    if (this._employeeSettingsSubscription)
      this._employeeSettingsSubscription.unsubscribe();
    if (this._addEmployeeSuccessSubscription)
      this._addEmployeeSuccessSubscription.unsubscribe();
  }

  // public methods
  submitEmployeeDetails(employeeDetails: EmployeeFullEntity) {
    this._store.dispatch(new EmployeeDetailsAddAction(employeeDetails));
  }
  // end of public methods

}
