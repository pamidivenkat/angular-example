import { BreadcrumbGroup } from '../../../../atlas-elements/common/models/ae-breadcrumb-group';
import { addOrUpdateAtlasParamValue } from '../../../../root-module/common/extract-helpers';
import { AtlasApiRequestWithParams, AtlasParams } from './../../../../shared/models/atlas-api-response';
import { LoadEmployeesAction } from './../../actions/nonworkingdays-actions';
import { AeDatasourceType } from '../../../../atlas-elements/common/ae-datasource-type';
import { CountryLoadAction } from './../../../../shared/actions/lookup.actions';
import { LoadAllDepartmentsAction, LoadSitesAction } from './../../../../shared/actions/company.actions';
import { Department, Site } from './../../../../calendar/model/calendar-models';
import { AeSelectItem } from './../../../../atlas-elements/common/models/ae-select-item';
import { Country } from './../../../../shared/models/lookup.models';
import { Observable, Subscription } from 'rxjs/Rx';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { LoadCompanyNonWorkingDaysAction, NonWorkingdaysFiltersChangedAction, ClearNonWorkingDaysFiltersAction } from '../../actions/nonworkingdays-actions';
import { Store } from '@ngrx/store';
import { ClaimsHelperService } from './../../../../shared/helpers/claims-helper';
import { TranslationService, LocaleService } from 'angular-l10n';
import { BaseComponent } from './../../../../shared/base-component';
import { Component, OnInit, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef, ViewEncapsulation } from '@angular/core';
import { IBreadcrumb } from '../../../../atlas-elements/common/models/ae-ibreadcrumb.model';
import { BreadcrumbService } from './../../../../atlas-elements/common/services/breadcrumb-service';
import * as fromRoot from './../../../../shared/reducers';
import * as Immutable from 'immutable';
import { SortDirection } from './../../../../atlas-elements/common/models/ae-sort-model';

