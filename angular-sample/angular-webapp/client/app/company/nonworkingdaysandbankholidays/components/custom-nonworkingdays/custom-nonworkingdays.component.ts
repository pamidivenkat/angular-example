import { isNullOrUndefined } from 'util';
import { AeDataTableAction } from './../../../../atlas-elements/common/models/ae-data-table-action';
import { StringHelper } from './../../../../shared/helpers/string-helper';
import { DataTableOptions } from './../../../../atlas-elements/common/models/ae-datatable-options';
import { NonWorkingdaysModel, HWPAssignToModel } from './../../models/nonworkingdays-model';
import { SortDirection } from '../../../../atlas-elements/common/models/ae-sort-model';
import { AtlasApiRequestWithParams, AtlasParams } from './../../../../shared/models/atlas-api-response';
import { LoadStandardNonWorkingDaysAction, LoadCustomNonWorkingDaysAction, NonWorkingDaysProfileCopyAction, NonWorkingDaysAssignSaveAction, LoadSelectedNonWorkingDaysProfileAction, NonWorkingDaysRemoveAction } from './../../actions/nonworkingdays-actions';
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
import { AeClassStyle } from "../../../../atlas-elements/common/ae-class-style.enum";
import { IBreadcrumb } from '../../../../atlas-elements/common/models/ae-ibreadcrumb.model';
import { BreadcrumbService } from './../../../../atlas-elements/common/services/breadcrumb-service';
import { BreadcrumbGroup } from '../../../../atlas-elements/common/models/ae-breadcrumb-group';

