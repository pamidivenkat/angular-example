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
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { LocaleService, TranslationService } from 'angular-l10n';
import * as Immutable from 'immutable';
import { Subscription } from 'rxjs/Rx';
import { BehaviorSubject } from 'rxjs/Rx';
import { isNullOrUndefined } from 'util';

import { BaseComponent } from '../../../../shared/base-component';
import { IFormBuilderVM, IFormFieldWrapper } from '../../../../shared/models/iform-builder-vm';
import { Sensitivity } from '../../../../shared/models/sensitivity';
import { getDocumentSensitivityList } from '../../../common/document-extract-helper';
import { DocumentCategoryEnum } from '../../../models/document-category-enum';
import { AeSelectItem } from './../../../../atlas-elements/common/models/ae-select-item';
import { mapEmployeKeyValuesToAeSelectItems } from './../../../../employee/common/extract-helpers';
import { EmployeeSearchService } from './../../../../employee/services/employee-search.service';
import { LoadSitesAction } from './../../../../shared/actions/company.actions';
import { ClaimsHelperService } from './../../../../shared/helpers/claims-helper';
import * as fromRoot from './../../../../shared/reducers';
import { Document, EntityReference } from './../../../models/document';
import { DocumentCategoryService } from './../../../services/document-category-service';
import { DocumentUpdateForm } from './../../models/document-update-form';

