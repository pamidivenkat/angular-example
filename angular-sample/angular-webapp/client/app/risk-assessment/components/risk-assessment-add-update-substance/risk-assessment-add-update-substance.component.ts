import { BehaviorSubject } from 'rxjs/Rx';
import { DocumentService } from '../../../document/services/document-service';
import { Component, OnInit, OnDestroy, ChangeDetectorRef, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { LocaleService, TranslationService } from "angular-l10n";
import { BaseComponent } from "../../../shared/base-component";
import { Subscription } from "rxjs/Subscription";
import { isNullOrUndefined } from "util";
import { MessengerService } from "../../../shared/services/messenger.service";
import { ClaimsHelperService } from "../../../shared/helpers/claims-helper";
import { Store } from "@ngrx/store";
import * as fromRoot from '../../../shared/reducers';
import { RiskAssessmentService } from "../../services/risk-assessment-service";
import { RASubstance } from "../../models/risk-assessment-substance";
import { FormGroup } from "@angular/forms/src/forms";
import { IFormBuilderVM } from "../../../shared/models/iform-builder-vm";
import { FormBuilderService } from "../../../shared/services/form-builder.service";
import { RaAddUpdateSubstanceForm } from "../../models/ra-add-update-substance-form";
import { AeDataActionTypes } from "../../../employee/models/action-types.enum";
import { AeClassStyle } from "../../../atlas-elements/common/ae-class-style.enum";
import { FileResult } from "../../../atlas-elements/common/models/file-result";
import { ObjectHelper } from "../../../shared/helpers/object-helper";
import { FileUploadService } from "../../../shared/services/file-upload.service";
import { Document } from '../../../document/models/document';
import { AtlasApiError } from "../../../shared/error-handling/atlas-api-error";
import * as errorActions from '../../../shared/actions/error.actions';
import { MessageEvent } from '../../../atlas-elements/common/models/message-event.enum';

@Component({
  selector: 'risk-assessment-add-update-substance',
  templateUrl: './risk-assessment-add-update-substance.component.html',
  styleUrls: ['./risk-assessment-add-update-substance.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RiskAssessmentAddUpdateSubstanceComponent extends BaseComponent implements OnInit, OnDestroy {

  private _selectedSubstance: RASubstance;
  private _action: string;
  private _raAddUpdateSubstanceForm: FormGroup;
  private _isFormSubmitted$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private _raAddUpdateSubstanceFormVM: IFormBuilderVM;
  private _formName: string;
  private _lightClass: AeClassStyle = AeClassStyle.Light;
  private _selectedFile: FileResult;
  private _actionText: string;
  private _headerTitle: string;
  private _attacheFileName: string;
  private _showFilePreview: boolean = false;
  private _attachDocumentSubscription$: Subscription;


  get isFormSubmitted$(): BehaviorSubject<boolean> {
    return this._isFormSubmitted$;
  }
  get raAddUpdateSubstanceFormVM(): IFormBuilderVM {
    return this._raAddUpdateSubstanceFormVM;
  }
  get actionText() {
    return this._actionText;
  }
  get headerTitle() {
    return this._headerTitle;
  }
  get lightClass() {
    return this._lightClass;
  }
  get showFilePreview() {
    return this._showFilePreview;
  }
  get attacheFileName() {
    return this._attacheFileName;
  }




  @Input('selectedSubstance')
  set selectedSubstance(val: RASubstance) {
    this._selectedSubstance = val;
  }
  get selectedSubstance() {
    return this._selectedSubstance;
  }
 

  @Input('action')
  get action() {
    return this._action;
  }
  set action(val: string) {
    this._action = val;
    this._actionText = this._action === 'Add' ? 'Add' : 'Update';
    this._headerTitle = this._action === 'Add' ? 'SUBSTANCE_TAB.ADD_SUBSTANCE' : 'SUBSTANCE_TAB.UPDATE_SUBSTANCE';
  }



  @Output('addUpdateSubstanceSubmit')
  private _addUpdateSubstanceSubmit: EventEmitter<any> = new EventEmitter<any>();

  @Output('slideOutClose')
  private _slideOutClose: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _cdRef: ChangeDetectorRef
    , private _store: Store<fromRoot.State>
    , private _fb: FormBuilderService
    , private _riskAssessmentService: RiskAssessmentService
    , private _fileUploadService: FileUploadService
    , private _documentService: DocumentService
    , private _messenger: MessengerService
  ) {
    super(_localeService, _translationService, _cdRef);
  }

  ngOnInit() {
    this._formName = 'raAddUpdateSubstanceForm';
    this._raAddUpdateSubstanceFormVM = new RaAddUpdateSubstanceForm(this._formName);
    let fields = this._raAddUpdateSubstanceFormVM.init();
  }

  onFormInit(fg: FormGroup) {
    this._raAddUpdateSubstanceForm = fg;
    if (this._action === AeDataActionTypes.Update) {
      this._raAddUpdateSubstanceForm.get('Substance').setValue(this._selectedSubstance.Substance);
      this._raAddUpdateSubstanceForm.get('Description').setValue(this._selectedSubstance.Description);
      this._raAddUpdateSubstanceForm.get('Manufacturer').setValue(this._selectedSubstance.Manufacturer);
      this._raAddUpdateSubstanceForm.get('Quantity').setValue(this._selectedSubstance.Quantity);
      this._raAddUpdateSubstanceForm.get('ExposureLimits').setValue(this._selectedSubstance.ExposureLimits);
      this._raAddUpdateSubstanceForm.get('ReferenceNumber').setValue(this._selectedSubstance.ReferenceNumber);
      this._raAddUpdateSubstanceForm.get('UsedFor').setValue(this._selectedSubstance.UsedFor);
      this._raAddUpdateSubstanceForm.get('PeopleAffected').setValue(this._selectedSubstance.PeopleAffected);
      this._raAddUpdateSubstanceForm.get('Mig_EmergencyContactNumber').setValue(this._selectedSubstance.Mig_EmergencyContactNumber);
      this._raAddUpdateSubstanceForm.get('AttachmentId').setValue(this._selectedSubstance.AttachmentId);
      if (!isNullOrUndefined(this._selectedSubstance.AttachmentId) || this._selectedSubstance.AttachmentId !== "00000000-0000-0000-0000-000000000000") {
        this._documentService.loadSelectedDocument(this._selectedSubstance.AttachmentId)
        this._attachDocumentSubscription$ = this._store.let(fromRoot.getCurrentDocument).subscribe((currentDocument) => {
          if (!isNullOrUndefined(currentDocument)) {
            this._attacheFileName = currentDocument.FileName;
            this._showFilePreview = true;
            this._cdRef.markForCheck();
          }
        });
      }

    }

  }
  onFilesSelected($event: FileResult[]) {
    this._selectedFile = $event[0];
    if (!isNullOrUndefined(this._selectedFile) && this._selectedFile.isValid) {
      let vm = ObjectHelper.createInsertInProgressSnackbarMessage("Document", this._selectedFile.file.name);
      this._messenger.publish('snackbar', vm);
      let _documentToSave: Document = Object.assign({}, new Document());
      _documentToSave.LastModifiedDateTime = this._selectedFile.file.lastModifiedDate;
      _documentToSave.Category = 0;
      _documentToSave.FileName = this._selectedFile.file.name;
      _documentToSave.FileNameAndTitle = this._selectedFile.file.name;
      this._fileUploadService.Upload(_documentToSave, this._selectedFile.file).then((response: any) => {
        if (!isNullOrUndefined(response)) {
          let vm = ObjectHelper.createInsertCompleteSnackbarMessage("Document", this._selectedFile.file.name);
          this._messenger.publish('snackbar', vm);
          this._raAddUpdateSubstanceForm.get("AttachmentId").setValue(response.Id);
          this._attacheFileName = this._selectedFile.file.name;
          this._showFilePreview = true;
          this._cdRef.markForCheck();
        }
      }, (error: string) => {
        new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Create, 'Document', this._selectedFile.file.name));
      });
    }
  }

  onUpdateFormSubmit(e) {
    this._isFormSubmitted$.next(true);
    if (this._raAddUpdateSubstanceForm.valid) {
      this._addUpdateSubstanceSubmit.emit(this._raAddUpdateSubstanceForm.value);

    }
  }
  removeAttachment() {
    this._raAddUpdateSubstanceForm.get("AttachmentId").setValue(null);
    this._showFilePreview = false;
  }


  onUpdateFormClosed(e) {
    this._slideOutClose.emit(false);
  }

  private _isAddForm() {
    return this._action == AeDataActionTypes.Add;
  }

  private _isUpdateForm() {
    return this._action == AeDataActionTypes.Update;
  }
  ngOnDestroy() {
    if (this._attachDocumentSubscription$) {
      this._attachDocumentSubscription$.unsubscribe();
    }
  }

}
