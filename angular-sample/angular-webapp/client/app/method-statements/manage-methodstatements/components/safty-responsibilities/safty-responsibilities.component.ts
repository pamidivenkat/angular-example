import { StringHelper } from './../../../../shared/helpers/string-helper';
import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef, Output, EventEmitter, Input } from '@angular/core';
import { BaseComponent } from './../../../../shared/base-component';
import { LocaleService, TranslationService } from "angular-l10n";
import { Store } from "@ngrx/store";
import { Router, ActivatedRoute } from "@angular/router";
import { ClaimsHelperService } from './../../../../shared/helpers/claims-helper';
import * as fromRoot from './../../../../shared/reducers';
import * as Immutable from 'immutable';
import { Observable } from "rxjs/Observable";
import { PPECategoryGroup, Responsiblity } from './../../../../shared/models/lookup.models';
import { LoadPPECategoryGroupsAction, LoadResponsibilitiesAction } from './../../../../shared/actions/lookup.actions';
import { MSSafetyRespAssigned, MethodStatement } from './../../../../method-statements/models/method-statement';
import { DataTableOptions } from './../../../../atlas-elements/common/models/ae-datatable-options';
import { Subscription, Subject } from "rxjs/Rx";
import { AeDataTableAction } from './../../../../atlas-elements/common/models/ae-data-table-action';
import { isNullOrUndefined } from "util";
import { AeClassStyle } from './../../../../atlas-elements/common/ae-class-style.enum';
import { UpdateMSResponsibilityAction, AddMSResponsibilityAction, DeleteMSSaftyResponsibilityAction } from './../../../../method-statements/manage-methodstatements/actions/manage-methodstatement.actions';


