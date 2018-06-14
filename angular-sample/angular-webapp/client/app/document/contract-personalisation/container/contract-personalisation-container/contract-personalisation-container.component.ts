import { AeClassStyle } from '../../../../atlas-elements/common/ae-class-style.enum';
import { AeIconSize } from '../../../../atlas-elements/common/ae-icon-size.enum';
import { ViewEncapsulation, Component, OnInit, OnDestroy, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { BaseComponent } from '../../../../shared/base-component';
import { LocaleService, TranslationService, Localization } from "angular-l10n";
import { Store } from "@ngrx/store";
import { ClaimsHelperService } from "../../../../shared/helpers/claims-helper";
import { MessengerService } from "../../../../shared/services/messenger.service";
import * as fromRoot from '../../../../shared/reducers/index';
import { Subscription } from "rxjs/Subscription";
import { ContractDetails, EmployeeContractDetails } from "../../../models/contract-details.model";
import { isNullOrUndefined } from "util";
import { EmployeeContractPersonalisationLoad, LoadContractEmployeesListData, PersonliseDocumentAction } from "../../../contract-personalisation/actions/contract-personalisation.actions";
import { Observable, BehaviorSubject } from "rxjs/Rx";
import { ActivatedRoute, Router } from '@angular/router';
import * as Immutable from 'immutable';
import { AeDataTableAction } from "../../../../atlas-elements/common/models/ae-data-table-action";
import { PagingInfo } from "../../../../atlas-elements/common/models/ae-paging-info";
import { AeSortModel, SortDirection } from "../../../../atlas-elements/common/models/ae-sort-model";
import { EmployeeGroup } from '../../../../shared/models/company.models'
import { Site } from "../../../../calendar/model/calendar-models";
import { LoadSitesAction } from '../../../../shared/actions/company.actions';
import { AtlasApiRequest } from '../../../../shared/models/atlas-api-response';
import { AePageChangeEventModel } from "../../../../atlas-elements/common/models/ae-page-change-event-model";
import { AssociateEmployeesToEmployeeGroupAction } from "../../../../employee/employee-group/actions/employee-group.actions";
import { EmployeeGroupAssociation } from "../../../../employee/models/employee-group-association.model";
import { IBreadcrumb } from '../../../../atlas-elements/common/models/ae-ibreadcrumb.model';
import { BreadcrumbService } from "../../../../atlas-elements/common/services/breadcrumb-service";
import { Artifact } from "../../../models/artifact";
import { DocumentState } from "../../../common/document-state.enum";
import { DatePipe } from "@angular/common";
import { LoadApplicableSitesAction } from '../../../../shared/actions/user.actions';
import { BreadcrumbGroup } from '../../../../atlas-elements/common/models/ae-breadcrumb-group';

@Component({
  selector: 'contract-personalisation-container',
  templateUrl: './contract-personalisation-container.component.html',
  styleUrls: ['./contract-personalisation-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class ContractPersonalisationContainerComponent extends BaseComponent implements OnInit, OnDestroy {

  /** Private variable declarations - start. */
  private _contractDetails: Artifact;
  private _routesSubScription: Subscription;
  private _totalRecords$: Observable<number>;
  private _title: string;
  private _keys = Immutable.List(['Fullname', 'JobTitle', 'LatestContractVersion', 'DistributionDate', 'AcknowledgementDate']);
  private _actions: Immutable.List<AeDataTableAction>;
  private _pagingInfo: PagingInfo;
  private _sortingInfo: AeSortModel;
  private _showEmployeeAssociationSlideOut: boolean = false;
  private _pageNumber: number = 1;
  private _pageSize: number = 10;
  private _sortField: string = 'Fullname';
  private _sortDirection: SortDirection = SortDirection.Descending;
  private _contractDetailsSubscription: Subscription;
  private _groupContractId: string;
  private _iconSize: AeIconSize = AeIconSize.none
  private _lightClass: AeClassStyle = AeClassStyle.Light;
  private _selectedEmployees: EmployeeContractDetails[];
  private _personalisedDocumentStateSubscription: Subscription;
  /** Private variable declarations - end. */
  get iconSize(): AeIconSize {
    return this._iconSize;
  }
  get showEmployeeAssociationSlideOut(): boolean {
    return this._showEmployeeAssociationSlideOut;
  }
  get lightClass(): AeClassStyle {
    return this._lightClass;
  }
  get title(): string {
    return this._title;
  }

  get bcGroup(): BreadcrumbGroup {
    return BreadcrumbGroup.Contracts;
  }

  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _cdRef: ChangeDetectorRef
    , private _store: Store<fromRoot.State>
    , private _claimsHelperService: ClaimsHelperService
    , private _route: ActivatedRoute
    , private _router: Router
    , private _datePipe: DatePipe
    , private _messenger: MessengerService
    , private _breadcrumbService: BreadcrumbService) {
    super(_localeService, _translationService, _cdRef);
    this._title = "";
    this.id = 'contract-personalisation-container';
    this.name = 'contract-personalisation-container';
  }

  ngOnInit() {
    this._selectedEmployees = null;
    this._routesSubScription = this._route.params.subscribe(params => {
      this._groupContractId = params['id'];

      const bcItem: IBreadcrumb = new IBreadcrumb('Contract personalisation',
        'document/group-contract-personalisation/' + this._groupContractId, BreadcrumbGroup.Contracts);
      this._breadcrumbService.add(bcItem);

      this._store.dispatch(new EmployeeContractPersonalisationLoad({ contractId: params['id'], withAttributes: false }));
      this._store.dispatch(new LoadApplicableSitesAction(true));
    });

    this._contractDetailsSubscription = this._store.let(fromRoot.getContractDetails).subscribe(data => {
      if (!isNullOrUndefined(data)) {
        this._contractDetails = data; // master data
        this._title = data.Title;
        this._store.dispatch(new LoadContractEmployeesListData(new AtlasApiRequest(this._pageNumber, this._pageSize, this._sortField, this._sortDirection)));
      }
    })

    this._personalisedDocumentStateSubscription = this._store.let(fromRoot.hasDocumentPersonalisedState).subscribe((documentPersonalised) => {
      if (documentPersonalised && !isNullOrUndefined(this._contractDetails)) {
        this._router.navigate(["document/group-contract-personalisation/bulk-distribute/", this._contractDetails.Id, this._contractDetails.Version]);
      }
    })
  }

  /**
     * Event on cancel click
     * 
     * @private
     * @param {any} e 
     * 
     * @memberOf EmployeeGroupContainerComponent
     */
  onEmployeeAssociationGroupFormCancel(event: any) {
    this._showEmployeeAssociationSlideOut = false;

  }

  onEmployeeAssociationGroupFormSaveComplete(event: any) {
    this._showEmployeeAssociationSlideOut = false;
    event.ReloadData = true;
    event.ContractId = this._groupContractId;
    this._store.dispatch(new AssociateEmployeesToEmployeeGroupAction(event));
  }

  onAddEmployeesClick(event: any) {
    this._showEmployeeAssociationSlideOut = true;
  }

  onPreviousButtonClick() {
    this._router.navigate(["document/company/contracts-and-handbooks/contract-templates"]);
  }

  onPageChange(event: AePageChangeEventModel) {
    this._pageNumber = event.pageNumber;
    this._pageSize = event.noOfRows;
    this._store.dispatch(new LoadContractEmployeesListData(new AtlasApiRequest(this._pageNumber, this._pageSize, this._sortField, this._sortDirection)));
  }
  onSorting(event: AeSortModel) {
    this._sortField = event.SortField;
    this._sortDirection = event.Direction;
    this._store.dispatch(new LoadContractEmployeesListData(new AtlasApiRequest(this._pageNumber, this._pageSize, this._sortField, this._sortDirection)));
  }

  onEmployeeCheck(employees: EmployeeContractDetails[]) {
    this._selectedEmployees = employees;
  }

  enablePersonalize(): boolean {
    if (isNullOrUndefined(this._contractDetails) || isNullOrUndefined(this._contractDetails.EmployeeGroup) || isNullOrUndefined(this._contractDetails.EmployeeGroup.Employees)) return true;
    let contracts = this._contractDetails.EmployeeGroup.Employees.filter(x => x.HasContract == true)
    if (contracts.length > 0)
      return false;
    if (!isNullOrUndefined(this._selectedEmployees) && this._selectedEmployees.length > 0)
      return false;
    return true;
  }

  onPersonalizeClick() {
    if (isNullOrUndefined(this._contractDetails)) return;
    let date = this._datePipe.transform(new Date(), 'yyyy-MM-dd');
    if (!isNullOrUndefined(this._selectedEmployees)) {
      this._selectedEmployees.forEach((employee) => {
        var employeeContract = new Artifact();
        employeeContract.Title = employee.Fullname + ' contract ' + date;
        employeeContract.Category = 128;
        employeeContract.Description = employee.Fullname + ' contract ' + date;
        employeeContract.Comment = 'Document created';
        employeeContract.RegardingObjectId = employee.Id;
        employeeContract.RegardingObjectTypeCode = 17;
        employeeContract.FileNameAndTitle = employee.Fullname + ' contract ' + date;
        employeeContract.TemplateId = this._contractDetails.TemplateId;
        employeeContract.CountryId = this._contractDetails.CountryId;
        employeeContract.SectorId = this._contractDetails.SectorId;
        employeeContract.NamedDataSetId = this._contractDetails.NamedDataSetId;
        employeeContract.EmployeeGroupId = this._contractDetails.EmployeeGroupId;
        employeeContract.Usage = 1;
        employeeContract.IsActive = true;
        employeeContract.SourceDocumentId = this._contractDetails.Id;
        employeeContract.State = DocumentState.Draft;
        if (isNullOrUndefined(this._contractDetails.ArtifactList)) {
          this._contractDetails.ArtifactList = new Array<Artifact>();
        }
        this._contractDetails.ArtifactList.push(employeeContract);
      });
      this._store.dispatch(new PersonliseDocumentAction(this._contractDetails));
    }
    else {
      this._router.navigate(["document/group-contract-personalisation/bulk-distribute/", this._contractDetails.Id, this._contractDetails.Version]);
    }
  }

  getContractCreatedonDate() {
    let date: Date = null;
    if (!isNullOrUndefined(this._contractDetails)) {
      date = this._contractDetails.ModifiedOn;
    }
    return date;
  }

  getContractVersion() {
    let version: string = '';
    if (!isNullOrUndefined(this._contractDetails)) {
      version = this._contractDetails.Version;
    }
    return version;
  }

  getEmployeeGroupName() {
    let name: string = '';
    if (!isNullOrUndefined(this._contractDetails) && !isNullOrUndefined(this._contractDetails.EmployeeGroup)) {
      name = this._contractDetails.EmployeeGroup.Name;
    }
    return name;
  }
  /**
   * State of slide out
   * 
   * @private
   * @returns {string} 
   * 
   * @memberOf EmployeeGroupContainerComponent
   */
  getEmployeeAssociationSlideoutState(): string {
    return this._showEmployeeAssociationSlideOut ? 'expanded' : 'collapsed';
  }

  ngOnDestroy() {
    if (this._contractDetailsSubscription)
      this._contractDetailsSubscription.unsubscribe();
    if (this._routesSubScription)
      this._routesSubScription.unsubscribe();
    if (this._personalisedDocumentStateSubscription)
      this._personalisedDocumentStateSubscription.unsubscribe();
  }
}