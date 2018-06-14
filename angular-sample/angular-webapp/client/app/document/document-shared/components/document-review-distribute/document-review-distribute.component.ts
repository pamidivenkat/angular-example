import { LoadApplicableDepartmentsAction } from './../../../../shared/actions/user.actions';
import { AeClassStyle } from '../../../../atlas-elements/common/ae-class-style.enum';
import { Title } from '@angular/platform-browser';
import { EmployeeSearchService } from './../../../../employee/services/employee-search.service';
import { mapEmployeKeyValuesToAeSelectItems } from '../../../../employee/common/extract-helpers';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { LoadSitesAction, LoadAllDepartmentsAction, LoadEmployeeGroupAction } from './../../../../shared/actions/company.actions';
import { AeDatasourceType } from '../../../../atlas-elements/common/ae-datasource-type';
import { Observable, Subscription } from 'rxjs/Rx';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DocumentActionType } from '../../../models/document';
import { EnumHelper } from './../../../../shared/helpers/enum-helper';
import { AeSelectItem } from './../../../../atlas-elements/common/models/ae-select-item';
import { Output, EventEmitter, OnDestroy } from '@angular/core';
import { DocumentDetails, DistributedDocument } from './../../../document-details/models/document-details-model';
import { Input } from '@angular/core';
import { DocumentDetailsType } from './../../../document-details/models/document-details-model';
import { ClaimsHelperService } from './../../../../shared/helpers/claims-helper';
import { Store } from '@ngrx/store';
import { LocaleService, TranslationService } from 'angular-l10n';
import { BaseComponent } from './../../../../shared/base-component';
import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy, ViewEncapsulation } from '@angular/core';
import * as fromRoot from './../../../../shared/reducers';
import * as Immutable from 'immutable';
import { getAllDistributedToOptions } from './../../../document-details/common/document-details-extract-helper';
import { selectedAnyDistributedTo } from './../../../document-details/common/document-distribution-validators';
import { DocumentCategoryEnum } from "../../../../document/models/document-category-enum";
import { isNullOrUndefined } from "util";

