import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Input, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { LocaleDatePipe, LocaleService, TranslationService } from 'angular-l10n';
import * as Immutable from 'immutable';
import { BehaviorSubject, Observable, Subscription } from 'rxjs/Rx';
import { isNullOrUndefined } from 'util';

import { DataTableOptions } from '../../../atlas-elements/common/models/ae-datatable-options';
import { SortDirection } from '../../../atlas-elements/common/models/ae-sort-model';
import { addOrUpdateAtlasParamValue, getAtlasParamValueByKey } from '../../../root-module/common/extract-helpers';
import { DistributedDocumentsModeOfOperation, DocumentActionType } from '../../models/document';
import { AeSelectItem } from './../../../atlas-elements/common/models/ae-select-item';
import { AeSortModel } from './../../../atlas-elements/common/models/ae-sort-model';
import { BaseComponent } from './../../../shared/base-component';
import { ClaimsHelperService } from './../../../shared/helpers/claims-helper';
import { AtlasApiRequestWithParams, AtlasParams } from './../../../shared/models/atlas-api-response';
import * as fromRoot from './../../../shared/reducers';
import { RouteParams } from './../../../shared/services/route-params';
import { LoadCompanyDocumentsToReview, LoadCompanyUsefulDocumentsToReview } from './../../actions/shared-documents.actions';
import { getDocumentActionStatus } from './../../common/document-helper';
import { DistributedDocument } from './../../models/DistributedDocument';
import { DocumentSignatureDetails } from '../../document-shared/models/document-signature.model';


