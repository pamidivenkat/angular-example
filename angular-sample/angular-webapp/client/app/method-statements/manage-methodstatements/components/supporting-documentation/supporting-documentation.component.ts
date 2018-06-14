import { CommonHelpers } from './../../../../shared/helpers/common-helpers';
import { RouteParams } from './../../../../shared/services/route-params';
import { AePageChangeEventModel } from './../../../../atlas-elements/common/Models/ae-page-change-event-model';
import { AtlasApiRequest } from './../../../../shared/models/atlas-api-response';
import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef, Output, EventEmitter } from '@angular/core';
import { BaseComponent } from './../../../../shared/base-component';
import { LocaleService, TranslationService } from "angular-l10n";
import { Store } from '@ngrx/store';
import { Observable, Subject, Subscription, BehaviorSubject } from 'rxjs/Rx';
import { Router, ActivatedRoute } from "@angular/router";
import { ClaimsHelperService } from './../../../../shared/helpers/claims-helper';
import * as fromRoot from './../../../../shared/reducers';
import * as Immutable from 'immutable';
import { isNullOrUndefined } from "util";
import { AeDataTableAction } from '../../../../atlas-elements/common/models/ae-data-table-action';
import { DataTableOptions } from '../../../../atlas-elements/common/models/ae-datatable-options';
import { MethodStatement, MSSupportingDocuments } from "../../../models/method-statement";
import { LoadSupportingDocumentsByIdAction, AddMethodStatementAttachmentAction, DeleteMethodStatementAttachmentAction } from "../../actions/manage-methodstatement.actions";
import { AeSplitButtonOption } from '../../../../atlas-elements/common/models/ae-split-button-options';
import { AeClassStyle } from "../../../../atlas-elements/common/ae-class-style.enum";
import { FileUploadService } from "../../../../shared/services/file-upload.service";
import { MessengerService } from "../../../../shared/services/messenger.service";
import { ObjectHelper } from "../../../../shared/helpers/object-helper";
import { Document, ResourceUsage } from './../../../../document/models/document';
import { Tristate } from './../../../../atlas-elements/common/tristate.enum';
import { SortDirection } from './../../../../atlas-elements/common/models/ae-sort-model';

