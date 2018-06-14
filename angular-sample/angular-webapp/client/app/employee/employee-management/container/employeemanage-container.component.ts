import { RouteParams } from './../../../shared/services/route-params';
import { AeClassStyle } from '../../../atlas-elements/common/ae-class-style.enum';
import { StringHelper } from './../../../shared/helpers/string-helper';
import { DataTableOptions } from './../../../atlas-elements/common/models/ae-datatable-options';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Employee } from '../../models/employee.model';
import { BehaviorSubject, Observable, Subscription } from 'rxjs/Rx';
import { EmployeeManageService } from '../../services/employee-manage.service';
import { ClaimsHelperService } from '../../../shared/helpers/claims-helper';
import { Store } from '@ngrx/store';
import { LocaleService, TranslationService } from 'angular-l10n';
import { BaseComponent } from '../../../shared/base-component';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, OnDestroy } from '@angular/core';
import * as fromRoot from './../../../shared/reducers';
import * as Immutable from 'immutable';
import { AeSortModel } from '../../../atlas-elements/common/models/ae-sort-model';
import { AeSplitButtonOption } from "../../../atlas-elements/common/models/ae-split-button-options";
import { Subject } from "rxjs/Subject";
import { Router, NavigationExtras } from "@angular/router";
import { BreadcrumbService } from "../../../atlas-elements/common/services/breadcrumb-service";
import { IBreadcrumb } from "../../../atlas-elements/common/models/ae-ibreadcrumb.model";

