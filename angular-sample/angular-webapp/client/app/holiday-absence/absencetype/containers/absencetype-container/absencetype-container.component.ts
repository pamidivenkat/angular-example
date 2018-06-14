import { AeClassStyle } from '../../../../atlas-elements/common/ae-class-style.enum';
import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef, Input } from '@angular/core';
import { LocaleService, Localization, TranslationService } from 'angular-l10n';
import { Store } from '@ngrx/store';
import { Observable, Subject, Subscription } from 'rxjs/Rx';
import { ClaimsHelperService } from './../../../../shared/helpers/claims-helper';
import * as fromRoot from './../../../../shared/reducers/index';
import { BaseComponent } from './../../../../shared/base-component';
import { AbsenceTypeAddAction, AbsenceTypeByIdLoadAction, AbsenceTypeUpdateAction, AbsenceTypeDeleteAction } from "./../../actions/absencetype.actions";
import { BreadcrumbGroup } from '../../../../atlas-elements/common/models/ae-breadcrumb-group';
import { LoadAbsenceTypeAction, LoadAbsenceTypeListDataAction } from './../../../../shared/actions/company.actions';

import { AbsenceType } from './../../../../shared/models/company.models';
import { AbsenceCode } from './../../../../shared/models/lookup.models';
import { isNullOrUndefined } from 'util';
import { SortDirection, AeSortModel } from './../../../../atlas-elements/common/models/ae-sort-model';
import { AtlasParams, AtlasApiRequestWithParams } from './../../../../shared/models/atlas-api-response';
import {
  LoadAbsenceCodeAction
} from '../../../../shared/actions/lookup.actions';

