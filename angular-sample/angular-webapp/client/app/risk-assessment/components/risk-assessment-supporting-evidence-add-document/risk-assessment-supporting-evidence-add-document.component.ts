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
import { Subscription } from "rxjs/Rx";
import * as Immutable from 'immutable';
import { AeSelectItem } from "../../../atlas-elements/common/models/ae-select-item";
import { DataTableOptions } from "../../../atlas-elements/common/models/ae-datatable-options";
import { BehaviorSubject } from "rxjs/BehaviorSubject";
import { FormGroup } from "@angular/forms/src/forms";
import { FormBuilderService } from "../../../shared/services/form-builder.service";
import { DocumentAddForm } from '../../models/document-add-form';

@Component({
  selector: 'risk-assessment-supporting-evidence-add-document',
  templateUrl: './risk-assessment-supporting-evidence-add-document.component.html',
  styleUrls: ['./risk-assessment-supporting-evidence-add-document.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RiskAssessmentSupportingEvidenceAddDocumentComponent extends BaseComponent implements OnInit, OnDestroy {
  private _action: string;
  private _actionText: string;
  private _documentForm: FormGroup;
  private _selectedFile: FileResult;
  private _document: Document;
  private _formName: string;
  private _submitted: boolean;
  private _headerTitle: string;
  private _showDesciptionAndTitle: boolean;
  private _objectType: string = "Document";
  private _lightClass: AeClassStyle = AeClassStyle.Light;

  @Input('Action')
  get Action() {
    return this._action;
  }
  set Action(value: string) {
    this._action = value;
    this._formName = 'document' + this._action + 'Form';
    this._actionText = this._action === 'Add' ? 'Add' : 'Save';
    this._headerTitle = this._action === 'Add' ? 'ADD_DOCUMENT_TEXT' : '';

  }

  @Output('onCancel') _onDocumentAddCancel: EventEmitter<string>;
  @Output('onFormSubmit') _onDocumentFormSubmit: EventEmitter<any>;

  get headerTitle(): string {
    return this._headerTitle;
  }
  get documentForm(): FormGroup {
    return this._documentForm;
  }
  get showDesciptionAndTitle(): boolean {
    return this._showDesciptionAndTitle;
  }
  get lightClass(): AeClassStyle {
    return this._lightClass;
  }
  get actionText(): string {
    return this._actionText;
  }
  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _cdRef: ChangeDetectorRef
    , private _fileUploadService: FileUploadService
    , private _messenger: MessengerService
    , private _claimsHelper: ClaimsHelperService
    , private _fb: FormBuilderService) {
    super(_localeService, _translationService, _cdRef);
    this._onDocumentAddCancel = new EventEmitter<string>();
    this._onDocumentFormSubmit = new EventEmitter<any>();
  }

  ngOnInit() {
    this._documentForm = this._fb.build(new DocumentAddForm(this._formName));
  }
  onFilesSelected($event: FileResult[]) {
    this._selectedFile = $event[0];
    if (!isNullOrUndefined(this._selectedFile)) {
      if (this._selectedFile.isValid) {
        this._showDesciptionAndTitle = true;
      }
    }
  }
  onAddCancel() {
    this._onDocumentAddCancel.emit('cancel');
  }

  isAdd(): boolean {
    return this._action === 'Add';
  }

  onAddFormSubmit() {
    this._submitted = true;
    let _documentsToSubmit: any = {
      _documentToSave: Document,
      file: File
    };
    if (this._documentForm.valid && !isNullOrUndefined(this._selectedFile)) {
      if (this._selectedFile.isValid) {
        let vm = ObjectHelper.createInsertInProgressSnackbarMessage(this._objectType, this._selectedFile.file.name);
        this._messenger.publish('snackbar', vm);
        let _documentToSave: Document = Object.assign({}, new Document());
        _documentToSave.LastModifiedDateTime = this._selectedFile.file.lastModifiedDate;
        _documentToSave.Category = 0;
        _documentToSave.FileName = this._selectedFile.file.name;
        _documentToSave.FileNameAndTitle = this._selectedFile.file.name;
        _documentToSave.CompanyId = this._claimsHelper.getCompanyId();
        _documentToSave.RegardingObjectTypeCode = 30;
        _documentToSave.Description = this._documentForm.get('Description').value;
        _documentToSave.Title = this._documentForm.get('Title').value;
        _documentToSave.Usage = 2;

        _documentsToSubmit._documentToSave = _documentToSave;
        _documentsToSubmit.file = this._selectedFile.file;
        this._onDocumentFormSubmit.emit({ _documentsToSubmit });

      }
    }
  }

  private _fieldHasRequiredError(fieldName: string): boolean {
    if (this._documentForm.get(fieldName).hasError('required') && (!this._documentForm.get(fieldName).pristine || this._submitted)) {
      return true;
    }
    return false;
  }
  isFileSelected(): boolean {
    return (this._submitted === true && isNullOrUndefined(this._selectedFile));
  }

}
