import { AeLoaderType } from '../../../atlas-elements/common/ae-loader-type.enum';
import { RouteParams } from './../../../shared/services/route-params';
import { AeIconSize } from "../../../atlas-elements/common/ae-icon-size.enum";
import { AeClassStyle } from '../../../atlas-elements/common/ae-class-style.enum';
import { DocumentService } from '../../services/document-service';
import { ClaimsHelperService } from '../../../shared/helpers/claims-helper';
import { FileUploadService } from '../../../shared/services/file-upload.service';
import { ObjectHelper } from '../../../shared/helpers/object-helper';
import { MessengerService } from '../../../shared/services/messenger.service';
import { BaseComponent } from '../../../shared/base-component';
import { UpdateDocument } from '../../actions/document.actions';
import { isNullOrUndefined } from 'util';
import { BehaviorSubject, Observable, Subscription } from 'rxjs/Rx';
import { Store } from '@ngrx/store';
import { LocaleService, TranslationService } from 'angular-l10n';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  ViewEncapsulation
} from '@angular/core';
import * as fromRoot from './../../../shared/reducers';
import { Document } from '../../models/document';
import * as Immutable from 'immutable';

@Component({
  selector: 'personal-documents',
  templateUrl: './personal-documents.component.html',
  styleUrls: ['./personal-documents.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class PersonalDocumentsComponent extends BaseComponent implements OnInit, OnDestroy {

  //Private members 
  private _isDetails: boolean;
  private _isAdd: boolean;
  private _isUpdate: boolean;
  private _showRemoveDialog: boolean;
  private _selectDocumentSubscription: Subscription;
  private _selectedDocument: Document;
  private _documents$: Observable<Array<Document>>;
  private _hasDocumentsLoaded$: Observable<boolean>;
  private _lightClass: AeClassStyle = AeClassStyle.Light;
  private _iconMedium: AeIconSize = AeIconSize.medium;
  private _loaderBars: AeLoaderType = AeLoaderType.Spinner;
  // End of Private members
  //public properties
  get loaderBars(): AeLoaderType {
    return this._loaderBars;
  }
  get hasDocumentsLoaded$(): Observable<boolean> {
    return this._hasDocumentsLoaded$;
  }
  get lightClass(): AeClassStyle {
    return this._lightClass;
  }
  get documents$() {
    return this._documents$;
  }
  get isAdd() {
    return this._isAdd;
  }
  get showRemoveDialog() {
    return this._showRemoveDialog;
  }
  get iconMedium(): AeIconSize {
    return this._iconMedium;
  }
  get isUpdate() {
    return this._isUpdate;
  }
  //end of public properties
  //Constructor
  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _cdRef: ChangeDetectorRef
    , private _store: Store<fromRoot.State>
    , private _claimsHelper: ClaimsHelperService
    , private _fileUploadService: FileUploadService
    , private _messenger: MessengerService
    , private _documentService: DocumentService
    , private _routeParamsService: RouteParams
  ) {
    super(_localeService, _translationService, _cdRef);
    this._isDetails = false;
    this._isAdd = false;
    this._isUpdate = false;
    this._showRemoveDialog = false;
    this.id = 'personal-documents';
    this.name = 'personal-documents';
  }
  //End of constructor

  //ngOnInit
  ngOnInit() {
    this._documentService.loadPersonalDocuments();
    this._documents$ = this._store.let(fromRoot.getPersonalDocumentsData);
    this._hasDocumentsLoaded$ = this._store.let(fromRoot.getHasPersonalDocumentsLoadedData);
  }
  //End of ngOnInit

  //ngOnDestroy
  ngOnDestroy(): void {
    if (this._selectDocumentSubscription)
      this._selectDocumentSubscription.unsubscribe();
  }
  //End of ngOnDestroy

  //Private methods 
  private _getImageUrl(pictureId: string) {
    return this._getDownloadUrl(pictureId);
  }

  private _getDownloadUrl(docId: string) {
    if (isNullOrUndefined(docId))
      return null;
    return this._routeParamsService.Cid ? `/filedownload?documentId=${docId}&cid=${this._routeParamsService.Cid}` : `/filedownload?documentId=${docId}`;
  }


  private _updateDocument(documentId: string) {
    this._isUpdate = true;
    this._documentService.loadSelectedDocument(documentId);
  }



  //End of Private methods
  //public methods  

  public modalClosed(event: any) {
    if (event == 'yes') {
      this._documentService.removeDocument(this._selectedDocument);
      this._isDetails = false;
    }
    this._showRemoveDialog = false;
  }

  public onDocumentAddOrUpdateCancel($event) {
    this._isAdd = false;
    this._isUpdate = false;
    if ($event === 'reload') {
      this._documentService.loadPersonalDocuments();
      this._isDetails = false;
    }
  }
  public onDocumentAddOrUpdateSubmit(document) {
    if (this._isAdd) {
      this._isAdd = false;
      this._isUpdate = false;
      this._isDetails = false;
      let vm = ObjectHelper.createInsertInProgressSnackbarMessage('Document',
        document._documentsToSubmit._documentToSave.FileName);
      this._messenger.publish('snackbar', vm);
      this._fileUploadService.Upload(document._documentsToSubmit._documentToSave, document._documentsToSubmit.file).then((response: any) => {
        this._documentService.loadPersonalDocuments();
        vm = ObjectHelper.createInsertCompleteSnackbarMessage('Document',
          document._documentsToSubmit._documentToSave.FileName);
        this._messenger.publish('snackbar', vm);
      })
    }
    else {
      this._store.dispatch(new UpdateDocument(document._documentsToSubmit._documentToSave));
      this._isAdd = false;
      this._isUpdate = false;
      this._isDetails = false;
    }
  }

  public onDocumentUpdate($event) {
    this._isUpdate = true;
  }
  public onDocumentDelete($event: string) {
    this._showRemoveDialog = true;
    this._selectDocumentSubscription = this._store.let(fromRoot.getDocumentsState).subscribe(res => {
      this._selectedDocument = res.CurrentDocument;
    });
  }

  public onDocumentCancel($event: string) {
    this._isDetails = false;
  }

  public getSlideoutAnimateState(): boolean {
    return this._isDetails || this._isAdd || this._isUpdate ? true : false;
  }

  public getSlideoutState(): string {
    return this._isDetails || this._isAdd || this._isUpdate ? 'expanded' : 'collapsed';
  }

  public showDetailsSlideOut() {
    return this._isDetails;
  }

  public showUpdateSlideOut() {
    return this._isUpdate;
  }

  public showAddSlideOut() {
    return this._isAdd;
  }

  public downloadDocument(docId: string) {
    window.open(this._getDownloadUrl(docId));
  }
  public showDocumentDetails(documentId: string) {
    this._isDetails = true;
    this._documentService.loadSelectedDocument(documentId);
  }

  public addNewDocument() {
    this._isAdd = true;
  }

  //end of public methods
}
