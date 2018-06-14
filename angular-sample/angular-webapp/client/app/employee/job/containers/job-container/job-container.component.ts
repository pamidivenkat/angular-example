import { Site } from './../../../../shared/models/site.model';
import { EmployeeJobLoadAction, LoadEmployeeHolidayWorkingProfileAction } from './../../../actions/employee.actions';
import { LoadApplicableDepartmentsAction } from '../../../../shared/actions/user.actions';
import { Component, OnInit, ChangeDetectorRef, OnDestroy, ChangeDetectionStrategy, ViewEncapsulation } from '@angular/core';
import { LocaleService, TranslationService } from 'angular-l10n';
import { Store } from '@ngrx/store';
import { ClaimsHelperService } from '../../../../shared/helpers/claims-helper';
import { BaseComponent } from '../../../../shared/base-component';
import * as fromRoot from '../../../../shared/reducers';
import { Observable, Subscription } from 'rxjs/Rx';
import { EmployeeJobDetails } from '../../models/job-details.model';
import {
  LoadAllDepartmentsAction,
  LoadJobTitleOptioAction,
  LoadSitesAction,
  LoadEmployeeSettingsAction
} from './../../../../shared/actions/company.actions';
import { EmploymentTypeLoadAction } from './../../../../shared/actions/lookup.actions';
import { EmployeeHolidayWorkingProfile } from './../../../../holiday-absence/models/holiday-absence.model';
import { isNullOrUndefined } from 'util';
import { LoadApplicableSitesAction } from './../../../../shared/actions/user.actions';

@Component({
  selector: 'job-container',
  templateUrl: './job-container.component.html',
  styleUrls: ['./job-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class JobContainerComponent extends BaseComponent implements OnInit, OnDestroy {
  // Private Fields
  private _jobDetailsLoaded$: Observable<boolean>
  private _jobDetailsSubscription: Subscription;
  private _employeeJobDetails$: Observable<EmployeeJobDetails>;
  private _sitesLoaded$: Observable<Site[]>;
  private _sitesSubscription: Subscription;
  private _departmentsLoaded$: Observable<boolean>
  private _departmentsSubscription: Subscription;
  private _employmentTypesLoaded$: Observable<boolean>
  private _employmentTypesSubscription: Subscription;
  private _jobTitlesLoaded$: Observable<boolean>
  private _jobTitlesSubscription: Subscription;
  private _employeeSettingsLoaded$: Observable<boolean>
  private _employeeSettingsSubscription: Subscription;
  private _employeeIdToFetch$: Observable<string>;
  private _routeParamsScription: Subscription;
  // End of private Fields

  //Public Properties 
  get employeeIdToFetch$(): Observable<string> {
    return this._employeeIdToFetch$;
  }
  //End of Public properties

  //constructor start
  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _cdRef: ChangeDetectorRef
    , private _store: Store<fromRoot.State>
    , private _claimsHelper: ClaimsHelperService) {
    super(_localeService, _translationService, _cdRef);
  }
  //end of constructor

  //public method start
  ngOnInit() {
    this._employeeIdToFetch$ = this._store.let(fromRoot.getEmployeeId);

    this._jobDetailsLoaded$ = this._store.let(fromRoot.getEmployeeJobDetailsLoadingState);
    this._jobDetailsSubscription = this._jobDetailsLoaded$.subscribe(jobDetailsLoaded => {

    });

    this._routeParamsScription = this._employeeIdToFetch$.combineLatest(this._jobDetailsLoaded$, (employeeId$, jobDetailsLoaded$) => {
      return { employeeId: employeeId$, jobDetailsLoaded: jobDetailsLoaded$ };
    }).subscribe((vl) => {
      if (vl.employeeId) {
        if (!vl.jobDetailsLoaded)
          this._store.dispatch(new EmployeeJobLoadAction(vl.employeeId));
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

  }

  ngOnDestroy() {
    if (this._jobDetailsSubscription)
      this._jobDetailsSubscription.unsubscribe();
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
    if (this._routeParamsScription)
      this._routeParamsScription.unsubscribe();
  }
  //End of public methods

  // Private methods start
  // End of Private methods
}
