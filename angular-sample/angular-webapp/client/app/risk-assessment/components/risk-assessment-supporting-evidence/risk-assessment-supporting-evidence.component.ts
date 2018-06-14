import { RouteParams } from './../../../shared/services/route-params';
import { AeClassStyle } from '../../../atlas-elements/common/ae-class-style.enum';
import { Component, OnInit, OnDestroy, ChangeDetectorRef, Input, ChangeDetectionStrategy, Output, EventEmitter } from '@angular/core';
import { BaseComponent } from "../../../shared/base-component";
import { FileResult } from "../../../atlas-elements/common/models/file-result";
import { LocaleService, TranslationService } from "angular-l10n";
import { FileUploadService } from "../../../shared/services/file-upload.service";
import { isNullOrUndefined } from "util";
import { MessengerService } from "../../../shared/services/messenger.service";
import { ObjectHelper } from "../../../shared/helpers/object-helper";
import { Document } from '../../../document/models/document';
import { AtlasApiError } from "../../../shared/error-handling/atlas-api-error";
import * as errorActions from '../../../shared/actions/error.actions';
import { MessageEvent } from '../../../atlas-elements/common/models/message-event.enum';
import { RiskAssessment } from "../../models/risk-assessment";
import { ClaimsHelperService } from "../../../shared/helpers/claims-helper";
import { Store } from "@ngrx/store";
import * as fromRoot from '../../../shared/reducers';
import { Observable } from "rxjs/Observable";
import { Subscription, Subject } from "rxjs/Rx";
import * as Immutable from 'immutable';
import { AeSelectItem } from "../../../atlas-elements/common/models/ae-select-item";
import { DataTableOptions } from "../../../atlas-elements/common/models/ae-datatable-options";
import { BehaviorSubject } from "rxjs/BehaviorSubject";
import { AeDataTableAction } from "../../../atlas-elements/common/models/ae-data-table-action";
import { AeSortModel, SortDirection } from "../../../atlas-elements/common/models/ae-sort-model";
import { RiskAssessmentService } from "../../services/risk-assessment-service";
import { DocumentService } from "../../../document/services/document-service";
import { LoadRiskAssessmentFilterDocumentsAction, LoadRiskAssessmentDocumentsPaggingAction } from "../../actions/risk-assessment-actions";
import { AePageChangeEventModel } from "../../../atlas-elements/common/models/ae-page-change-event-model";
import { AtlasParams, AtlasApiRequestWithParams } from "../../../shared/models/atlas-api-response";
import { AeSplitButtonOption } from "../../../atlas-elements/common/models/ae-split-button-options";