@Component({
  selector: 'safty-responsibilities',
  templateUrl: './safty-responsibilities.component.html',
  styleUrls: ['./safty-responsibilities.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class SaftyResponsibilitiesComponent extends BaseComponent implements OnInit, OnDestroy {


  // Private Fields
  private _msSaftyResponsibilityListLoaded: boolean;
  private _msSaftyResponsibilityList$: Observable<Immutable.List<MSSafetyRespAssigned>>;
  private _recordsCount$: Observable<number>;
  private _dataTableOptions$: Observable<DataTableOptions>;
  private _keys = Immutable.List(['Id', 'MethodStatementId', 'NameOfResponsible', 'OtherResponsibilityValue', 'Responsibilities', 'ResponsiblePerson']);
  private _msSaftyResponsibilityListLoadedSubscription: Subscription;
  private _msSaftyResponsibilityList: Subscription;

  private _methodStatement: MethodStatement;
  private _updateAction = new Subject();
  private _removeAction = new Subject();
  private _actions: Immutable.List<AeDataTableAction>;
  private _updateActionSubscription: Subscription;
  private _deleteActionSubscription: Subscription;

  private _lightClass: AeClassStyle = AeClassStyle.Light;
  private _selectedRecord: MSSafetyRespAssigned;
  private _showMSResponsibilitiesAddUpdateForm: boolean = false;
  private _operationMode: string;
  private _responsibilities: Responsiblity[];
  private _responsibilitySubscription: Subscription;
  private _showRemoveDialog: boolean;

  // End of Private Fields

  // Public properties
  @Input('methodStatement')
  set methodStatement(val: MethodStatement) {
    this._methodStatement = val;
  }
  get methodStatement() {
    return this._methodStatement;
  }


  get lightClass() {
    return this._lightClass;
  }

  get selectedRecord() {
    return this._selectedRecord;
  }

  get responsibilities() {
    return this._responsibilities;
  }
  get showRemoveDialog() {
    return this._showRemoveDialog;
  }
  get msSaftyResponsibilityList$(): Observable<Immutable.List<MSSafetyRespAssigned>> {
    return this._msSaftyResponsibilityList$;
  }

  get actions(): Immutable.List<AeDataTableAction> {
    return this._actions;
  }

  get recordsCount$(): Observable<number> {
    return this._recordsCount$;
  }

  get dataTableOptions$(): Observable<DataTableOptions> {
    return this._dataTableOptions$;
  }

  get keys(): any {
    return this._keys;
  }

  get msSaftyResponsibilityListLoaded() {
    return !this._msSaftyResponsibilityListLoaded;
  }

  get showMSResponsibilitiesAddUpdateForm() {
    return this._showMSResponsibilitiesAddUpdateForm;
  }

  // End of Public properties

  // Public Output bindings
  @Output('onMSRespGridPaging') _doMSRespGridPaging: EventEmitter<any> = new EventEmitter<any>();
  @Output('onMSResponsibilityRecordSelected') _onMSRespDetailsSelected: EventEmitter<MSSafetyRespAssigned> = new EventEmitter<MSSafetyRespAssigned>();
  @Output('onBankDetailsDelete') _onMSRespDetailsDelete: EventEmitter<MSSafetyRespAssigned> = new EventEmitter<MSSafetyRespAssigned>();


  // End of Public Output bindings

  // Public ViewChild bindings
  // End of Public ViewChild bindings

  // Public ContentChild bindings
  // End of Public ContentChild bindings

  // Constructor
  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _changeDetectorRef: ChangeDetectorRef
    , private _store: Store<fromRoot.State>
    , private _claimsHelper: ClaimsHelperService
  ) {
    super(_localeService, _translationService, _changeDetectorRef);
    this.id = 'SaftyResponsibility';
    this.name = 'SaftyResponsibility';
  }
  // End of constructor

  // Private methods 
  // End of private methods

  // Public methods

  ngOnInit() {
    this._responsibilitySubscription = this._store.let(fromRoot.getResponsibilities).subscribe(res => {
      if (!isNullOrUndefined(res)) {
        this._responsibilities = res;
      } else {
        this._store.dispatch(new LoadResponsibilitiesAction());
      }
    });
    this._setActions();
    if (!isNullOrUndefined(this._methodStatement) && !isNullOrUndefined(this._methodStatement.Id)) {
      this._msSaftyResponsibilityListLoaded = true;
    }

    this._msSaftyResponsibilityList$ = this._store.let(fromRoot.getMSSaftyResponsibilities);
    this._recordsCount$ = this._store.let(fromRoot.getMSSaftyResponsibilitiesTotalCount);
    this._dataTableOptions$ = this._store.let(fromRoot.getMSSaftyResponsibilitiesDataTableOptions);
    this._updateActionSubscription = this._updateAction.subscribe(obj => {
      let msRespToBeUpdated: MSSafetyRespAssigned = <MSSafetyRespAssigned>obj;
      this._onMSRespDetailsSelected.emit(msRespToBeUpdated);
      this._selectedRecord = msRespToBeUpdated;
      this._showMSResponsibilitiesAddUpdateForm = true;
    });

    this._deleteActionSubscription = this._removeAction.subscribe(obj => {
      this._onMSRespDetailsDelete.emit(<MSSafetyRespAssigned>obj);
      this._selectedRecord = <MSSafetyRespAssigned>obj;
      this._showRemoveDialog = true;
    });

  }
  ngOnDestroy() {
    if (this._updateActionSubscription)
      this._updateActionSubscription.unsubscribe();
    if (this._deleteActionSubscription)
      this._deleteActionSubscription.unsubscribe();
    if (this._msSaftyResponsibilityListLoadedSubscription)
      this._msSaftyResponsibilityListLoadedSubscription.unsubscribe();
    if (this._msSaftyResponsibilityList)
      this._msSaftyResponsibilityList.unsubscribe();
    if (this._responsibilitySubscription)
      this._responsibilitySubscription.unsubscribe();
  }

  getResponsibilities(data: any, otherResponsibilityValue: string): string {
    let responsibilitiesCommaList: string;
    if (!isNullOrUndefined(data) && data.length > 0) {
      responsibilitiesCommaList = (data.filter(obj => obj.Name.toLowerCase() != 'other').map(p => { if (p.Name.toLowerCase() != 'other') return p.Name }).join(','));
    }
    //now add if other responsibility is not empty
    if (!StringHelper.isNullOrUndefinedOrEmpty(otherResponsibilityValue)) {
      if (StringHelper.isNullOrUndefinedOrEmpty(responsibilitiesCommaList)) {
        responsibilitiesCommaList = otherResponsibilityValue;
      } else {
        responsibilitiesCommaList = responsibilitiesCommaList + ', ' + otherResponsibilityValue;
      }
    }
    return responsibilitiesCommaList;
  }
  getResponsiblePerson(data: any): string {
    let responsiblePerson = data.ResponsiblePerson;
    let otherResponsiblePerson = data.NameOfResponsible;
    return !isNullOrUndefined(responsiblePerson) ? responsiblePerson.FullName : otherResponsiblePerson;
  }

  // Private methods
  private _setActions(): void {
    this._actions = Immutable.List([
      new AeDataTableAction("Update", this._updateAction, false),
      new AeDataTableAction("Remove", this._removeAction, false),
    ]);
  }

  onGridPageChange($event) {
    this._doMSRespGridPaging.emit($event);
  }

  getMSResponsibilitiesSlideoutState(): string {
    return this._showMSResponsibilitiesAddUpdateForm ? 'expanded' : 'collapsed';
  }

  closeEmployeeBankDetailsAddUpdateForm(e) {
    this._showMSResponsibilitiesAddUpdateForm = false;
  }

  onAddOrUpdateCancel(event: any) {
    this._showMSResponsibilitiesAddUpdateForm = false;
  }

  onMSREspUpdate(dataToUpdate: MSSafetyRespAssigned) {
    this._showMSResponsibilitiesAddUpdateForm = false;
    this._store.dispatch(new UpdateMSResponsibilityAction(dataToUpdate));
  }
  onMSREspAdd(dataToSave: MSSafetyRespAssigned) {
    this._showMSResponsibilitiesAddUpdateForm = false;
    this._store.dispatch(new AddMSResponsibilityAction(dataToSave));
  }

  onMSRespCancel($event) {
    this._showMSResponsibilitiesAddUpdateForm = false;
  }

  openMSResponsibilitiesAddUpdateForm(e) {
    // load master data if any
    this._selectedRecord = new MSSafetyRespAssigned();
    this._showMSResponsibilitiesAddUpdateForm = true;
    this._operationMode = "add";
  }

  private modalClosed(option) {
    if (option == 'yes' && !isNullOrUndefined(this.selectedRecord)) {
      this._store.dispatch(new DeleteMSSaftyResponsibilityAction({ Id: this.selectedRecord.Id }));
    }
    this._showRemoveDialog = false;
    this._selectedRecord = null;
  }
}
