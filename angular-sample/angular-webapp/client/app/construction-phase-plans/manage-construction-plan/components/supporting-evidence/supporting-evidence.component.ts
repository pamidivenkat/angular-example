import { isNullOrUndefined } from 'util';
import { CommonHelpers } from './../../../../shared/helpers/common-helpers';
import { RouteParams } from './../../../../shared/services/route-params';
import { CPPAdditionalInfo } from '../../../models/construction-phase-plans';
import { AeClassStyle } from '../../../../atlas-elements/common/ae-class-style.enum';
import { DocumentService } from './../../../../document/services/document-service';
import { StringHelper } from '../../../../shared/helpers/string-helper';
import { LoadCPPClientDetailsByIdAction, UpdateCPPClientDetailsAction, RemoveDocumentAction } from './../../actions/manage-cpp.actions';
import { SortDirection } from '../../../../atlas-elements/common/models/ae-sort-model';
import { AtlasApiRequest } from './../../../../shared/models/atlas-api-response';
import { DataTableOptions } from './../../../../atlas-elements/common/models/ae-datatable-options';
import { AeDataTableAction } from './../../../../atlas-elements/common/models/ae-data-table-action';
import { Document, ResourceUsage } from './../../../../document/models/document';
import { BehaviorSubject, Observable, Subject, Subscription } from 'rxjs/Rx';
import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef, Output, EventEmitter, Input, ViewChild, asNativeElements } from '@angular/core';
import { BaseComponent } from './../../../../shared/base-component';
import { LocaleService, TranslationService } from "angular-l10n";
import { Store } from "@ngrx/store";
import * as fromRoot from './../../../../shared/reducers';
import * as Immutable from 'immutable';