@Component({
  selector: 'custom-nonworkingdays',
  templateUrl: './custom-nonworkingdays.component.html',
  styleUrls: ['./custom-nonworkingdays.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class CustomNonworkingdaysComponent extends BaseComponent implements OnInit, OnDestroy {

  // Private Fields 
  private _companyNonWorkingDayLoaded: Subscription;
  private _selectedCountryId: string;
  private _nonWorkingDays$: Observable<Immutable.List<NonWorkingdaysModel>>;
  private _recordsCount$: Observable<number>;
  private _loading$: Observable<boolean>;
  private _nonWorkingDaysDataTableOptions$: Observable<DataTableOptions>;
  private _companyNonWorkingDaySub: Subscription;
  private _actions: Immutable.List<AeDataTableAction>;

  private _copyCustomNonWorkingDayCommand = new Subject();
  private _assignCustomNonWorkingDayCommand = new Subject();
  private _removeCustomNonWorkingDayCommand = new Subject();
  private _updateCustomNonWorkingDayCommand = new Subject();
  private _viewCustomNonWorkingDayCommand = new Subject();

  private _copyCustomNonWorkingDayCmdSub: Subscription;
  private _assignCustomNonWorkingDayCmdSub: Subscription;
  private _removeCustomNonWorkingDayCmdSub: Subscription;
  private _updateCustomNonWorkingDayCmdSub: Subscription;
  private _viewCustomNonWorkingDayCmdSub: Subscription;

  private _keys = Immutable.List(['Id', 'Name', 'Description', 'CountryName', 'IsExample', 'CompanyNonWorkingDaysId']);
  private _nonWokingDaysApiRequest: AtlasApiRequestWithParams;
  private _nonWokingDaysApiRequestSub: Subscription;
  private _isFirstTimeLoad: boolean = true;
  private _currentCustomNonWorkingApiRequest: AtlasApiRequestWithParams = new AtlasApiRequestWithParams(1, 10, 'Name', SortDirection.Ascending, [new AtlasParams('CountryId', !StringHelper.isNullOrUndefinedOrEmpty(this._selectedCountryId) ? this._selectedCountryId : '00000000-0000-0000-0000-000000000000')]);
  private _companyNonWorkingdaysModel: NonWorkingdaysModel;

  private _showCustomNonWorkingDayCopy: boolean = false;
  private _selectedNonWorkingDayProfile: NonWorkingdaysModel;
  private _customNonWorkingDayOperationMode: NonworkingdaysOperationmode
  private _showCustomNonWorkingDayView: boolean;
  private _selectedNonWorkingDayProfileForView: NonWorkingdaysModel
  private _selectedNonWorkingDayProfileViewSub: Subscription;
  private _selectedNonWorkingDayProfileForAssign: NonWorkingdaysModel;
  private _showCustomNonWorkingDayAssign: boolean;
  private _userActionMode: string = "";
  private _showCustomNonWorkingDayRemove: boolean = false;
  private _getHasSelectedProfileFullEntityDataSub: Subscription;
  private _nonWokingDaysOnlyApiRequestSub: Subscription;
  private _getHasFiltersChangedDataSub: Subscription;
  private _copiedNonWorkingDayProfileIdSub: Subscription;
  private _lightClass: AeClassStyle = AeClassStyle.Light;
  // End of Private Fields

  // Public properties
  get lightClass() {
    return this._lightClass;
  }

  get nonWorkingDayProfileName() {
    return this._selectedNonWorkingDayProfile.Name;
  }

  get nonWorkingdaysModelName() {
    if (!isNullOrUndefined(this._companyNonWorkingdaysModel)) {
      return this._companyNonWorkingdaysModel.Name;
    }
    return '';
  }

  get nonWorkingdaysModelType() {
    if (!isNullOrUndefined(this._companyNonWorkingdaysModel)) {
      return this._companyNonWorkingdaysModel.IsExample ? 'standard' : 'custom';
    }
    return '';
  }

  get recordsCount$() {
    return this._recordsCount$;
  }

  get nonWorkingDaysDataTableOptions$() {
    return this._nonWorkingDaysDataTableOptions$;
  }

  get nonWorkingDays$() {
    return this._nonWorkingDays$;
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

  get showCustomNonWorkingDayCopy() {
    return this._showCustomNonWorkingDayCopy;
  }

  get selectedNonWorkingDayProfile() {
    return this._selectedNonWorkingDayProfile;
  }

  get customNonWorkingDayOperationMode() {
    return this._customNonWorkingDayOperationMode;
  }

  get showCustomNonWorkingDayRemove() {
    return this._showCustomNonWorkingDayRemove;
  }

  get selectedNonWorkingDayProfileForView() {
    return this._selectedNonWorkingDayProfileForView;
  }

  get showCustomNonWorkingDayView() {
    return this._showCustomNonWorkingDayView;
  }

  get selectedNonWorkingDayProfileForAssign() {
    return this._selectedNonWorkingDayProfileForAssign;
  }

  get showCustomNonWorkingDayAssign() {
    return this._showCustomNonWorkingDayAssign;
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
    ,private _breadcrumbService: BreadcrumbService
  ) {
    super(_localeService, _translationService, _changeDetector);
let bcItem: IBreadcrumb = new IBreadcrumb(' Custom non-working days and bank holidays',
      'company/non-working-days-and-bank-holidays/custom', BreadcrumbGroup.Company);
    this._breadcrumbService.add(bcItem);
  }
  // End of constructor

  // Private methods 
  private _setActions() {
    // Action buttons

    this._actions = Immutable.List([
      new AeDataTableAction('View', this._viewCustomNonWorkingDayCommand, false),
      new AeDataTableAction('Assign', this._assignCustomNonWorkingDayCommand, false),
      new AeDataTableAction('Copy', this._copyCustomNonWorkingDayCommand, false),
      new AeDataTableAction('Update', this._updateCustomNonWorkingDayCommand, false),
      new AeDataTableAction('Remove', this._removeCustomNonWorkingDayCommand, false),
    ]);

  }
  onPageChange($event) {
    this._currentCustomNonWorkingApiRequest.PageNumber = $event.pageNumber;
    this._currentCustomNonWorkingApiRequest.PageSize = $event.noOfRows;
    this._store.dispatch(new LoadCustomNonWorkingDaysAction(this._currentCustomNonWorkingApiRequest));
  }
  onSort($event) {
    this._currentCustomNonWorkingApiRequest.SortBy.SortField = $event.SortField;
    this._currentCustomNonWorkingApiRequest.SortBy.Direction = $event.Direction;
    this._store.dispatch(new LoadCustomNonWorkingDaysAction(this._currentCustomNonWorkingApiRequest));
  }

  addCustomWorkingProfile($event) {
    let navigationExtras: NavigationExtras = {
      queryParamsHandling: 'merge'
    };
    this._router.navigate(['/company/non-working-days-and-bank-holiday/add/custom'], navigationExtras);
  }

  getCustomNonWorkingdaysCopySlideoutState() {
    return this._showCustomNonWorkingDayCopy ? 'expanded' : 'collapsed';
  }
  closeCustomNonWorkingDayCopy() {
    this._showCustomNonWorkingDayCopy = false;
  }
  onCustomProfileCopy(data: NonWorkingdaysModel) {
    data.IsExample = false;// copying the standard working day profile
    this._store.dispatch(new NonWorkingDaysProfileCopyAction(data));
    this._showCustomNonWorkingDayCopy = false;
    this._userActionMode = "";
  }
  getCustomNonWorkingdaysViewSlideoutState() {
    return this._showCustomNonWorkingDayView ? 'expanded' : 'collapsed';
  }
  closeCustomNonWorkingDayView($event) {
    this._showCustomNonWorkingDayView = false;
    this._userActionMode = "";
  }
  getCustomNonWorkingdaysAssignSlideoutState() {
    return this._showCustomNonWorkingDayAssign ? 'expanded' : 'collapsed';
  }
  closeCustomNonWorkingDayAssign($event) {
    this._showCustomNonWorkingDayAssign = false;
    this._userActionMode = "";
  }
  saveNonWorkingDaysProfileAssignment(assignmentModel: HWPAssignToModel) {
    //here need to despatch the event to store the assignment 
    this._showCustomNonWorkingDayAssign = false;
    this._store.dispatch(new NonWorkingDaysAssignSaveAction(assignmentModel));
    this._userActionMode = "";
  }
  removeConfirmModalClosed($event) {
    if ($event == 'yes') {
      //despatch action to remove the selected item for removal
      this._store.dispatch(new NonWorkingDaysRemoveAction(this._selectedNonWorkingDayProfile));
    }
    this._showCustomNonWorkingDayRemove = false;
  }
  canCompanyDefaultProfileMsgShown(): boolean {
    return this._companyNonWorkingdaysModel && !this._companyNonWorkingdaysModel.IsExample;
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
    //raise api call to get the standard list.. before that we should know about the company default profile id to be set, this is done in container           
    this._companyNonWorkingDaySub = this._store.let(fromRoot.getCompanyNonWorkingDayData).subscribe((companyNwD) => {
      this._companyNonWorkingdaysModel = companyNwD;
    });
    this._nonWorkingDays$ = this._store.let(fromRoot.getCustomNonWorkingDaysData);
    this._recordsCount$ = this._store.let(fromRoot.getCustomNonWorkingDaysTotalCountData);
    this._nonWorkingDaysDataTableOptions$ = this._store.let(fromRoot.getCustomNonWorkingdaysDataTableOptionsData);
    this._loading$ = this._store.let(fromRoot.getHasCustomNonWorkingdaysLoadedData);

    this._getHasSelectedProfileFullEntityDataSub = this._store.let(fromRoot.getHasSelectedProfileFullEntityData).subscribe((fullentity) => {
      this._selectedNonWorkingDayProfileForView = fullentity;
      this._selectedNonWorkingDayProfileForAssign = fullentity;
    });


    this._selectedNonWorkingDayProfileViewSub = this._store.let(fromRoot.getHasSelectedProfileFullEntityLoadedData).subscribe((fullEntityLoaded) => {
      if (fullEntityLoaded && this._userActionMode == "view")
        this._showCustomNonWorkingDayView = true;
      else if (fullEntityLoaded && this._userActionMode == "assign")
        this._showCustomNonWorkingDayAssign = true;
    });

    this._nonWokingDaysApiRequestSub = this._store.let(fromRoot.getCustomNonWorkingDaysApiRequestData).combineLatest(this._store.let(fromRoot.getHasCompanyNonWorkingdaysLoadedData), (initialRequest$, companyNonWorkingDay$) => {
      return { savedRequest: initialRequest$, companyNonWorkingDay: companyNonWorkingDay$ };
    }).subscribe((vl) => {
      if (vl.companyNonWorkingDay) {
        //only after company non working day is loaded, now check for the existing api request , if null then form a new api request object or else raise with that api request object..                 
        if (!isNullOrUndefined(vl.savedRequest)) {
          Object.assign(this._currentCustomNonWorkingApiRequest, vl.savedRequest);
        }
        if (this._isFirstTimeLoad) {
          this._isFirstTimeLoad = false;
          this._store.dispatch(new LoadCustomNonWorkingDaysAction(this._currentCustomNonWorkingApiRequest));
        }
      }
    });
    //when filters changed from container, raise API call to get the data again
    this._getHasFiltersChangedDataSub = this._store.let(fromRoot.getHasFiltersChangedData).subscribe((filtersChanged) => {
      if (filtersChanged) {
        this._store.dispatch(new LoadCustomNonWorkingDaysAction(this._currentCustomNonWorkingApiRequest));
      }
    });


    this._nonWokingDaysOnlyApiRequestSub = this._store.let(fromRoot.getCustomNonWorkingDaysApiRequestData).subscribe(apiRequest => {
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

    this._copyCustomNonWorkingDayCmdSub = this._copyCustomNonWorkingDayCommand.subscribe((item: NonWorkingdaysModel) => {
      //since this is routable component , there will notbe any container component to capture the emmited event so handling all commands functionality in this component
      this._selectedNonWorkingDayProfile = item;
      this._showCustomNonWorkingDayCopy = true;
    });

    this._assignCustomNonWorkingDayCmdSub = this._assignCustomNonWorkingDayCommand.subscribe((item: NonWorkingdaysModel) => {
      //since this is routable component , there will notbe any container component to capture the emmited event so handling all commands functionality in this component
      this._userActionMode = "assign";
      if (isNullOrUndefined(this._selectedNonWorkingDayProfileForAssign) || this._selectedNonWorkingDayProfileForAssign.Id != item.Id) {
        //state item is not matching with selected item then despatch action to load new full entity..
        this._store.dispatch(new LoadSelectedNonWorkingDaysProfileAction(item));
      }
      else {
        this._showCustomNonWorkingDayAssign = true;
        //the selected item already exists in the state so directly we can open the slide since we have already subscribed in ngOnitThe value.
      }
    });

    this._removeCustomNonWorkingDayCmdSub = this._removeCustomNonWorkingDayCommand.subscribe((item: NonWorkingdaysModel) => {
      //since this is routable component , there will notbe any container component to capture the emmited event so handling all commands functionality in this component
      //this.assignStandardNonWorkingDay.emit(item);
      this._showCustomNonWorkingDayRemove = true;
      this._selectedNonWorkingDayProfile = item;
    });

    this._updateCustomNonWorkingDayCmdSub = this._updateCustomNonWorkingDayCommand.subscribe((item: NonWorkingdaysModel) => {
      //since this is routable component , there will notbe any container component to capture the emmited event so handling all commands functionality in this component
      //this.assignStandardNonWorkingDay.emit(item);
      let navigationExtras: NavigationExtras = {
        queryParamsHandling: 'merge'
      };
      this._router.navigate(['/company/non-working-days-and-bank-holiday/update/custom/' + item.Id], navigationExtras);
    });

    this._viewCustomNonWorkingDayCmdSub = this._viewCustomNonWorkingDayCommand.subscribe((item: NonWorkingdaysModel) => {
      this._userActionMode = "view";
      //since this is routable component , there will notbe any container component to capture the emmited event so handling all commands functionality in this component
      if (isNullOrUndefined(this._selectedNonWorkingDayProfileForView) || this._selectedNonWorkingDayProfileForView.Id != item.Id) {
        //state item is not matching with selected item then despatch action to load new full entity..
        this._store.dispatch(new LoadSelectedNonWorkingDaysProfileAction(item));
      }
      else {
        this._showCustomNonWorkingDayView = true;
        //the selected item already exists in the state so directly we can open the slide since we have already subscribed in ngOnitThe value.
      }
    });
    //end of commands
  }
  ngOnDestroy() {
    //super.ngOnDestroy();
    if (this._nonWokingDaysApiRequestSub)
      this._nonWokingDaysApiRequestSub.unsubscribe();

    if (this._selectedNonWorkingDayProfileViewSub)
      this._selectedNonWorkingDayProfileViewSub.unsubscribe();

    if (this._companyNonWorkingDaySub)
      this._companyNonWorkingDaySub.unsubscribe();

    if (this._getHasSelectedProfileFullEntityDataSub)
      this._getHasSelectedProfileFullEntityDataSub.unsubscribe();

    if (this._nonWokingDaysOnlyApiRequestSub)
      this._nonWokingDaysOnlyApiRequestSub.unsubscribe();

    if (this._getHasFiltersChangedDataSub)
      this._getHasFiltersChangedDataSub.unsubscribe();

    if (this._copyCustomNonWorkingDayCmdSub)
      this._copyCustomNonWorkingDayCmdSub.unsubscribe();

    if (this._assignCustomNonWorkingDayCmdSub)
      this._assignCustomNonWorkingDayCmdSub.unsubscribe();

    if (this._removeCustomNonWorkingDayCmdSub)
      this._removeCustomNonWorkingDayCmdSub.unsubscribe();

    if (this._updateCustomNonWorkingDayCmdSub)
      this._updateCustomNonWorkingDayCmdSub.unsubscribe();

    if (this._viewCustomNonWorkingDayCmdSub)
      this._viewCustomNonWorkingDayCmdSub.unsubscribe();

    if (this._copiedNonWorkingDayProfileIdSub)
      this._copiedNonWorkingDayProfileIdSub.unsubscribe();
  }
  // End of public methods

}
