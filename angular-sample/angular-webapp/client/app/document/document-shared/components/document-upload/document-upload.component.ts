import { FormGroup, FormBuilder } from '@angular/forms';
import { FormBuilderService } from './../../../../shared/services/form-builder.service';
import { Component, OnInit, OnDestroy, ChangeDetectorRef, Input, ChangeDetectionStrategy, Output, EventEmitter } from '@angular/core';
import { BaseComponent } from './../../../../shared/base-component';
import { FileResult } from './../../../../atlas-elements/common/models/file-result';
import { LocaleService, TranslationService } from "angular-l10n";
import { FileUploadService } from './../../../../shared/services/file-upload.service';
import { isNullOrUndefined } from 'util';
import { MessengerService } from '../../../../shared/services/messenger.service';
import { ObjectHelper } from './../../../../shared/helpers/object-helper';
import { Document, ResourceUsage } from './../../../../document/models/document';
import { AtlasApiError } from './../../../../shared/error-handling/atlas-api-error';
import * as errorActions from './../../../../shared/actions/error.actions';
import { MessageEvent } from './../../../../atlas-elements/common/models/message-event.enum';
import { ClaimsHelperService } from './../../../../shared/helpers/claims-helper';
import { Store } from '@ngrx/store';
import * as fromRoot from './../../../../shared/reducers';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Rx';
import * as Immutable from 'immutable';
import { DataTableOptions } from './../../../../atlas-elements/common/models/ae-datatable-options';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { AeClassStyle } from "./../../../../atlas-elements/common/ae-class-style.enum";

@Component({
  selector: 'document-upload',
  templateUrl: './document-upload.component.html',
  styleUrls: ['./document-upload.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DocumentUploadComponent extends BaseComponent implements OnInit, OnDestroy {

  private _action: string;
  private _actionText: string;
  private _documentForm: FormGroup;
  private _selectedFile: FileResult;
  private _document: Document;
  private _formName: string;
  private _submitted: boolean;
  private _headerTitle: string = 'UPLOAD_DOCUMENT';
  private _showDesciptionAndTitle: boolean;
  private _objectType: string = "Document";
  private _regardingObjectId: string;
  private _regardingObjectTypeCode: number;
  private _isAttachable: boolean;
  private _usage: ResourceUsage = ResourceUsage.User;
  private _documentCategory: number = 0;
  private _accept: string = "*";
  private _showSnackBar: boolean = false;
  private _lightClass: AeClassStyle = AeClassStyle.Light;

  @Input('showSnackBar')
  get showSnackBar() {
    return this._showSnackBar;
  }

  set showSnackBar(value: boolean) {
    this._showSnackBar = value;
  }

  @Input('accept')
  get accept() {
    return this._accept;
  }

  set accept(value: string) {
    this._accept = value;
  }

  @Input('documentCategory')
  get documentCategory() {
    return this._documentCategory;
  }

  set documentCategory(value: number) {
    this._documentCategory = value;
  }


  @Input('regardingObjectId')
  get regardingObjectId() {
    return this._regardingObjectId;
  }

  set regardingObjectId(value: string) {
    this._regardingObjectId = value;
  }

  @Input('regardingObjectTypeCode')
  get regardingObjectTypeCode() {
    return this._regardingObjectTypeCode;
  }

  set regardingObjectTypeCode(value: number) {
    this._regardingObjectTypeCode = value;
  }


  @Input('isAttachable')
  get isAttachable() {
    return this._isAttachable;
  }

  set isAttachable(value: boolean) {
    this._isAttachable = value;
  }

  @Input('usage')
  get usage() {
    return this._usage;
  }

  set usage(value: ResourceUsage) {
    this._usage = value;
  }

  get lightClass() {
    return this._lightClass;
  }

  get headerTitle() {
    return this._headerTitle;
  }
  get documentForm() {
    return this._documentForm;
  }
  get showDesciptionAndTitle() {
    return this._showDesciptionAndTitle;
  }
  @Output('onCancel') _onDocumentAddCancel: EventEmitter<string>;
  @Output('onDocumentUploaded') _onDocumentUploaded: EventEmitter<Document>;
  @Output('onDocumentUploadStart') _onDocumentUploadStart: EventEmitter<Document>;

  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _cdRef: ChangeDetectorRef
    , private _fileUploadService: FileUploadService
    , private _messenger: MessengerService
    , private _claimsHelper: ClaimsHelperService
    , private _fb: FormBuilder) {
    super(_localeService, _translationService, _cdRef);
    this._onDocumentAddCancel = new EventEmitter<string>();
    this._onDocumentUploaded = new EventEmitter<Document>();
    this._onDocumentUploadStart = new EventEmitter<Document>();
  }
  //public methods
  public isAdd(): boolean {
    return this._action === 'Add';
  }
  public onFilesSelected($event: FileResult[]) {
    this._selectedFile = $event[0];
    if (!isNullOrUndefined(this._selectedFile) && this._selectedFile.isValid) {
      this._showDesciptionAndTitle = true;
    }
  }
  public isFileSelected(): boolean {
    return (this._submitted === true && isNullOrUndefined(this._selectedFile));
  }
  public onAddCancel() {
    this._onDocumentAddCancel.emit('cancel');
  }
  public onAddFormSubmit(e) {
    this._submitted = true;
    let _documentsToSubmit: any = {
      _documentToSave: Document,
      file: File
    };
    if (this._documentForm.valid && !isNullOrUndefined(this._selectedFile)) {
      if (this._selectedFile.isValid) {
        let _documentToSave: Document = Object.assign({}, new Document());
        _documentToSave.LastModifiedDateTime = this._selectedFile.file.lastModifiedDate;
        _documentToSave.Category = this._documentCategory;
        _documentToSave.FileName = this._selectedFile.file.name;
        _documentToSave.FileNameAndTitle = this._selectedFile.file.name;
        _documentToSave.RegardingObjectTypeCode = this._regardingObjectTypeCode;
        _documentToSave.RegardingObjectId = this._regardingObjectId;
        if (this._regardingObjectTypeCode == 600 && this._isAttachable) {
          _documentToSave.Tag = 'MS SD - ' + this._regardingObjectId;
        }
        _documentToSave.Description = this._documentForm.get('Description').value;
        _documentToSave.Title = this._documentForm.get('Title').value;
        _documentToSave.Usage = this._usage;
        _documentToSave.IsAttachable = this._isAttachable;
        _documentsToSubmit._documentToSave = _documentToSave;
        _documentsToSubmit.file = this._selectedFile.file;
        let vm: any;
        this._onDocumentUploadStart.emit(_documentToSave);
        if (this._showSnackBar) {
          vm = ObjectHelper.createInsertInProgressSnackbarMessage('Document', _documentsToSubmit._documentToSave.FileName);
          this._messenger.publish('snackbar', vm);
        }
        this._fileUploadService.Upload(_documentsToSubmit._documentToSave, _documentsToSubmit.file).then((response: any) => {
          if (this._showSnackBar) {
            vm = ObjectHelper.createInsertCompleteSnackbarMessage('Document',
              _documentsToSubmit._documentToSave.FileName);
            this._messenger.publish('snackbar', vm);
          }
          this._onDocumentUploaded.emit(<Document>response);
        });


      }
    }
  }
  //end of public methods
  ngOnInit() {
    this._documentForm = this._fb.group({
      Title: [{ value: null, disabled: false }],
      Description: [{ value: null, disabled: false }]
    })
  }
}
