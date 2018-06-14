import { ChangeDetectionStrategy, OnDestroy, ViewEncapsulation } from '@angular/core';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { LocaleService, TranslationService } from 'angular-l10n';
import * as Immutable from 'immutable';
import { BehaviorSubject, Subscription } from 'rxjs';
import { Observable, Subject } from 'rxjs/Rx';
import { isNullOrUndefined } from 'util';

import { AeClassStyle } from '../../../../atlas-elements/common/ae-class-style.enum';
import { AeDatasourceType } from '../../../../atlas-elements/common/ae-datasource-type';
import { SortDirection } from '../../../../atlas-elements/common/models/ae-sort-model';
import { Tristate } from '../../../../atlas-elements/common/tristate.enum';
import { getFlatValues } from '../../../../company/nonworkingdaysandbankholidays/common/extract-helpers';
import { mapEmployeKeyValuesToAeSelectItems } from '../../../../employee/common/extract-helpers';
import { IncidentStatus } from '../../../../incident-log/models/incident-status.enum';
import { MethodStatementStatus } from '../../../../method-statements/models/method-statement';
import { RiskAssessmentStatus } from '../../../../risk-assessment/common/risk-assessment-status.enum';
import { addOrUpdateAtlasParamValue } from '../../../../root-module/common/extract-helpers';
import { DistributeDocumentAction } from '../../../document-details/actions/document-distribute.actions';
import {
    DistributedDocument,
    DocumentDetails,
    DocumentDetailsType,
} from '../../../document-details/models/document-details-model';
import { DocumentDetailsService } from '../../../document-details/services/document-details.service';
import { DocumentsFolder } from '../../../models/document';
import { DocumentArea } from '../../../models/document-area';
import { DocumentCategoryEnum } from '../../../models/document-category-enum';
import { extractDocumentCategorySelectItems } from '../../common/company-document-extract-helper';
import { AeDataTableAction } from './../../../../atlas-elements/common/models/ae-data-table-action';
import { DataTableOptions } from './../../../../atlas-elements/common/models/ae-datatable-options';
import { AeSelectItem } from './../../../../atlas-elements/common/models/ae-select-item';
import { EmployeeSearchService } from './../../../../employee/services/employee-search.service';
import { LoadAllDepartmentsAction, LoadSitesAction } from './../../../../shared/actions/company.actions';
import { BaseComponent } from './../../../../shared/base-component';
import { ClaimsHelperService } from './../../../../shared/helpers/claims-helper';
import { EnumHelper } from './../../../../shared/helpers/enum-helper';
import { StringHelper } from './../../../../shared/helpers/string-helper';
import { AtlasApiRequestWithParams, AtlasParams } from './../../../../shared/models/atlas-api-response';
import * as fromRoot from './../../../../shared/reducers';
import { RouteParams } from './../../../../shared/services/route-params';
import { Document } from './../../../models/document';
import { DocumentCategoryService } from './../../../services/document-category-service';
import { DocumentService } from './../../../services/document-service';
import {
    LoadCompanyDocumentsAction,
    RemoveCompanyDocumentAction,
    UpdateCompanyDocumentAction,
} from './../../actions/company-documents.actions';