@Component({
  selector: 'company-documents-distributed',
  templateUrl: './company-documents-distributed.component.html',
  styleUrls: ['./company-documents-distributed.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class CompanyDocumentsDistributedComponent extends BaseComponent implements OnInit, OnDestroy {

  // Private Fields   
  private _disributedDocuments$: Observable<Immutable.List<DistributedDocument>>;  //BehaviorSubject<Immutable.List<DistributedDocument>> = new BehaviorSubject(<Immutable.List<DistributedDocument>>(null));
  private _keys = Immutable.List(['Id', 'DocumentName', 'DistributeDocumentId', 'DocumentVersion', 'DateSent', 'ActionedDateOn', 'DueDate', 'DocumentAction', 'CategoryName', 'CompanyId', 'OperationMode', 'Signature']);
  private _totalRecords = new BehaviorSubject(0);
  private _distributedDocumentsSubscription: Subscription;
  private _showRemoveDocumentActionConfirmModalDialog: boolean = false;
  private _selectedDocument: DistributedDocument;
  private _actionedDocumentForm: FormGroup;
  private _validationMessage: string;
  private _modeOfOPeration: DistributedDocumentsModeOfOperation;
  private _preferredPageSize: number = 10;
  private _preferredSortField: string = "DateSent";
  private _preferredSortDirection: SortDirection = SortDirection.Descending; // "desc";
  private _preferredParams: AtlasParams[] = [new AtlasParams('DocumentAction', '1')];
  private _currentDocumentsAPIRequest: AtlasApiRequestWithParams;
  private _currentUsefulDocumentsAPIRequest: AtlasApiRequestWithParams;

  private _currentDocumentsAPIRequestSubScription: Subscription;
  private _currentUsefulDocumentsAPIRequestSubscription: Subscription;
  private _defaultLocale: string;
  private _documentsLoading$: Observable<boolean>;

  private _preferredsSharedPageSize: number = 10;
  private _preferredSharedSortField: string = "CreatedOn";
  private _preferredSharedSortDirection: SortDirection = SortDirection.Descending; //"desc";

  private _documentsCount$: Observable<number>;
  private _usefulDocumentsCount: Observable<number>;
  private _dataTableOptions$: Observable<DataTableOptions>;
  private _currentPage$: Observable<number>;
  private _totalRecords$: Observable<number>;
  private _defaultNoOfRows: number;
  private _documentActionFilter: Immutable.List<AeSelectItem<string>>;
  private _requireActionStatus: string;
  private _documentsFilterForm: FormGroup;
  private _loadingSubscription: Subscription;
  private _documentSignatureDetails: DocumentSignatureDetails;
  private _showSignatureDialog: boolean;

  // End of Private Fields

  // Public properties
  get documentsFilterForm() {
    return this._documentsFilterForm;
  }
  get documentActionFilter() {
    return this._documentActionFilter;
  }
  get disributedDocuments$() {
    return this._disributedDocuments$;
  }
  get totalRecords$() {
    return this._totalRecords$;
  }
  get dataTableOptions$() {
    return this._dataTableOptions$;
  }
  get documentsLoading$() {
    return this._documentsLoading$;
  }
  get keys() {
    return this._keys;
  }
  get showRemoveDocumentActionConfirmModalDialog() {
    return this._showRemoveDocumentActionConfirmModalDialog;
  }
  get modeOfOPeration() {
    return this._modeOfOPeration;
  }
  get selectedDocument() {
    return this._selectedDocument;
  }
  get preferredParams() {
    return this._preferredParams;
  }
  get documentSignatureDetails() {
    return this._documentSignatureDetails;
  }
  get showSignatureDialog() {
    return this._showSignatureDialog;
  }
  // End of Public properties

  // Public Output bindings
  // End of Public Output bindings

  // Public ViewChild bindings
  // End of Public ViewChild bindings

  // Public ContnetChild bindings
  // End of Public ContnetChild bindings

  // Constructor
  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _cdRef: ChangeDetectorRef
    , private _store: Store<fromRoot.State>
    , private _claimsHelper: ClaimsHelperService
    , private _route: ActivatedRoute
    , private _router: Router
    , private _localeDatePipe: LocaleDatePipe
    , private _fb: FormBuilder
    , private _routeParamsService: RouteParams
  ) {
    super(_localeService, _translationService, _cdRef);
    this._documentActionFilter = getDocumentActionStatus();
    this._documentSignatureDetails = new DocumentSignatureDetails();
  }

  // End of constructor

  // Private methods


  private _initForm() {
    this._documentsFilterForm = this._fb.group({
      documentAction: [{ value: this._requireActionStatus }]
    });
  }
  private _patchForm(documentAct: string) {
    this._documentsFilterForm.patchValue({
      documentAction: documentAct
    });
  }
  //public methods


  public onDailogDisplayStatusChanged($event: boolean) {
    //in this event we need to close the pop up and based on the response if true we need to reload the grid with the current paging and sorting settings
    //the current API request is stored in the state, so we need to raise the APi call with the same APi request which is previously requested
    this._showRemoveDocumentActionConfirmModalDialog = false;
    this._documentsLoading$ = Observable.of(false);
    this._cdRef.markForCheck();
    //despatch to load data again only if he has actioned on the opened _document
    // if ($event) {
    //   if (this._modeOfOPeration == DistributedDocumentsModeOfOperation.Documents) {
    //     this._store.dispatch(new LoadCompanyDocumentsToReview(this._currentDocumentsAPIRequest));
    //   }
    //   else if (this._modeOfOPeration == DistributedDocumentsModeOfOperation.SharedDocuments) {
    //     this._store.dispatch(new LoadCompanyUsefulDocumentsToReview(this._currentUsefulDocumentsAPIRequest));
    //   }
    // }
  }

  public modalClosed($event) {
    this._showRemoveDocumentActionConfirmModalDialog = false;
    this._documentsLoading$ = Observable.of(false);
    this._cdRef.markForCheck();
  }

  public onDocumentAction(doc: DistributedDocument) {
    this._selectedDocument = doc;
    this._modeOfOPeration = doc.OperationMode;
    this._showRemoveDocumentActionConfirmModalDialog = true;
    this._documentsLoading$ = Observable.of(true);
    this._cdRef.markForCheck();
  }

  public canActionTakenVisible(doc: DistributedDocument): boolean {
    if ((doc.DocumentAction == DocumentActionType.RequiresSign || doc.DocumentAction == DocumentActionType.RequiresRead) && (doc.ActionedDateOn))
      return true;
    return false;
  }


  public canRequireActionVisible(doc: DistributedDocument): boolean {
    if ((doc.DocumentAction == DocumentActionType.RequiresSign || doc.DocumentAction == DocumentActionType.RequiresRead) && (!doc.ActionedDateOn))
      return true;
    return false;
  }

  public canNoActionRequireVisible(doc: DistributedDocument): boolean {
    if (doc.DocumentAction == DocumentActionType.NoActionRequired)
      return true;
    return false;
  }

  public getActionTitle(doc: DistributedDocument): string {
    if (this.canActionTakenVisible(doc))
      return "Actioned on " + this._localeDatePipe.transform(doc.ActionedDateOn, this._defaultLocale, 'dd/MM/yyyy');
    if (this.canNoActionRequireVisible(doc))
      return "No action required";
    if (this.canRequireActionVisible(doc)) {
      if (doc.DocumentAction == DocumentActionType.RequiresSign)
        return "Require sign";
      return "Require read"
    }
  }





  public onDocumentDownLoad(doc: DistributedDocument) {
    if (doc.OperationMode == DistributedDocumentsModeOfOperation.Documents) {
      let url = this._routeParamsService.Cid ? `/filedownload?documentId=${doc.Id}&?isSystem=false&version=${doc.DocumentVersion}&cid=${this._routeParamsService.Cid}` : `/filedownload?documentId=${doc.Id}&?isSystem=false&version=${doc.DocumentVersion}`
      window.open(url);
    }
    if (doc.OperationMode == DistributedDocumentsModeOfOperation.SharedDocuments)
      window.open('/filedownload?sharedDocumentId=' + doc.Id);
  }

  public onPageChange($event: any) {
    //TODO:Here we need to pass the current sorting infor
    this._preferredPageSize = $event.noOfRows;
    this._store.dispatch(new LoadCompanyDocumentsToReview(new AtlasApiRequestWithParams($event.pageNumber, this._preferredPageSize, this._currentDocumentsAPIRequest.SortBy.SortField, this._currentDocumentsAPIRequest.SortBy.Direction, this._currentDocumentsAPIRequest.Params)));
  }

  public onSort($event: AeSortModel) {
    this._preferredParams = this._currentDocumentsAPIRequest.Params;
    this._preferredSortField = $event.SortField;
    this._preferredSortDirection = $event.Direction;
    this._store.dispatch(new LoadCompanyDocumentsToReview(new AtlasApiRequestWithParams(1, this._preferredPageSize, this._preferredSortField, this._preferredSortDirection, this._preferredParams)));
  }

  public onDocumentActionChanged($event) {
    let selectedAction = $event.SelectedValue;
    this._preferredParams = addOrUpdateAtlasParamValue(this._preferredParams, 'DocumentAction', selectedAction);
    this._store.dispatch(new LoadCompanyDocumentsToReview(new AtlasApiRequestWithParams(1, this._preferredPageSize, this._preferredSortField, this._preferredSortDirection, this._preferredParams)));
  }

  public onActionDateClick(context) {
    this._showSignatureDialog = true;
    this._documentSignatureDetails.Signature = context.Signature;
    this._documentSignatureDetails.SignedBy = this._claimsHelper.getUserFullName();
    this._documentSignatureDetails.SignedDate = context.ActionedDateOn;
    this._documentSignatureDetails.DocumentName = context.DocumentName;
  }

  signatureModalClosed(event: any) {
    this._showSignatureDialog = false;
  }


  ngOnInit(): void {
    //Here by this time the store has already got the first page data which should be binded to the UI
    //the store state items should be of first page data or else we need to despatch the event to load hfirst page data.
    this._initForm();
    //if (this._modeOfOPeration == DistributedDocumentsModeOfOperation.Documents) {
    this._disributedDocuments$ = this._store.let(fromRoot.getDocumentsToReviewData);
    this._currentPage$ = this._store.let(fromRoot.getDocumentsToReviewDataCurrentPage);
    this._totalRecords$ = this._store.let(fromRoot.getDocumentsToReviewTotalCountData);
    this._documentsCount$ = this._store.let(fromRoot.getDocumentsToReviewItemsCountData);
    this._dataTableOptions$ = this._store.let(fromRoot.getDocumentsToReviewDataTableOptions);

    this._loadingSubscription =
      this._store.let(fromRoot.getHasDocumentsToReviewLoadedData).map(loaded => !loaded).subscribe(c => {
        this._documentsLoading$ = Observable.of(c);
      });

    // now subscribe to the api requests
    this._currentDocumentsAPIRequestSubScription = this._store.let(fromRoot.getDocumentsToReviewAPIRequestData).subscribe((atlasApiReq) => {
      if (!isNullOrUndefined(atlasApiReq)) {
        this._currentDocumentsAPIRequest = atlasApiReq;
        this._patchForm(getAtlasParamValueByKey(atlasApiReq.Params, 'DocumentAction'));
      }
    });

    this._defaultLocale = this._localeService.getDefaultLocale();
    this._localeService.defaultLocaleChanged.subscribe(
      (locale) => { this._defaultLocale = locale }
    );
  }

  ngOnDestroy(): void {
    if (this._distributedDocumentsSubscription)
      this._distributedDocumentsSubscription.unsubscribe();
    if (this._currentDocumentsAPIRequestSubScription)
      this._currentDocumentsAPIRequestSubScription.unsubscribe();
    if (!isNullOrUndefined(this._loadingSubscription)) {
      this._loadingSubscription.unsubscribe();
    }
  }

  // End of public methods

}
