import { EmployeeSecurityService } from './../../services/employee-security-service';
import { EmployeeBankDetailsByIdLoadAction, EmployeeBankDetailsDeleteAction } from './../../actions/employee.actions';
import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef, Output, EventEmitter } from '@angular/core';
import { BaseComponent } from '../../../shared/base-component';
import { LocaleService, TranslationService } from "angular-l10n";
import { Store } from "@ngrx/store";
import { Router, ActivatedRoute } from "@angular/router";
import { ClaimsHelperService } from '../../../shared/helpers/claims-helper';
import * as fromRoot from '../../../shared/reducers';
import * as Immutable from 'immutable';
import { BankDetails } from "../../../employee/models/bank-details";
import { Observable, Subscription, BehaviorSubject } from "rxjs/Rx";
import { AtlasParams, AtlasApiRequestWithParams } from './../../../shared/models/atlas-api-response';
import { AeDataTableAction } from "./../../../atlas-elements/common/models/ae-data-table-action";
import { EmployeeBankDetailsListLoadAction, EmployeeBankDetailsUpdateAction, EmployeeBankDetailsAddAction } from "../../../employee/actions/employee.actions";
import { SortDirection, AeSortModel } from '../../../atlas-elements/common/models/ae-sort-model';
import { isNullOrUndefined } from "util";
import { AeClassStyle } from './../../../atlas-elements/common/ae-class-style.enum';
import { County, Country } from './../../../shared/models/lookup.models';
import { CountyLoadAction, CountryLoadAction } from './../../../shared/actions/lookup.actions';
@Component({
  selector: 'bank-container',
  templateUrl: './bank-container.component.html',
  styleUrls: ['./bank-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class BankContainerComponent extends BaseComponent implements OnInit, OnDestroy {
  // Private Fields
  private _pageNumber: number = 1;
  private _pageSize: number = 10;
  private _sortField: string = 'AccountName';
  private _sortDirection: SortDirection = SortDirection.Ascending;
  private _showEmployeeBankDetailsAddUpdateForm: boolean = false;
  private _operationMode: string = "add";
  private _lightClass: AeClassStyle = AeClassStyle.Light;
  private _county$: Observable<County[]>;
  private _country$: Observable<Country[]>;
  private _countyDataLoaded$: Observable<boolean>
  private _countyDataLoadedSubscription: Subscription;
  private _countryDataLoaded$: Observable<boolean>
  private _countryDataLoadedSubscription: Subscription;
  private _bankDetailsListLoaded$: Observable<boolean>
  private _bankDetailsListLoadedSubscription: Subscription;
  private _showRemoveDialog: boolean = false;
  private _selectedBankdetails: BankDetails = new BankDetails();
  private _currentEmployeeBankDetailsSubscription: Subscription;
  private _canUpdate$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private _employeeStateSub: Subscription;
  // End of private Fields

  //Public Properties 
  get canUpdate$(): BehaviorSubject<boolean> {
    return this._canUpdate$;
  }
  get lightClass(): AeClassStyle {
    return this._lightClass;
  }
  get showEmployeeBankDetailsAddUpdateForm(): boolean {
    return this._showEmployeeBankDetailsAddUpdateForm;
  }
  get county$(): Observable<County[]> {
    return this._county$;
  }
  get country$(): Observable<Country[]> {
    return this._country$;
  }
  get operationMode(): string {
    return this._operationMode;
  }
  get selectedBankdetails(): BankDetails {
    return this._selectedBankdetails;
  }
  get showRemoveDialog(): boolean {
    return this._showRemoveDialog;
  }
  //End of Public properties

  //constructor start
  /**
   * Creates an instance of BankContainerComponent.
   * @param {LocaleService} _localeService 
   * @param {TranslationService} _translationService 
   * @param {ChangeDetectorRef} _changeDetectordRef 
   * @param {Store<fromRoot.State>} _store 
   * @param {ClaimsHelperService} _claimsHelper 
   * 
   * @memberOf EmployeeContainerComponent
   */
  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _changeDetectordRef: ChangeDetectorRef
    , private _store: Store<fromRoot.State>
    , private _claimsHelper: ClaimsHelperService
    , private _employeeSecurityService: EmployeeSecurityService
    , private _activatedRoute: ActivatedRoute
  ) {
    super(_localeService, _translationService, _changeDetectordRef);
  }
  //end of constructor

  //private function
  private _canAddBankDetails() {
    const statePersonal = this._store.let(fromRoot.getEmployeePersonalData);
    this._employeeStateSub = statePersonal.subscribe((val) => {
      if (val) {
        this._canUpdate$.next(this._employeeSecurityService.CanUpdateBank(val.Id));
      }
    });
  }
  private _loadMasterDataRelatedToAddUpdate() {
    this._countyDataLoadedSubscription = this._countyDataLoaded$.subscribe(countyLoaded => {
      if (!countyLoaded)
        this._store.dispatch(new CountyLoadAction(null));
    });
    this._countryDataLoadedSubscription = this._countyDataLoaded$.subscribe(countryLoaded => {
      if (!countryLoaded)
        this._store.dispatch(new CountryLoadAction(null));
    });
  }
  //end of private functions

  //public method start
  ngOnInit() {
    this._canAddBankDetails();
    this._countyDataLoaded$ = this._store.let(fromRoot.getCountyLoadingState);
    this._countryDataLoaded$ = this._store.let(fromRoot.getCountryLoadingState);
    this._county$ = this._store.let(fromRoot.getCountyData);
    this._country$ = this._store.let(fromRoot.getCountryData);
    this._bankDetailsListLoaded$ = this._store.let(fromRoot.getEmployeeBankDetailsListLoadingState);
    this._bankDetailsListLoadedSubscription = this._bankDetailsListLoaded$.subscribe(bankDetailsListLoaded => {
      if (!bankDetailsListLoaded) {
        let atlasParams: AtlasParams[] = new Array();
        atlasParams.push(new AtlasParams("EmployeeId", this._claimsHelper.getEmpId()));
        this._store.dispatch(new EmployeeBankDetailsListLoadAction(new AtlasApiRequestWithParams(this._pageNumber, this._pageSize, this._sortField, this._sortDirection, atlasParams)));
      }
    });
    // for update
    this._currentEmployeeBankDetailsSubscription = this._store.select(details => details.employeeState.CurrentBankDetails).subscribe(details => {
      if (!isNullOrUndefined(details)) {
        this._selectedBankdetails = details;
        if (this._operationMode == "update")
          this._showEmployeeBankDetailsAddUpdateForm = true;
      }
    });
  }

  ngOnDestroy() {
    if (this._employeeStateSub) {
      this._employeeStateSub.unsubscribe();
    }
    if (this._countyDataLoadedSubscription)
      this._countyDataLoadedSubscription.unsubscribe();
    if (this._countryDataLoadedSubscription)
      this._countryDataLoadedSubscription.unsubscribe();
    if (this._bankDetailsListLoadedSubscription)
      this._bankDetailsListLoadedSubscription.unsubscribe();

    if (this._currentEmployeeBankDetailsSubscription)
      this._currentEmployeeBankDetailsSubscription.unsubscribe();
  }
  openEmployeeBankDetailsAddUpdateForm(e) {
    this._loadMasterDataRelatedToAddUpdate();
    this._selectedBankdetails = new BankDetails();
    this._showEmployeeBankDetailsAddUpdateForm = true;
    this._operationMode = "add";
  }
  onGridPaging($event) {
    this._pageNumber = $event.pageNumber;
    this._pageSize = $event.noOfRows;
    let atlasParams: AtlasParams[] = new Array();
    atlasParams.push(new AtlasParams("EmployeeId", this._claimsHelper.getEmpId()));
    this._store.dispatch(new EmployeeBankDetailsListLoadAction(new AtlasApiRequestWithParams(this._pageNumber, this._pageSize, this._sortField, this._sortDirection, atlasParams)));
  }
  onGridSorting($event: AeSortModel) {
    this._sortField = $event.SortField;
    this._sortDirection = $event.Direction;
    let atlasParams: AtlasParams[] = new Array();
    atlasParams.push(new AtlasParams("EmployeeId", this._claimsHelper.getEmpId()));
    this._store.dispatch(new EmployeeBankDetailsListLoadAction(new AtlasApiRequestWithParams(this._pageNumber, this._pageSize, this._sortField, this._sortDirection, atlasParams)));
  }
  onBankDetailsSelect(dataToUpdate: BankDetails) {
    //fired from the grid
    this._selectedBankdetails = dataToUpdate; //below action is required to load the full entity
    this._operationMode = "update";
    this._loadMasterDataRelatedToAddUpdate();
    this._store.dispatch(new EmployeeBankDetailsByIdLoadAction({ EmployeeBankDetailsId: this._selectedBankdetails.Id }));
  }
  onBankDetailsDeleteSelect(dataToDelete: BankDetails) {
    this._selectedBankdetails = dataToDelete;
    this._operationMode = "delete";
    this._showRemoveDialog = true;
  }
  closeEmployeeBankDetailsAddUpdateForm(e) {
    this._showEmployeeBankDetailsAddUpdateForm = false;
  }
  getEmployeeBankDetailsSlideoutState(): string {
    return this._showEmployeeBankDetailsAddUpdateForm ? 'expanded' : 'collapsed';
  }
  onBankDetailsUpdate(dataToUpdate: BankDetails) {
    this._showEmployeeBankDetailsAddUpdateForm = false;
    this._store.dispatch(new EmployeeBankDetailsUpdateAction(dataToUpdate));
  }
  onBankDetailsAdd(dataToSave: BankDetails) {
    this._showEmployeeBankDetailsAddUpdateForm = false;
    this._store.dispatch(new EmployeeBankDetailsAddAction(dataToSave));
  }
  modalClosed(option) {
    if (option == 'yes') {
      this._store.dispatch(new EmployeeBankDetailsDeleteAction(this._selectedBankdetails));
    }
    this._showRemoveDialog = false;
    this._selectedBankdetails = null;
  }
  onAddOrUpdateCancel(event: any) {
    this._showEmployeeBankDetailsAddUpdateForm = false;
  }
  //End of public methods

}
