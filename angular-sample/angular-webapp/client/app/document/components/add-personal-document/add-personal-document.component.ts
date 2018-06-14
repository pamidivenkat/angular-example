import { AeClassStyle } from '../../../atlas-elements/common/ae-class-style.enum';
import { FileUploadService } from '../../../shared/services/file-upload.service';
import { UpdateDocument } from '../../actions/document.actions';
import { extractDocumentCategorySelectItems } from '../../common/document-subcategory-extract-helper';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs/Rx';
import { DocumentCategory } from '../../models/document-category';
import { DocumentCategoryService } from '../../services/document-category-service';
import { ClaimsHelperService } from '../../../shared/helpers/claims-helper';
import { AeInputType } from '../../../atlas-elements/common/ae-input-type.enum';
import { isNullOrUndefined, isNumber } from 'util';
import { FileResult } from '../../../atlas-elements/common/models/file-result';
import { AeSelectItem } from '../../../atlas-elements/common/models/ae-select-item';
import { DocumentForm } from '../../models/document-form';
import { FormGroup } from '@angular/forms';
import { FormBuilderService } from '../../../shared/services/form-builder.service';
import { LocaleService, TranslationService } from 'angular-l10n';
import { BaseComponent } from '../../../shared/base-component';
import { ObjectHelper } from '../../../shared/helpers/object-helper';
import { MessengerService } from '../../../shared/services/messenger.service';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output
} from '@angular/core';
import * as Immutable from 'immutable';
import { Document } from '../../models/document';
import * as fromRoot from './../../../shared/reducers';
import { DocumentArea } from '../../models/document-area';
import { DatePipe } from "@angular/common";

