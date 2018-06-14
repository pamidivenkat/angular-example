import { AeIconSize } from '../../../../atlas-elements/common/ae-icon-size.enum';
import { EmployeeSearchService } from './../../../../employee/services/employee-search.service';
import { isNullOrUndefined } from 'util';
import { AeDataTableAction } from './../../../../atlas-elements/common/models/ae-data-table-action';
import { StringHelper } from './../../../../shared/helpers/string-helper';
import { DataTableOptions } from './../../../../atlas-elements/common/models/ae-datatable-options';
import { NonWorkingdaysModel, NonWorkingdaysNotesModel, HWPAssignToModel } from './../../models/nonworkingdays-model';
import { SortDirection } from '../../../../atlas-elements/common/models/ae-sort-model';
import { AtlasApiRequestWithParams, AtlasParams } from './../../../../shared/models/atlas-api-response';
import { LoadStandardNonWorkingDaysAction, LoadSelectedProfileNotesAction, NonWorkingDaysProfileCopyAction, LoadSelectedNonWorkingDaysProfileAction, NonWorkingDaysAssignSaveAction } from './../../actions/nonworkingdays-actions';
import { Observable, Subject } from 'rxjs/Rx';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs/Subscription';
import { ClaimsHelperService } from './../../../../shared/helpers/claims-helper';
import { LocaleService, TranslationService } from 'angular-l10n';
import { BaseComponent } from '../../../../shared/base-component';
import { Component, OnInit, ChangeDetectionStrategy, ViewEncapsulation, OnDestroy, ChangeDetectorRef, Input, Output, EventEmitter } from '@angular/core';
import { NonworkingdaysOperationmode } from './../../models/nonworkingdays-operationmode-enum';
import * as fromRoot from './../../../../shared/reducers';
import * as Immutable from 'immutable';
import { Router, NavigationExtras } from "@angular/router";
import { IBreadcrumb } from '../../../../atlas-elements/common/models/ae-ibreadcrumb.model';
import { BreadcrumbService } from './../../../../atlas-elements/common/services/breadcrumb-service';
import { BreadcrumbGroup } from '../../../../atlas-elements/common/models/ae-breadcrumb-group';

