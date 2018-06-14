import { DatePipe } from '@angular/common';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Input,
    OnDestroy,
    OnInit,
    Output,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Store } from '@ngrx/store';
import { LocaleService, TranslationService } from 'angular-l10n';
import * as Immutable from 'immutable';
import { Observable, Subscription } from 'rxjs/Rx';
import { isNullOrUndefined } from 'util';

import { AeClassStyle } from '../../../../atlas-elements/common/ae-class-style.enum';
import { AeInputType } from '../../../../atlas-elements/common/ae-input-type.enum';
import { AeSelectItem } from '../../../../atlas-elements/common/models/ae-select-item';
import { FileResult } from '../../../../atlas-elements/common/models/file-result';
import { extractDocumentCategorySelectItems } from '../../../../document/common/document-subcategory-extract-helper';
import { Document } from '../../../../document/models/document';
import { DocumentArea } from '../../../../document/models/document-area';
import { DocumentCategory } from '../../../../document/models/document-category';
import { DocumentCategoryService } from '../../../../document/services/document-category-service';
import { BaseComponent } from '../../../../shared/base-component';
import { ClaimsHelperService } from '../../../../shared/helpers/claims-helper';
import { FileUploadService } from '../../../../shared/services/file-upload.service';
import { FormBuilderService } from '../../../../shared/services/form-builder.service';
import {
    getTimelineViewTypeOptionsForAdvance,
    getTimelineViewTypeOptionsForBasic,
    getTimelineViewTypeOptionsForSensitive,
} from '../../../common/extract-helpers';
import { Sensitivity } from '../../../models/timeline';
import { DocumentForm } from '../../models/employee-document-form';
import * as fromRoot from '.././../../../shared/reducers';

