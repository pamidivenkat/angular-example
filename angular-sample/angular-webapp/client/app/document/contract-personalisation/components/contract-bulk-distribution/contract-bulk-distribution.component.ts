import { IBreadcrumb } from './../../../../atlas-elements/common/models/ae-ibreadcrumb.model';
import { BreadcrumbService } from './../../../../atlas-elements/common/services/breadcrumb-service';
import { AeClassStyle } from '../../../../atlas-elements/common/ae-class-style.enum';
import { DistributeModel } from '../../../document-details/models/document-details-model';
import { DocumentActionType } from '../../../models/document';
import { EnumHelper } from '../../../../shared/helpers/enum-helper';
import { AeSelectItem } from '../../../../atlas-elements/common/models/ae-select-item';
import { Artifact } from '../../../models/artifact';
import { AtlasApiRequest } from '../../../../shared/models/atlas-api-response';
import { AeSortModel, SortDirection } from '../../../../atlas-elements/common/models/ae-sort-model';
import { AePageChangeEventModel } from '../../../../atlas-elements/common/models/ae-page-change-event-model';
import { DataTableOptions } from '../../../../atlas-elements/common/models/ae-datatable-options';
import { PersonalisedEmployeesInfo } from '../../../models/personalised-employees-info';
import {
  EmployeeContractPersonalisationLoad,
  LoadPersonalisedDocumentsBySource,
  PersonalisedEmployeesListData,
  DocumentBulkDistributionAction,
  SelectedEmployeesToDistribute
} from '../../actions/contract-personalisation.actions';
import { isNullOrUndefined } from 'util';
import { Store } from '@ngrx/store';
import { BehaviorSubject, Observable, Subscription } from 'rxjs/Rx';
import { ActivatedRoute, Router } from '@angular/router';
import { LocaleService, TranslationService } from 'angular-l10n';
import { BaseComponent } from '../../../../shared/base-component';
import { ChangeDetectorRef, Component, OnDestroy, OnInit, ChangeDetectionStrategy, ViewEncapsulation } from '@angular/core';
import * as fromRoot from '../../../../shared/reducers/index';
import * as Immutable from 'immutable';
import { BreadcrumbGroup } from '../../../../atlas-elements/common/models/ae-breadcrumb-group';