@Component({
  selector: 'risk-assessment-supporting-evidence',
  templateUrl: './risk-assessment-supporting-evidence.component.html',
  styleUrls: ['./risk-assessment-supporting-evidence.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RiskAssessmentSupportingEvidenceComponent extends BaseComponent implements OnInit, OnDestroy {
  //Private Variables
  private _selectedFile: FileResult;
  private _objectType: string = "Document";
  private _currentRiskAssessment: RiskAssessment;
  private _currentRiskAssessmentDocuments: Observable<Immutable.List<Document>>;
  private _currentRiskAssessmentSubscription$: Subscription;
  private _documentFormatOptions: Immutable.List<AeSelectItem<string>>;
  private _documentFormatDefualtVaule = 'All';
  private _keys = Immutable.List(['FileName', 'Title', 'Description']);
  private _dataTableOptions$: Observable<DataTableOptions>;
  private _totalRecords: Observable<number>;
  private _isAdd: boolean;
  private _actions: Immutable.List<AeDataTableAction>;
  private _downloadDocumentCommand = new Subject();
  private _removeDocumentCommand = new Subject();
  private _downloadDocumentSubscription: Subscription;
  private _removeDocumentSubscription: Subscription;
  private _selectedDocument: Document;
  private _documentRemoveConfirmPopup: boolean = false;
  private _selectedValue: string = "All";
  private _lightClass: AeClassStyle = AeClassStyle.Light;
  private _pageNumber: number = 1;
  private _pageSize: number = 10;
  private _addFromLibraryCommand = new Subject<boolean>();
  private _addFromComputerCommand = new Subject<boolean>();
  private _splitButtonOptions: any[] = [
    new AeSplitButtonOption<boolean>('FROM LIBRARY', this._addFromLibraryCommand, false),
    new AeSplitButtonOption<boolean>('FROM COMPUTER', this._addFromComputerCommand, false),
  ];
  private _addFromLibraryCommandSubscription: Subscription;
  private _addFromComputerCommandSubscription: Subscription;
  private _showLibrarySlideOut: boolean = false;
  private _showComputerSlideOut: boolean = false;

  get lightClass(): AeClassStyle {
    return this._lightClass;
  }
  get documentFormatOptions(): Immutable.List<AeSelectItem<string>> {
    return this._documentFormatOptions;
  }
  get documentFormatDefualtVaule() {
    return this._documentFormatDefualtVaule;
  }
  get dataTableOptions(): Observable<DataTableOptions> {
    return this._dataTableOptions$;
  }
  get currentRiskAssessmentDocuments(): Observable<Immutable.List<Document>> {
    return this._currentRiskAssessmentDocuments;
  }
  get totalRecords(): Observable<number> {
    return this._totalRecords;
  }
  get actions(): Immutable.List<AeDataTableAction> {
    return this._actions;
  }
  get keys() {
    return this._keys;
  }
  get selectedDocument() {
    return this._selectedDocument;
  }
  get showLibrarySlideOut() {
    return this._showLibrarySlideOut;
  }
  get splitButtonOptions(): any[] {
    return this._splitButtonOptions;
  }
  get showComputerSlideOut() {
    return this._showComputerSlideOut;
  }
  //output events to parent container
  @Output() downloadDocumentCommand = new EventEmitter<Document>();
  @Output() removeDocumentCommand = new EventEmitter<Document>();

  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _cdRef: ChangeDetectorRef
    , private _fileUploadService: FileUploadService
    , private _messenger: MessengerService
    , private _claimsHelper: ClaimsHelperService
    , private _store: Store<fromRoot.State>
    , private _documentService: DocumentService
    , private _riskAssessmentService: RiskAssessmentService
    , private _routeParamsService: RouteParams
  ) {
    super(_localeService, _translationService, _cdRef);
    this._isAdd = false;
    this._documentFormatOptions = Immutable.List([
      new AeSelectItem<string>('All', 'All', false),
      new AeSelectItem<string>('Word', 'Word', false),
      new AeSelectItem<string>('Excel', 'Excel', false),
      new AeSelectItem<string>('PDF', 'PDF', false),
      new AeSelectItem<string>('AI', 'AI', false),
      new AeSelectItem<string>('Images', 'Images', false)
    ]);
    this._actions = Immutable.List([
      new AeDataTableAction("Download", this._downloadDocumentCommand, false),
      new AeDataTableAction("Remove", this._removeDocumentCommand, false)
    ]);
  }

  ngOnInit() {
    this._currentRiskAssessmentSubscription$ = this._store.let(fromRoot.getCurrentRiskAssessment).subscribe((CurrentRiskAssessmentData) => {
      this._currentRiskAssessment = CurrentRiskAssessmentData;
    });
    this._dataTableOptions$ = this._store.let(fromRoot.getCurrentRiskAssessmentDocumentListDataTableOptions);
    this._totalRecords = this._store.let(fromRoot.getCurrentRiskAssessmentDocumentsLength);
    this._currentRiskAssessmentDocuments = this._store.let(fromRoot.getCurrentRiskAssessmentFilterDocuments);



    //Subscription for Download Doc
    this._downloadDocumentSubscription = this._downloadDocumentCommand.subscribe(document => {
      this._selectedDocument = document as Document;
      this.downloadDocument(this._selectedDocument.Id);
    });

    //Subscription for Removing Doc
    this._removeDocumentSubscription = this._removeDocumentCommand.subscribe(document => {
      if (!isNullOrUndefined(document)) {
        this._selectedDocument = document as Document;
        //this._removeDocument(this._selectedDocument);
        this.removeDocumentRemoveConfirmPopup(true)
      }
    });

    this._addFromLibraryCommandSubscription = this._addFromLibraryCommand.subscribe(() => {
      this._showLibrarySlideOut = true;
    });
    this._addFromComputerCommandSubscription = this._addFromComputerCommand.subscribe(() => {
      this._showComputerSlideOut = true;
    });

  }
  private removeDocumentRemoveConfirmPopup(event) {
    this._documentRemoveConfirmPopup = true;
  }
  private _getDownloadUrl(docId: string) {
    if (isNullOrUndefined(docId))
      return null;
    return this._routeParamsService.Cid ? `/filedownload?documentId=${docId}&cid=${this._routeParamsService.Cid}` : `/filedownload?documentId=${docId}`;
  }

  private downloadDocument(docId: string) {
    window.open(this._getDownloadUrl(docId));
  }
  getSlideoutAnimateState(): boolean {
    return this._showLibrarySlideOut || this._showComputerSlideOut;
  }

  getSlideoutState(): string {
    return this._showLibrarySlideOut || this._showComputerSlideOut ? 'expanded' : 'collapsed';
  }
  showAddSlideOut() {
    return this._showLibrarySlideOut || this._showComputerSlideOut;
  }
  public onDocumentAddOrUpdateCancel($event: any) {
    this._showLibrarySlideOut = false;
    this._showComputerSlideOut = false;
  }
  public closeComputerSlider($event: any) {
    this._showLibrarySlideOut = false;
    this._showComputerSlideOut = false;
  }

  public onSplitBtnClick() {

  }
  onDocumentUploadDone($event) {
    this._showComputerSlideOut = false;
    this._showLibrarySlideOut = false;
  }
  onSelectDocuments(selectedDocs: Document[]) {
    if (selectedDocs && selectedDocs.length > 0) {
      let vm = ObjectHelper.createInsertInProgressSnackbarMessage('Document',
        'Documents from Atlas');
      this._messenger.publish('snackbar', vm);
      this._currentRiskAssessment.Documents = this._currentRiskAssessment.Documents.concat(selectedDocs);
      vm = ObjectHelper.createInsertCompleteSnackbarMessage('Document',
        'Documents from Atlas');
      this._messenger.publish('snackbar', vm);
      this._riskAssessmentService._updateRiskAssessment(this._currentRiskAssessment);
    }
  }
  onDocumentAddOrUpdateSubmit(document) {
    if (this._showComputerSlideOut) {
      this._showComputerSlideOut = false;
      let vm = ObjectHelper.createInsertInProgressSnackbarMessage('Document',
        document._documentsToSubmit._documentToSave.FileName);
      this._messenger.publish('snackbar', vm);
      document._documentsToSubmit._documentToSave.RegardingObjectId = this._currentRiskAssessment.Id;
      this._fileUploadService.Upload(document._documentsToSubmit._documentToSave, document._documentsToSubmit.file).then((response: any) => {
        vm = ObjectHelper.createInsertCompleteSnackbarMessage('Document',
          document._documentsToSubmit._documentToSave.FileName);
        this._messenger.publish('snackbar', vm);
        this._currentRiskAssessment.Documents.push(response);
        this._riskAssessmentService._updateRiskAssessment(this._currentRiskAssessment);
      })

    }
  }
  onDocumentFormatChange($event: any) {
    this._selectedValue = $event.SelectedValue
    this._store.dispatch(new LoadRiskAssessmentFilterDocumentsAction({ SortField: 'FileName', Direction: SortDirection.Ascending, Search: this._selectedValue }));

  }
  removeDocument() {
    let document: Document = this._selectedDocument;
    for (var i = 0; i < this._currentRiskAssessment.Documents.length; i++) {
      if (this._currentRiskAssessment.Documents[i].Id == document.Id) {
        // this._riskAssessmentService._removeDocument(this._selectedDocument);
        this._currentRiskAssessment.Documents.splice(i, 1);
        this._riskAssessmentService._updateRiskAssessment(this._currentRiskAssessment);
        break;
      }
    }

  }
  getDocumentRemoveConfirmPopup() {
    return this._documentRemoveConfirmPopup;
  }
  modalClosed() {
    this._documentRemoveConfirmPopup = false;
  }
  onSort($event: AeSortModel) {
    this._store.dispatch(new LoadRiskAssessmentFilterDocumentsAction({ SortField: $event.SortField, Direction: $event.Direction, PageSize: this._pageSize, Search: this._selectedValue }));
  }
  onPageChange($event) {
    this._pageNumber = $event.pageNumber;
    this._pageSize = $event.noOfRows;
    let atlasParams: AtlasParams[] = new Array();
    this._store.dispatch(new LoadRiskAssessmentDocumentsPaggingAction(new AtlasApiRequestWithParams(this._pageNumber, this._pageSize, "", SortDirection.Descending, atlasParams)));
  }

  ngOnDestroy() {
    if (!isNullOrUndefined(this._currentRiskAssessmentSubscription$))
      this._currentRiskAssessmentSubscription$.unsubscribe();
    if (!isNullOrUndefined(this._downloadDocumentSubscription))
      this._downloadDocumentSubscription.unsubscribe();
    if (!isNullOrUndefined(this._removeDocumentSubscription))
      this._removeDocumentSubscription.unsubscribe();
    if (!isNullOrUndefined(this._addFromLibraryCommandSubscription)) {
      this._addFromLibraryCommandSubscription.unsubscribe();
    }
    if (!isNullOrUndefined(this._addFromComputerCommandSubscription)) {
      this._addFromComputerCommandSubscription.unsubscribe();
    }
  }
}