@Component({
  selector: 'supporting-documentation',
  templateUrl: './supporting-documentation.component.html',
  styleUrls: ['./supporting-documentation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class SupportingDocumentationComponent extends BaseComponent implements OnInit, OnDestroy {


  // Private Fields
  private _supportingEvidenceActions: Immutable.List<AeDataTableAction>;
  private _viewAction = new Subject();
  private _deleteAction = new Subject();
  private _documentKeys = ['Id', 'FileName', 'Title', 'Description'];
  private _methodStatement: MethodStatement;
  private _methodStatementSubscription: Subscription;
  private _routeParamsSubscription: Subscription;
  private _methodStatementId: string;
  private _isExample: boolean = false;
  
  private _documents: BehaviorSubject<Immutable.List<MSSupportingDocuments>> = new BehaviorSubject(null);
  private _dataTableOptions$: BehaviorSubject<DataTableOptions> = new BehaviorSubject<DataTableOptions>(new DataTableOptions(1, 10));
  private _recordsCount$: BehaviorSubject<number> = new BehaviorSubject(0);
  private _pagingParams: Map<string, string> = new Map<string, string>();
  private _sortParams: Map<string, string> = new Map<string, string>();

  private _addFromLibraryCommand = new Subject<boolean>();
  private _addFromComputerCommand = new Subject<boolean>();
  private _splitButtonOptions: any[] = [
    new AeSplitButtonOption<boolean>('ATLAS LIBRARY', this._addFromLibraryCommand, false),
    new AeSplitButtonOption<boolean>('FROM OTHER', this._addFromComputerCommand, false),
  ];
  private _lightClass: AeClassStyle = AeClassStyle.Light;
  private _showLibrarySlideOut: boolean = false;
  private _showComputerSlideOut: boolean = false;
  private _userDocument: ResourceUsage = ResourceUsage.User;
  private _isAttachable: boolean = true;
  private _regardingObjectTypeCode: number = 600;
  private _regardingObjectId: string;
  private _documentCategory: number = 0;
  private _acceptedFileTypes: string = ".doc,.docx,.xls,.xlsx,.pdf,.ai,.jpg,.jpeg,.png,.xlsm";
  private _selectedDocuments: Document[] = [];
  private _msAddAttachmentSubscription: Subscription;
  private _documentToBeDeleted: Document;
  private _showRemoveDialog: boolean = false;
  private _viewActionSubscription: Subscription;
  private _deleteActionSubscription: Subscription;
  private _addFromLibraryCommandSubscription: Subscription;
  private _addFromComputerCommandSubscription: Subscription;
  private _request: AtlasApiRequest = new AtlasApiRequest(1, 10, 'Name', SortDirection.Ascending);
  private _documentListSub: Subscription;
  private _allDocuments: MSSupportingDocuments[];
  private _dataload:boolean = true;
  // End of Private Fields

  // Public properties
  get supportingEvidenceActions() {
    return this._supportingEvidenceActions;
  }
  get documents() {
    return this._documents;
  }
  get recordsCount() {
    return this._recordsCount$;
  }
  get dataTableOptions$() {
    return this._dataTableOptions$;
  }
  get splitButtonOptions(): any[] {
    return this._splitButtonOptions;
  }
  get buttonLight(): AeClassStyle {
    return this._lightClass;
  }
  get showLibrarySlideOut() {
    return this._showLibrarySlideOut;
  }
  get documentKeys(): any {
    return this._documentKeys;
  }
  get showComputerSlideOut() {
    return this._showComputerSlideOut;
  }
  get selectedDocuments() {
    return this._selectedDocuments;
  }
  get documentToBeDeleted() {
    return this._documentToBeDeleted;
  }
  public get showRemoveDialog() {
    return this._showRemoveDialog;
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
    , protected _changeDetectordRef: ChangeDetectorRef
    , private _store: Store<fromRoot.State>
    , private _claimsHelper: ClaimsHelperService
    , private _router: ActivatedRoute
    , private _fileUploadService: FileUploadService
    , private _messenger: MessengerService
    , private _routeParamsService: RouteParams
  ) {
    super(_localeService, _translationService, _changeDetectordRef);
  }
  // End of constructor

  // Private methods 
  private _downloadDocument(doc: Document) {
    let strExampleParam = '&isSystem=true';
    let url: string;
    if (this._isExample) {
      url = '/filedownload?documentId=' + doc.Id + (this._isExample ? strExampleParam : '')
    } else {
      url = this._routeParamsService.Cid ? `/filedownload?documentId=${doc.Id}&cid=${this._routeParamsService.Cid}` : `/filedownload?documentId=${doc.Id}`;
    }
    window.open(url);
  }
  private _deleteAttachment(doc: Document) {
    this._showRemoveDialog = true;
    this._documentToBeDeleted = doc;
  }
  // End of private methods

  // Public methods
  public showSliderState() {
    return this._showLibrarySlideOut || this._showComputerSlideOut ? 'expanded' : 'collapsed';
  }
  public showSlider() {
    return this._showLibrarySlideOut || this._showComputerSlideOut;
  }
  public getSlideoutAnimateState(): boolean {
    return this._showLibrarySlideOut || this._showComputerSlideOut;
  }
  public closeLibrarySlider($event: any) {
    this._showLibrarySlideOut = false;
    this._showComputerSlideOut = false;
  }
  public closeComputerSlider($event: any) {
    this._showLibrarySlideOut = false;
    this._showComputerSlideOut = false;
  }
  public onSplitBtnClick() {

  }
  public modalClosed(option) {
    if (option == 'yes') {
      this._store.dispatch(new DeleteMethodStatementAttachmentAction(this._documentToBeDeleted));
    }
    this._showRemoveDialog = false;
    this._documentToBeDeleted = null;
  }

  get allDocuments() {
    return this._allDocuments;
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
  get acceptedFileTypes() {
    return this._acceptedFileTypes;
  }

  onDocumentUploadClose($event) {
    this._showComputerSlideOut = false;
  }
  onDocumentUploadDone($event) {
    if (this._showComputerSlideOut) {
      this._showComputerSlideOut = false;
      this._store.dispatch(new LoadSupportingDocumentsByIdAction({ Id: this._methodStatement.Id, IsExample: this._methodStatement.IsExample }));
    }
  }
  onSelectDocuments(selectedDocs: Document[]) {
    if (selectedDocs && selectedDocs.length > 0) {
      this._store.dispatch(new AddMethodStatementAttachmentAction(selectedDocs));
    }
  }
  onGridPageChange($event) {
    this._pagingParams.set('pageNumber', $event.pageNumber);
    this._pagingParams.set('pageSize', $event.noOfRows);
    this._loadMSSupportingDocsGridData(this._allDocuments);
  }
  onSort($event) {
    this._sortParams.set('sortField', $event.SortField);
    this._sortParams.set('direction', $event.Direction);
    this._pagingParams.set('pageNumber', '1');
    this._loadMSSupportingDocsGridData(this._allDocuments);
  }


  private _getPaginatedSource(source: Array<MSSupportingDocuments>, pageSize: number, pageNumber: number) {
    if (isNullOrUndefined(source) ||
      source.length < 1) {
      return source;
    }
    let currentPageNumber = pageNumber - 1;
    return source.slice(currentPageNumber * pageSize, (pageNumber) * pageSize);
  }

  private _loadMSSupportingDocsGridData(source: Array<MSSupportingDocuments>) {
    let dataSource: Array<MSSupportingDocuments> = [];

    let sortField = this._sortParams.get('sortField');
    let direction = this._sortParams.get('direction') == SortDirection.Ascending.toString() ? SortDirection.Ascending : SortDirection.Descending;
    dataSource = CommonHelpers.sortArray(source,sortField,direction);

    let pageNumber = parseInt(this._pagingParams.get('pageNumber'), 10);
    let pageSize = parseInt(this._pagingParams.get('pageSize'), 10);
    dataSource = this._getPaginatedSource(dataSource, pageSize, pageNumber);
    
    let count = (!isNullOrUndefined(source) ? source.length : 0);
    let datatableOptions = new DataTableOptions(pageNumber, pageSize,sortField,direction);

    this._dataTableOptions$.next(datatableOptions);
    if (pageNumber === 1) {
      this._recordsCount$.next(count);
    }
    this._documents.next(Immutable.List(dataSource));
  }

  ngOnInit() {
    this._routeParamsSubscription = this._router.params.subscribe(params => {
      if (isNullOrUndefined(params['id'])) {
        this._methodStatementId = '';
      }
      else {
        this._methodStatementId = params['id'];
      }
      if (isNullOrUndefined(params['isExample'])) {
        this._isExample = false;
      }
      else {
        this._isExample = true;
      }
    });

    this._methodStatementSubscription = this._store.let(fromRoot.getManageMethodStatementData).subscribe(msData => {
      if (!isNullOrUndefined(msData)) {
        this._methodStatement = msData;
        this._isExample = this._methodStatement.IsExample;
        this._regardingObjectId = this._methodStatement.Id;
        if (this._isExample && this._dataload) {
          this._splitButtonOptions.splice(0, 1);
          this._dataload=false;
          this._changeDetectordRef.markForCheck();
        }
        this._store.dispatch(new LoadSupportingDocumentsByIdAction({ Id: this._methodStatement.Id, IsExample: this._methodStatement.IsExample })); // as of now sending is example false        
      }
    });

    this._documentListSub = this._store.let(fromRoot.getMSSupportingDocs).subscribe((val) => {
      if (val) {
        this._allDocuments = val;
        if (this._pagingParams.size <= 0) {
          this._pagingParams.set('pageNumber', '1');
          this._pagingParams.set('pageSize', '10');
        }

        if (this._sortParams.size <= 0) {
          this._sortParams.set('sortField', 'FileName');
          this._sortParams.set('direction', SortDirection.Ascending.toString());
        }

        this._loadMSSupportingDocsGridData(this._allDocuments);
      }
    });


    this._supportingEvidenceActions = Immutable.List([
      new AeDataTableAction("Download", this._viewAction, false),
      new AeDataTableAction("Remove", this._deleteAction, false, (item) => { return (this._methodStatement.StatusId == 0 ? Tristate.True : Tristate.False) }),
    ]);
    this._viewActionSubscription = this._viewAction.takeUntil(this._destructor$).subscribe((doc: Document) => {
      this._downloadDocument(doc);
    });
    this._deleteActionSubscription = this._deleteAction.takeUntil(this._destructor$).subscribe((doc: Document) => {
      this._deleteAttachment(doc);
    });

    this._addFromLibraryCommandSubscription = this._addFromLibraryCommand.subscribe(() => {
      this._showLibrarySlideOut = true;
    });
    this._addFromComputerCommandSubscription = this._addFromComputerCommand.subscribe(() => {
      this._showComputerSlideOut = true;
    });

    this._msAddAttachmentSubscription = this._store.let(fromRoot.getMSAttachmentOperationStatus).subscribe(status => {
      if (status) {
        this._store.dispatch(new LoadSupportingDocumentsByIdAction({ Id: this._methodStatement.Id, IsExample: this._methodStatement.IsExample })); // as of now sending is example false        
      }
    });

  }
  ngOnDestroy() {
    super.ngOnDestroy();
    if (this._documentListSub) {
      this._documentListSub.unsubscribe();
    }
    if (!isNullOrUndefined(this._routeParamsSubscription)) {
      this._routeParamsSubscription.unsubscribe();
    }
    if (!isNullOrUndefined(this._methodStatementSubscription)) {
      this._methodStatementSubscription.unsubscribe();
    }
    if (!isNullOrUndefined(this._viewActionSubscription)) {
      this._viewActionSubscription.unsubscribe();
    }
    if (!isNullOrUndefined(this._deleteActionSubscription)) {
      this._deleteActionSubscription.unsubscribe();
    }
    if (!isNullOrUndefined(this._addFromLibraryCommandSubscription)) {
      this._addFromLibraryCommandSubscription.unsubscribe();
    }
    if (!isNullOrUndefined(this._addFromComputerCommandSubscription)) {
      this._addFromComputerCommandSubscription.unsubscribe();
    }
    if (!isNullOrUndefined(this._msAddAttachmentSubscription)) {
      this._msAddAttachmentSubscription.unsubscribe();
    }
  }
  // End of public methods
}