@Component({
  selector: 'add-update-employee-document',
  templateUrl: './add-update-employee-document.component.html',
  styleUrls: ['./add-update-employee-document.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddUpdateEmployeeDocumentComponent extends BaseComponent implements OnInit, OnDestroy {
  //Private Variables
  private _documentForm: FormGroup;
  private _categoryDropDownList: Immutable.List<AeSelectItem<string>>;
  private _categoryList: Array<DocumentCategory>;
  private _selectedFile: FileResult;
  private _isDateValid: boolean;
  private _ctrlType: AeInputType = AeInputType.number;
  private _showReminderInDaysField: boolean;
  private _showDescriptionAndNotes: boolean;
  private _document: Document;
  private _documentCategoriesSubscription: Subscription;
  private _formName: string;
  private _action: string;
  private _actionText: string;
  private _selectDocumentSubscription: Subscription;
  private _minDate: Date;
  private _submitted: boolean;
  private _errorMessage: string;
  private _showErrorMessage: boolean;
  private _documentCategorySubscription: Subscription;
  private _headerTitle: string;
  private _documentExpiryLabelText: string;
  private _documentExpiryNotificationLabelText: string;
  private _sensitivityOptions: Immutable.List<AeSelectItem<number>>;
  private _title: string;
  private _canSeeSensitive: boolean;
  private _canSeeAdvance: boolean;
  private _canManageDepartmentEmployees: boolean;
  private _employeeId: string;
  private _employeeIdToFetch$: Observable<string>;
  private _routeParamsSubscription: Subscription;

  //End of Private Variables
  //Input Bindings
  @Input('Action')
  get Action() {
    return this._action;
  }
  set Action(value: string) {
    this._action = value;
    this._formName = 'document' + this._action + 'Form';
    this._actionText = this._action === 'Add' ? 'Add' : 'Update';
    this._headerTitle = this._action === 'Add' ? 'ADD_DOCUMENT_TEXT' : 'UPDATE_DOCUMENT';
    this._documentExpiryLabelText = this._action === 'Add' ? 'DOCUMENT_EXPIRY_ADD_TEXT' : 'DOCUMENT_EXPIRY_UPDATE_TEXT';
    this._documentExpiryNotificationLabelText = this._action === 'Add' ? 'DOCUMENT_EXPIRY_NOTIFICATION_TEXT' : 'DOCUMENT_EXPIRY_NOTIFICATION_DAYS_TEXT';
  }
  //End of Input Bindings

  //Output Variables
  @Output('onCancel') _onDocumentAddCancel: EventEmitter<string>;
  @Output('onFormSubmit') _onDocumentFormSubmit: EventEmitter<any>;

  //End of Output Variables
  get headerTitle(): string {
    return this._headerTitle;
  }
  get documentForm(): FormGroup {
    return this._documentForm;
  }
  get categoryDropDownList(): Immutable.List<AeSelectItem<string>> {
    return this._categoryDropDownList;
  }
  get sensitivityOptions(): Immutable.List<AeSelectItem<number>> {
    return this._sensitivityOptions;
  }
  get showDescriptionAndNotes(): boolean {
    return this._showDescriptionAndNotes;
  }
  get minDate(): Date {
    return this._minDate;
  }
  get showReminderInDaysField(): boolean {
    return this._showReminderInDaysField;
  }
  get ctrlType(): AeInputType {
    return this._ctrlType;
  }
  get showErrorMessage(): boolean {
    return this._showErrorMessage;
  }
  get errorMessage(): string {
    return this._errorMessage;
  }
  get actionText(): string {
    return this._actionText;
  }
  get document(): Document {
    return this._document;
  }
  get documentExpiryLabelText(): string {
    return this._documentExpiryLabelText;
  }
  get documentExpiryNotificationLabelText(): string {
    return this._documentExpiryNotificationLabelText;
  }
  get isDateValid(): boolean {
    return this._isDateValid;
  }
  public get lightClass(): AeClassStyle {
    return AeClassStyle.Light;
  }



  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _cdRef: ChangeDetectorRef
    , private _fb: FormBuilderService
    , private _claimsHelper: ClaimsHelperService
    , private _fileUploadService: FileUploadService
    , private _documentCategoryService: DocumentCategoryService
    , private _store: Store<fromRoot.State>
    , private _datePipe: DatePipe) {
    super(_localeService, _translationService, _cdRef);
    this._isDateValid = false;
    this._showReminderInDaysField = false;
    this._showDescriptionAndNotes = false;
    this._onDocumentAddCancel = new EventEmitter<string>();
    this._onDocumentFormSubmit = new EventEmitter<any>();
    this._categoryDropDownList = Immutable.List([]);
    this._documentCategoriesSubscription = new Subscription();
    this._minDate = new Date();
    this._canSeeSensitive = this._claimsHelper.canManageEmployeeSensitiveDetails();
    this._canSeeAdvance = this._claimsHelper.CanManageEmployeeAdvanceeDetails();
    this._canManageDepartmentEmployees = this._claimsHelper.canManageDeptEmps();
  }

  ngOnInit() {
    this._documentForm = this._fb.build(new DocumentForm(this._formName));
    this._documentCategoriesSubscription = this._store.let(fromRoot.getDocumentCategoriesData).subscribe(res => {
      if (!isNullOrUndefined(res)) {
        this._categoryList = this._documentCategoryService.getDocumentCategoriesByArea(res, DocumentArea.EmployeeDocuments);
        this._categoryDropDownList = Immutable.List(extractDocumentCategorySelectItems(this._categoryList));
        this._cdRef.markForCheck();
      }
    });

    if (this._canSeeSensitive) {
      this._sensitivityOptions = getTimelineViewTypeOptionsForSensitive(Sensitivity);
    }
    else if (this._canSeeAdvance || this._canManageDepartmentEmployees) {
      this._sensitivityOptions = getTimelineViewTypeOptionsForAdvance(Sensitivity);
    }
    else {
      this._sensitivityOptions = getTimelineViewTypeOptionsForBasic(Sensitivity);
    }

    if (this._action === "Update" && isNullOrUndefined(this._document)) {
      this._selectDocumentSubscription = this._store.let(fromRoot.getCurrentDocument).subscribe(res => {
        if (!isNullOrUndefined(res) && isNullOrUndefined(this._document)) {
          this._document = res;
          this._documentForm.get('Title').setValue(this._document.Title);
          this._documentForm.get('Sensitivity').setValue(this._document.Sensitivity);
          this._documentForm.get('Category').setValue(this._categoryList.find(f => f.Code === this._document.Category).Id);

          if (!isNullOrUndefined(this._document.ExpiryDate)) {
            this._documentForm.get('ExpiryDate').setValue(new Date(this._document.ExpiryDate));
            this._isDateValid = true;
          }

          if (!isNullOrUndefined(this._document.ReminderInDays)) {
            this._showReminderInDaysField = true;
            this._documentForm.get('IsReminderRequired').setValue(true);
            this._documentForm.get('ReminderInDays').setValue(this._document.ReminderInDays);
          }

        }

      });
    }
    else {
      if (this._canSeeSensitive) {
        this._documentForm.get('Sensitivity').setValue(Sensitivity.Sensitive);
      }
      else if (this._canSeeAdvance) {
        this._documentForm.get('Sensitivity').setValue(Sensitivity.Advance);
      }
    }
    this._documentForm.get('IsReminderRequired').valueChanges.subscribe((value: boolean) => {
      this._showReminderInDaysField = value;
      this._showErrorMessage = true;
      this._errorMessage = '';
      if (value === false)
        this._documentForm.get('ReminderInDays').setValue(null);
    });
    this._documentForm.get('ExpiryDate').valueChanges.subscribe((value: Date) => {
      if (!isNullOrUndefined(value)) {
        if ((value) as Date) {
          if (this._documentForm.get('ReminderInDays').value && this._documentForm.get('ReminderInDays').value != "") {
            this.checkNoOfDays();
          }
        }
      }

    });
    this._documentForm.get('ReminderInDays').valueChanges.subscribe((value: any) => {
      if (!isNullOrUndefined(value) && value != "") {
        if (Number(value) as Number || Number(value) === 0) {
          this.checkNoOfDays();
        }
      }
      else {
        this._errorMessage = "";
        this._showErrorMessage = false;
      }

    });
    this._employeeIdToFetch$ = this._store.let(fromRoot.getEmployeeId);
    this._routeParamsSubscription = this._employeeIdToFetch$.subscribe((val) => {
      this._employeeId = val;
    })
  }

  ngOnDestroy(): void {
    if (!isNullOrUndefined(this._documentCategoriesSubscription))
      this._documentCategoriesSubscription.unsubscribe();
    if (!isNullOrUndefined(this._routeParamsSubscription)) {
      this._routeParamsSubscription.unsubscribe();
    }
  }

  onFilesSelected($event: FileResult[]) {
    this._selectedFile = $event[0];
    if (!isNullOrUndefined(this._selectedFile) && this._selectedFile.isValid) {
      this._showDescriptionAndNotes = true;
    }
  }

  isValidDate = function (val: boolean) {
    this._isDateValid = val;
  }

  onAddCancel() {
    this._onDocumentAddCancel.emit('cancel');
  }

  isAdd(): boolean {
    return this._action === 'Add';
  }

  onAddFormSubmit() {

    let _documentsToSubmit: any = {
      _documentToSave: Document,
      file: File
    };
    this._submitted = true;
    if (this._documentForm.valid && (this._action === 'Update' || (this._action === 'Add' && !isNullOrUndefined(this._selectedFile)))) {
      if (this._action === 'Add') {

        let _documentToSave: Document = Object.assign({}, this._document, <Document>this._documentForm.value);
        _documentToSave.CompanyId = this._claimsHelper.getCompanyId();
        _documentToSave.RegardingObjectId = this._employeeId;
        _documentToSave.RegardingObjectTypeCode = 17;
        _documentToSave.LastModifiedDateTime = this._datePipe.transform(this._selectedFile.file.lastModifiedDate, 'medium');
        _documentToSave.FileName = this._selectedFile.file.name;
        _documentToSave.Category = this._categoryList.find(c => c.Id === this._documentForm.get('Category').value).Code;
        _documentToSave.Usage = 2;
        _documentToSave.Title = this._documentForm.get('Title').value;
        _documentToSave.Sensitivity = this._documentForm.get('Sensitivity').value;
        if (!isNullOrUndefined(_documentToSave.ExpiryDate))
          _documentToSave.ExpiryDate = this._datePipe.transform(_documentToSave.ExpiryDate, 'medium');

        _documentsToSubmit._documentToSave = _documentToSave;
        _documentsToSubmit.file = this._selectedFile.file;
        this._onDocumentFormSubmit.emit({ _documentsToSubmit });

      }
      else {
        this._document.Title = this._documentForm.get('Title').value;
        this._document.Sensitivity = this._documentForm.get('Sensitivity').value;
        this._document.ExpiryDate = this._documentForm.get('ExpiryDate').value;
        this._document.Category = this._categoryList.find(c => c.Id === this._documentForm.get('Category').value).Code;
        if (!isNullOrUndefined(this._document.ExpiryDate)) {
          this._document.ReminderInDays = this._documentForm.get('ReminderInDays').value;
        }
        else
          this._document.ReminderInDays = 0;
        _documentsToSubmit._documentToSave = this._document;
        _documentsToSubmit.file = null;
        this._onDocumentFormSubmit.emit({ _documentsToSubmit });
      }

    }
  }


  fieldHasRequiredError(fieldName: string): boolean {
    if (this._documentForm.get(fieldName).hasError('required') && (!this._documentForm.get(fieldName).pristine || this._submitted)) {
      return true;
    }
    return false;
  }
  isFileSelected(): boolean {
    return (this._submitted === true && isNullOrUndefined(this._selectedFile));
  }

  checkNoOfDays() {
    if (this._showReminderInDaysField === true) {
      this._errorMessage = '';
      this._showErrorMessage = false;
      let oneDay = 24 * 60 * 60 * 1000;
      let today = new Date();
      if (isNullOrUndefined(this._documentForm.get('ExpiryDate').value)) {
        this._showErrorMessage = true;
        this._errorMessage = "Please select the expiry above date.";
      } else {
        let cal = Math.ceil(Math.abs((this._documentForm.get('ExpiryDate').value - today.getTime()) / (oneDay)));
        if (isNullOrUndefined(this._documentForm.get('ExpiryDate').value) || this._documentForm.get('ReminderInDays').value > cal) {
          this._showErrorMessage = true;
          this._errorMessage = "Number of reminder notification days should be less than the days difference between today's date and expiry date.";
        }
        else if (today.getDate() == this._documentForm.get('ExpiryDate').value.getDate()) {
          this._showErrorMessage = true;
          this._errorMessage = "Number of reminder notification days should be less than the days difference between today's date and expiry date.";
        }
      }
    }

  }


  canSeeSensitivityText(): boolean {
    return this._canSeeSensitive === true;
  }
  canSeeAdvanceText(): boolean {
    return this._canSeeAdvance === true || this._canManageDepartmentEmployees === true;
  }



}