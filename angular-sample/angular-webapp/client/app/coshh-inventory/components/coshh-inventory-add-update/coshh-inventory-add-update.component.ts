import { RouteParams } from './../../../shared/services/route-params';
import { Input } from '@angular/core';
import { CoshhInventoryForm } from '../../models/coshhinventory.form';
import { ClaimsHelperService } from '../../../shared/helpers/claims-helper';
import { BehaviorSubject } from 'rxjs/Rx';

import { IFormBuilderVM, IFormFieldWrapper } from '../../../shared/models/iform-builder-vm';
import { isNullOrUndefined } from 'util';
import { COSHHInventory } from '../../models/coshh-inventory';
import * as coshhInventoryActions from '../../../coshh-inventory/actions/coshh-inventory.actions';
import { FormBuilderService } from '../../../shared/services/form-builder.service';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { AeSelectItem } from './../../../atlas-elements/common/models/ae-select-item';
import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef, Output, EventEmitter } from '@angular/core';
import { BaseComponent } from './../../../shared/base-component';
import { LocaleService, TranslationService } from "angular-l10n";
import { Store } from "@ngrx/store";
import { Router, ActivatedRoute } from "@angular/router";
import * as fromRoot from './../../../shared/reducers';
import * as Immutable from 'immutable';
import { Observable } from "rxjs/Observable";
import { Subscription } from "rxjs/Subscription";
import * as errorActions from '../../../shared/actions/error.actions';
import { AtlasApiError } from '../../../shared/error-handling/atlas-api-error'
import { MessageEvent } from '../../../atlas-elements/common/models/message-event.enum';
import { FileResult } from "../../../atlas-elements/common/models/file-result";
import { ObjectHelper } from "../../../shared/helpers/object-helper";
import { FileUploadService } from "../../../shared/services/file-upload.service";
import { MessengerService } from "../../../shared/services/messenger.service";
import { Document } from '../../../document/models/document';
import { DocumentService } from "../../../document/services/document-service";