@Component({
  selector: 'app-employeemanage-container',
  templateUrl: './employeemanage-container.component.html',
  styleUrls: ['./employeemanage-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmployeemanageContainerComponent extends BaseComponent implements OnInit, OnDestroy {
  private _employeeList$: Observable<Immutable.List<Employee>>;
  private _totalCount$: Observable<number>;
  private _employeesDataTableOptions$: Observable<DataTableOptions>;
  private _employeesLoading$: Observable<boolean>;
  private _showExpExportConfirmation: boolean = false;
  private _exportAll: boolean = true;
  private _exportConfirmform: FormGroup;
  private _employeePagingInformation$: Observable<DataTableOptions>;
  private _employeeFiltersInformation$: Observable<Map<string, string>>;
  private _employeeSortInformation$: Observable<AeSortModel>;
  private _employeeListPagingAndFiltersSub: Subscription;
  private _employeelistDataTableOptions: DataTableOptions;
  private _employeelistFilters: Map<string, string>;
  private _lightClass: AeClassStyle = AeClassStyle.Light;
  private _employeelistSort: AeSortModel;
  private _importSplitButtonOptions: Array<AeSplitButtonOption<any>>;
  private _filters: Map<string, string>;

  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _cdRef: ChangeDetectorRef
    , private _store: Store<fromRoot.State>
    , private _claimsHelper: ClaimsHelperService
    , private _employeeManageService: EmployeeManageService
    , private _fb: FormBuilder
    , private _router: Router
    , private _breadcrumbService: BreadcrumbService
    , private _routeParamsService: RouteParams
  ) {
    super(_localeService, _translationService, _cdRef);
    this._importSplitButtonOptions = [new AeSplitButtonOption('Import Employee Data', this._getOption(this._importEmployeeData), false), new AeSplitButtonOption('View Import History', this._getOption(this._viewImportHistory), false)];
    // const bcItem: IBreadcrumb = { label: 'Employees', url: '/employee/manage' };
    // this._breadcrumbService.add(bcItem);
  }

  //private functions getEmployeesPageInformation,getEmployeesFiltersInformation
  canExportEmployees(): boolean {
    return this._claimsHelper.canExportEmployees();
  }
  canBulkUpdateEmployees(): boolean {
    return this._claimsHelper.canBulkUpdateEmployees();
  }
  onExport($event) {
    this._showExpExportConfirmation = true;
  }

  private _initForm() {
    this._exportConfirmform = this._fb.group({
      exportAllPages: [this._exportAll]
    });
  }
  OnChange(e) {
    this._exportAll = e;
  }

  modalClosed($event) {
    if ($event == 'yes') {
      let sortField; let direction;
      if (this._employeelistSort) {
        sortField = this._employeelistSort.SortField;
        if (this._employeelistSort.Direction == 0) {
          direction = 'asc';
        } else {
          direction = 'desc';
        }
      } else {
        sortField = 'FullName';
        direction = 'asc';
      }
      //here based on form export all value we need to export the employee data by saved filters at this point of time
      // let exportAll = <boolean>this._exportConfirmform.controls['exportAllPages'].value;
      // let currentPageOnly = !exportAll;
      let currentPageOnly = !this._exportAll;
      let queryToDownLoad = 'employeeexport?isCollection=false&isCurrentPage=' + currentPageOnly + '&pageSize=' + this._employeelistDataTableOptions.noOfRows + '&pageNumber=' + this._employeelistDataTableOptions.currentPage + '&forEmployee=true&sortField=' + sortField + '&direction=' + direction
      //now append each filter value to the query todownload
      if (this._employeelistFilters) {
        this._employeelistFilters.forEach(
          (value: string, key: string) => {
            if (!StringHelper.isNullOrUndefinedOrEmpty(value)) {
              queryToDownLoad += '&' + key + '=' + value;
            }
          }
        );
      }
      if (this._routeParamsService.Cid) {
        queryToDownLoad += '&cid' + '=' + this._routeParamsService.Cid;
      }
      window.open(queryToDownLoad);
    }
    this._showExpExportConfirmation = false;
  }

  private _getOption(fn: Function) {
    let sub = new Subject();
    sub.subscribe((v) => {
      fn.call(this, v);
    })
    return sub;
  }

  private _importEmployeeData() {
    let navigationExtras: NavigationExtras = {
      queryParamsHandling: 'merge'
    };
    this._router.navigate(['employee/import'], navigationExtras);
  }
  private _viewImportHistory() {
    let navigationExtras: NavigationExtras = {
      queryParamsHandling: 'merge'
    };
    this._router.navigate(['employee/import/history'], navigationExtras);
  }

  onUpdateEmployees() {
    let navigationExtras: NavigationExtras = {
      queryParamsHandling: 'merge'
    };
    this._router.navigate(['employee/bulkupdate'], navigationExtras);
  }
  //end of private functions
  get EmployeeList$() {
    return this._employeeList$;
  }
  get TotalCount$() {
    return this._totalCount$;
  }
  get EmployeesDataTableOptions$() {
    return this._employeesDataTableOptions$;
  }
  get EmployeesLoading$() {
    return this._employeesLoading$;
  }
  get ShowExpExportConfirmation() {
    return this._showExpExportConfirmation;
  }
  get ExportConfirmform() {
    return this._exportConfirmform;
  }
  get LightClass() {
    return this._lightClass;
  }
  get ImportSplitButtonOptions() {
    return this._importSplitButtonOptions;
  }
  get ExportAll() {
    return this._exportAll;
  }
  ngOnInit() {
    this._initForm();
    this._filters = new Map<string, string>();
    this._filters.set('employeesByLeaverFilter', '0');
    this._employeeManageService.LoadEmployeesOnFilterChange(this._filters);
    this._employeeList$ = this._store.let(fromRoot.getEmployeesListData);
    this._totalCount$ = this._store.let(fromRoot.getEmployeesTotalCount);
    this._employeesLoading$ = this._store.let(fromRoot.getEmployeesLoadingStatusInformation);
    this._employeesDataTableOptions$ = this._store.let(fromRoot.getEmployeesPageInformation);
    this._employeePagingInformation$ = this._store.let(fromRoot.getEmployeesPageInformation);
    this._employeeFiltersInformation$ = this._store.let(fromRoot.getEmployeesFiltersInformation);
    this._employeeSortInformation$ = this._store.let(fromRoot.getEmployeesSortInformation);

    this._employeeListPagingAndFiltersSub = Observable.combineLatest(this._employeePagingInformation$, this._employeeFiltersInformation$, this._employeeSortInformation$)
      .subscribe((data) => {
        if (data) {
          this._employeelistDataTableOptions = data[0];
          this._employeelistFilters = data[1];
          this._employeelistSort = data[2];
        }
      });
  }

  ngOnDestroy() {
    if (this._employeeListPagingAndFiltersSub)
      this._employeeListPagingAndFiltersSub.unsubscribe();
  }

}