@Component({
  selector: 'company-documents-list',
  templateUrl: './company-documents-list.component.html',
  styleUrls: ['./company-documents-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class CompanyDocumentsListComponent extends BaseComponent implements OnInit, OnDestroy {

  // Private Fields  
  private _documentCategories: BehaviorSubject<Immutable.List<AeSelectItem<string>>> = new BehaviorSubject<Immutable.List<AeSelectItem<string>>>(null);
  private _companyDocumentsListForm: FormGroup;
  private _documentFolder: DocumentsFolder;
  private _documentCategoriesSubscription: Subscription;
  private _localDataSourceType: AeDatasourceType = AeDatasourceType.Local;
  private _remoteDataSourceType: AeDatasourceType = AeDatasourceType.Remote;
  private _sites$: Observable<AeSelectItem<string>[]>;
  private _departments$: Observable<AeSelectItem<string>[]>;
  private _departmentsSubscription: Subscription;
  private _sitesSubscription: Subscription;
  private _employeeFilters: Map<string, string> = new Map<string, string>();
  private _searchedEmployeesSub: BehaviorSubject<AeSelectItem<string>[]> = new BehaviorSubject<AeSelectItem<string>[]>(null);

  private _companyDocumentsTableOptions$: Observable<DataTableOptions>;
  private _companyDocumentsTotalCount$: Observable<number>;
  private _companyDocumentsLoaded$: Observable<boolean>;
  private _companyDocuments$: Observable<Immutable.List<Document>>;
  private _lightClass: AeClassStyle = AeClassStyle.Light;

  private _keys = Immutable.List(['Id', 'FileNameAndTitle', 'CategoryName', 'Version', 'SiteName', 'EmployeeName', 'ModifiedOn', 'Status']);
  private _apiRequest: AtlasApiRequestWithParams;
  private _apiRequestSub: Subscription;
  private _isFirstTimeLoad: boolean = true;
  private _actions: Immutable.List<AeDataTableAction>;
  private _viewDocumentCommand = new Subject();
  private _viewDocumentCommandSub: Subscription;
  private _downloadActionCommand = new Subject();
  private _downloadActionCommandSub: Subscription;
  private _distributeActionCommand = new Subject();
  private _distributeActionCommandSub: Subscription;
  private _showRemoveDocumentDistributeSelectSlideOut: boolean;
  private _documentDetails$: Observable<DocumentDetails>;
  private _routerSubscription: Subscription;
  private _documentCategoryStatus$: BehaviorSubject<Immutable.List<AeSelectItem<number>>> = new BehaviorSubject<Immutable.List<AeSelectItem<number>>>(null);
  private _deleteActionCommand = new Subject();
  private _deleteActionCommandSub: Subscription;
  private _showRemovDocumentConfirm: boolean;
  private _selectedDocument: Document;
  private _updateDocumentActionCommand = new Subject();
  private _updateDocumentActionCommandSub: Subscription;
  private _showUpdateDocumentSlideOut: boolean;
  private _documentCategoriesForUpdate: Immutable.List<AeSelectItem<string>>;
  // End of Private Fields

  // Public properties
  get documentCategoriesForUpdate(): Immutable.List<AeSelectItem<string>> {
    return this._documentCategoriesForUpdate;
  }
  get showUpdateDocumentSlideOut(): boolean {
    return this._showUpdateDocumentSlideOut;
  }

  get selectedDocument(): Document {
    return this._selectedDocument;
  }
  get documentCategoryStatus$(): BehaviorSubject<Immutable.List<AeSelectItem<number>>> {
    return this._documentCategoryStatus$;
  }
  get companyDocumentsListForm(): FormGroup {
    return this._companyDocumentsListForm;
  }
  get documentCategories(): BehaviorSubject<Immutable.List<AeSelectItem<string>>> {
    return this._documentCategories;
  }
  get sites$(): Observable<AeSelectItem<string>[]> {
    return this._sites$;
  }
  get localDataSourceType(): AeDatasourceType {
    return this._localDataSourceType;
  }
  get remoteDataSourceType(): AeDatasourceType {
    return this._remoteDataSourceType;
  }
  get departments$(): Observable<AeSelectItem<string>[]> {
    return this._departments$;
  }
  get searchedEmployeesSub(): BehaviorSubject<AeSelectItem<string>[]> {
    return this._searchedEmployeesSub;
  }
  get companyDocuments$(): Observable<Immutable.List<Document>> {
    return this._companyDocuments$;
  }
  get actions(): Immutable.List<AeDataTableAction> {
    return this._actions;
  }
  get companyDocumentsTotalCount$(): Observable<number> {
    return this._companyDocumentsTotalCount$;
  }
  get companyDocumentsTableOptions$(): Observable<DataTableOptions> {
    return this._companyDocumentsTableOptions$;
  }
  get companyDocumentsLoaded$(): Observable<boolean> {
    return this._companyDocumentsLoaded$;
  }
  get keys(): Immutable.List<string> {
    return this._keys;
  }
  get showRemoveDocumentDistributeSelectSlideOut(): boolean {
    return this._showRemoveDocumentDistributeSelectSlideOut;
  }
  get showRemovDocumentConfirm(): boolean {
    return this._showRemovDocumentConfirm;
  }
  get documentType(): DocumentDetailsType {
    return DocumentDetailsType.Document;
  }
  get lightClass(): AeClassStyle {
    return this._lightClass;
  }

  get documentDetails$(): Observable<DocumentDetails> {
    return this._documentDetails$;
  }

  get apiRequest(): AtlasApiRequestWithParams {
    return this._apiRequest;
  }
  
  // End of Public properties

  // Public ViewChild bindings
  // End of Public ViewChild bindings

  // Public ContnetChild bindings
  // End of Public ContnetChild bindings

  // Constructor
  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _cdRef: ChangeDetectorRef
    , protected _store: Store<fromRoot.State>
    , private _claimsHelper: ClaimsHelperService
    , private _fb: FormBuilder
    , private _router: Router
    , private _route: ActivatedRoute
    , private _documentCategoryService: DocumentCategoryService
    , private _employeeSearchService: EmployeeSearchService
    , private _documentDetailsService: DocumentDetailsService
    , private _routeParamsService: RouteParams
    , private _documentService: DocumentService
  ) {
    super(_localeService, _translationService, _cdRef);
    this.id = 'company-documents-list';
    this.name = 'company-documents-list';
  }

  // End of constructor

  // Private methods
  private _getAppropriateStatus(category: string, status: string) {
    if (category == DocumentCategoryEnum.RiskAssessment.toString()) {
      //now get the status id 
      let selectedValue = EnumHelper.getGivenNameEnumValue(RiskAssessmentStatus, status);
      return selectedValue;
    }
    return null;
  }
  private _initForm(categoryId, statusId) {
    this._companyDocumentsListForm = this._fb.group({
      documentCategory: [{ value: categoryId, disabled: false }],
      site: [{ value: '', disabled: false }],
      department: [{ value: '', disabled: false }],
      employee: [{ value: [], disabled: false }],
      documentCategoryStatus: [{ value: statusId, disabled: false }]
    }
    );


    this._companyDocumentsListForm.valueChanges.subscribe(data => {
      //this._holidayAbsenceRequest represents the current request object, now modify the request object with form changed parameters and raise api rquest to fetch  the data again
      //clear all parameters and then assign from the form values 
      //this._apiRequest.Params = [];
      this._apiRequest.PageNumber = 1;
      this._apiRequest.Params = addOrUpdateAtlasParamValue(this._apiRequest.Params, 'DocumentFolder', this._documentFolder);
      this._apiRequest.Params = addOrUpdateAtlasParamValue(this._apiRequest.Params, 'Site', data.site && data.site[0] ? data.site[0] : null);
      this._apiRequest.Params = addOrUpdateAtlasParamValue(this._apiRequest.Params, 'DocumentCategory', data.documentCategory);
      this._apiRequest.Params = addOrUpdateAtlasParamValue(this._apiRequest.Params, 'DepartmentId', data.department && data.department[0] ? data.department[0] : null);
      this._apiRequest.Params = addOrUpdateAtlasParamValue(this._apiRequest.Params, 'EmployeeId', data.employee && data.employee[0] ? data.employee[0] : null);
      if (!isNullOrUndefined(data.documentCategoryStatus) && !isNullOrUndefined(data.documentCategory) && data.documentCategoryStatus != "-1") {
        this._apiRequest.Params = addOrUpdateAtlasParamValue(this._apiRequest.Params, 'DocumentViewByCategoryStatus', data.documentCategory + '#' + data.documentCategoryStatus);
      } else {
        this._apiRequest.Params = addOrUpdateAtlasParamValue(this._apiRequest.Params, 'DocumentViewByCategoryStatus', null);
      }
      this._store.dispatch(new LoadCompanyDocumentsAction(this._apiRequest));
    });

  }
  private _setActions() {
    this._actions = Immutable.List([
      new AeDataTableAction("View", this._viewDocumentCommand, false),
      new AeDataTableAction("Download", this._downloadActionCommand, false),
      new AeDataTableAction("Distribute", this._distributeActionCommand, false, (item) => { return this._showDistributeDocumentAction(item) }),
      new AeDataTableAction("Update", this._updateDocumentActionCommand, false, (item) => { return this._showUpdateDocumentAction(item) }),
      new AeDataTableAction("Remove", this._deleteActionCommand, false, (item) => { return this._showDeleteDocumentAction(item) })
    ]);
  }
  private _showUpdateDocumentAction(item: Document): Tristate {
    return this._documentCategoryService.getIsDocumentCanBeUpdated(item, this._claimsHelper) ? Tristate.True : Tristate.False;
  }
  private _showDeleteDocumentAction(item: Document): Tristate {
    return this._documentCategoryService.getIsDocumentCanbeDeleted(item, this._claimsHelper, this._routeParamsService) ? Tristate.True : Tristate.False;
  }
  private _showDistributeDocumentAction(item: Document): Tristate {
    if (item.Category == DocumentCategoryEnum.PersonalDocuments) {
      return Tristate.False;
    }
    return this._claimsHelper.canDistributeAnyDocument ? Tristate.True : Tristate.False;
  }
  // End of private methods

  // Public methods
  public canEmployeeNameColumnShown(): boolean {
    return this._documentFolder == DocumentsFolder.AppraisalReviews
      || this._documentFolder == DocumentsFolder.DisciplinaryAndGrivences
      || this._documentFolder == DocumentsFolder.Trainings
      || this._documentFolder == DocumentsFolder.StartersAndLeavers
      || this._documentFolder == DocumentsFolder.General
  }

  public canSiteNameColumnShown(): boolean {
    return this._documentFolder != DocumentsFolder.General
  }

  public onCategoryChange($event) {
    if (!StringHelper.isNullOrUndefinedOrEmpty($event.SelectedValue)) {
      let selectedCategory: DocumentCategoryEnum = <DocumentCategoryEnum>parseInt($event.SelectedValue);
      let categoryStatus: Array<AeSelectItem<number>>;
      let allOption: AeSelectItem<number> = new AeSelectItem<number>('All', -1);
      switch (selectedCategory) {
        case DocumentCategoryEnum.AccidentLogs:
          //IncidentStatus, but get only Pending,Approved
          categoryStatus = EnumHelper.getAeSelectItems(IncidentStatus);
          categoryStatus = categoryStatus.filter(obj => obj.Value == IncidentStatus.Pending || obj.Value == IncidentStatus.Approved);
          break;
        case DocumentCategoryEnum.ConstructionPhasePlans:
        case DocumentCategoryEnum.RiskAssessment:
          categoryStatus = EnumHelper.getAeSelectItems(RiskAssessmentStatus);
          //RiskAssessmentStatus , but only Live,Pending, Overdue
          //RiskAssessmentStatus , but only Live,Pending, Overdue
          categoryStatus = categoryStatus.filter(obj => obj.Value == RiskAssessmentStatus.Pending || obj.Value == RiskAssessmentStatus.Live || obj.Value == RiskAssessmentStatus.Overdue);
          break;
        case DocumentCategoryEnum.MethodStatements:
          categoryStatus = EnumHelper.getAeSelectItems(MethodStatementStatus);
          categoryStatus = categoryStatus.filter(obj => obj.Value == MethodStatementStatus.Pending || obj.Value == MethodStatementStatus.Live || obj.Value == MethodStatementStatus.Completed);
          //MethodStatementStatus, but only Live,Pending.Completed
          break;
        default:
          categoryStatus = [];
          break;
      }
      categoryStatus.push(allOption);
      categoryStatus = categoryStatus.sort((a, b) => a.Text.localeCompare(b.Text));
      this._documentCategoryStatus$.next(Immutable.List(categoryStatus));
    }
  }

  public canSiteFilterBeShown(): boolean {
    return this._documentCategoryService.getSitesFilterBeShownByFolder(this._documentFolder);
  }

  public canDepartmentFilterBeShown(): boolean {
    return this._documentCategoryService.getDepartmentFilterBeShownByFolder(this._documentFolder);
  }
  public canEmployeeShown(): boolean {
    return this._documentCategoryService.getEmployeeFilterBeShownByFolder(this._documentFolder);
  }
  public canStatusShown(): boolean {
    if (this._documentFolder == DocumentsFolder.HSDocumentSuite && !isNullOrUndefined(this._companyDocumentsListForm.controls['documentCategory'])) {
      let selectedCategory: DocumentCategoryEnum = <DocumentCategoryEnum>this._companyDocumentsListForm.controls['documentCategory'].value;
      if (selectedCategory == DocumentCategoryEnum.AccidentLogs
        || selectedCategory == DocumentCategoryEnum.ConstructionPhasePlans
        || selectedCategory == DocumentCategoryEnum.MethodStatements
        || selectedCategory == DocumentCategoryEnum.RiskAssessment
      ) {
        return true;
      } else {
        return false;
      }
    }
    return false;
  }
  public searchEmployees($event) {
    // add department filter      
    this._employeeFilters.set('employeesByDepartmentFilter', getFlatValues(this._companyDocumentsListForm.controls['department'].value));
    this._employeeSearchService.getEmployeesKeyValuePair($event.query, this._employeeFilters).first().subscribe((empData) => {
      this._searchedEmployeesSub.next(mapEmployeKeyValuesToAeSelectItems(empData));
    });
  }
  public onGridPaging($event) {
    this._apiRequest.PageNumber = $event.pageNumber;
    this._apiRequest.PageSize = $event.noOfRows;
    this._store.dispatch(new LoadCompanyDocumentsAction(this._apiRequest));
  }
  public onGridSorting($event) {
    this._apiRequest.SortBy.SortField = $event.SortField;
    this._apiRequest.SortBy.Direction = $event.Direction;
    this._store.dispatch(new LoadCompanyDocumentsAction(this._apiRequest));
  }

  public canDocumentCategoryFilterBeShown(): boolean {
    return this._documentCategoryService.getDocumentCategoryFilterBeShownByFolder(this._documentFolder);
  }
  public onDocumentUpdateCancel($event) {
    this._showUpdateDocumentSlideOut = false;
    this._selectedDocument = null;
  }
  public onDocumentUpdateSubmit(doc: Document) {
    //here we need to despatch action to update the document category and other details
    this._showUpdateDocumentSlideOut = false;
    doc.ShouldReloadList = true;
    this._store.dispatch(new UpdateCompanyDocumentAction(doc));
  }
  public ngOnInit() {
    this._employeeFilters.clear();
    this._documentFolder = this._documentCategoryService.getDocumentFolderByRoutePath(this._route.snapshot.url[0].path);
    this._documentCategoriesSubscription = this._store.let(fromRoot.getDocumentCategoriesData).subscribe(res => {
      if (!isNullOrUndefined(res)) {
        let documentCategoriesInLibrary = this._documentCategoryService.getDocumentCategoriesByArea(res, DocumentArea.DocumentLibrary);
        let folderDocCategories = this._documentCategoryService.getDocumentCategoriesByFolder(documentCategoriesInLibrary, this._documentFolder);
        this._documentCategories.next(Immutable.List(extractDocumentCategorySelectItems(folderDocCategories)));
        this._documentCategoriesForUpdate = Immutable.List(extractDocumentCategorySelectItems(this._documentCategoryService.getDocumentCategoriesForUpdate(documentCategoriesInLibrary)));
      }
      else {
        this._documentCategoryService.loadDocumentCategories();
      }
    });

    this._departments$ = this._store.let(fromRoot.getAllDepartmentsForMultiSelectData);
    this._sites$ = this._store.let(fromRoot.getsitesClientsForMultiSelectData);
    this._departmentsSubscription = this._store.let(fromRoot.getAllDepartmentsData).subscribe(departmentsLoaded => {
      if (!departmentsLoaded)
        this._store.dispatch(new LoadAllDepartmentsAction());
    });

    this._sitesSubscription = this._store.let(fromRoot.getSiteData).subscribe(sites => {
      if (!sites)
        this._store.dispatch(new LoadSitesAction(false));
    });

    this._companyDocuments$ = this._store.let(fromRoot.getCompanyDocumentsData);
    this._companyDocumentsLoaded$ = this._store.let(fromRoot.getCompanyDocumentsLoadedData);
    this._companyDocumentsTableOptions$ = this._store.let(fromRoot.getCompanyDocumentsDataTableOptionsData);
    this._companyDocumentsTotalCount$ = this._store.let(fromRoot.getCompanyDocumentsTotalCountData);
    this._documentDetails$ = this._documentDetailsService.loadDocumentDetails();
    //raise load documents action based on the folder requested....//first check if any existing API request is available in the state, will be useful
    //if existing request is available we need to bind those request values to the form and raise API to get the data 
    this._apiRequestSub = this._store.let(fromRoot.getCompanyDocumentsApiRequestData).subscribe((request) => {
      //TODO:Here we cannot fully leverage on the store API request since changing folders need fresh API request to be raised
      //Hence we should have a route param which will distinguish between a folder change or a back button from document details page to select the desired filters along with that API
      if (this._isFirstTimeLoad) {
        this._isFirstTimeLoad = false;
        let params: AtlasParams[] = [];
        params.push(new AtlasParams('DocumentFolder', this._documentFolder))
        this._apiRequest = new AtlasApiRequestWithParams(1, 10, 'FileNameAndTitle', SortDirection.Ascending, params);
        this._routerSubscription = this._route.params.takeUntil(this._destructor$).subscribe((params) => {
          if (!isNullOrUndefined(params['id']) && !isNullOrUndefined(params['status'])) {
            this._apiRequest.Params = addOrUpdateAtlasParamValue(this._apiRequest.Params, 'DocumentCategory', params['id']);
            let requestedStatus = this._getAppropriateStatus(params['id'], params['status']);
            this.onCategoryChange({ SelectedValue: params['id'].toString() });
            if (!isNullOrUndefined(requestedStatus)) {
              this._apiRequest.Params = addOrUpdateAtlasParamValue(this._apiRequest.Params, 'DocumentViewByCategoryStatus', params['id'] + '#' + requestedStatus);
            }
            this._initForm(params['id'], requestedStatus);
          } else {
            this._initForm('', '-1');
          }
        });
        this._store.dispatch(new LoadCompanyDocumentsAction(this._apiRequest));
      }
    });


    this._setActions();

    this._viewDocumentCommandSub = this._viewDocumentCommand.subscribe(document => {
      let doc = document as Document;
      let navigationExtras: NavigationExtras = {
        queryParamsHandling: 'merge'
      };
      let url = 'document/document-details/' + doc.Id
      this._router.navigate([url], navigationExtras);
    });

    this._distributeActionCommandSub = this._distributeActionCommand.subscribe(document => {
      let doc = document as Document;
      this._documentDetailsService.dispatchDocumentDetails(doc.Id, DocumentDetailsType.Document);
      this._showRemoveDocumentDistributeSelectSlideOut = true;
    });

    this._downloadActionCommandSub = this._downloadActionCommand.subscribe(document => {
      let doc = document as Document;
      if (!isNullOrUndefined(doc.Id)) {
        let url = this._routeParamsService.Cid ? `/filedownload?documentId=${doc.Id}&?isSystem=false&version=${doc.Version}&cid=${this._routeParamsService.Cid}` : `/filedownload?documentId=${doc.Id}&?isSystem=false&version=${doc.Version}`
        window.open(url);
      }
    });
    this._deleteActionCommandSub = this._deleteActionCommand.subscribe(document => {
      let doc = document as Document;
      this._selectedDocument = doc;
      this._showRemovDocumentConfirm = true;
    });
    this._updateDocumentActionCommandSub = this._updateDocumentActionCommand.subscribe((document) => {
      let doc = document as Document;
      this._documentDetailsService.dispatchDocumentDetails(doc.Id, DocumentDetailsType.Document);
      this._showUpdateDocumentSlideOut = true;
    });
  }
  public deleteConfirmModalClosed($event) {
    if ($event == 'Yes') {
      this._selectedDocument.ShouldReloadList = true;
      this._store.dispatch(new RemoveCompanyDocumentAction(this._selectedDocument));
      //now we need to refresh the grid
    }
    this._showRemovDocumentConfirm = false;
  }
  getDocDistributeSlideoutState() {
    return this._showRemoveDocumentDistributeSelectSlideOut ? 'expanded' : 'collapsed';
  }
  getDocUpdateSlideoutState() {
    return this._showUpdateDocumentSlideOut ? 'expanded' : 'collapsed';
  }
  get getRemoveDocumentConfirmState() {
    return this._showRemovDocumentConfirm ? 'expanded' : 'collapsed';
  }
  onDocumentDistribute(distributedDoc: DistributedDocument) {
    //here we need to despatch the action based on the model we recied with document or shared document
    this._store.dispatch(new DistributeDocumentAction(distributedDoc));
    this._showRemoveDocumentDistributeSelectSlideOut = false;
  }

  onAeCancel($event) {
    this._showRemoveDocumentDistributeSelectSlideOut = false;
    this._selectedDocument = null;
  }

  ngOnDestroy() {
    super.ngOnDestroy();
    if (this._updateDocumentActionCommandSub) {
      this._updateDocumentActionCommandSub.unsubscribe();
    }
    if (this._deleteActionCommandSub) {
      this._deleteActionCommandSub.unsubscribe();
    }
    if (this._documentCategoriesSubscription) {
      this._documentCategoriesSubscription.unsubscribe();
    }

    if (this._departmentsSubscription) {
      this._departmentsSubscription.unsubscribe();
    }

    if (this._sitesSubscription) {
      this._sitesSubscription.unsubscribe();
    }

    if (this._apiRequestSub) {
      this._apiRequestSub.unsubscribe();
    }

    if (this._viewDocumentCommandSub) {
      this._viewDocumentCommandSub.unsubscribe();
    }
    if (this._downloadActionCommandSub)
      this._downloadActionCommandSub.unsubscribe();
    if (this._distributeActionCommandSub)
      this._distributeActionCommandSub.unsubscribe();

    // End of public methods
  }
}