@Component({
  selector: 'contract-bulk-distribution',
  templateUrl: './contract-bulk-distribution.component.html',
  styleUrls: ['./contract-bulk-distribution.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class ContractBulkDistributionComponent extends BaseComponent implements OnInit, OnDestroy {
  private _routeParamsSubscription: Subscription;
  private _dataTableOptions$: Observable<DataTableOptions>;
  private _totalRecords$: Observable<number>;
  private _personalisedDocuments$: BehaviorSubject<Immutable.List<PersonalisedEmployeesInfo>>;
  private _personalisedDocumentsList: Immutable.List<PersonalisedEmployeesInfo>;
  private _keys = ['DocumentId', 'EmployeeId', 'EmployeeName', 'Author', 'JobTitle', 'EmployeeGroup'];
  private _pageNumber: number = 1;
  private _pageSize: number = 10;
  private _sortField: string = 'EmployeeName';
  private _sortDirection: SortDirection = SortDirection.Descending;
  private _sourceDocumentId: string;
  private _sourceDocumentVersion: string;
  private _showHideDocumentActionSlideOut: boolean = false;
  private _contractDetails: Artifact;
  private _contractDetailsSubscription: Subscription;
  private _actionOptions: Immutable.List<AeSelectItem<number>>;
  private _personalisedSelectedEmployees: string[];
  private _lightClass: AeClassStyle = AeClassStyle.Light;
  private _selectedEmployeesSubscription: Subscription;
  private _personalisedDocumentsSubscription: Subscription;

  get documentTitle(): string {
    return isNullOrUndefined(this._contractDetails) ? "" : this._contractDetails.Title;
  }

  get documentVersion(): string {
    return isNullOrUndefined(this._contractDetails) ? "" : this._contractDetails.Version;
  }

  get documentCreatedDate(): Date {
    return isNullOrUndefined(this._contractDetails) ? new Date() : this._contractDetails.CreatedOn;
  }
  get employeeGroup() {
    if (isNullOrUndefined(this._contractDetails)) {
      return "";
    }
    return isNullOrUndefined(this._contractDetails.EmployeeGroup) ? "" : this._contractDetails.EmployeeGroup.Name;
  }
  get lightClass(): AeClassStyle {
    return this._lightClass;
  }

  get actionOptions(): Immutable.List<AeSelectItem<number>> {
    return this._actionOptions;
  }

  get bcGroup(): BreadcrumbGroup {
    return BreadcrumbGroup.Contracts;
  }

  get contractDetails(): Artifact {
    return this._contractDetails;
  }
  get showHideDocumentActionSlideOut(): boolean {
    return this._showHideDocumentActionSlideOut;
  }

  get totalRecords$(): Observable<number> {
    return this._totalRecords$;
  }

  get dataTableOptions$(): Observable<DataTableOptions> {
    return this._dataTableOptions$;
  }

  get keys(): string[] {
    return this._keys;
  }

  get personalisedDocuments$(): Observable<Immutable.List<PersonalisedEmployeesInfo>> {
    return this._personalisedDocuments$;
  }

  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _cdRef: ChangeDetectorRef
    , private _route: ActivatedRoute
    , private _router: Router
    , private _store: Store<fromRoot.State>
    , private _breadcrumbService: BreadcrumbService) {
    super(_localeService, _translationService, _cdRef);
    this._personalisedSelectedEmployees = new Array<string>();
    this._personalisedDocuments$ = new BehaviorSubject(Immutable.List<PersonalisedEmployeesInfo>([]));

  }

  onPageChange(event: AePageChangeEventModel) {
    this._pageNumber = event.pageNumber;
    this._pageSize = event.noOfRows;
    this._store.dispatch(new PersonalisedEmployeesListData(new AtlasApiRequest(this._pageNumber, this._pageSize, this._sortField, this._sortDirection)));
  }

  onSorting(event: AeSortModel) {
    this._sortField = event.SortField;
    this._sortDirection = event.Direction;
    this._store.dispatch(new PersonalisedEmployeesListData(new AtlasApiRequest(this._pageNumber, this._pageSize, this._sortField, this._sortDirection)));
  }

  documentAction(documentActionType: DocumentActionType) {
    let distributeModel = new DistributeModel();
    distributeModel.CompanyId = this._contractDetails.CompanyId;
    distributeModel.DocumentAction = documentActionType;
    distributeModel.sourceId = this._sourceDocumentId;
    distributeModel.EmployeeGroup = isNullOrUndefined(this._contractDetails.EmployeeGroup) ? "" : this._contractDetails.EmployeeGroup.Name;
    distributeModel.employees = this._personalisedSelectedEmployees.toString();
    this._store.dispatch(new DocumentBulkDistributionAction(distributeModel));
    this._closeSlideOut();
    this._router.navigate(['document/company/contracts-and-handbooks/personalised']);
  }

  onEmployeesSelect(personalisedEmployeesInfo: PersonalisedEmployeesInfo) {
    if (isNullOrUndefined(personalisedEmployeesInfo)) return;
    let employee = this._personalisedSelectedEmployees.findIndex(employeeId => employeeId == personalisedEmployeesInfo.EmployeeId);
    if (employee !== -1) {
      this._personalisedSelectedEmployees.splice(employee, 1);
    } else {
      this._personalisedSelectedEmployees.push(personalisedEmployeesInfo.EmployeeId);
    }
  }

  checkEmployee(empId: string): boolean {
    let employee = this._personalisedSelectedEmployees.findIndex(employeeId => employeeId == empId);
    if (employee !== -1) {
      return true;
    }
    return false;
  }

  // select or deselct select all checkbox
  onAllEmployeesSelect($event) {
    let personalisedEmployees: string[] = this._personalisedDocumentsList.map(x => x.EmployeeId).toArray();
    if (!$event) {
      personalisedEmployees.forEach((emp) => {
        let index = this._personalisedSelectedEmployees.findIndex(x => x == emp)
        if (index > -1) {
          this._personalisedSelectedEmployees.splice(index, 1);
        }
      });
    }
    else {
      personalisedEmployees.forEach((Id) => {
        let _empIndex = this._personalisedSelectedEmployees.findIndex(x => x == Id);
        if (_empIndex == -1) {
          this._personalisedSelectedEmployees.push(Id);
        }
      });
    }
  }

  checkedAllEmployees(): boolean {
    if (this._personalisedSelectedEmployees.length === 0) return false;
    let selectedCount = 0;
    let personalisedEmployees: string[] = this._personalisedDocumentsList.map(x => x.EmployeeId).toArray();
    personalisedEmployees.forEach((empId) => {
      let empIndex = this._personalisedSelectedEmployees.findIndex(x => x == empId);
      if (empIndex != -1) {
        selectedCount++;
      }
    });
    if ((selectedCount) == this._personalisedDocumentsList.size && selectedCount > 0) {
      return true;
    }
    return false;
  }

  enableBulkDistribution(): boolean {
    if (isNullOrUndefined(this._personalisedSelectedEmployees)) return true;
    if (this._personalisedSelectedEmployees.length > 0) {
      return false;
    }
    return true;
  }

  onPreviousButtonClick() {
    this._router.navigate(['/document/group-contract-personalisation', this._sourceDocumentId]);
  }

  onBulkDistributeClick() {
    this._showHideDocumentActionSlideOut = true;
  }

  onAeCancel($event: any) {
    this._closeSlideOut();
  }

  private _closeSlideOut() {
    this._showHideDocumentActionSlideOut = false;
  }
  getDocActionSlideoutState() {
    return this._showHideDocumentActionSlideOut ? 'expanded' : 'collapsed';
  }

  onUpdateClick(personalisedEmployeesInfo: PersonalisedEmployeesInfo) {
    this._store.dispatch(new SelectedEmployeesToDistribute(this._personalisedSelectedEmployees));
    this._router.navigate(['document/group-contract-personalisation/contract-update', personalisedEmployeesInfo.DocumentId]);
  }
  ngOnInit() {
    let documentActionTypes: Array<AeSelectItem<number>> = EnumHelper.getAeSelectItems(DocumentActionType);
    documentActionTypes.forEach(actionType => {
      actionType.Text = this._translationService.translate(actionType.Text);
    });
    this._actionOptions = Immutable.List(documentActionTypes);
    let routeParams = this._route.params;
    let contractDetails = this._store.let(fromRoot.getContractDetails);
    let combineContractWithRouteParams = Observable.combineLatest(routeParams, contractDetails, (params, contract) => {
      this._sourceDocumentId = params['id'];
      this._sourceDocumentVersion = params['version'];
      if (!isNullOrUndefined(this._sourceDocumentId) && !isNullOrUndefined(this._sourceDocumentVersion)) {
        if (!isNullOrUndefined(contract)) {
          this._contractDetails = contract;
          this._store.dispatch(new LoadPersonalisedDocumentsBySource({ Id: this._sourceDocumentId, Version: this._sourceDocumentVersion }));
        }
        else {
          this._store.dispatch(new EmployeeContractPersonalisationLoad({ contractId: this._sourceDocumentId, withAttributes: false }));
        }
      }

      let bcItem: IBreadcrumb = new IBreadcrumb('Contract personalisation',
        'document/group-contract-personalisation/' + this._sourceDocumentId, BreadcrumbGroup.Contracts);
      this._breadcrumbService.add(bcItem);
      let bcItem1: IBreadcrumb = new IBreadcrumb('Review',
        '', BreadcrumbGroup.Contracts);
      this._breadcrumbService.add(bcItem1);
    })
    this._selectedEmployeesSubscription = this._store.let(fromRoot.getSelectedEmployeesToDistribute).subscribe((selectedEmployees) => {
      if (!isNullOrUndefined(selectedEmployees)) {
        this._personalisedSelectedEmployees = selectedEmployees;
      }
    });
    this._routeParamsSubscription = combineContractWithRouteParams.subscribe();
    this._personalisedDocumentsSubscription = this._store.let(fromRoot.getPersonalisedEmployeeDocuments).subscribe((empDocuments) => {
      if (!isNullOrUndefined(empDocuments)) {
        this._personalisedDocumentsList = empDocuments;
        this._personalisedDocuments$.next(this._personalisedDocumentsList);
      }
    });
    this._totalRecords$ = this._store.let(fromRoot.getPersonalisedEmployeeDocumentsTotalCount);
    this._dataTableOptions$ = this._store.let(fromRoot.getPersonalisedEmployeeDocumentsDataTableOptions);
  }

  ngOnDestroy() {
    this._routeParamsSubscription.unsubscribe();
    this._selectedEmployeesSubscription.unsubscribe();
    this._personalisedDocumentsSubscription.unsubscribe();
  }
}