@Component({
  selector: 'nonworkingdays-container',
  templateUrl: './nonworkingdays-container.component.html',
  styleUrls: ['./nonworkingdays-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class NonworkingdaysContainerComponent extends BaseComponent implements OnInit, OnDestroy {

  // Private Fields
  private _nonWorkingDaysFilterForm: FormGroup;
  private _countries$: Observable<Immutable.List<AeSelectItem<string>>>;
  private _applicableTo$: Observable<Immutable.List<AeSelectItem<string>>>;
  private _departments$: Observable<Immutable.List<AeSelectItem<string>>>;
  private _sites$: Observable<Immutable.List<AeSelectItem<string>>>;
  private _employees$: Observable<AeSelectItem<string>[]>;
  private _remoteDataSourceType: AeDatasourceType = AeDatasourceType.Remote;
  private _departmentsSubscription: Subscription;
  private _sitesSubscription: Subscription;
  private _countriesSubscription: Subscription;
  private _standardNonWokingDaysApiRequest: AtlasApiRequestWithParams = new AtlasApiRequestWithParams(1, 10, 'Name', SortDirection.Ascending, [new AtlasParams('CountryId', '00000000-0000-0000-0000-000000000000')]);
  private _standardNonWokingDaysApiRequestSub: Subscription;
  private _customNonWokingDaysApiRequest: AtlasApiRequestWithParams = new AtlasApiRequestWithParams(1, 10, 'Name', SortDirection.Ascending, [new AtlasParams('CountryId', '00000000-0000-0000-0000-000000000000')]);;
  private _customNonWokingDaysApiRequestSub: Subscription;
  private _routesSubScription: Subscription;
  private _applicableToItemsData$: Observable<Immutable.List<AeSelectItem<string>>>;
  private _showApplicableToItemFilter: any;
  private _assignSaveSubscription: Subscription;
  private _defaultWorkingdaysLoadSaveSubscription: Subscription;



  // End of Private Fields

  // Public properties
  get nonWorkingDaysFilterForm() {
    return this._nonWorkingDaysFilterForm;
  }

  get remoteDataSourceType() {
    return this._remoteDataSourceType;
  }

  get countries$() {
    return this._countries$;
  }

  get applicableTo$() {
    return this._applicableTo$;
  }

  get applicableToItemsData$() {
    return this._applicableToItemsData$;
  }

  get employees$() {
    return this._employees$;
  }

  get bcGroup(): BreadcrumbGroup {
    return BreadcrumbGroup.Company;
  }
  // End of Public properties

  // Public Output bindings
  // End of Public Output bindings

  // Public ViewChild bindings
  // End of Public ViewChild bindings

  // Public ContnetChild bindings
  // End of Public ContnetChild bindings

  // Constructor
  constructor(protected _changeDetector: ChangeDetectorRef
    , _localeService: LocaleService
    , _translationService: TranslationService
    , protected _claimsHelper: ClaimsHelperService
    , private _breadcrumbService: BreadcrumbService
    , private _store: Store<fromRoot.State>
    , private _route: ActivatedRoute
    , private _fb: FormBuilder
  ) {
    super(_localeService, _translationService, _changeDetector);
  }
  // End of constructor

  // Private methods
  onApplicableToChange($event) {
      this._standardNonWokingDaysApiRequest.Params = addOrUpdateAtlasParamValue(this._standardNonWokingDaysApiRequest.Params, 'DepartmentId', '');
      this._customNonWokingDaysApiRequest.Params = addOrUpdateAtlasParamValue(this._customNonWokingDaysApiRequest.Params, 'DepartmentId', '');
      this._standardNonWokingDaysApiRequest.Params = addOrUpdateAtlasParamValue(this._standardNonWokingDaysApiRequest.Params, 'SiteId', '');
      this._customNonWokingDaysApiRequest.Params = addOrUpdateAtlasParamValue(this._customNonWokingDaysApiRequest.Params, 'SiteId', '');
      this._standardNonWokingDaysApiRequest.Params = addOrUpdateAtlasParamValue(this._standardNonWokingDaysApiRequest.Params, 'EmployeeId', '');
      this._customNonWokingDaysApiRequest.Params = addOrUpdateAtlasParamValue(this._customNonWokingDaysApiRequest.Params, 'EmployeeId', '');
      this._store.dispatch(new NonWorkingdaysFiltersChangedAction({ standardApiRequest: this._standardNonWokingDaysApiRequest, customApiRequest: this._customNonWokingDaysApiRequest }));
  }
  onCountryChange($event) {
    this._standardNonWokingDaysApiRequest.Params = addOrUpdateAtlasParamValue(this._standardNonWokingDaysApiRequest.Params, 'CountryId', $event.SelectedValue);
    this._customNonWokingDaysApiRequest.Params = addOrUpdateAtlasParamValue(this._customNonWokingDaysApiRequest.Params, 'CountryId', $event.SelectedValue);

    this._store.dispatch(new NonWorkingdaysFiltersChangedAction({ standardApiRequest: this._standardNonWokingDaysApiRequest, customApiRequest: this._customNonWokingDaysApiRequest }));
  }

  onSelectorChange($event) {
    if (this._nonWorkingDaysFilterForm.controls['applicableTo'].value == '4') {
      this._standardNonWokingDaysApiRequest.Params = addOrUpdateAtlasParamValue(this._standardNonWokingDaysApiRequest.Params, 'DepartmentId', $event.SelectedValue);
      this._customNonWokingDaysApiRequest.Params = addOrUpdateAtlasParamValue(this._customNonWokingDaysApiRequest.Params, 'DepartmentId', $event.SelectedValue);

      this._store.dispatch(new NonWorkingdaysFiltersChangedAction({ standardApiRequest: this._standardNonWokingDaysApiRequest, customApiRequest: this._customNonWokingDaysApiRequest }));
    } else {
      this._standardNonWokingDaysApiRequest.Params = addOrUpdateAtlasParamValue(this._standardNonWokingDaysApiRequest.Params, 'SiteId', $event.SelectedValue);
      this._customNonWokingDaysApiRequest.Params = addOrUpdateAtlasParamValue(this._customNonWokingDaysApiRequest.Params, 'SiteId', $event.SelectedValue);

      this._store.dispatch(new NonWorkingdaysFiltersChangedAction({ standardApiRequest: this._standardNonWokingDaysApiRequest, customApiRequest: this._customNonWokingDaysApiRequest }));
    }
  }

  onSelectEmployee($event) {
    let selectedEmployee = $event;
    let empId = (selectedEmployee[0].Value);
    this._standardNonWokingDaysApiRequest.Params = addOrUpdateAtlasParamValue(this._standardNonWokingDaysApiRequest.Params, 'EmployeeId', empId);
    this._customNonWokingDaysApiRequest.Params = addOrUpdateAtlasParamValue(this._customNonWokingDaysApiRequest.Params, 'EmployeeId', empId);
    this._store.dispatch(new NonWorkingdaysFiltersChangedAction({ standardApiRequest: this._standardNonWokingDaysApiRequest, customApiRequest: this._customNonWokingDaysApiRequest }));
  }

  getStandardWorkingProfilesUrl(): string {
    return "standard";
  }
  getCustomWorkingProfilesUrl(): string {
    return "custom";
  }
  canEmployeeShown(): boolean {
    return this._nonWorkingDaysFilterForm.controls['applicableTo'].value == '17';
  }
  showElement(): boolean {
    return this._showApplicableToItemFilter;
  }

  searchEmployees(e) {
    let apiRequestWithParams: AtlasApiRequestWithParams;
    let apiParams: AtlasParams[] = [];
    apiParams.push(new AtlasParams("SearchedQuery", e.query));
    apiRequestWithParams = new AtlasApiRequestWithParams(0, 0, 'FirstName', SortDirection.Ascending, apiParams);
    this._store.dispatch(new LoadEmployeesAction(apiRequestWithParams));
  }

  private _initForm() {
    this._nonWorkingDaysFilterForm = this._fb.group({
      country: [null],
      applicableTo: [],
      applicableToItems: [],
      employee: [{ value: '' }],
    }
    );
  }
  // End of private methods

  // Public methods
  ngOnInit() {
    super.ngOnInit();
    this._initForm();
    //before that we should know about the company default profile id to be set, this is done in this container component
    this._countries$ = this._store.let(fromRoot.getCountryImmutableData);
    this._applicableTo$ = this._store.let(fromRoot.getMetaDataExclCompany);
    this._departments$ = this._store.let(fromRoot.getAllDepartmentsImmutableData);
    this._sites$ = this._store.let(fromRoot.sitesForClientsImmutableData);
    this._employees$ = this._store.let(fromRoot.getNonWorkingDaysEmployeesData);
    //countries,sites should be loaded if not already loaded previously
    this._departmentsSubscription = this._store.let(fromRoot.getAllDepartmentsData).subscribe(departmentsLoaded => {
      if (!departmentsLoaded)
        this._store.dispatch(new LoadAllDepartmentsAction());
    });

    this._sitesSubscription = this._store.let(fromRoot.getSiteData).subscribe(sites => {
      if (!sites)
        this._store.dispatch(new LoadSitesAction(false));
    });

    this._countriesSubscription = this._store.let(fromRoot.getSiteData).subscribe(countries => {
      if (!countries)
        this._store.dispatch(new CountryLoadAction(false));
    });

    this._routesSubScription = this._route.params.subscribe(params => {
      let companyId = params['cid'] ? params['cid'] : this._claimsHelper.getCompanyId();
      this._store.dispatch(new LoadCompanyNonWorkingDaysAction(companyId));
    });

    this._standardNonWokingDaysApiRequestSub = this._store.let(fromRoot.getStandardNonWorkingDaysApiRequestData).subscribe(apiRequest => {
      if (apiRequest)
        Object.assign(this._standardNonWokingDaysApiRequest, apiRequest);
    });

    this._customNonWokingDaysApiRequestSub = this._store.let(fromRoot.getCustomNonWorkingDaysApiRequestData).subscribe(apiRequest => {
      if (apiRequest)
        Object.assign(this._customNonWokingDaysApiRequest, apiRequest);
    });

    this._nonWorkingDaysFilterForm.get('applicableTo').valueChanges.subscribe(val => {
      if (val === '4') {
        this._applicableToItemsData$ = this._store.let(fromRoot.getAllDepartmentsImmutableData);
        this._showApplicableToItemFilter = true;
        this._nonWorkingDaysFilterForm.get('applicableToItems').setValue(null);
      } else if (val === '3') {
        this._applicableToItemsData$ = this._store.let(fromRoot.getsitesImmutableData);
        this._showApplicableToItemFilter = true;
        this._nonWorkingDaysFilterForm.get('applicableToItems').setValue(null);
      } else {
        this._showApplicableToItemFilter = false;
        this._nonWorkingDaysFilterForm.get('applicableToItems').setValue(null);
      }
    });


    this._assignSaveSubscription = this._store.let(fromRoot.getNonWorkingdayProfileAssignStatus).subscribe(res => {
      if (res == true) {
        this._routesSubScription = this._route.params.subscribe(params => {
          let companyId = params['cid'] ? params['cid'] : this._claimsHelper.getCompanyId();
          this._store.dispatch(new LoadCompanyNonWorkingDaysAction(companyId));
        });
      }
    })

    this._defaultWorkingdaysLoadSaveSubscription = this._store.let(fromRoot.getHasCompanyNonWorkingdaysLoadedData).subscribe(res => {
      if (res === true) {
        this._store.dispatch(new NonWorkingdaysFiltersChangedAction({ standardApiRequest: this._standardNonWokingDaysApiRequest, customApiRequest: this._customNonWokingDaysApiRequest }));
      }
    })
  }
  ngOnDestroy() {
    //super.ngOnDestroy();
    this._store.dispatch(new ClearNonWorkingDaysFiltersAction());
    if (this._departmentsSubscription)
      this._departmentsSubscription.unsubscribe();
    if (this._sitesSubscription)
      this._sitesSubscription.unsubscribe();
    if (this._countriesSubscription)
      this._countriesSubscription.unsubscribe();
    if (this._routesSubScription)
      this._routesSubScription.unsubscribe();
    if (this._standardNonWokingDaysApiRequestSub)
      this._standardNonWokingDaysApiRequestSub.unsubscribe();
    if (this._customNonWokingDaysApiRequestSub)
      this._customNonWokingDaysApiRequestSub.unsubscribe();

    if (this._assignSaveSubscription) {
      this._assignSaveSubscription.unsubscribe();
    }
    if (this._defaultWorkingdaysLoadSaveSubscription) {
      this._defaultWorkingdaysLoadSaveSubscription.unsubscribe();
    }
  }
  // End of public methods
}