@Component({
  selector: "coshhinventory-addupdate",
  templateUrl: "./coshh-inventory-add-update.component.html",
  styleUrls: ["./coshh-inventory-add-update.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})

export class CoshhInventoryAddUpdateComponent extends BaseComponent implements OnInit, OnDestroy {
  //Private Fields
  private _addUpdateCoshhInventoryForm: FormGroup;
  private _submitted: boolean = false;
  private _formName: string;
  private _addUpdateCoshhInventoryFormVM: IFormBuilderVM;
  private _action: string;
  private _coshhInventoryToSave: COSHHInventory = new COSHHInventory();
  private _fields: Array<IFormFieldWrapper<any>>;
  private _formFields: IFormFieldWrapper<any>[];
  private _selectedFile: FileResult;
  private _attachmentId: string;
  private _selectDocumentSubscription: Subscription;
  private _documentForm: FormGroup;
  private _fileName: string;
  private _clearSelectedFile: boolean = false;
  // End of Private Fields
  get ClearFile(): boolean {
    return this._clearSelectedFile;
  }
  get addUpdateCoshhInventoryFormVM(): IFormBuilderVM {
    return this._addUpdateCoshhInventoryFormVM;
  }

  // Public Output 
  @Output('onCancel') _onCoshhInventoryCancel: EventEmitter<string>;
  @Output('onSubmit') _onCoshhInventorySubmit: EventEmitter<any>;
  // End of Public Output bindings

  @Input('action')
  get action() {
    return this._action;
  }
  set action(value: string) {
    this._action = value;
  }

  @Input('selectedCoshhInventory')
  get selectedCoshhInventory() {
    return this._coshhInventoryToSave;
  }
  set selectedCoshhInventory(value: COSHHInventory) {
    this._coshhInventoryToSave = value;
  }

  get FileName() {
    if (!isNullOrUndefined(this._fileName))
      return this._fileName;
    return '';
  }

  get ShowCancelIcon() {
    if (!isNullOrUndefined(this._fileName)) {
      return true;
    }
    return false
  }

  // Constructor
  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _changeDetectordRef: ChangeDetectorRef
    , private _store: Store<fromRoot.State>
    , private _claimsHelper: ClaimsHelperService
    , private _fb: FormBuilder
    , private _fileUploadService: FileUploadService
    , private _messenger: MessengerService
    , private _documentService: DocumentService
    , private _routeParamsService: RouteParams
  ) {
    super(_localeService, _translationService, _changeDetectordRef);
    this._onCoshhInventoryCancel = new EventEmitter<string>();
    this._onCoshhInventorySubmit = new EventEmitter<string>();

  }
  // End of constructor

  // Private methods  
  formButtonNames() {
    return (this._action == 'Add' ? { Submit: 'Add' } : { Submit: 'update' });
  }

  private _loadDocumentDetails(documentId: string) {
    this._documentService.loadSelectedDocument(documentId);
  }
  // End of private methods

  ngOnInit() {
    this._formName = 'addUpdateForm';

    this._addUpdateCoshhInventoryFormVM = new CoshhInventoryForm(this._formName, this._coshhInventoryToSave);
    this._fields = this._addUpdateCoshhInventoryFormVM.init();
    this._attachmentId = this._coshhInventoryToSave.AttachmentId;
    if (!isNullOrUndefined(this._coshhInventoryToSave.AttachmentId)) {
      this._loadDocumentDetails(this._coshhInventoryToSave.AttachmentId);
    }
    this._selectDocumentSubscription = this._store.let(fromRoot.getCurrentDocument).subscribe(res => {
      if (!isNullOrUndefined(res)) {
        this._fileName = res.FileName;
        this._cdRef.markForCheck();
      }
    });
  }

  ngOnDestroy() {
    if (this._selectDocumentSubscription) {
      this._selectDocumentSubscription.unsubscribe();
    }
  }
  // End of public methods

  onCancel($event) {
    this._addUpdateCoshhInventoryForm.reset(); //clear form.
    this._onCoshhInventoryCancel.emit('Cancel');
  }

  onSubmit($event) {
    this._submitted = true;
    if (this._addUpdateCoshhInventoryForm.valid) {
      let coshhInventoryToSave: COSHHInventory = Object.assign({}, this._coshhInventoryToSave, <COSHHInventory>this._addUpdateCoshhInventoryForm.value);
      this._addUpdateCoshhInventoryForm.reset();
      coshhInventoryToSave.AttachmentId = this._attachmentId;
      this._onCoshhInventorySubmit.emit(coshhInventoryToSave);
    }
  }

  onFormInit(fg: FormGroup) {
    this._addUpdateCoshhInventoryForm = fg;
  }

  private _getDownloadUrl(docId: string) {
    if (isNullOrUndefined(docId))
      return null;
    return;
  }
  public onSheetDownload() {
    let url = this._routeParamsService.Cid ? `/filedownload?documentId=${this._attachmentId}&cid=${this._routeParamsService.Cid}` : `/filedownload?documentId=${this._attachmentId}`;
    window.open(url);
  }
  public ResetClearFile($event) {
    this._clearSelectedFile = false;
  }
  public onSheetCancel() {
    this._fileName = null;
    this._attachmentId = null;
    this._clearSelectedFile = true;
    this._cdRef.markForCheck();
  }

  title() {
    if (this._action == 'Add') {
      return "ADD_COSHH_INVENTORY";
    } else {
      return "UPDATE_COSHH_INVENTORY";
    }
  }

  onFilesSelected($event: FileResult[]) {
    this._selectedFile = $event[0];    
    if (!isNullOrUndefined(this._selectedFile) && this._selectedFile.isValid) {
      let vm = ObjectHelper.createInsertInProgressSnackbarMessage("Data sheet", this._selectedFile.file.name);
      this._messenger.publish('snackbar', vm);
      let _documentToSave: Document = Object.assign({}, new Document());
      _documentToSave.LastModifiedDateTime = this._selectedFile.file.lastModifiedDate;
      _documentToSave.Category = 0;
      _documentToSave.FileName = this._selectedFile.file.name;
      _documentToSave.FileNameAndTitle = this._selectedFile.file.name;
      this._fileUploadService.Upload(_documentToSave, this._selectedFile.file).then((response: any) => {
        if (!isNullOrUndefined(response)) {
          let vm = ObjectHelper.createInsertCompleteSnackbarMessage("Data sheet", this._selectedFile.file.name);
          this._messenger.publish('snackbar', vm);
          this._fileName = response.FileName;
          this._attachmentId = response.Id;
          this._cdRef.markForCheck();
        }
      }, (error: string) => {
        console.log("file upload error is", error);
        new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Create, 'Signature', this._selectedFile.file.name));
      });

    }
  }
}


