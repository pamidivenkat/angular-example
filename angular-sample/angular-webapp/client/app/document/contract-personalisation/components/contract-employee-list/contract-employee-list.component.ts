import { Component, OnInit, OnDestroy, ChangeDetectorRef, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { BaseComponent } from '../../../../shared/base-component';
import { LocaleService, TranslationService, Localization } from "angular-l10n";
import { Store } from "@ngrx/store";
import * as fromRoot from '../../../../shared/reducers/index';
import { Subscription } from "rxjs/Subscription";
import { ContractDetails, EmployeeContractDetails } from "../../../models/contract-details.model";
import { isNullOrUndefined } from "util";
import { EmployeeContractPersonalisationLoad } from "../../../contract-personalisation/actions/contract-personalisation.actions";
import { BehaviorSubject, Observable } from 'rxjs/Rx';
import { ActivatedRoute } from '@angular/router';
import { DatePipe } from "@angular/common";
import * as Immutable from 'immutable';
import { AeDataTableAction } from "../../../../atlas-elements/common/models/ae-data-table-action";
import { DataTableOptions } from "../../../../atlas-elements/common/models/ae-datatable-options";
import { PagingInfo } from "../../../../atlas-elements/common/models/ae-paging-info";
import { AeSortModel } from "../../../../atlas-elements/common/models/ae-sort-model";
import { EmployeeGroup } from '../../../../shared/models/company.models';
import { Subject } from "rxjs/Subject";
import { AePageChangeEventModel } from "../../../../atlas-elements/common/models/ae-page-change-event-model";

@Component({
  selector: 'contract-employee-list',
  templateUrl: './contract-employee-list.component.html',
  styleUrls: ['./contract-employee-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush

})
export class ContractEmployeeListComponent extends BaseComponent implements OnInit, OnDestroy {

  /** Private variable declarations - start. */
  private _totalRecords$: Observable<number>;
  private _employeeContractLoading$: Observable<boolean>;
  private _keys = Immutable.List(['Id', 'Fullname', 'JobTitle', 'LatestContractVersion', 'DistributionDate', 'AcknowledgementDate', 'HasContract']);
  private _actions: Immutable.List<AeDataTableAction>;
  private _dataTableOptions$: Observable<DataTableOptions>;
  private _pagingInfo: PagingInfo;
  private _sortingInfo: AeSortModel;
  private _employeeList$: BehaviorSubject<Immutable.List<EmployeeContractDetails>>;
  private _employees: Immutable.List<EmployeeContractDetails>;
  private _employeeListSubscription: Subscription;
  private _selectedEmployees: EmployeeContractDetails[];
  private _contractEmployeesSubscription: Subscription;
  /** Private variable declarations - end. */
  get dataTableOptions$(): Observable<DataTableOptions> {
    return this._dataTableOptions$;
  }

  get employeeList$(): Observable<Immutable.List<EmployeeContractDetails>> {
    return this._employeeList$;
  }

  get totalRecords$() {
    return this._totalRecords$;
  }

  get employeeContractLoading$() {
    return this._employeeContractLoading$;
  }
  get keys(): Immutable.List<string> {
    return this._keys;
  }
  // Public Output 
  @Output('onPageChange') _doPageChange: EventEmitter<any> = new EventEmitter<any>();
  @Output('onSorting') _doSorting: EventEmitter<AeSortModel> = new EventEmitter<AeSortModel>();
  @Output('onEmployeeCheck') _employeesChecked: EventEmitter<EmployeeContractDetails[]> = new EventEmitter<EmployeeContractDetails[]>();
  // End of Public Output bindings

  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _cdRef: ChangeDetectorRef
    , private _store: Store<fromRoot.State>
    , private _route: ActivatedRoute
    , private _datePipe: DatePipe) {
    super(_localeService, _translationService, _cdRef);
    // Actions
    this._selectedEmployees = new Array<EmployeeContractDetails>();
    this._employeeList$ = new BehaviorSubject(Immutable.List<EmployeeContractDetails>([]));
  }

  ngOnInit() {
    this._employeeContractLoading$ = this._store.let(fromRoot.getContractDetailsLoadedState);
    this._contractEmployeesSubscription = this._store.let(fromRoot.getContractEmployeesList).subscribe((employees) => {
      if (!isNullOrUndefined(employees)) {
        this._employees = employees;
        this._employeeList$.next(this._employees);
      }
    });
    this._totalRecords$ = this._store.let(fromRoot.getContractEmplogetContractEmployeesListTotalCount);
    this._dataTableOptions$ = this._store.let(fromRoot.getContractEmployeesListDataTableOptions);
  }

  // Private Method Starts

  // on select or deselect of each checkbox 
  onEmployeesChange(employeeContractDetails: EmployeeContractDetails) {
    if (isNullOrUndefined(employeeContractDetails)) return;
    let employee = this._selectedEmployees.findIndex(employee => employee.Id == employeeContractDetails.Id);
    if (employee !== -1) {
      this._selectedEmployees.splice(employee, 1);
    } else {
      this._selectedEmployees.push(employeeContractDetails);
    }

    this._employeesChecked.emit(this._selectedEmployees);
  }

  // select status of select all checkbox
  checkedAllEmployees(): boolean {
    if (this._selectedEmployees.length === 0) return false;
    let selectedCount = 0;
    let allCount = 0;
    this._employees.forEach((emp) => {
      let empIndex = this._selectedEmployees.findIndex(x => x.Id == emp.Id);
      if (empIndex == -1) {
        if (emp.HasContract == true) {
          allCount++;
        }
      } else {
        selectedCount++;
      }
    });
    if ((allCount + selectedCount) == this._employees.size && selectedCount > 0) {
      return true;
    }
    return false;
  }
  
  // select status of each checkbox
  checkStatus(context) {
    let selectEmp = false;
    let contracts = this._selectedEmployees.filter(x => x.Id == context.Id)
    if (contracts.length > 0)
      selectEmp = true;
    return context.HasContract || selectEmp;
  }

  // select or deselct select all checkbox
  onAllEmployeesSelect($event) {
    if (!$event) {
      this._employees.forEach((emp) => {
        let index = this._selectedEmployees.findIndex(x => x.Id == emp.Id)
        if (index > -1) {
          this._selectedEmployees.splice(index, 1);
        }
      })
    }
    else {
      let _employeesList = this._employees.filter(x => x.HasContract == false).toArray();
      _employeesList.forEach((obj) => {
        let _empIndex = this._selectedEmployees.findIndex(x => x.Id == obj.Id);
        if (_empIndex == -1) {
          this._selectedEmployees.push(obj);
        }
      });
    }
    this._employeesChecked.emit(this._selectedEmployees);
  }

  // to disable select all checkbox on all employees has contract
  isAllHasContract() {
    if (!isNullOrUndefined(this._employees)) {
      let employee = this._employees.find((emp) => {
        return emp.HasContract == false;
      });
      if (isNullOrUndefined(employee)) {
        return true;
      }
      return false;
    }
    return false;
  }

  onPageChange(event: AePageChangeEventModel) {
    this._doPageChange.emit(event);
  }

  onSort(event: AeSortModel) {
    this._doSorting.emit(event);
  }
  // End of Private methods
  ngOnDestroy() {
    this._contractEmployeesSubscription.unsubscribe();
  }
}