@Component({
  selector: 'document-review-distribute',
  templateUrl: './document-review-distribute.component.html',
  styleUrls: ['./document-review-distribute.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class DocumentReviewDistributeComponenet extends BaseComponent implements OnInit, OnDestroy {
  // Private Fields  
  private _documentType: DocumentDetailsType;
  private _documentDetails: DocumentDetails;
  private _distributedDocument: DistributedDocument;
  private _actionOptions: Immutable.List<AeSelectItem<number>>;
  private _documentDistributeForm: FormGroup;
  private _regardingObjectTypes: Immutable.List<AeSelectItem<string>>;
  private _regardingObjects$: Observable<AeSelectItem<string>[]>;
  private _sites$: Observable<AeSelectItem<string>[]>;
  private _departments$: Observable<AeSelectItem<string>[]>;
  private _employeeGroups$: Observable<AeSelectItem<string>[]>;
  private _searchEmployees$: BehaviorSubject<AeSelectItem<string>[]> = new BehaviorSubject<AeSelectItem<string>[]>(null);
  private _localDataSourceType: AeDatasourceType = AeDatasourceType.Local;
  private _remoteDataSourceType: AeDatasourceType = AeDatasourceType.Remote;
  private _sitesSubscription: Subscription;
  private _departmentsSubscription: Subscription;
  private _employeeGroupsSubscription: Subscription;
  private _submitted: boolean = false;
  private _lightClass: AeClassStyle = AeClassStyle.Light;
  private _selectedValues: AeSelectItem<string>[];
  private _category: string;

  // End of Private Fields

  // Public properties
  @Input('documentType')
  get DocumentType() {
    return this._documentType;
  }
  set DocumentType(val: DocumentDetailsType) {
    this._documentType = val;
  }

  @Input('documentDetails')
  get DocumentDetails() {
    return this._documentDetails;
  }
  set DocumentDetails(val: DocumentDetails) {
    if (!isNullOrUndefined(val)) {
      this._documentDetails = val;
      if (this._documentType == DocumentDetailsType.SharedDocument) {
        this._category = this._documentDetails && this._documentDetails.Category ? this._documentDetails.Category.Name : '';
      }
      else {
        this._category = this._documentDetails ? DocumentCategoryEnum[this._documentDetails.Category].toString() : '';
      }
    }
  }

  get documentDetails(): DocumentDetails {
    return this._documentDetails;
  }

  get documentDistributeForm(): FormGroup {
    return this._documentDistributeForm;
  }

  get actionOptions(): Immutable.List<AeSelectItem<number>> {
    return this._actionOptions;
  }

  get regardingObjectTypes(): Immutable.List<AeSelectItem<string>> {
    return this._regardingObjectTypes;
  }

  get regardingObjects$(): Observable<AeSelectItem<string>[]> {
    return this._regardingObjects$;
  }

  get localDataSourceType(): AeDatasourceType {
    return this._localDataSourceType;
  }

  get searchEmployees$(): BehaviorSubject<AeSelectItem<string>[]> {
    return this._searchEmployees$;
  }

  get remoteDataSourceType(): AeDatasourceType {
    return this._remoteDataSourceType;
  }

  get lightClass(): AeClassStyle {
    return this._lightClass;
  }

  get SelectedValues(): AeSelectItem<string>[] {
    return this._selectedValues;
  }

  get categoryName() {
    return this._category;
  }
  // End of Public properties

  // Public Output bindings
  @Output('aeCancel')
  _aeCancel: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output('aeDistribute')
  _aeDistribute: EventEmitter<DistributedDocument> = new EventEmitter<DistributedDocument>();
  // End of Public Output bindings

  // Public ViewChild bindings
  // End of Public ViewChild bindings

  // Public ContnetChild bindings
  // End of Public ContnetChild bindings

  // Constructor
  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _cdRef: ChangeDetectorRef
    , protected _store: Store<fromRoot.State>
    , private _claimsHelper: ClaimsHelperService
    , private _fb: FormBuilder
    , private _employeeSearchService: EmployeeSearchService
  ) {
    super(_localeService, _translationService, _cdRef);

  }

  // End of constructor

  // Private methods

  private _initForm() {
    this._documentDistributeForm = this._fb.group({
      Action: [{ value: null, disabled: false }, [Validators.required]],
      RegardingObjectTypeCode: [{ value: null, disabled: false }, [Validators.required]],
      RegardingObjects: [{ value: '', disabled: false }],
      Employee: [{ value: '', disabled: false }]
    }, { validator: selectedAnyDistributedTo });
  }
  // End of private methods

  // Public methods

  isSiteSelected(): boolean {
    return this._documentDistributeForm.controls['RegardingObjectTypeCode'].value == 3;
  }

  isEmployeeGroupSelected(): boolean {
    return this._documentDistributeForm.controls['RegardingObjectTypeCode'].value == 4018;
  }

  isDepartmentSelected(): boolean {
    return this._documentDistributeForm.controls['RegardingObjectTypeCode'].value == 4;
  }

  isEmployeeSelected(): boolean {
    return this._documentDistributeForm.controls['RegardingObjectTypeCode'].value == 17;
  }

  canRegardingObjectsBeShown(): boolean {
    return this._documentDistributeForm.controls['RegardingObjectTypeCode'].value != 17;
  }

  slideClose($event) {
    this._aeCancel.emit($event);
  }

  isSharedDoc(): boolean {
    return this._documentType == DocumentDetailsType.SharedDocument;
  }

  onAddOrUpdateFormSubmit($event) {
    this._submitted = true;
    if (this._documentDistributeForm.valid) {
      this._distributedDocument = new DistributedDocument();
      this._distributedDocument.DocumentType = this._documentType;
      this._distributedDocument.DocumentVersion = this._documentDetails.Version;
      this._distributedDocument.DocumentTitle = !this.isSharedDoc() ? this._documentDetails.FileName : this._documentDetails.Title;
      this._distributedDocument.SharedDocumentId = this._distributedDocument.DocumentId = this._documentDetails.Id;
      Object.assign(this._distributedDocument, this._documentDistributeForm.value);
      this._distributedDocument.IsActive = true;
      if (this._documentDistributeForm.controls['RegardingObjectTypeCode'].value == '17') {
        //in this case we have to assign regarding objects from employee property
        this._distributedDocument.RegardingObjects = this._documentDistributeForm.controls['Employee'].value;
      }
      this._aeDistribute.emit(this._distributedDocument);
    }
  }

  searchEmployees($event) {
    this._employeeSearchService.getEmployeesKeyValuePair($event.query).first().subscribe((empData) => {
      this._searchEmployees$.next(mapEmployeKeyValuesToAeSelectItems(empData));
    });
  }

  setRegardingObjects($event) {
    this._submitted = false;
    switch ($event.SelectedValue.toString()) {
      case '1':
        this._regardingObjects$ = Observable.of([]);
        break;
      case '3':
        this._regardingObjects$ = this._sites$;
        break;
      case '4018':
        this._regardingObjects$ = this._employeeGroups$;
        break;
      case '4':
        this._regardingObjects$ = this._departments$
        break;
      case '17':
        this._regardingObjects$ = Observable.of([]);
        break;
      default:
        this._regardingObjects$ = Observable.of([]);
        break;
    }
    this._selectedValues = [];
  }

  anyDistributedToError(): boolean {
    return (this._documentDistributeForm.hasError('selectedAnyDistributedTo') == true && this._submitted);
  }

  getDistributedToSelectErrorMsg(): string {
    let selectRegardingObjectsMsg: string;
    switch (this._documentDistributeForm.controls['RegardingObjectTypeCode'].value) {
      case '3':
        selectRegardingObjectsMsg = this._translationService.translate('DOC_DISTRIBUTION.DISTRIBUTE_TO_SITE_REQUIRED');
        break;
      case '4018':
        selectRegardingObjectsMsg = this._translationService.translate('DOC_DISTRIBUTION.DISTRIBUTE_TO_EMPLOYEE_GROUP_REQUIRED');
        break;
      case '4':
        selectRegardingObjectsMsg = this._translationService.translate('DOC_DISTRIBUTION.DISTRIBUTE_TO_DEPARTMENT_REQUIRED');
        break;
      case '17':
        selectRegardingObjectsMsg = this._translationService.translate('DOC_DISTRIBUTION.DISTRIBUTE_TO_EMPLOYEE_REQUIRED');
        break;
      default:
        selectRegardingObjectsMsg = '';
        break;
    }
    return selectRegardingObjectsMsg
  }

  fieldHasRequiredError(fieldName: string): boolean {
    return (this._documentDistributeForm.get(fieldName).hasError('required') && (!this._documentDistributeForm.get(fieldName).pristine || this._submitted));
  }

  ngOnInit(): void {
    let documentActionTypes: Array<AeSelectItem<number>> = EnumHelper.getAeSelectItems(DocumentActionType);
    documentActionTypes.forEach(actionType => {
      actionType.Text = this._translationService.translate(actionType.Text);
    });

    this._actionOptions = Immutable.List(documentActionTypes);
    let distributedToOptions: AeSelectItem<string>[];
    this._regardingObjectTypes = getAllDistributedToOptions();
    //if logged
    if (!this._claimsHelper.canFullAssignedToShown()) {
      this._regardingObjectTypes = Immutable.List<AeSelectItem<string>>(this._regardingObjectTypes.toArray().filter(obj => obj.Value == '4' || obj.Value == '17'));
    }
    this._sites$ = this._store.let(fromRoot.getsitesClientsForMultiSelectData);
    this._departments$ = this._store.let(fromRoot.getApplicableDepartmentsDataForMultiSelect);
    this._employeeGroups$ = this._store.let(fromRoot.getEmployeeGroupsForMultiSelectData);

    this._sitesSubscription = this._store.let(fromRoot.getSiteData).subscribe(sites => {
      if (!sites)
        this._store.dispatch(new LoadSitesAction(false));
    });

    this._departmentsSubscription =  this._store.let(fromRoot.getApplicableDepartmentsDataForMultiSelect).subscribe(departments => {
      if (isNullOrUndefined(departments)) {
        this._store.dispatch(new LoadApplicableDepartmentsAction());
      }
    });

    this._employeeGroupsSubscription = this._store.let(fromRoot.getEmployeeGroupsData).subscribe(empgroups => {
      if (!empgroups)
        this._store.dispatch(new LoadEmployeeGroupAction());
    });

    this._initForm();
  }
  ngOnDestroy() {
    if (this._sitesSubscription) {
      this._sitesSubscription.unsubscribe();
    }
    if (this._departmentsSubscription) {
      this._departmentsSubscription.unsubscribe();
    }
    if (this._employeeGroupsSubscription) {
      this._employeeGroupsSubscription.unsubscribe();
    }
  }
  // End of public methods
}