@Component({
  selector: 'supporting-evidence',
  templateUrl: './supporting-evidence.component.html',
  styleUrls: ['./supporting-evidence.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SupportingEvidenceComponent extends BaseComponent implements OnInit, OnDestroy {

  // Private Fields
  private _actions: Immutable.List<AeDataTableAction>;
  private _documentsList$: BehaviorSubject<Immutable.List<Document>> = new BehaviorSubject(null);
  private _documentsDataTableOptions: BehaviorSubject<DataTableOptions> = new BehaviorSubject<DataTableOptions>(new DataTableOptions(1, 10));
  private _totalCount$: BehaviorSubject<number> = new BehaviorSubject(0);
  private _pagingParams: Map<string, string> = new Map<string, string>();
  private _sortParams: Map<string, string> = new Map<string, string>();
  private _allDocuments: Document[];

  private _keys = ['Id', 'FileName', 'Title', 'Description', 'FileNameAndTitle', 'ModifiedOn'];
  private _hasCPPAdditionalInfoLoaded$: Observable<boolean>;
  private _cppId: string;
  private _isExample: boolean;
  private _cppLoadedSub: Subscription;
  private _viewAction = new Subject();
  private _viewActionSub: Subscription;
  private _deleteAction = new Subject();
  private _deleteActionSub: Subscription;
  private _lightClass: AeClassStyle = AeClassStyle.Light;
  private _showDocUploadSelectorSlide: boolean;
  private _userDocument: ResourceUsage = ResourceUsage.User;
  private _isAttachable: boolean = false;
  private _regardingObjectTypeCode: number = 42;
  private _regardingObjectId: string;
  private _cppAddtionalInfoSub: Subscription;
  private _cppEvidenceDocSub: Subscription;
  private _cppAdditionalInfo: CPPAdditionalInfo;
  private _documentCategory: number = 0;
  private _accept: string = ".doc,.docx,.xls,.xlsx,.pdf,.ai,.jpg,.jpeg,.png";
  private _showDeleteConfirmDialog: boolean;
  private _selectedDocument: Document;
  private _context: any;
  private _submitEventSubscription: Subscription;
  private _showDocumentUpload: boolean = false;
  // End of Private Fields
  get showDocumentUpload(): boolean {
    return this._showDocumentUpload;
  }
  // Public properties
  @Input('context')
  get context() {
    return this._context;
  }
  set context(val: any) {
    this._context = val;
  }

  @Input('cppId')
  get cppId() {
    return this._cppId;
  }
  set cppId(val: string) {
    this._cppId = val;
  }

  @Input('isExample')
  get isExample() {
    return this._isExample;
  }
  set isExample(val: boolean) {
    this._isExample = val;
  }



  get actions() {
    return this._actions;
  }
  get keys() {
    return this._keys;
  }
  get documentsList$() {
    return this._documentsList$;
  }
  get totalCount$() {
    return this._totalCount$;
  }
  get documentsDataTableOptions() {
    return this._documentsDataTableOptions;
  }
  get hasCPPAdditionalInfoLoaded$() {
    return this._hasCPPAdditionalInfoLoaded$;
  }
  get showDocUploadSelectorSlide() {
    return this._showDocUploadSelectorSlide
  }
  get userDocument() {
    return this._userDocument;
  }
  get isAttachable() {
    return this._isAttachable;
  }
  get regardingObjectTypeCode() {
    return this._regardingObjectTypeCode;
  }
  get regardingObjectId() {
    return this._regardingObjectId;
  }
  get documentCategory() {
    return this._documentCategory;
  }
  get accept() {
    return this._accept;
  }
  get showDeleteConfirmDialog() {
    return this._showDeleteConfirmDialog;
  }
  get selectedDocument() {
    return this._selectedDocument;
  }

  get lightClass() {
    return this._lightClass;
  }
  // End of Public properties

  // Public Output bindings
  @Output('onAeSubmit') _onAeSubmit: EventEmitter<CPPAdditionalInfo> = new EventEmitter<CPPAdditionalInfo>();
  // End of Public Output bindings

  // Public ViewChild bindings
  // End of Public ViewChild bindings

  // Public ContnetChild bindings
  // End of Public ContnetChild bindings

  // Constructor
  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _changeDetectordRef: ChangeDetectorRef
    , private _store: Store<fromRoot.State>
    , private _routeParamsService: RouteParams
  ) {
    super(_localeService, _translationService, _changeDetectordRef);
  }
  // End of constructor

  // Private methods
  private _viewDocument(doc: Document) {
    let url = this._routeParamsService.Cid ? '/filedownload?documentId=' + doc.Id + '&version=' + doc.Version + '$cid=' + this._routeParamsService.Cid : '/filedownload?documentId=' + doc.Id + '&version=' + doc.Version;
    window.open(url)
  }
  private _deleteDocument(doc: Document) {
    this._pagingParams.set('pageNumber', '1');
    this._cppAdditionalInfo.Documents = this._cppAdditionalInfo.Documents.filter(obj => obj.Id != doc.Id);
    this._store.dispatch(new RemoveDocumentAction(doc));
    this._store.dispatch(new UpdateCPPClientDetailsAction(this._cppAdditionalInfo));
  }
  // End of private methods

  // Public methods

  public deleteConfirmModalClosed($event) {
    if ($event == 'yes') {
      this._deleteDocument(this._selectedDocument);
    }
    this._showDeleteConfirmDialog = false;
  }
  public getDocUploadSlideoutState(): string {
    return this._showDocUploadSelectorSlide ? 'expand' : 'collapse';
  }
  public onDocumentUploadStarted(doc: Document) {
    //hide the slide when document upload is started
    this._showDocumentUpload = false;

  }
  public onDocumentUploadDone(doc: Document) {
    this._pagingParams.set('pageNumber', '1');
    this._cppAdditionalInfo.Documents.push(doc);
    this._store.dispatch(new UpdateCPPClientDetailsAction(this._cppAdditionalInfo));
    this._showDocUploadSelectorSlide = false;
    this._showDocumentUpload = false;

    //TODO: here need to post the cppadditional info entity to save this document
  }
  public onDocumentUploadClose($event) {
    this._showDocUploadSelectorSlide = false;
    this._showDocumentUpload = false;
  }
  public onAddDocument($event) {
    this._showDocumentUpload = true;
    this._showDocUploadSelectorSlide = true;
  }

  onGridPageChange($event) {
    this._pagingParams.set('pageNumber', $event.pageNumber);
    this._pagingParams.set('pageSize', $event.noOfRows);
    this._loadSupportingEvidenceDocsData(this._allDocuments);
  }
  onSort($event) {
    this._sortParams.set('sortField', $event.SortField);
    this._sortParams.set('direction', $event.Direction);
    this._pagingParams.set('pageNumber', '1');
    this._loadSupportingEvidenceDocsData(this._allDocuments);
  }

  private _getPaginatedSource(source: Array<Document>, pageSize: number, pageNumber: number) {
    if (isNullOrUndefined(source) ||
      source.length < 1) {
      return source;
    }
    let currentPageNumber = pageNumber - 1;
    return source.slice(currentPageNumber * pageSize, (pageNumber) * pageSize);
  }

  private _loadSupportingEvidenceDocsData(source: Array<Document>) {
    let dataSource: Array<Document> = [];
    let sortField = this._sortParams.get('sortField');
    let direction = this._sortParams.get('direction') == SortDirection.Ascending.toString() ? SortDirection.Ascending : SortDirection.Descending;
    dataSource = CommonHelpers.sortArray(source, sortField, direction);

    let pageNumber = parseInt(this._pagingParams.get('pageNumber'), 10);
    let pageSize = parseInt(this._pagingParams.get('pageSize'), 10);

    dataSource = this._getPaginatedSource(dataSource, pageSize, pageNumber);

    let count = (!isNullOrUndefined(source) ? source.length : 0);
    let datatableOptions = new DataTableOptions(pageNumber, pageSize);

    this._documentsDataTableOptions.next(datatableOptions);
    if (pageNumber === 1) {
      this._totalCount$.next(count);
    }
    this._documentsList$.next(Immutable.List(dataSource));
  }

  ngOnInit() {

    this._hasCPPAdditionalInfoLoaded$ = this._store.let(fromRoot.getHasCPPAdditionalInfoLoadedData);
    this._cppLoadedSub = this._store.let(fromRoot.getHasCPPAdditionalInfoLoadedData).subscribe((loaded) => {
      if (!loaded && !StringHelper.isNullOrUndefinedOrEmpty(this._cppId)) {
        this._store.dispatch(new LoadCPPClientDetailsByIdAction({ Id: this._cppId, IsExample: this._isExample }));
      }
    });

    this._cppEvidenceDocSub = this._store.let(fromRoot.getCPPSupportEvidencePageListData).subscribe((val) => {
      if (!isNullOrUndefined(val)) {
        this._allDocuments = val;
        if (this._pagingParams.size <= 0) {
          this._pagingParams.set('pageNumber', '1');
          this._pagingParams.set('pageSize', '10');
        }

        if (this._sortParams.size <= 0) {
          this._sortParams.set('sortField', 'Title');
          this._sortParams.set('direction', SortDirection.Ascending.toString());
        }

        this._loadSupportingEvidenceDocsData(this._allDocuments);
      }
    });


    this._actions = Immutable.List([
      new AeDataTableAction("View", this._viewAction, false),
      new AeDataTableAction("Remove", this._deleteAction, false),
    ]);

    this._viewActionSub = this._viewAction.subscribe((doc: Document) => {
      this._viewDocument(doc)
    });


    this._deleteActionSub = this._deleteAction.subscribe((doc: Document) => {
      this._selectedDocument = doc;
      this._showDeleteConfirmDialog = true;
    });

    this._cppAddtionalInfoSub = this._store.let(fromRoot.getCPPAdditionalInfoData).subscribe((cpp) => {
      if (cpp) {
        this._cppAdditionalInfo = cpp;
        this._regardingObjectId = cpp.Id;
      }
    });


    this._submitEventSubscription = this._context.submitEvent.subscribe((value) => {
      if (value) {
        this._onAeSubmit.emit(this._cppAdditionalInfo);
      }
    });

  }
  ngOnDestroy() {
    if (this._viewActionSub) {
      this._viewActionSub.unsubscribe();
    }
    if (this._cppEvidenceDocSub) {
      this._cppEvidenceDocSub.unsubscribe();
    }
    if (this._cppLoadedSub) {
      this._cppLoadedSub.unsubscribe();
    }
    if (this._deleteActionSub) {
      this._deleteActionSub.unsubscribe();
    }
    if (this._cppAddtionalInfoSub) {
      this._cppAddtionalInfoSub.unsubscribe();
    }
    if (this._submitEventSubscription) {
      this._submitEventSubscription.unsubscribe();
    }
  }
  // End of public methods

}