@Component({
  selector: 'document-update',
  templateUrl: './document-update.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DocumentUpdateComponent extends BaseComponent implements OnInit, OnDestroy {
  // Private Fields
  private _documentUpdateForm: FormGroup;
  private _updateDocumentFormVM: IFormBuilderVM;
  private _fields: Array<IFormFieldWrapper<any>>;
  private _document: Document;
  private _categoryOptions$: BehaviorSubject<Immutable.List<AeSelectItem<string>>>;
  private _documentCategories: Immutable.List<AeSelectItem<string>>;
  private _allSub: Subscription[] = [];
  private _isRemainderReqFieldVisibility$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private _remainderFieldVisibility$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private _siteFieldVisibility$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private _employeeFieldVisibility$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private _employeeFieldRequired$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private _sensitivityFieldVisibility$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private _sensitivityFieldDataSource$: BehaviorSubject<Immutable.List<AeSelectItem<number>>> = new BehaviorSubject<Immutable.List<AeSelectItem<number>>>(Immutable.List([]));
  private _folderLocationText$: BehaviorSubject<string> = new BehaviorSubject<string>(null);
  private _folderLocationVisibility$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private _siteFieldDataSource$: BehaviorSubject<AeSelectItem<string>[]> = new BehaviorSubject<AeSelectItem<string>[]>([]);
  private _employeeFieldDataSource$: BehaviorSubject<AeSelectItem<string>[]> = new BehaviorSubject<AeSelectItem<string>[]>([]);
  private _siteFieldDataSource: AeSelectItem<string>[] = [];
  private _employeeFieldDataSource: AeSelectItem<string>[] = [];

  //End of private fields

  // Public properties
  @Input('document')
  set document(val: Document) {
    this._document = val;
    this._patchForm();
  }
  get document(): Document {
    return this._document;
  }

  @Input('documentCategories')
  set documentCategories(val: Immutable.List<AeSelectItem<string>>) {
    this._documentCategories = val;
    if (val) {
      this._setDocumentCategories();
    }
  }
  get documentCategories(): Immutable.List<AeSelectItem<string>> {
    return this._documentCategories;
  }

  get updateDocumentFormVM(): IFormBuilderVM {
    return this._updateDocumentFormVM;
  }
  get documentUpdateForm(): FormGroup {
    return this._documentUpdateForm;
  }
  get fields() {
    return this._fields;
  }
  get siteFieldVisibility$() {
    return this._siteFieldVisibility$;
  }
  get employeeFieldVisibility$() {
    return this._employeeFieldVisibility$;
  }
  //End of public properties

  // Public Output bindings
  @Output('onCancel') _onDocumentUpdateCancel: EventEmitter<string> = new EventEmitter<string>();
  @Output('onSubmit') _onDocumentUpdateSubmit: EventEmitter<Document> = new EventEmitter<Document>();
  // End of Public Output bindings

  // Public ViewChild bindings
  // End of Public ViewChild bindings

  // Public ContnetChild bindings
  // End of Public ContnetChild bindings

  // Constructor
  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _cdRef: ChangeDetectorRef
    , private _fb: FormBuilder
    , private _claimsHelper: ClaimsHelperService
    , private _documentCategoryService: DocumentCategoryService
    , protected _store: Store<fromRoot.State>
    , private _employeeSearchService: EmployeeSearchService
  ) {
    super(_localeService, _translationService, _cdRef);
  }
  // End of constructor

  // Private methods
  private _getSensitivityItems(): Immutable.List<AeSelectItem<number>> {
    if (this._claimsHelper.canManageEmployeeSensitiveDetails()) {
      return getDocumentSensitivityList(Sensitivity).toList();
    }
    else if (this._claimsHelper.CanManageEmployeeAdvanceeDetails()) {
      return getDocumentSensitivityList(Sensitivity).filter(Sensitivity => Sensitivity.Text !== "Sensitive").toList();
    }
    else {
      return getDocumentSensitivityList(Sensitivity).filter(Sensitivity => Sensitivity.Text === "Basic").toList();
    }


  }
  private _patchForm() {
    let documentSite: Array<AeSelectItem<string>> = [];
    let employee: Array<AeSelectItem<string>> = [];
    if (!isNullOrUndefined(this._documentUpdateForm) && !isNullOrUndefined(this._document)) {
      if (this._document.RegardingObjectTypeCode == 17) {
        documentSite.push(new AeSelectItem<string>('', this._document.RegardingObjectId));
      } else if (this._document.RegardingObjectTypeCode == 3) {
        employee.push(new AeSelectItem<string>('', this._document.RegardingObjectId));
      }
      this._documentUpdateForm.patchValue({
        Title: this._document.FileNameAndTitle ? this._document.FileNameAndTitle : this._document.FileName,
        Description: this._document.Description,
        ExpiryDate: this._document.ExpiryDate ? new Date(this._document.ExpiryDate) : null,
        Category: this._document.Category,
        Comment: this._document.Comment,
        IsReminderRequired: !isNullOrUndefined(this._document.ReminderInDays),
        ReminderInDays: this._document.ReminderInDays,
        Employee: employee,
        DocumentSite: documentSite
      });
      this._setDocumentCategories();
      this._setSensitivity();
    }
  }
  private _setDocumentCategories() {
    if (!isNullOrUndefined(this._fields)) {
      let categoryField = this._fields.find(f => f.field.name === 'Category');
      if (!isNullOrUndefined(categoryField)) {
        this._categoryOptions$ = categoryField.context.getContextData().get('options');
        this._categoryOptions$.next(this._documentCategories);
      }
    }
  }
  private _setSensitivity() {
    if (!isNullOrUndefined(this._fields)) {
      let sensitivityField = this._fields.find(f => f.field.name === 'Sensitivity');
      if (!isNullOrUndefined(sensitivityField)) {
        this._sensitivityFieldDataSource$ = sensitivityField.context.getContextData().get('options');
        this._sensitivityFieldDataSource$.next(this._getSensitivityItems());
      }
    }

  }
  private _toggleRequiredValidation(fieldName: string, required: boolean) {
    let field = this._documentUpdateForm.get(fieldName);
    if (!isNullOrUndefined(field)) {
      if (required) {
        field.setValidators(Validators.required);
      } else {
        field.clearValidators();
      }
      field.updateValueAndValidity();
    }
  }

  private _documentFolderLocation(documentCategory: DocumentCategoryEnum): string {
    let folderName = this._documentCategoryService.getDocumentFolderName(documentCategory);
    let folderText = this._translationService.translate('DOCUMENT_CATEGORY_INFO', { uploadDocFolder: folderName });
    return folderText;
  }

  private _onCategoryChange(category: any) {
    if (category.length < 1) {
      this._folderLocationVisibility$.next(false);
      this._siteFieldVisibility$.next(false);
      this._employeeFieldVisibility$.next(false);
      this._sensitivityFieldVisibility$.next(false);
    }
    else {
      let siteShown = this._documentCategoryService.getSiteFieldDetails(<DocumentCategoryEnum>category);
      let employeeShown = this._documentCategoryService.getEmploeeFieldDetails(<DocumentCategoryEnum>category);
      let sensitivityShown = this._documentCategoryService.getSensitivityFieldDetails(<DocumentCategoryEnum>category);
      let documentFolder = this._documentFolderLocation(<DocumentCategoryEnum>category);
      this._folderLocationVisibility$.next(true);
      this._folderLocationText$.next(documentFolder);
      this._siteFieldVisibility$.next(siteShown.visibility);
      this._employeeFieldVisibility$.next(employeeShown.visibility);
      this._employeeFieldRequired$.next(employeeShown.mandatory);
      this._sensitivityFieldVisibility$.next(sensitivityShown.visibility);
      this._toggleRequiredValidation('Employee', employeeShown.mandatory)
      this._documentUpdateForm.patchValue({
        Employee: [],
        DocumentSite: [],
        Sensitivity: sensitivityShown.defaultValue
      })
    }
  }
  private _setVisibilityAndSubscribeFunctions() {
    let expiryDateField = this._fields.filter(f => f.field.name === 'ExpiryDate')[0];
    let categoryField = this._fields.filter(obj => obj.field.name == 'Category')[0];
    let isReminderRequiredField = this._fields.filter(obj => obj.field.name == 'IsReminderRequired')[0];
    let reminderInDaysField = this._fields.filter(obj => obj.field.name == 'ReminderInDays')[0];
    let documentSiteField = this._fields.filter(obj => obj.field.name == 'DocumentSite')[0];
    let employeeField = this._fields.filter(obj => obj.field.name == 'Employee')[0];
    let sensitivityField = this._fields.filter(obj => obj.field.name == 'Sensitivity')[0];
    let folderLocationField = this._fields.filter(obj => obj.field.name == 'folderLocation')[0];


    if (!isNullOrUndefined(documentSiteField)) {
      this._siteFieldVisibility$ = <BehaviorSubject<boolean>>(documentSiteField.context.getContextData().get('propertyValue'));
      this._siteFieldDataSource$ = <BehaviorSubject<Array<any>>>(documentSiteField.context.getContextData().get('items'));
      this._siteFieldDataSource$.next(this._siteFieldDataSource);
    }

    if (!isNullOrUndefined(employeeField)) {
      this._employeeFieldVisibility$ = <BehaviorSubject<boolean>>(employeeField.context.getContextData().get('propertyValue'));
      this._employeeFieldRequired$ = <BehaviorSubject<boolean>>(employeeField.context.getContextData().get('requiredValue'));
      this._employeeFieldDataSource$ = <BehaviorSubject<AeSelectItem<string>[]>>(employeeField.context.getContextData().get('items'));
      (<EventEmitter<any>>(employeeField.context.getContextData().get('searchEvent'))).subscribe((val) => {
        this.searchEmployees(val);
      });
    }

    if (!isNullOrUndefined(sensitivityField)) {
      this._sensitivityFieldVisibility$ = <BehaviorSubject<boolean>>(sensitivityField.context.getContextData().get('propertyValue'));

    }

    if (!isNullOrUndefined(folderLocationField)) {
      this._folderLocationText$ = <BehaviorSubject<string>>(folderLocationField.context.getContextData().get('displayValue'));
      this._folderLocationVisibility$ = <BehaviorSubject<boolean>>(folderLocationField.context.getContextData().get('propertyValue'));
    }

    if (!isNullOrUndefined(isReminderRequiredField)) {
      this._isRemainderReqFieldVisibility$ = <BehaviorSubject<boolean>>(isReminderRequiredField.context.getContextData().get('propertyValue'));
      //this._isRemainderReqFieldVisibility$.next(false);
    }

    if (!isNullOrUndefined(reminderInDaysField)) {
      this._remainderFieldVisibility$ = <BehaviorSubject<boolean>>(reminderInDaysField.context.getContextData().get('propertyValue'));
      //this._remainderFieldVisibility$.next(false);
    }


    if (!isNullOrUndefined(categoryField)) {
      let selectChangeSub = (<EventEmitter<any>>(categoryField.context.getContextData().get('onSelectChange'))).subscribe((val) => {
        this._onCategoryChange(val.SelectedValue);
      });
      this._allSub.push(selectChangeSub);
    }



    if (!isNullOrUndefined(expiryDateField)) {
      let subexpChange = (<EventEmitter<any>>(expiryDateField.context.getContextData().get('onDateChange'))).subscribe((val) => {
        if (!isNullOrUndefined(val)) {
          this._isRemainderReqFieldVisibility$.next(true);
        } else {
          this._isRemainderReqFieldVisibility$.next(false);
        }
      });
      this._allSub.push(subexpChange);

      let onBlur = (<EventEmitter<any>>(expiryDateField.context.getContextData().get('onBlur'))).subscribe((val) => {
        if (!isNullOrUndefined(val)) {
          this._isRemainderReqFieldVisibility$.next(true);
        } else {
          this._isRemainderReqFieldVisibility$.next(false);
        }
      });
      this._allSub.push(onBlur);

    }

    //this._incidentAboutInjuryForm.get('IncidentTypeId').valueChanges.subscribe
    if (!isNullOrUndefined(isReminderRequiredField)) {
      let sub = (<EventEmitter<any>>isReminderRequiredField.context.getContextData().get('onSwitchChange')).subscribe((value) => {
        if (value) {
          this._remainderFieldVisibility$.next(true);
        } else {
          this._documentUpdateForm.patchValue({
            ReminderInDays: null
          });
          this._remainderFieldVisibility$.next(false);
        }
      });
      this._allSub.push(sub);
    }
  }
  // End of private methods

  // Public methods
  public searchEmployees($event) {
    let searchSub = this._employeeSearchService.getEmployeesKeyValuePair($event.query, null).first().subscribe((empData) => {
      this._employeeFieldDataSource$.next(mapEmployeKeyValuesToAeSelectItems(empData));
    });
    this._allSub.push(searchSub);
  }

  ngOnInit() {
    this._updateDocumentFormVM = new DocumentUpdateForm('Document Update');
    this._fields = this._updateDocumentFormVM.init();
    this._store.let(fromRoot.getsitesClientsForMultiSelectData).subscribe((sites) => {
      this._siteFieldDataSource = sites;
      this._siteFieldDataSource$.next(this._siteFieldDataSource);
    });
    let loadedSites = this._store.let(fromRoot.getSiteData).subscribe(sites => {
      if (!sites)
        this._store.dispatch(new LoadSitesAction(false));
    });
    this._allSub.push(loadedSites);
  }

  ngOnDestroy() {
    if (isNullOrUndefined(this._allSub) && this._allSub.length > 0) {
      this._allSub.forEach(sub => {
        if (isNullOrUndefined(sub)) {
          sub.unsubscribe();
        }
      });
    }
  }

  public onSubmit($event) {
    if (this._documentUpdateForm.valid) {
      let documentToUpdate: Document = Object.assign({}, this._document, <Document>this._documentUpdateForm.value);
      if (this._siteFieldVisibility$.value && !this._employeeFieldVisibility$.value && !isNullOrUndefined(this._documentUpdateForm.value['DocumentSite']) && this._documentUpdateForm.value['DocumentSite'].length > 0) {
        documentToUpdate.RegardingObjectTypeCode = 3;
        documentToUpdate.RegardingObjectId = this._documentUpdateForm.value['DocumentSite'][0];
        documentToUpdate.RegardingObject = new EntityReference();
        documentToUpdate.RegardingObject.Id = documentToUpdate.RegardingObjectId;
        documentToUpdate.RegardingObject.Otc = 3;
        documentToUpdate.RegardingObject.Name = 'site'
      }
      else if (!this._siteFieldVisibility$.value && this._employeeFieldVisibility$.value && !isNullOrUndefined(this._documentUpdateForm.value['Employee']) && this._documentUpdateForm.value['Employee'].length > 0) {
        documentToUpdate.RegardingObjectTypeCode = 17;
        documentToUpdate.RegardingObjectId = this._documentUpdateForm.value['Employee'][0];
        documentToUpdate.RegardingObject = new EntityReference();
        documentToUpdate.RegardingObject.Id = documentToUpdate.RegardingObjectId;
        documentToUpdate.RegardingObject.Otc = 17;
        documentToUpdate.RegardingObject.Name = 'employee'
      }
      (<any>documentToUpdate).DocumentSite = null;
      (<any>documentToUpdate).Employee = null;
      this._onDocumentUpdateSubmit.emit(documentToUpdate);
    }
  }
  public onCancel($event) {
    this._onDocumentUpdateCancel.emit('Cancel');
    this._documentUpdateForm.reset(); //clear form.
  }
  public onFormInit(fg: FormGroup) {
    this._documentUpdateForm = fg;
    if (!isNullOrUndefined(this._documentUpdateForm)) {
      this._setVisibilityAndSubscribeFunctions();
      this._patchForm();
    }
  }
  public formButtonNames() {
    return { Submit: 'Update' };
  }
  // End of public methods
}
