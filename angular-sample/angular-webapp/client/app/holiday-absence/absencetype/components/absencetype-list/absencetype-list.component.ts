import { AeSelectItem } from '../../../../atlas-elements/common/models/ae-select-item';
import { BaseComponent } from '../../../../shared/base-component';
import { AeSortModel } from '../../../../atlas-elements/common/models/ae-sort-model';
import { AeDataTableAction } from '../../../../atlas-elements/common/models/ae-data-table-action';
import { DataTableOptions } from '../../../../atlas-elements/common/models/ae-datatable-options';
import { AtlasApiRequestWithParams } from '../../../../shared/models/atlas-api-response';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewEncapsulation
} from '@angular/core';
import { LocaleService, Localization, TranslationService } from 'angular-l10n';
import { Store } from '@ngrx/store';
import { Observable, Subject, Subscription } from 'rxjs/Rx';
import { ClaimsHelperService } from './../../../../shared/helpers/claims-helper';
import * as fromRoot from './../../../../shared/reducers/index';
import { AbsenceType } from './../../../../shared/models/company.models';
import { AbsenceCode } from './../../../../shared/models/lookup.models';
import * as Immutable from 'immutable';
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { mapAbsenceSubTypeToAeSelectItems } from '../../../common/extract-helpers';
import { isNullOrUndefined } from 'util';
import { AeIconSize } from '../../../../atlas-elements/common/ae-icon-size.enum';

@Component({
  selector: 'absencetype-list',
  templateUrl: "./absencetype-list.component.html",
  styleUrls: ['./absencetype-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})

export class AbsenceTypeListComponent extends BaseComponent implements OnInit, OnDestroy {

  // Private Fields
  private _absenceTypeRequestLoaded$: Observable<boolean>;
  private _absenceTypeRequest$: Observable<Immutable.List<AbsenceType>>;
  private _absenceTypeRequestSubScription: Subscription;
  private _keys = Immutable.List(['TypeName', 'AbsenceSubType', 'CodeName', 'NameAndCode', 'IsExample']);
  private _absenceTypeListDataTableOptions$: Observable<DataTableOptions>;
  private _absenceTypeListTotalCount$: Observable<number>;
  private _actions: Immutable.List<AeDataTableAction>;


  private _updateActionCommand = new Subject();
  private _deleteActionCommand = new Subject();

  private _updateActionCommandSubscription$: Subscription;
  private _deleteActionCommandSubscription$: Subscription;
  private _iconSize: AeIconSize = AeIconSize.medium;
  private _absenceSubType: FormGroup;
  private _absenceType: AbsenceType;
  // End of Private Fields

  //public properties
  get absenceTypeRequest$(){
    return this._absenceTypeRequest$;
  }
  get actions(){
    return this._actions;
  }
  get absenceTypeListTotalCount$(){
    return this._absenceTypeListTotalCount$;
  }
  get absenceTypeListDataTableOptions$(){
    return this._absenceTypeListDataTableOptions$;
  }
  get absenceTypeRequestLoaded$(){
    return this._absenceTypeRequestLoaded$;
  }
  get keys(){
    return this._keys;
  }
  get iconSize(){
    return this._iconSize;
  }
  //end of public properties


  // Public Output 
  @Output('onGridPaging') _doGridPaging: EventEmitter<any> = new EventEmitter<any>();
  @Output('onGridSorting') _doGridSorting: EventEmitter<AeSortModel> = new EventEmitter<AeSortModel>();
  @Output('onAbsenceTypeSelect') _onAbsenceTypeSelect: EventEmitter<AbsenceType> = new EventEmitter<AbsenceType>();
  @Output('onAbsenceTypeDelete') _onAbsenceTypeDelete: EventEmitter<AbsenceType> = new EventEmitter<AbsenceType>();
  // End of Public Output bindings

  // constructor
  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _fb: FormBuilder
    , protected _cdRef: ChangeDetectorRef
    , private _store: Store<fromRoot.State>
    , private _claimsHelper: ClaimsHelperService) {
    super(_localeService, _translationService, _cdRef);

    const holiday = 'icon-case';
    const businessRelated = 'icon-building';
    const familyRelated = "icon-hand-heart";
    const publicDuties = "icon-legal";
    const sickness = "icon-steth";

    // Actions
    this._actions = Immutable.List([
      new AeDataTableAction("Update", this._updateActionCommand, false),
      new AeDataTableAction("Remove", this._deleteActionCommand, false)
    ]);
    // Actions Ends

  }
  // End of constructor

  // Public methods
  ngOnInit() {
    this._absenceTypeRequestLoaded$ = this._store.let(fromRoot.getAbsenceTypesLoadingState);
    this._absenceTypeRequest$ = this._store.let(fromRoot.getAbsenceTypeList);
    this._absenceTypeListTotalCount$ = this._store.let(fromRoot.getAbsenceTypeListTotalCount);
    this._absenceTypeListDataTableOptions$ = this._store.let(fromRoot.getAbsenceTypeListDataTableOptions);

    this._updateActionCommandSubscription$ = this._updateActionCommand.subscribe(at => {
      let atToBeUpdated: AbsenceType = <AbsenceType>at;
      this._onAbsenceTypeSelect.emit(atToBeUpdated);
    });

    this._deleteActionCommandSubscription$ = this._deleteActionCommand.subscribe(at => {
      this._onAbsenceTypeDelete.emit(<AbsenceType>at);
    });

  }

  ngOnDestroy() {
    if (this._absenceTypeRequestSubScription)
      this._absenceTypeRequestSubScription.unsubscribe();
    if (this._updateActionCommandSubscription$)
      this._updateActionCommandSubscription$.unsubscribe();
    if (this._deleteActionCommandSubscription$)
      this._deleteActionCommandSubscription$.unsubscribe();

  }

  public selectIconName(status: string) {
    switch (status) {
      case 'Holiday':
        {
          return 'icon-case';
        }
      case 'Business related':
        {
          return 'icon-building';
        }
      case 'Family related':
        {
          return 'icon-hand-heart';
        }
      case 'Public duties related':
        {
          return 'icon-legal';
        }
      case 'Sickness':
        {
          return 'icon-steth'
        }
      default:
    }
  }

  public absenceTypeSelectList(val: any[]) {
    if (!isNullOrUndefined(val)) {
      let aeSelectList = mapAbsenceSubTypeToAeSelectItems(val);
      return aeSelectList;
    }
  }
   public onGridPageChange($event) {
    this._doGridPaging.emit($event);
  }
  public onGridSort($event: AeSortModel) {
    this._doGridSorting.emit($event);
  }
  // End of public methods

  // Private Method Starts
 
  // End of Private methods
}
