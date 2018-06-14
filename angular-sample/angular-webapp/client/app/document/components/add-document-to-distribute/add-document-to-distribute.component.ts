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
import { FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { LocaleService, TranslationService } from 'angular-l10n';
import * as Immutable from 'immutable';
import { Observable, Subscription } from 'rxjs/Rx';
import { isNullOrUndefined } from 'util';

import { AeClassStyle } from '../../../atlas-elements/common/ae-class-style.enum';
import { AeDatasourceType } from '../../../atlas-elements/common/ae-datasource-type';
import { AeInputType } from '../../../atlas-elements/common/ae-input-type.enum';
import { AeSelectItem } from '../../../atlas-elements/common/models/ae-select-item';
import { SortDirection } from '../../../atlas-elements/common/models/ae-sort-model';
import { FileResult } from '../../../atlas-elements/common/models/file-result';
import {
  getTimelineViewTypeOptionsForAdvance,
  getTimelineViewTypeOptionsForBasic,
  getTimelineViewTypeOptionsForSensitive,
} from '../../../employee/common/extract-helpers';
import { Sensitivity } from '../../../employee/models/timeline';
import { LoadApplicableSitesAction } from '../../../shared/actions/user.actions';
import { BaseComponent } from '../../../shared/base-component';
import { ClaimsHelperService } from '../../../shared/helpers/claims-helper';
import { StringHelper } from '../../../shared/helpers/string-helper';
import { AtlasApiRequestWithParams, AtlasParams } from '../../../shared/models/atlas-api-response';
import { FileUploadService } from '../../../shared/services/file-upload.service';
import { FormBuilderService } from '../../../shared/services/form-builder.service';
import { MessengerService } from '../../../shared/services/messenger.service';
import { RouteParams } from '../../../shared/services/route-params';
import { SearchEmployees } from '../../actions/shared-documents.actions';
import {
  extractDocumentCategorySelectItems,
  extractSiteSelectItems,
} from '../../common/document-subcategory-extract-helper';
import { Document, fieldDetails } from '../../models/document';
import { DocumentAddForm } from '../../models/document-add-form';
import { DocumentArea } from '../../models/document-area';
import { DocumentCategory } from '../../models/document-category';
import { DocumentCategoryEnum } from '../../models/document-category-enum';
import { DocumentCategoryService } from '../../services/document-category-service';
import * as fromRoot from './../../../shared/reducers';

@Component({
  selector: 'add-document-to-distribute',
  templateUrl: './add-document-to-distribute.component.html',
  styleUrls: ['./add-document-to-distribute.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddDocumentToDistribute extends BaseComponent implements OnInit, OnDestroy {
  //Private Variables
  private _documentForm: FormGroup;
  private _docCategoryList: Immutable.List<AeSelectItem<string>>;
  private _docSiteList: Immutable.List<AeSelectItem<string>>;
  private _categoryList: Array<DocumentCategory>;
  private _selectedFile: FileResult;
  private _isDateValid: boolean;
  private _ctrlType: AeInputType = AeInputType.number;
  private _showReminderInDaysField: boolean;
  private _showDesciptionAndNotes: boolean;
  private _document: Document;
  private _documentCategoriesSubscription: Subscription;
  private _documentSiteDataSubscription: Subscription;

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
  private _isSiteRegardingObject: fieldDetails;
  private _isEmployeeRegardingObject: fieldDetails;
  private _isSensitivityObject: fieldDetails;
  private _isDocDistributable: boolean;
  private _uploadDocFolder: string;
  private _employees$: Observable<AeSelectItem<string>[]>;
  private _selectedEmployee: AeSelectItem<string>;
  private _remoteDataSourceType: AeDatasourceType;
  private _isCitationConsultant: boolean;
  private _initialEmployeeText: string = '';
  private _canSeeSensitive: boolean;
  private _canSeeAdvance: boolean;
  private _sensitivityOptions: Immutable.List<AeSelectItem<number>>;

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

  get headerTitle() {
    return this._headerTitle;
  }
  get documentForm() {
    return this._documentForm;
  }
  get docCategoryList() {
    return this._docCategoryList;
  }
  get uploadDocFolder() {
    return this._uploadDocFolder;
  }
  get isDocDistributable() {
    return this._isDocDistributable;
  }
  get lightClass(): AeClassStyle {
    return this._lightClass;
  }
  get docSiteList() {
    return this._docSiteList;
  }
  get employees$() {
    return this._employees$;
  }
  get remoteDataSourceType() {
    return this._remoteDataSourceType;
  }
  get initialEmployeeText() {
    return this._initialEmployeeText;
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

  get isSiteRegardingObject(): fieldDetails {
    return this._isSiteRegardingObject;
  }

  get isEmployeeRegardingObject(): fieldDetails {
    return this._isEmployeeRegardingObject;
  }

  get isSensitivityObject(): fieldDetails {
    return this._isSensitivityObject;
  }

  get sensitivityOptions(): Immutable.List<AeSelectItem<number>> {
    return this._sensitivityOptions;
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
    , private _messenger: MessengerService
    , private _routeParamsService: RouteParams
  ) {
    super(_localeService, _translationService, _cdRef);
    this._isDateValid = false;
    this._showReminderInDaysField = false;
    this._showDesciptionAndNotes = false;
    this._onDocumentAddCancel = new EventEmitter<string>();
    this._onDocumentFormSubmit = new EventEmitter<any>();
    this._docCategoryList = Immutable.List([]);
    this._docSiteList = Immutable.List([]);
    this._documentCategoriesSubscription = new Subscription();
    this._documentSiteDataSubscription = new Subscription();
    this._minDate = new Date();
    this._isDocDistributable = false;
    this._remoteDataSourceType = AeDatasourceType.Remote;
    this._isCitationConsultant = _claimsHelper.isConsultant();
    this._isSiteRegardingObject = new fieldDetails();
    this._isEmployeeRegardingObject = new fieldDetails();
    this._isSensitivityObject = new fieldDetails();
    this._canSeeSensitive = this._claimsHelper.canManageEmployeeSensitiveDetails();
    this._canSeeAdvance = this._claimsHelper.CanManageEmployeeAdvanceeDetails();
  }
  private _setControlValidationsAndVisibility() {
    if (this._isSiteRegardingObject.mandatory) {
      this._documentForm.get('DocumentSite').setValidators([Validators.required]);
    }
    else {
      this._documentForm.get('DocumentSite').clearValidators();
    }
    this._documentForm.get('DocumentSite').updateValueAndValidity();
    if (this._isEmployeeRegardingObject.mandatory) {
      this._documentForm.get('Employee').setValidators([Validators.required]);
    } else {
      this._documentForm.get('Employee').clearValidators();
    }
    this._documentForm.get('Employee').updateValueAndValidity();
    if (this._isSensitivityObject.mandatory) {
      this._documentForm.get('Sensitivity').setValidators([Validators.required]);
    } else {
      this._documentForm.get('Sensitivity').clearValidators();
    }
    this._documentForm.get('Sensitivity').updateValueAndValidity();
    if (this._isEmployeeRegardingObject.visible && this._category == DocumentCategoryEnum.PersonalDocuments) {
      this._documentForm.get('Employee').setValue([{ Text: this._claimsHelper.getUserFullName(), Value: this._claimsHelper.getEmpId() }]);
    }
    if (this._isSensitivityObject.visible) {
      this._setSensitivityDefault(this._isSensitivityObject.defaultValue)
    }
  }

  ngOnInit() {
    this._documentForm = this._fb.build(new DocumentAddForm(this._formName));

    if (this._action === 'Add') {
      this._documentCategoriesSubscription = this._store.let(fromRoot.getDocumentCategoriesData).subscribe(res => {
        if (isNullOrUndefined(res)) {
          this._documentCategoryService.loadDocumentCategories();
        }
        else {
          this._categoryList = this._documentCategoryService.getDocumentCategoriesByArea(res, DocumentArea.DocumentLibrary);
          if (!this._isCitationConsultant) {
            this._categoryList = this._categoryList.filter((category) => {
              return !(
                category.Code === DocumentCategoryEnum.ELHandbook
                || category.Code === DocumentCategoryEnum.Handbook
                || category.Code === DocumentCategoryEnum.Policy
                || category.Code === DocumentCategoryEnum.HSCitation
                || category.Code === DocumentCategoryEnum.PELCitation
                || category.Code === DocumentCategoryEnum.HSQualityMarkCitation
                || category.Code === DocumentCategoryEnum.PELQualityMarkCitation
                || category.Code === DocumentCategoryEnum.ContractTemplate
                || category.Code === DocumentCategoryEnum.HS
                || category.Code === DocumentCategoryEnum.PEL
                || category.Code === DocumentCategoryEnum.Icons
                || category.Code === DocumentCategoryEnum.StandardHazardIcons
                || category.Code === DocumentCategoryEnum.StandardControlIcons)
            });

          }

          this._categoryList = this._categoryList.filter(function (category) {
            return !(
              category.Code === DocumentCategoryEnum.EmployeeContract
              || category.Code === DocumentCategoryEnum.SiteVisit
            );
          });
          this._docCategoryList = Immutable.List(extractDocumentCategorySelectItems(this._categoryList));
        }
      });

      this._documentSiteDataSubscription = this._store.let(fromRoot.getApplicableSitesData).subscribe(res => {
        if (isNullOrUndefined(res)) {
          this._store.dispatch(new LoadApplicableSitesAction(true));
        }
        else {
          this._docSiteList = Immutable.List(extractSiteSelectItems(res));
          this._cdRef.markForCheck();
        }
      });

      this._documentForm.get('Category').valueChanges.subscribe((value: string) => {
        this._documentForm.get('DocumentSite').clearValidators();
        this._documentForm.get('Employee').clearValidators();
        this._documentForm.get('Sensitivity').clearValidators();

        if (!isNullOrUndefined(value)) {
          this._categoryId = value;
          let selectedCat = this._categoryList.find(c => c.Id === this._categoryId);
          this._setUploadDocFolder();
          if (!isNullOrUndefined(selectedCat)) {
            this._category = selectedCat.Code;

            this._isSiteRegardingObject = this._documentCategoryService.getSiteSelectionRequiredWhileAddUpdate(<DocumentCategoryEnum>this._category);
            this._isEmployeeRegardingObject = this._documentCategoryService.getEmployeeSelectionRequiredWhileAddUpdate(<DocumentCategoryEnum>this._category);
            this._isSensitivityObject = this._documentCategoryService.getSensitivitySelectionRequiredWhileAddUpdate(<DocumentCategoryEnum>this._category);
            this._setControlValidationsAndVisibility();

          } else {
            let siteReg = new fieldDetails();
            siteReg.visible = false;
            siteReg.mandatory = false;
            siteReg.defaultValue = null;
            let empReg = new fieldDetails();
            empReg.visible = false;
            empReg.mandatory = false;
            empReg.defaultValue = null;
            let sensitiveReg = new fieldDetails();
            sensitiveReg.visible = false;
            sensitiveReg.mandatory = false;
            sensitiveReg.defaultValue = null;

            this._isSiteRegardingObject = siteReg;
            this._isEmployeeRegardingObject = empReg;
            this._isSensitivityObject = sensitiveReg;
            this._setControlValidationsAndVisibility();
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
      if (!isNullOrUndefined(value) && value != "") {
        if (Number(value) as Number || Number(value) === 0) {
          this._checkNoOfDays();
        }
      }
      else {
        this._errorMessage = "";
        this._showerrorMessage = false;
      }

    });
    //Added for Employee Autocomplete
    this._employees$ = this._store.let(fromRoot.getDocumentReviewRequestsEmployees);

  }

  ngOnDestroy(): void {
    if (!isNullOrUndefined(this._documentCategoriesSubscription))
      this._documentCategoriesSubscription.unsubscribe();
    if (!isNullOrUndefined(this._selectDocumentSubscription))
      this._selectDocumentSubscription.unsubscribe();
    if (!isNullOrUndefined(this._documentSiteDataSubscription))
      this._documentSiteDataSubscription.unsubscribe();
  }

  private _setSensitivityDefault(defaultValue) {
    if (this._canSeeSensitive) {
      this._sensitivityOptions = getTimelineViewTypeOptionsForSensitive(Sensitivity);
    }
    else if (this._canSeeAdvance || this._claimsHelper.canManageDeptEmps()) {
      this._sensitivityOptions = getTimelineViewTypeOptionsForAdvance(Sensitivity);
    }
    else {
      this._sensitivityOptions = getTimelineViewTypeOptionsForBasic(Sensitivity);
    }
    this._documentForm.get('Sensitivity').setValue(defaultValue);
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

  private _setUploadDocFolder() {
    let selectedCat = this._categoryList.find(c => c.Id === this._categoryId);
    let docCategory = !isNullOrUndefined(selectedCat) ? selectedCat.Code : null;
    switch (docCategory) {
      case DocumentCategoryEnum.ELHandbook:
      case DocumentCategoryEnum.HS:
      case DocumentCategoryEnum.Policy:
        this._uploadDocFolder = 'Handbooks & Policies';
        break;
      case DocumentCategoryEnum.AccidentLogs:
      case DocumentCategoryEnum.CheckList:
      case DocumentCategoryEnum.ConstructionPhasePlans:
      case DocumentCategoryEnum.Icons:
      case DocumentCategoryEnum.MethodStatements:
      case DocumentCategoryEnum.RiskAssessment:
      case DocumentCategoryEnum.CarePolicies:
      case DocumentCategoryEnum.FireRiskAssessment:
      case DocumentCategoryEnum.COSHH:
        this._uploadDocFolder = 'H&S document suite';
        break;
      case DocumentCategoryEnum.Contract:
      case DocumentCategoryEnum.Leaver:
      case DocumentCategoryEnum.NewStarter:
        this._uploadDocFolder = 'Starters & leavers';
        break;
      case DocumentCategoryEnum.Certificates:
        this._uploadDocFolder = 'Training';
        break;
      case DocumentCategoryEnum.ComplianceCertificates:
      case DocumentCategoryEnum.Emails:
      case DocumentCategoryEnum.Uploads:
      case DocumentCategoryEnum.Other:
      case DocumentCategoryEnum.DBS:
      case DocumentCategoryEnum.ScannedDocument:
      case DocumentCategoryEnum.ComplianceCertificates:
        this._uploadDocFolder = 'Other';
        break;
      case DocumentCategoryEnum.PersonalDocuments:
      case DocumentCategoryEnum.General:
        this._uploadDocFolder = 'General';
        break;
      case DocumentCategoryEnum.CompanyPolicies:
        this._uploadDocFolder = 'Company policies';
        break;
      case DocumentCategoryEnum.Disciplinary:
      case DocumentCategoryEnum.Grievance:
        this._uploadDocFolder = 'Disciplinaries & grievances';
        break;
      case DocumentCategoryEnum.Appraisal:
      case DocumentCategoryEnum.Performance:
        this._uploadDocFolder = 'Appraisal & reviews';
        break;
      default:
        this._uploadDocFolder = '';
    }

    this._isDocDistributable = (docCategory == DocumentCategoryEnum.PersonalDocuments) ? false : true;
  }

  //public methods

  public onAddCancel() {
    this._onDocumentAddCancel.emit('cancel');
  }


  public onAddFormSubmit() {
    this._submitted = true;
    let _documentsToSubmit: any = {
      _documentToSave: Document,
      file: File
    };
    if (this._documentForm.valid && (this._action === 'Add' && !isNullOrUndefined(this._selectedFile))) {
      if (this._action === 'Add') {
        let _documentToSave: Document = Object.assign({}, this._document, <Document>this._documentForm.value);
        _documentToSave.CompanyId = this._routeParamsService.Cid ? this._routeParamsService.Cid : this._claimsHelper.getCompanyId();
        _documentToSave.Usage = 2;
        _documentToSave.LastModifiedDateTime = this._datePipe.transform(this._selectedFile.file.lastModifiedDate, 'medium');
        _documentToSave.FileName = this._selectedFile.file.name;
        _documentToSave.Category = this._category;
        _documentToSave.Title = this._documentForm.get('Title').value;
        if (this._isSiteRegardingObject.visible) {
          _documentToSave.RegardingObjectId = this._documentForm.get('DocumentSite').value;
          _documentToSave.RegardingObjectTypeCode = 3;
        }
        if (this._isEmployeeRegardingObject.visible) {
          if (!isNullOrUndefined(this._documentForm.get('Employee').value[0]) && !isNullOrUndefined(this._documentForm.get('Employee').value[0].Value)) {
            _documentToSave.RegardingObjectId = this._documentForm.get('Employee').value[0].Value
          } else {
            _documentToSave.RegardingObjectId = this._documentForm.get('Employee').value;
          }
          _documentToSave.RegardingObjectTypeCode = 17;
        }
        if (!isNullOrUndefined(_documentToSave.ExpiryDate))
          _documentToSave.ExpiryDate = this._datePipe.transform(_documentToSave.ExpiryDate, 'medium');

        _documentsToSubmit._documentToSave = _documentToSave;
        _documentsToSubmit.file = this._selectedFile.file;
        this._onDocumentFormSubmit.emit({ _documentsToSubmit });
      }
    }
  }


  public isValidDate = function (val: boolean) {
    this._isDateValid = val;
  }

  public isFileSelected(): boolean {
    return (this._submitted === true && isNullOrUndefined(this._selectedFile));
  }

  public onFilesSelected($event: FileResult[]) {
    this._selectedFile = $event[0];
    if (!isNullOrUndefined(this._selectedFile) && this._selectedFile.isValid) {
      this._showDesciptionAndNotes = true;
    }
  }

  public aeOnUnselectEmployee($event) {
    this._selectedEmployee = null;

  }

  public aeOnClearEmployee($event) {
    this._selectedEmployee = null;

  }

  public onEmployeeSearchChange(text: string) {
    if (StringHelper.isNullOrUndefinedOrEmpty(text)) {
      this._selectedEmployee = null;

    }
  }

  public isAdd(): boolean {
    return this._action === 'Add';
  }

  public fieldHasRequiredError(fieldName: string): boolean {
    if (this._documentForm.get(fieldName).hasError('required') && (!this._documentForm.get(fieldName).pristine || this._submitted)) {
      return true;
    }
    return false;
  }

  public searchEmployees(e) {
    this._selectedEmployee = null;
    let apiRequestWithParams: AtlasApiRequestWithParams;
    let apiParams: AtlasParams[] = [];
    apiParams.push(new AtlasParams("SearchedQuery", e.query));
    apiRequestWithParams = new AtlasApiRequestWithParams(0, 0, 'FirstName', SortDirection.Ascending, apiParams);
    this._store.dispatch(new SearchEmployees(apiRequestWithParams));
  }

  public onSelectEmployee($event) {
    this._selectedEmployee = $event;

    let apiRequestWithParams: AtlasApiRequestWithParams;
    let apiParams: AtlasParams[] = [];
  }
  //end of public methods
}