import { ActivatedRoute } from '@angular/router';
import { EmployeeSecurityService } from './../../services/employee-security-service';
import { Store } from '@ngrx/store';
import { LocaleService, TranslationService } from 'angular-l10n';
import { BaseComponent } from '../../../shared/base-component';
import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy, ViewEncapsulation, Input, OnDestroy, Output, EventEmitter } from '@angular/core';
import * as fromRoot from './../../../shared/reducers';
import { Observable, Subject, Subscription, BehaviorSubject } from "rxjs/Rx";
import * as Immutable from 'immutable';
import { BankDetails } from "../../../employee/models/bank-details";
import { AeDataTableAction } from "../../../atlas-elements/common/models/ae-data-table-action";
import { AtlasParams, AtlasApiRequestWithParams } from './../../../shared/models/atlas-api-response';
import { EmployeeBankDetailsByIdLoadAction, EmployeeBankDetailsDeleteAction } from './../../../employee/actions/employee.actions';
import { DataTableOptions } from './../../../atlas-elements/common/models/ae-datatable-options';
import { AeSortModel } from './../../../atlas-elements/common/models/ae-sort-model';
@Component({
  selector: 'employee-bank-list',
  templateUrl: './employee-bank-list.component.html',
  styleUrls: ['./employee-bank-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class EmployeeBankListComponent extends BaseComponent implements OnInit, OnDestroy {

  //private variables
  private _bankDetailsListLoaded$: Observable<boolean>;
  private _bankDetailsList$: Observable<Immutable.List<BankDetails>>;
  private _updateAction = new Subject();
  private _removeAction = new Subject();
  private _actions: Immutable.List<AeDataTableAction>;
  private _recordsCount$: Observable<number>;
  private _dataTableOptions$: Observable<DataTableOptions>;
  private _keys = Immutable.List(['Id', 'Name', 'AccountName', 'AccountNumber', 'BankCode', 'IsSalaryAccount', 'Town']);
  private _bankUpdateActionSubscription: Subscription;
  private _bankDeleteActionSubscription: Subscription;
  private _bankDetailsToBeDeleted: BankDetails = null;
  private _canUpdate$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private _employeeStateSub: Subscription;
   private _actionsUpdated:boolean = false;
  // End :: Private variables

  // Output properties declarations
  @Output('onGridPaging') _doGridPaging: EventEmitter<any> = new EventEmitter<any>();
  @Output('onGridSorting') _doGridSorting: EventEmitter<AeSortModel> = new EventEmitter<AeSortModel>();
  @Output('onBankDetailsSelected') _onBankDetailsSelected: EventEmitter<BankDetails> = new EventEmitter<BankDetails>();
  @Output('onBankDetailsDelete') _onBankDetailsDelete: EventEmitter<BankDetails> = new EventEmitter<BankDetails>();

  // constructor
  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _cdRef: ChangeDetectorRef
    , private _store: Store<fromRoot.State>
    , private _employeeSecurityService: EmployeeSecurityService
    , private _activatedRoute: ActivatedRoute
  ) {
    super(_localeService, _translationService, _cdRef);
  }

  get keys() {
    return this._keys;
  }

  get bankDetailsList$() {
    return this._bankDetailsList$;
  }

  get bankDetailsListLoaded$() {
    return this._bankDetailsListLoaded$;
  }

  get actions() {
    return this._actions;
  }
  get recordsCount$() {
    return this._recordsCount$;
  }

  get dataTableOptions$() {
    return this._dataTableOptions$;
  }

  ngOnInit() {
    this._setActions();
    this._bankDetailsListLoaded$ = this._store.let(fromRoot.getEmployeeBankDetailsListLoadingState);
    this._bankDetailsList$ = this._store.let(fromRoot.getEmployeeBankDetailsList);
    this._recordsCount$ = this._store.let(fromRoot.getEmployeeBankDetailsListTotalCount);
    this._dataTableOptions$ = this._store.let(fromRoot.getEmployeeBankDetailsListDataTableOptions);

    this._bankUpdateActionSubscription = this._updateAction.subscribe(bd => {
      let bdToBeUpdated: BankDetails = <BankDetails>bd;
      this._onBankDetailsSelected.emit(bdToBeUpdated);
    });

    this._bankDeleteActionSubscription = this._removeAction.subscribe(bd => {
      this._onBankDetailsDelete.emit(<BankDetails>bd);
    });
  }
  highLightRow = (context: any) => context.IsSalaryAccount;
  ngOnDestroy() {
    if (this._employeeStateSub) {
      this._employeeStateSub.unsubscribe();
    }
    if (this._bankUpdateActionSubscription)
      this._bankUpdateActionSubscription.unsubscribe();
    if (this._bankDeleteActionSubscription)
      this._bankDeleteActionSubscription.unsubscribe();
  }

  // Private methods
  private _setActions(): void {
    const statePersonal = this._store.let(fromRoot.getEmployeePersonalData);
    this._employeeStateSub = statePersonal.subscribe((val) => {
      if (val) {
        if (this._employeeSecurityService.CanUpdateBank(val.Id) && !this._actionsUpdated) {
          this._actions = Immutable.List([
            new AeDataTableAction("Update", this._updateAction, false),
            new AeDataTableAction("Remove", this._removeAction, false),
          ]);
          this._actionsUpdated = true;
        }
      }
    });
  }


  onGridPageChange($event) {
    this._doGridPaging.emit($event);
  }
  onGridSort($event: AeSortModel) {
    this._doGridSorting.emit($event);
  }

  // End of private methods
}