@Component({
  selector: 'absencetype-container',
  templateUrl: './absencetype-container.component.html',
  styleUrls: ['./absencetype-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AbsencetypeContainerComponent extends BaseComponent implements OnInit, OnDestroy {

  // Private Fields
  private _pageNumber: number = 1;
  private _pageSize: number = 10;
  private _sortField: string = 'TypeName';
  private _sortDirection: SortDirection = SortDirection.Descending;
  private _showAbsencetypeAddUpdateForm: boolean = false;
  private _absenceCodesSubscription: Subscription;
  private _absenceCodes$: Observable<AbsenceCode[]>;
  private _absenceCodesLoaded$: Observable<boolean>;
  private _selectedAbsenceType: AbsenceType = new AbsenceType();
  private _operationMode: string = "add";
  private _absenceTypeListLoaded$: Observable<boolean>
  private _absenceTypeListLoadedSubscription: Subscription;
  private _currentAbsenceTypeSubscription: Subscription;
  private _showRemoveDialog: boolean = false;
  private _lightClass: AeClassStyle = AeClassStyle.Light;


  // End of Private Fields

  // Public properties
  get lightClass(): AeClassStyle {
    return this._lightClass;
  }
  get showAbsencetypeAddUpdateForm() {
    return this._showAbsencetypeAddUpdateForm;
  }
  get operationMode() {
    return this._operationMode;
  }
  get absenceCodes$() {
    return this._absenceCodes$;
  }
  get selectedAbsenceType() {
    return this._selectedAbsenceType;
  }
  get showRemoveDialog() {
    return this._showRemoveDialog;
  }

  get bcGroup(): BreadcrumbGroup {
    return BreadcrumbGroup.AbsenceTypes;
  }
  // End of Public properties

  // Public Output bindings
  // End of Public Output bindings

  // Public ViewChild bindings
  // End of Public ViewChild bindings

  // Public ViewContent bindings
  // End of Public ViewContent bidnings

  // constructor
  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _cdRef: ChangeDetectorRef
    , private _store: Store<fromRoot.State>
    , private _claimsHelper: ClaimsHelperService) {
    super(_localeService, _translationService, _cdRef);
  }
  // End of constructor

  // Public methods
  ngOnInit() {
    this._absenceCodesLoaded$ = this._store.let(fromRoot.getAbsenceCodesLoadingState);
    this._absenceCodes$ = this._store.let(fromRoot.getAbsenceCodesData);

    this._absenceTypeListLoadedSubscription = this._store.let(fromRoot.getAbsenceTypesLoadingState).subscribe(absenceTypeListLoaded => {
      let atlasParams: AtlasParams[] = new Array();
      atlasParams.push(new AtlasParams("CompanyId", this._claimsHelper.getCompanyIdOrCid()));
      if (!absenceTypeListLoaded) {
        this._store.dispatch(new LoadAbsenceTypeAction(true));
      } else {
        //already absence types are available in the state
        this._store.dispatch(new LoadAbsenceTypeListDataAction(new AtlasApiRequestWithParams(this._pageNumber, this._pageSize, this._sortField, this._sortDirection, atlasParams)));
      }
    });

    this._currentAbsenceTypeSubscription = this._store.select(details => details.absenceTypeState.CurrentAbsenceType).subscribe(details => {

      if (!isNullOrUndefined(details)) {
        this._selectedAbsenceType = details;
        if (this._operationMode == "update") {
          this._showAbsencetypeAddUpdateForm = true;
          this._cdRef.markForCheck();
        }

      }
    });

  }
  ngOnDestroy() {
    if (this._absenceTypeListLoadedSubscription)
      this._absenceTypeListLoadedSubscription.unsubscribe();
    if (this._currentAbsenceTypeSubscription)
      this._currentAbsenceTypeSubscription.unsubscribe();
    if (this._absenceCodesSubscription)
      this._absenceCodesSubscription.unsubscribe();

  }
  // End of public methods

  // Private methods

  private _loadAbsenceCodeAddUpdate() {
    if (!this._absenceCodesSubscription) {
      this._absenceCodesSubscription = this._absenceCodesLoaded$.subscribe(absenceCodesLoaded => {
        if (!absenceCodesLoaded)
          this._store.dispatch(new LoadAbsenceCodeAction(true));
      });
    }


  }





  // End of Private methods
  //public methods
  public onAbsenceTypeAdd(dataToSave: AbsenceType) {
    this._showAbsencetypeAddUpdateForm = false;
    this._store.dispatch(new AbsenceTypeAddAction(dataToSave));
  }

  public modalClosed(option) {
    if (option == 'yes') {
      this._store.dispatch(new AbsenceTypeDeleteAction(this._selectedAbsenceType));
    }
    this._showRemoveDialog = false;
    this._selectedAbsenceType = null;
  }

  public onAbsenceTypeUpdate(dataToSave: AbsenceType) {
    this._showAbsencetypeAddUpdateForm = false;
    this._store.dispatch(new AbsenceTypeUpdateAction(dataToSave));
  }

  public onAbsenceTypeAddOrUpdateCancel($event) {
    this._showAbsencetypeAddUpdateForm = false;
  }

  public getSlideoutState(): string {
    return (this._showAbsencetypeAddUpdateForm) ? 'expanded' : 'collapsed';
  }

  public onAbsenceTypeSelect(dataToUpdate: AbsenceType) {
    this._selectedAbsenceType = dataToUpdate;
    this._operationMode = "update";
    this._loadAbsenceCodeAddUpdate();
    this._store.dispatch(new AbsenceTypeByIdLoadAction({ AbsenceType: this._selectedAbsenceType }));
  }
  public onAbsenceTypeDelete(dataToDelete: AbsenceType) {
    this._pageNumber = 1
    this._selectedAbsenceType = dataToDelete;
    this._operationMode = "delete";
    this._showRemoveDialog = true;
  }

  public onGridPaging($event) {
    this._pageNumber = $event.pageNumber;
    this._pageSize = $event.noOfRows;
    let atlasParams: AtlasParams[] = new Array();
    atlasParams.push(new AtlasParams("CompanyId", this._claimsHelper.getCompanyIdOrCid()));
    this._store.dispatch(new LoadAbsenceTypeListDataAction(new AtlasApiRequestWithParams(this._pageNumber, this._pageSize, this._sortField, this._sortDirection, atlasParams)));
  }
  public onGridSorting($event: AeSortModel) {
    this._sortField = $event.SortField;
    this._sortDirection = $event.Direction;
    let atlasParams: AtlasParams[] = new Array();
    atlasParams.push(new AtlasParams("CompanyId", this._claimsHelper.getCompanyIdOrCid()));
    this._store.dispatch(new LoadAbsenceTypeListDataAction(new AtlasApiRequestWithParams(this._pageNumber, this._pageSize, this._sortField, this._sortDirection, atlasParams)));
  }
  public addNewAbscenceType() {
    this._loadAbsenceCodeAddUpdate();
    this._selectedAbsenceType = new AbsenceType();
    this._operationMode = 'add';
    this._showAbsencetypeAddUpdateForm = true;
  }
  //end of public methods
}