@Component({
  selector: 'add-personal-document',
  templateUrl: './add-personal-document.component.html',
  styleUrls: ['./add-personal-document.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddPersonalDocumentComponent extends BaseComponent implements OnInit, OnDestroy {
  //Private Variables
  private _documentForm: FormGroup;
  private _categoryDropDownList: Immutable.List<AeSelectItem<string>>;
  private _categoryList: Array<DocumentCategory>;
  private _selectedFile: FileResult;
  private _isDateValid: boolean;
  private _ctrlType: AeInputType = AeInputType.number;
  private _showReminderInDaysField: boolean;
  private _showDesciptionAndNotes: boolean;
  private _document: Document;
  private _documentCategoriesSubscription: Subscription;
  private _categoryId: string;
  private _category: number;
  private _documentSubCategoryDropDownList$: Observable<Immutable.List<AeSelectItem<string>>>;
  private _formName: string;
  private _action: string;
  private _actionText: string;
  private _selectDocumentSubscription: Subscription;
  private _minDate: Date;
  private _submitted: boolean;
  private _errorMessage: string;
  private _showerrorMessage: boolean;
  private _documentCategorySubscription: Subscription;
  private _headerTitle: string;
  private _documentExpiryLabelText: string;
  private _documentExpiryNotificationLabelText: string;
  private _lightClass: AeClassStyle = AeClassStyle.Light;

  //End of Private Variables
  //Input Bindings
  @Input('Action')
  get Action() {
    return this._action;
  }
  set Action(value: string) {
    this._action = value;
    this._formName = 'document' + this._action + 'Form';
    this._actionText = this._action === 'Add' ? 'Add' : 'Save';
    this._headerTitle = this._action === 'Add' ? 'ADD_DOCUMENT_TEXT' : 'UPDATE_DOCUMENT';
    this._documentExpiryLabelText = this._action === 'Add' ? 'DOCUMENT_EXPIRY_ADD_TEXT' : 'DOCUMENT_EXPIRY_UPDATE_TEXT';
    this._documentExpiryNotificationLabelText = this._action === 'Add' ? 'DOCUMENT_EXPIRY_NOTIFICATION_TEXT' : 'DOCUMENT_EXPIRY_NOTIFICATION_DAYS_TEXT';
  }
  get lightClass(): AeClassStyle {
    return this._lightClass;
  }
  get headerTitle() {
    return this._headerTitle;
  }
  get documentForm() {
    return this._documentForm;
  }
  get categoryDropDownList() {
    return this._categoryDropDownList;
  }
  get documentSubCategoryDropDownList$() {
    return this._documentSubCategoryDropDownList$;
  }
  get showDesciptionAndNotes() {
    return this._showDesciptionAndNotes;
  }
  get documentExpiryLabelText() {
    return this._documentExpiryLabelText;
  }
  get minDate() {
    return this._minDate;
  }
  get isDateValid() {
    return this._isDateValid;
  }
  get showReminderInDaysField() {
    return this._showReminderInDaysField;
  }
  get documentExpiryNotificationLabelText() {
    return this._documentExpiryNotificationLabelText;
  }
  get ctrlType() {
    return this._ctrlType;
  }
  get showerrorMessage() {
    return this._showerrorMessage;
  }
  get errorMessage() {
    return this._errorMessage;
  }
  get actionText() {
    return this._actionText;
  }
  //End of Input Bindings

  //Output Variables
  @Output('onCancel') _onDocumentAddCancel: EventEmitter<string>;
  @Output('onFormSubmit') _onDocumentFormSubmit: EventEmitter<any>;

  //End of Output Variables
  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _cdRef: ChangeDetectorRef
    , private _fb: FormBuilderService
    , private _claimsHelper: ClaimsHelperService
    , private _fileUploadService: FileUploadService
    , private _documentCategoryService: DocumentCategoryService
    , private _store: Store<fromRoot.State>
    , private _datePipe: DatePipe
    , private _messenger: MessengerService) {
    super(_localeService, _translationService, _cdRef);
    this._isDateValid = false;
    this._showReminderInDaysField = false;
    this._showDesciptionAndNotes = false;
    this._onDocumentAddCancel = new EventEmitter<string>();
    this._onDocumentFormSubmit = new EventEmitter<any>();
    this._categoryDropDownList = Immutable.List([]);
    this._documentCategoriesSubscription = new Subscription();
    this._minDate = new Date();
    this.id = 'add-personal-document';
    this.name = 'add-personal-document';

  }


  ngOnInit() {
    this._documentForm = this._fb.build(new DocumentForm(this._formName));
    if (this._action === 'Add') {
      this._documentCategoryService.loadDocumentCategories();
      this._documentCategoriesSubscription = this._store.let(fromRoot.getDocumentCategoriesData).subscribe(res => {
        if (!isNullOrUndefined(res)) {
          this._categoryList = this._documentCategoryService.getDocumentCategoriesByArea(res, DocumentArea.DocumentVault);
          this._categoryDropDownList = Immutable.List(extractDocumentCategorySelectItems(this._categoryList));
          this._cdRef.markForCheck();
        }
      });

      this._documentForm.get('Category').valueChanges.subscribe((value: string) => {
        if (!isNullOrUndefined(value)) {
          this._categoryId = value;
          this._category = this._categoryList.find(c => c.Id === this._categoryId).Code;
          this._documentForm.get('DocumentVaultSubCategory').setValue(null);
          this._documentCategoryService.getDocumentSubCategories(this._categoryId);
        }
      });
    }

    if (this._action === "Update" && isNullOrUndefined(this._document)) {
      this._selectDocumentSubscription = this._store.let(fromRoot.getCurrentDocument).subscribe(res => {
        if (!isNullOrUndefined(res) && isNullOrUndefined(this._document)) {
          this._document = res;
          if (!isNullOrUndefined(this._document.DocumentVaultSubCategory)) {
            this._documentForm.get('Category').setValue(this._document.DocumentVaultSubCategory.CategoryId);
            this._categoryId = this._document.DocumentVaultSubCategory.CategoryId;
            this._documentCategoryService.getDocumentSubCategories(this._categoryId);
          }

          this._documentForm.get('DocumentVaultSubCategory').setValue(this._document.DocumentVaultSubCategoryId);

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
    this._documentForm.get('IsReminderRequired').valueChanges.subscribe((value: boolean) => {
      this._showReminderInDaysField = value;
      this._showerrorMessage = true;
      this._errorMessage = '';
      if (value === false)
        this._documentForm.get('ReminderInDays').setValue(null);
    });

    this._documentForm.get('ExpiryDate').valueChanges.subscribe((value: Date) => {
      if (!isNullOrUndefined(value)) {
        if ((value) as Date) {
          this._checkNoOfDays();
        }
      }

    });
    this._documentForm.get('ReminderInDays').valueChanges.subscribe((value: any) => {
      if (!isNullOrUndefined(value)) {
        if (Number(value) as Number) {
          this._checkNoOfDays();
        }
      }

    });

    this._documentSubCategoryDropDownList$ = this._store.let(fromRoot.getDocumentSubCategoriesData);
  }

  ngOnDestroy(): void {
    if (!isNullOrUndefined(this._documentCategoriesSubscription))
      this._documentCategoriesSubscription.unsubscribe();
    if (!isNullOrUndefined(this._selectDocumentSubscription))
      this._selectDocumentSubscription.unsubscribe();
  }




  private _checkNoOfDays() {
    if (this._showReminderInDaysField === true) {
      this._errorMessage = '';
      this._showerrorMessage = false;
      let oneDay = 24 * 60 * 60 * 1000;
      let caldate = new Date();
      if (isNullOrUndefined(this._documentForm.get('ExpiryDate').value)) {
        this._showerrorMessage = true;
        this._errorMessage = "Please select the expiry above date.";
      } else {
        let cal = Math.ceil(Math.abs((this._documentForm.get('ExpiryDate').value - caldate.getTime()) / (oneDay)));
        if (isNullOrUndefined(this._documentForm.get('ExpiryDate').value) || this._documentForm.get('ReminderInDays').value > cal) {
          this._showerrorMessage = true;
          this._errorMessage = "Number of reminder notification days should be less than the days difference between today's date and expiry date.";
        }
        else if (caldate.getDate() == this._documentForm.get('ExpiryDate').value.getDate()) {
          this._showerrorMessage = true;
          this._errorMessage = "Number of reminder notification days should be less than the days difference between today's date and expiry date.";
        }
      }
    }

  }
  //public methods
  public onAddFormSubmit() {
    this._submitted = true;
    let _documentsToSubmit: any = {
      _documentToSave: Document,
      file: File
    };
    if (this._documentForm.valid && (this._action === 'Update' || (this._action === 'Add' && !isNullOrUndefined(this._selectedFile)))) {
      if (this._action === 'Add') {
        let _documentToSave: Document = Object.assign({}, this._document, <Document>this._documentForm.value);
        _documentToSave.CompanyId = this._claimsHelper.getCompanyId();
        _documentToSave.RegardingObjectId = this._claimsHelper.getEmpId() ? this._claimsHelper.getEmpId() : this._claimsHelper.getUserId();
        _documentToSave.RegardingObjectTypeCode = this._claimsHelper.getEmpId() ? 17 : 11;
        _documentToSave.LastModifiedDateTime = this._datePipe.transform(this._selectedFile.file.lastModifiedDate, 'medium');
        _documentToSave.FileName = this._selectedFile.file.name;
        _documentToSave.Category = this._category;
        _documentToSave.DocumentVaultSubCategoryId = this._documentForm.get('DocumentVaultSubCategory').value;
        _documentToSave.DocumentVaultSubCategory = null;
        _documentToSave.Usage = 2;
        _documentToSave.Sensitivity = 1;
        if (!isNullOrUndefined(_documentToSave.ExpiryDate))
          _documentToSave.ExpiryDate = this._datePipe.transform(_documentToSave.ExpiryDate, 'medium');
        _documentsToSubmit._documentToSave = _documentToSave;
        _documentsToSubmit.file = this._selectedFile.file;
        this._onDocumentFormSubmit.emit({ _documentsToSubmit });
      }
      else {
        this._document.DocumentVaultSubCategoryId = this._documentForm.get('DocumentVaultSubCategory').value;
        this._document.DocumentVaultSubCategory = null;
        this._document.ExpiryDate = this._documentForm.get('ExpiryDate').value;
        if (!isNullOrUndefined(this._document.ExpiryDate)) {
          this._document.ReminderInDays = this._documentForm.get('ReminderInDays').value;
        }
        else {
          this._document.ReminderInDays = 0;
        }
        _documentsToSubmit._documentToSave = this._document;
        _documentsToSubmit.file = null;
        this._onDocumentFormSubmit.emit({ _documentsToSubmit });
      }

    }
  }

  public onAddCancel() {
    this._onDocumentAddCancel.emit('cancel');
  }

  public isValidDate = function (val: boolean) {
    this._isDateValid = val;;
  }

  public isFileSelected(): boolean {
    return (this._submitted === true && isNullOrUndefined(this._selectedFile));
  }

  public onFilesSelected($event: FileResult[]) {
    this._selectedFile = $event[0];
    if (!isNullOrUndefined(this._selectedFile)  && this._selectedFile.isValid) {
      this._showDesciptionAndNotes = true;
    }
  }

  public fieldHasRequiredError(fieldName: string): boolean {
    if (this._documentForm.get(fieldName).hasError('required') && (!this._documentForm.get(fieldName).pristine || this._submitted)) {
      return true;
    }
    return false;
  }

  public isAdd(): boolean {
    return this._action === 'Add';
  }

  //end of public methods

}