@Component({
  selector: 'standard-nonworkingdays',
  templateUrl: './standard-nonworkingdays.component.html',
  styleUrls: ['./standard-nonworkingdays.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class StandardNonworkingdaysComponent extends BaseComponent implements OnInit, OnDestroy {

  // Private Fields  
  private _icon: string;
  private _canCreateStandardWorkingdayProfile: boolean;
  private _companyNonWorkingDayLoaded: Subscription;
  private _selectedCountryId: string;
  private _nonWorkingDays$: Observable<Immutable.List<NonWorkingdaysModel>>;
  private _recordsCount$: Observable<number>;
  private _loading$: Observable<boolean>;
  private _nonWorkingDaysDataTableOptions$: Observable<DataTableOptions>;
  private _companyNonWorkingDaySub: Subscription;
  private _actions: Immutable.List<AeDataTableAction>;
  private _viewStandardNonWorkingDayNotesCommand = new Subject();
  private _copyStandardNonWorkingDayCommand = new Subject();
  private _assignStandardNonWorkingDayCommand = new Subject();
  private _viewStandardNonWorkingDayCommand = new Subject();
  private _keys = Immutable.List(['Id', 'Name', 'Description', 'CountryName', 'IsExample', 'CompanyNonWorkingDaysId']);
  private _nonWokingDaysApiRequest: AtlasApiRequestWithParams;
  private _nonWokingDaysApiRequestSub: Subscription;
  private _isFirstTimeLoad: boolean = true;
  private _currentStandardNonWorkingApiRequest: AtlasApiRequestWithParams = new AtlasApiRequestWithParams(1, 10, 'Name', SortDirection.Ascending, [new AtlasParams('CountryId', !StringHelper.isNullOrUndefinedOrEmpty(this._selectedCountryId) ? this._selectedCountryId : '00000000-0000-0000-0000-000000000000')]);
  private _companyNonWorkingdaysModel: NonWorkingdaysModel;
  private _showStandardNonWorkingDayNotes: boolean = false;
  private _selectedProfilesNotes$: Observable<NonWorkingdaysNotesModel[]>;
  private _selectedProfilNotesLoadedSub: Subscription;
  private _showStandardNonWorkingDayCopy: boolean = false;
  private _selectedNonWorkingDayProfile: NonWorkingdaysModel;
  private _standardNonWorkingDayOperationMode: NonworkingdaysOperationmode
  private _showStandardNonWorkingDayView: boolean;
  private _selectedNonWorkingDayProfileForView: NonWorkingdaysModel
  private _selectedNonWorkingDayProfileViewSub: Subscription;
  private _selectedNonWorkingDayProfileForAssign: NonWorkingdaysModel;
  private _showStandardNonWorkingDayAssign: boolean;
  private _userActionMode: string = "";
  private _getHasSelectedProfileFullEntityDataSub: Subscription;
  private _viewStandardNonWorkingDayNotesCmdSub: Subscription;
  private _copyStandardNonWorkingDayCmdSub: Subscription;
  private _assignStandardNonWorkingDayCmdSub: Subscription;
  private _viewStandardNonWorkingDayCmdSub: Subscription;
  private _getHasFiltersChangedDataSub: Subscription;
  private _nonWokingDaysOnlyApiRequestSub: Subscription;
  private _copiedNonWorkingDayProfileIdSub: Subscription;
  // End of Private Fields

  // Public properties

  get canCreateStandardWorkingdayProfile() {
    return this._canCreateStandardWorkingdayProfile;
  }

  get nonWorkingDays$() {
    return this._nonWorkingDays$;
  }

  get recordsCount$() {
    return this._recordsCount$;
  }

  get nonWorkingDaysDataTableOptions$() {
    return this._nonWorkingDaysDataTableOptions$;
  }

  get loading$() {
    return this._loading$;
  }

  get actions() {
    return this._actions;
  }

  get keys() {
    return this._keys;
  }

  get showStandardNonWorkingDayNotes() {
    return this._showStandardNonWorkingDayNotes;
  }

  get selectedProfilesNotes$() {
    return this._selectedProfilesNotes$;
  }

  get showStandardNonWorkingDayCopy() {
    return this._showStandardNonWorkingDayCopy;
  }

  get standardNonWorkingDayOperationMode() {
    return this._standardNonWorkingDayOperationMode;
  }

  get selectedNonWorkingDayProfile() {
    return this._selectedNonWorkingDayProfile;
  }

  get showStandardNonWorkingDayView() {
    return this._showStandardNonWorkingDayView;
  }

  get selectedNonWorkingDayProfileForView() {
    return this._selectedNonWorkingDayProfileForView;
  }

  get showStandardNonWorkingDayAssign() {
    return this._showStandardNonWorkingDayAssign;
  }

  get selectedNonWorkingDayProfileForAssign() {
    return this._selectedNonWorkingDayProfileForAssign;
  }

  get companyNonWorkingdaysModelName() {
    return this._companyNonWorkingdaysModel.Name;
  }

  get companyNonWorkingdaysModelType() {
    if (!isNullOrUndefined(this._companyNonWorkingdaysModel)) {
      return this._companyNonWorkingdaysModel.IsExample ? 'standard' : 'custom';
    }
    return '';
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
    , private _store: Store<fromRoot.State>
    , private _router: Router
    , private _employeeSearchService: EmployeeSearchService
    ,private _breadcrumbService: BreadcrumbService
  ) {
    super(_localeService, _translationService, _changeDetector);
     let bcItem: IBreadcrumb = new IBreadcrumb(' Standard non-working days and bank holidays',
      'company/non-working-days-and-bank-holidays/standard', BreadcrumbGroup.Company);
    this._breadcrumbService.add(bcItem);

  }
  // End of constructor

  // Private methods  
  private _setActions() {
    // Action buttons    
    this._actions = Immutable.List([
      new AeDataTableAction('View', this._viewStandardNonWorkingDayCommand, false),
      new AeDataTableAction('Assign', this._assignStandardNonWorkingDayCommand, false),
      new AeDataTableAction('Copy and update', this._copyStandardNonWorkingDayCommand, false),
      new AeDataTableAction('View Notes', this._viewStandardNonWorkingDayNotesCommand, false),
    ]);
  }

  onPageChange($event) {
    this._currentStandardNonWorkingApiRequest.PageNumber = $event.pageNumber;
    this._currentStandardNonWorkingApiRequest.PageSize = $event.noOfRows;
    this._store.dispatch(new LoadStandardNonWorkingDaysAction(this._currentStandardNonWorkingApiRequest));
  }
  onSort($event) {
    this._currentStandardNonWorkingApiRequest.SortBy.SortField = $event.SortField;
    this._currentStandardNonWorkingApiRequest.SortBy.Direction = $event.Direction;
    this._store.dispatch(new LoadStandardNonWorkingDaysAction(this._currentStandardNonWorkingApiRequest));
  }
  getStandardNonWorkingdaysSlideoutState() {
    return this._showStandardNonWorkingDayNotes ? 'expanded' : 'collapsed';
  }
  closeStandardNonWorkingDatNotes() {
    this._showStandardNonWorkingDayNotes = false;
    this._userActionMode = "";
  }
  getStandardNonWorkingdaysCopySlideoutState() {
    return this._showStandardNonWorkingDayCopy ? 'expanded' : 'collapsed';
  }
  closeStandardNonWorkingDayCopy() {
    this._showStandardNonWorkingDayCopy = false;
  }
  onStandardProfileCopy(data: NonWorkingdaysModel) {
    data.IsExample = true;// copying the standard working day profile
    this._store.dispatch(new NonWorkingDaysProfileCopyAction(data));
    this._showStandardNonWorkingDayCopy = false;
    this._userActionMode = "";
  }
  getStandardNonWorkingdaysViewSlideoutState() {
    return this._showStandardNonWorkingDayView ? 'expanded' : 'collapsed';
  }
  closeStandardNonWorkingDayView($event) {
    this._showStandardNonWorkingDayView = false;
    this._userActionMode = "";
  }
  getStandardNonWorkingdaysAssignSlideoutState() {
    return this._showStandardNonWorkingDayAssign ? 'expanded' : 'collapsed';
  }
  closeStandardNonWorkingDayAssign($event) {
    this._showStandardNonWorkingDayAssign = false;
    this._userActionMode = "";
  }
  saveNonWorkingDaysProfileAssignment(assignmentModel: HWPAssignToModel) {
    //here need to despatch the event to store the assignment 
    this._showStandardNonWorkingDayAssign = false;
    this._store.dispatch(new NonWorkingDaysAssignSaveAction(assignmentModel));
    this._userActionMode = "";
  }
  addStandardProfile($event) {
    let navigationExtras: NavigationExtras = {
      queryParamsHandling: 'merge'
    };
    this._router.navigate(['/company/non-working-days-and-bank-holiday/add/standard'], navigationExtras);
  }

  canCompanyDefaultProfileMsgShown(): boolean {
    return this._companyNonWorkingdaysModel && this._companyNonWorkingdaysModel.IsExample;
  }
  isDefaultProfile(item: NonWorkingdaysModel) {
    if (item)
      return item.CompanyNonWorkingDaysId == item.Id;
    return false;
  }
  // End of private methods

  // Public methods
  ngOnInit() {
    super.ngOnInit();
    this._setActions();

    this._canCreateStandardWorkingdayProfile = this._claimsHelper.canManagePredefinedWorkingdayProfile();

    //raise api call to get the standard list.. before that we should know about the company default profile id to be set, this is done in container       
    //this._companyNonWorkingDay$ = 
    this._companyNonWorkingDaySub = this._store.let(fromRoot.getCompanyNonWorkingDayData).subscribe((companyNwD) => {
      this._companyNonWorkingdaysModel = companyNwD;
    });
    //standard working day profiles code will go here
    this._nonWorkingDays$ = this._store.let(fromRoot.getStandardNonWorkingDaysData);
    this._recordsCount$ = this._store.let(fromRoot.getStandardNonWorkingDaysTotalCountData);
    this._nonWorkingDaysDataTableOptions$ = this._store.let(fromRoot.getStandardNonWorkingdaysDataTableOptionsData);
    this._loading$ = this._store.let(fromRoot.getHasStandardNonWorkingdaysLoadedData);
    this._selectedProfilesNotes$ = this._store.let(fromRoot.getSelectedProfileNotesData);

    this._getHasSelectedProfileFullEntityDataSub = this._store.let(fromRoot.getHasSelectedProfileFullEntityData).subscribe((fullentity) => {
      this._selectedNonWorkingDayProfileForView = fullentity;
      this._selectedNonWorkingDayProfileForAssign = fullentity;
    });



    this._selectedProfilNotesLoadedSub = this._store.let(fromRoot.getHasSelectedProfileNotesLoadedData).subscribe((notesLoaded) => {
      if (notesLoaded && this._userActionMode == "viewnotes")
        this._showStandardNonWorkingDayNotes = true;
    });

    this._selectedNonWorkingDayProfileViewSub = this._store.let(fromRoot.getHasSelectedProfileFullEntityLoadedData).subscribe((fullEntityLoaded) => {
      if (fullEntityLoaded && this._userActionMode == "view")
        this._showStandardNonWorkingDayView = true;
      else if (fullEntityLoaded && this._userActionMode == "assign")
        this._showStandardNonWorkingDayAssign = true;
    });

    this._nonWokingDaysApiRequestSub = this._store.let(fromRoot.getStandardNonWorkingDaysApiRequestData).combineLatest(this._store.let(fromRoot.getHasCompanyNonWorkingdaysLoadedData), (initialRequest$, companyNonWorkingDay$) => {
      return { savedRequest: initialRequest$, companyNonWorkingDay: companyNonWorkingDay$ };
    }).subscribe((vl) => {
      if (vl.companyNonWorkingDay) {
        //only after company non working day is loaded, now check for the existing api request , if null then form a new api request object or else raise with that api request object..                 
        if (!isNullOrUndefined(vl.savedRequest)) {
          Object.assign(this._currentStandardNonWorkingApiRequest, vl.savedRequest);
        }
        if (this._isFirstTimeLoad) {
          this._isFirstTimeLoad = false;
          this._store.dispatch(new LoadStandardNonWorkingDaysAction(this._currentStandardNonWorkingApiRequest));
        }
      }
    });
    //when filters changed from container, raise API call to get the data again
    this._getHasFiltersChangedDataSub = this._store.let(fromRoot.getHasFiltersChangedData).subscribe((filtersChanged) => {
      if (filtersChanged) {
        this._store.dispatch(new LoadStandardNonWorkingDaysAction(this._currentStandardNonWorkingApiRequest));
      }
    });

    this._nonWokingDaysOnlyApiRequestSub = this._store.let(fromRoot.getStandardNonWorkingDaysApiRequestData).subscribe(apiRequest => {
      this._nonWokingDaysApiRequest = apiRequest;
    });

    this._copiedNonWorkingDayProfileIdSub = this._store.let(fromRoot.getCopiedWorkingdayProfileData).subscribe(copiedId => {
      if (copiedId) {
        let navigationExtras: NavigationExtras = {
          queryParamsHandling: 'merge'
        };
        this._router.navigate(['/company/non-working-days-and-bank-holiday/update/custom/' + copiedId], navigationExtras);
      }
    });

    //commands
    this._viewStandardNonWorkingDayNotesCmdSub = this._viewStandardNonWorkingDayNotesCommand.subscribe((item: NonWorkingdaysModel) => {
      //since this is routable component , there will notbe any container component to capture the emmited event so handling all commands functionality in this component
      //despatch the action to load the selected profile notes.
      this._store.dispatch(new LoadSelectedProfileNotesAction(item.Id));
      this._userActionMode = "viewnotes";
    });

    this._copyStandardNonWorkingDayCmdSub = this._copyStandardNonWorkingDayCommand.subscribe((item: NonWorkingdaysModel) => {
      //since this is routable component , there will notbe any container component to capture the emmited event so handling all commands functionality in this component
      this._selectedNonWorkingDayProfile = item;
      this._showStandardNonWorkingDayCopy = true;
      this._userActionMode = "copy";
    });

    this._assignStandardNonWorkingDayCmdSub = this._assignStandardNonWorkingDayCommand.subscribe((item: NonWorkingdaysModel) => {
      //since this is routable component , there will notbe any container component to capture the emmited event so handling all commands functionality in this component
      this._userActionMode = "assign";
      if (isNullOrUndefined(this._selectedNonWorkingDayProfileForAssign) || this._selectedNonWorkingDayProfileForAssign.Id != item.Id) {
        //state item is not matching with selected item then despatch action to load new full entity..
        this._store.dispatch(new LoadSelectedNonWorkingDaysProfileAction(item));
      }
      else {
        this._showStandardNonWorkingDayAssign = true;
        //the selected item already exists in the state so directly we can open the slide since we have already subscribed in ngOnitThe value.
      }
    });

    this._viewStandardNonWorkingDayCmdSub = this._viewStandardNonWorkingDayCommand.subscribe((item: NonWorkingdaysModel) => {
      this._userActionMode = "view";
      //since this is routable component , there will notbe any container component to capture the emmited event so handling all commands functionality in this component
      if (isNullOrUndefined(this._selectedNonWorkingDayProfileForView) || this._selectedNonWorkingDayProfileForView.Id != item.Id) {
        //state item is not matching with selected item then despatch action to load new full entity..
        this._store.dispatch(new LoadSelectedNonWorkingDaysProfileAction(item));
      }
      else {
        this._showStandardNonWorkingDayView = true;
        //the selected item already exists in the state so directly we can open the slide since we have already subscribed in ngOnitThe value.
      }
    });
    //end of commands
  }
  /**
  * Member to assign icon size
  * 
  * @type {AeIconSize}
  * @memberOf AeNotificationComponent
  */
  iconMedium: AeIconSize = AeIconSize.medium;
  // End of Private Fields

  ngOnDestroy() {
    //super.ngOnDestroy();
    if (this._nonWokingDaysApiRequestSub)
      this._nonWokingDaysApiRequestSub.unsubscribe();

    if (this._companyNonWorkingDaySub)
      this._companyNonWorkingDaySub.unsubscribe();

    if (this._getHasSelectedProfileFullEntityDataSub)
      this._getHasSelectedProfileFullEntityDataSub.unsubscribe()

    if (this._getHasFiltersChangedDataSub)
      this._getHasFiltersChangedDataSub.unsubscribe()

    if (this._nonWokingDaysOnlyApiRequestSub)
      this._nonWokingDaysOnlyApiRequestSub.unsubscribe();

    if (this._selectedProfilNotesLoadedSub)
      this._selectedProfilNotesLoadedSub.unsubscribe();

    if (this._selectedNonWorkingDayProfileViewSub)
      this._selectedNonWorkingDayProfileViewSub.unsubscribe();

    if (this._viewStandardNonWorkingDayNotesCmdSub)
      this._viewStandardNonWorkingDayNotesCmdSub.unsubscribe();

    if (this._copyStandardNonWorkingDayCmdSub)
      this._copyStandardNonWorkingDayCmdSub.unsubscribe();

    if (this._assignStandardNonWorkingDayCmdSub)
      this._assignStandardNonWorkingDayCmdSub.unsubscribe();

    if (this._viewStandardNonWorkingDayCmdSub)
      this._viewStandardNonWorkingDayCmdSub.unsubscribe();

    if (this._copiedNonWorkingDayProfileIdSub)
      this._copiedNonWorkingDayProfileIdSub.unsubscribe();
  }
  // End of public methods

}
