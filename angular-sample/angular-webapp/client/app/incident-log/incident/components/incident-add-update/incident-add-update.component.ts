import { BaseComponent } from '../../../../shared/base-component';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, OnDestroy, ViewEncapsulation, Input, Output, EventEmitter } from '@angular/core';
import { LocaleService, TranslationService } from 'angular-l10n';
import { Store } from '@ngrx/store';
import * as fromRoot from './../../../../shared/reducers';
import * as Immutable from 'immutable';
import { AeSelectItem } from './../../../../atlas-elements/common/models/ae-select-item';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Incident } from './../../models/incident.model';
import { AeClassStyle } from './../../../../atlas-elements/common/ae-class-style.enum';
import { Site } from './../../../../company/sites/models/site.model';
import { EmployeeFullEntity } from './../../../../employee/models/employee-full.model';
import { ClaimsHelperService } from './../../../../shared/helpers/claims-helper';
import { Subscription, BehaviorSubject } from 'rxjs/Rx';
import { IncidentReportedBy } from './../../models/incident-reported-by.model';
import { Address } from './../../../../employee/models/employee.model';
import { isNullOrUndefined } from 'util';
import { IFormBuilderVM, IFormFieldWrapper } from './../../../../shared/models/iform-builder-vm';
import { IncidentAboutYouForm } from './../../models/incident-about-you.form';
import { Observable } from 'rxjs/Observable';
import { IncidentReportedBySearchService } from './../../services/incident-reported-by-search.service';
import {
  IncidentEmployeeDetailsByUserIdGetAction
  , IncidentAboutYouDetailsAddAction
  , IncidentAboutYouDetailsGetAction
  , IncidentAboutYouDetailsUpdateAction
} from './../../actions/incident.actions';
import { StringHelper } from './../../../../shared/helpers/string-helper';
import { RouteParams } from './../../../../shared/services/route-params';
import { mergeWithSelectedIncidentReportedByData } from './../../common/extract-helpers';
import { ActivatedRoute } from '@angular/router';
import { IBreadcrumb } from './../../../../atlas-elements/common/models/ae-ibreadcrumb.model';
import { BreadcrumbService } from './../../../../atlas-elements/common/services/breadcrumb-service';
import { BreadcrumbGroup } from './../../../../atlas-elements/common/models/ae-breadcrumb-group';
import { AeLoaderType } from "./../../../../atlas-elements/common/ae-loader-type.enum";

@Component({
  selector: 'incident-add-update',
  templateUrl: './incident-add-update.component.html',
  styleUrls: ['./incident-add-update.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class IncidentAddUpdateComponent extends BaseComponent implements OnInit, OnDestroy {
  // Private variables - start
  private _counties$: Observable<Immutable.List<AeSelectItem<string>>>;
  private _incidentAddUpdateForm: FormGroup;
  private _incidentDetails: Incident;
  private _submitted: boolean = false;
  private _headOfficeSite: Site;
  private _selectedUserEmployeeDetails: EmployeeFullEntity;
  private _selectedUserEmployeeDetailsSubscription: Subscription;
  private _isNew: boolean = true;
  private _currentReportedBy: AeSelectItem<string>[];
  private _reportedBySubscription: Subscription;
  private _incidentAddUpdateFormVM: IFormBuilderVM;
  private _formName: string;
  private _formFields: Array<IFormFieldWrapper<any>>;
  private _context: any;
  private _filteredUsers: AeSelectItem<string>[] = [];
  private _isUserChanged: boolean = false;
  private _incidentDetailsToSave: IncidentReportedBy;
  private _incidentReportedById: string;
  private _incidentDetailsToUpdateSubscription: Subscription;
  private _newIncidentReportedByAddress: Address;
  private _routeParamsSubscription: Subscription;
  private _submitEventSubscription: Subscription;
  private _reportedBySearchEventSubscription: Subscription;
  private _reportedBySearchServiceSubscription: Subscription;
  private _countySubscription: Subscription;
  private _incidentIdSubscription: Subscription;
  private _selectedUserAddress: Address;
  private _formKeyFields: Array<string> = [];
  private _showNotification: boolean = false;;
  private _lightClass: AeClassStyle = AeClassStyle.Light;
  private _incidentReportedByUpdateStatusSubscription: Subscription;
  private _saveReportedByDetails: any;
  private _reportedByInputEventSubscription: Subscription;
  private _isDataLoading: boolean = false;
  private _loaderType: AeLoaderType = AeLoaderType.Bars;
  // Private variables - end

  // Input properties - start
  @Input('context')
  get context() {
    return this._context;
  }
  set context(val: any) {
    this._context = val;
  }

  @Input('counties')
  set counties(val: Observable<Immutable.List<AeSelectItem<string>>>) {
    this._counties$ = val;
    if (!isNullOrUndefined(this._incidentAddUpdateForm)) {
      this._incidentAddUpdateForm.patchValue({
        CountyId: this._incidentDetails.IncidentReportedBy.Address.CountyId,
      });
    }
  }
  get counties() {
    return this._counties$;
  }
  

  @Input('headOfficeSite')
  set headOfficeSite(val: Site) {
    this._headOfficeSite = val;
  }
  get headOfficeSite() {
    return this._headOfficeSite;
  }
  

  get showPopUp() {
    return this._showNotification;
  }

  get lightClass() {
    return this._lightClass;
  }

  get isDataLoading() {
    return this._isDataLoading;
  }
  get loaderType() {
    return this._loaderType;
  }
  // Input properties - end

  public get incidentAddUpdateFormVM() {
    return this._incidentAddUpdateFormVM;
  }

  modalClosed() {
    this._context.clearEvent.next(true);
    return this._showNotification = false;
  }
  onConfirmation() {
    this._showNotification = false;
    this._savePersonReportingData();
  }

  // constructor - start
  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _cdRef: ChangeDetectorRef
    , private _fb: FormBuilder
    , private _claimsHelper: ClaimsHelperService
    , private _incidentReportedBySearchService: IncidentReportedBySearchService
    , private _router: ActivatedRoute
    , private _store: Store<fromRoot.State>
    , private _breadcrumbService: BreadcrumbService) {
    super(_localeService, _translationService, _cdRef);
  }
  // constructor - end

  // Public methods - start
  ngOnInit() {
    this._formName = 'IncidentAboutYouForm';
    this._incidentAddUpdateFormVM = new IncidentAboutYouForm(this._formName);
    this._formFields = this._incidentAddUpdateFormVM.init();
    this._formFields.filter(f => f.context.getContextData().get('required')).forEach(
      x => {
        this._formKeyFields.push(x.field.name);
      }
    );
    this._routeParamsSubscription = this._router.params.subscribe(params => {
      if (isNullOrUndefined(params['id'])) {
        this._incidentReportedById = '';
        let bcItem = new IBreadcrumb('Add', '/incident/add', BreadcrumbGroup.IncidentLog);
        this._breadcrumbService.add(bcItem);
      }
      else {
        this._incidentReportedById = params['id'];
      }
    });

    this._incidentIdSubscription = this._store.let(fromRoot.getIncidentId).subscribe(incidentId => {
        if (!isNullOrUndefined(incidentId)) {          
          this._incidentReportedById = incidentId;
        }
        else {
          this._isDataLoading = true;
          this._store.dispatch(new IncidentEmployeeDetailsByUserIdGetAction(this._claimsHelper.getUserId()));
        }
      });

    // if (this._incidentReportedById === '') {
    //   this._incidentIdSubscription = this._store.let(fromRoot.getIncidentId).subscribe(incidentId => {
    //     if (!isNullOrUndefined(incidentId)) {    
    //       this._incidentReportedById = incidentId;
    //     }
    //   });
    // }

    this._isNew = StringHelper.isNullOrUndefinedOrEmpty(this._incidentReportedById);
    this._incidentDetails = new Incident();
    if (!this._isNew) {
      this._incidentDetailsToUpdateSubscription = this._store.let(fromRoot.getIncidentReportedByDetails).subscribe(aboutYouDetails => {
        if (!aboutYouDetails) {
          this._isDataLoading = true;
          this._store.dispatch(new IncidentAboutYouDetailsGetAction(this._incidentReportedById));
        }
        else {
          let bcItem = new IBreadcrumb('', '/incident/edit/' + this._incidentDetails.Id, BreadcrumbGroup.IncidentLog);
          this._breadcrumbService.add(bcItem);
          this._incidentDetails.IncidentReportedBy = aboutYouDetails;
          if (aboutYouDetails.User != null) {
            this._incidentDetails.IncidentReportedBy.UserId = aboutYouDetails.User.Id;
            this._incidentDetails.IncidentReportedBy.Name = aboutYouDetails.User.Name;
            this._selectedUserAddress = aboutYouDetails.Address;
          }
         this._isDataLoading = false;
          this._bindIncidentAboutYouForm(true);
        }
      });
    }
    let countyIdField = this._formFields.filter(f => f.field.name === 'CountyId')[0];
    this._countySubscription = this._counties$.subscribe(<BehaviorSubject<Immutable.List<AeSelectItem<string>>>>countyIdField.context.getContextData().get('options'));
    let incidentReportedByField = this._formFields.filter(f => f.field.name === 'ReportedBy')[0];
    this._reportedBySearchEventSubscription = (<EventEmitter<any>>incidentReportedByField.context.getContextData().get('searchEvent')).subscribe((event) => {
      this._reportedBySearchServiceSubscription = this._incidentReportedBySearchService.getFilteredUserData(event.query).first().subscribe((data) => {
        (<BehaviorSubject<AeSelectItem<string>[]>>incidentReportedByField.context.getContextData().get('items')).next(data);
        this._filteredUsers = data;
        this._isUserChanged = true;
      });
    });
    this._reportedByInputEventSubscription = (<EventEmitter<any>>incidentReportedByField.context.getContextData().get('onInputEvent')).subscribe((input) => {
      this._incidentAddUpdateForm.get('ReportedBy').setValue('');
    });
    this._selectedUserEmployeeDetailsSubscription = this._store.let(fromRoot.getIncidentSelectedUserEmployeeDetails).subscribe(empDetails => {
      if (this._incidentReportedById === '') {
        this._selectedUserAddress = empDetails;
       this._isDataLoading = false;
        this._bindIncidentAboutYouForm(false);
      }
      if (this._isUserChanged) {
        if (!isNullOrUndefined(this._incidentDetails)) {
          if (!isNullOrUndefined(this._incidentDetails.IncidentReportedBy.UserId)) {
            this._selectedUserAddress = empDetails;
            this._bindIncidentAboutYouForm(false);
          }
        }
      }

    });

    this._submitEventSubscription = this._context.submitEvent.subscribe((value) => {
      if (value) {
        this._onAboutYouFormSubmit(null);
      }
    });

    this._incidentReportedByUpdateStatusSubscription = this._store.let(fromRoot.getIncidentAboutYouDetailsProgressStatus).subscribe(status => {
      if (status && this._saveReportedByDetails) {
        this._context.waitEvent.next(true);
      }
    });
  }

  ngOnDestroy() {
    if (this._routeParamsSubscription)
      this._routeParamsSubscription.unsubscribe();
    if (this._incidentDetailsToUpdateSubscription)
      this._incidentDetailsToUpdateSubscription.unsubscribe();
    if (this._selectedUserEmployeeDetailsSubscription)
      this._selectedUserEmployeeDetailsSubscription.unsubscribe();
    if (this._submitEventSubscription)
      this._submitEventSubscription.unsubscribe();
    if (this._reportedBySearchEventSubscription)
      this._reportedBySearchEventSubscription.unsubscribe();
    if (this._reportedBySearchServiceSubscription)
      this._reportedBySearchServiceSubscription.unsubscribe();
    if (this._countySubscription)
      this._countySubscription.unsubscribe();
    if (this._reportedBySubscription)
      this._reportedBySubscription.unsubscribe();
    if (this._incidentIdSubscription) {
      this._incidentIdSubscription.unsubscribe();
      if (this._incidentReportedByUpdateStatusSubscription)
        this._incidentReportedByUpdateStatusSubscription.unsubscribe();
    }
    if (this._reportedByInputEventSubscription)
      this._reportedByInputEventSubscription.unsubscribe();
  }
  // Public methods - end

  // Private methods - start
  public onFormInit(fg: FormGroup) {
    this._incidentAddUpdateForm = fg;
    if (this._isNew) {
      this._currentReportedBy = [];
      this._currentReportedBy.push(new AeSelectItem(this._claimsHelper.getUserFullName(), this._claimsHelper.getUserId(), false));
      this._incidentAddUpdateForm.patchValue({
        ReportedBy: this._currentReportedBy
      });
    }
    else {
      this._bindIncidentAboutYouForm(true);
    }
    this._reportedBySubscription = this._incidentAddUpdateForm.get('ReportedBy').valueChanges.subscribe((val) => {
      if (this._filteredUsers != null && this._filteredUsers.length > 0 && typeof (val[0]) === 'string') {
        this._incidentDetails.IncidentReportedBy.UserId = val[0];
        this._filteredUsers.filter(x => x.Value === val[0]).map(user => {
          this._incidentDetails.IncidentReportedBy.Name = user.Text;
        });
        this._store.dispatch(new IncidentEmployeeDetailsByUserIdGetAction(this._incidentDetails.IncidentReportedBy.UserId));
      }
    });
  }

  private _prepareIncidentAboutYouDetails() {
    if (!this._isUserChanged && this._isNew) {
      this._incidentDetails.IncidentReportedBy.Name = this._claimsHelper.getUserFullName();
      this._incidentDetails.IncidentReportedBy.UserId = this._claimsHelper.getUserId();
      this._incidentDetails.IncidentReportedBy.CompanyId = this._claimsHelper.getCompanyId();
    }

    if (this._selectedUserAddress != null) {
      this._incidentDetails.IncidentReportedBy.Address = this._selectedUserAddress;
      this._incidentDetails.IncidentReportedBy.AddressId = this._selectedUserAddress.Id;
    }
    else {
      if (!isNullOrUndefined(this._headOfficeSite)) {
        this._incidentDetails.IncidentReportedBy.Address = this._headOfficeSite.Address;
        this._incidentDetails.IncidentReportedBy.AddressId = this._headOfficeSite.Address.Id;
      }
      else {
        this._incidentDetails.IncidentReportedBy.Address = new Address();
        this._incidentDetails.IncidentReportedBy.AddressId = null;
      }
    }
  }

  private _bindIncidentAboutYouForm(isAll) {
    if (!isNullOrUndefined(this._incidentAddUpdateForm)) {
      this._prepareIncidentAboutYouDetails();
      if (isAll) {
        this._currentReportedBy = [];
        this._currentReportedBy.push(new AeSelectItem(this._incidentDetails.IncidentReportedBy.Name, this._incidentDetails.IncidentReportedBy.UserId, false));
        this._incidentAddUpdateForm.patchValue({
          ReportedBy: this._currentReportedBy,
          AddressLine1: this._incidentDetails.IncidentReportedBy.Address.AddressLine1,
          AddressLine2: this._incidentDetails.IncidentReportedBy.Address.AddressLine2,
          Town: this._incidentDetails.IncidentReportedBy.Address.Town,
          CountyId: this._incidentDetails.IncidentReportedBy.Address.CountyId,
          Postcode: this._incidentDetails.IncidentReportedBy.Address.Postcode
        });
      } else {
        this._incidentAddUpdateForm.patchValue({
          AddressLine1: this._incidentDetails.IncidentReportedBy.Address.AddressLine1,
          AddressLine2: this._incidentDetails.IncidentReportedBy.Address.AddressLine2,
          Town: this._incidentDetails.IncidentReportedBy.Address.Town,
          CountyId: this._incidentDetails.IncidentReportedBy.Address.CountyId,
          Postcode: this._incidentDetails.IncidentReportedBy.Address.Postcode,
        });
      }
    }
  }

  public onFormValidityChange(status: boolean) {
    this._context.isValidEvent.emit(status);
  }

  private _isAddressChanged(incidentDetailsToSave) {
    if (this._incidentDetails.IncidentReportedBy.Address == null || this._incidentDetails.IncidentReportedBy.Address.Id == null) return true;
    return (this._incidentDetails.IncidentReportedBy.Address.AddressLine1 != incidentDetailsToSave.AddressLine1
      || this._incidentDetails.IncidentReportedBy.Address.AddressLine2 != incidentDetailsToSave.AddressLine2
      || this._incidentDetails.IncidentReportedBy.Address.Town != incidentDetailsToSave.Town
      || this._incidentDetails.IncidentReportedBy.Address.CountyId != incidentDetailsToSave.CountyId
      || this._incidentDetails.IncidentReportedBy.Address.Postcode != incidentDetailsToSave.Postcode
    );
  }

  private _onAboutYouFormSubmit(e) {
    if (!this._submitted) {
      this._submitted = true;
      if (this._incidentAddUpdateForm.valid && (!this._incidentAddUpdateForm.pristine || this._isNew)) {
        if (!this._validateFormKeyFields()) {
          this._savePersonReportingData();
        }
        else {
          this._submitted = false;
        }
      }
      else {
        if (!this._validateFormKeyFields()) {
          this._context.waitEvent.next(true);
        }
        else {
          this._submitted = false;
        }
      }
      this._cdRef.markForCheck();
    }
  }

  private _savePersonReportingData() {
    this._saveReportedByDetails = true;
    var _incidentDetailsToSave = this._incidentAddUpdateForm.value;
    var isAddressChanged = this._isAddressChanged(_incidentDetailsToSave);
    if (isAddressChanged) {
      _incidentDetailsToSave.AddressId = null;
      this._newIncidentReportedByAddress = new Address();
      this._newIncidentReportedByAddress.AddressLine1 = _incidentDetailsToSave.AddressLine1;
      this._newIncidentReportedByAddress.AddressLine2 = _incidentDetailsToSave.AddressLine2;
      this._newIncidentReportedByAddress.Town = _incidentDetailsToSave.Town;
      this._newIncidentReportedByAddress.CountyId = _incidentDetailsToSave.CountyId;
      this._newIncidentReportedByAddress.Postcode = _incidentDetailsToSave.Postcode;
      _incidentDetailsToSave.Address = this._newIncidentReportedByAddress;
    }
    else {
      _incidentDetailsToSave.AddressId = this._incidentDetails.IncidentReportedBy.AddressId;
    }
    _incidentDetailsToSave.CompanyId = this._incidentDetails.IncidentReportedBy.CompanyId;
    _incidentDetailsToSave.UserId = this._incidentDetails.IncidentReportedBy.UserId;
    _incidentDetailsToSave.Name = this._incidentDetails.IncidentReportedBy.Name;

    _incidentDetailsToSave.ReportedBy = null;
    this._incidentDetailsToSave = _incidentDetailsToSave;

    if (this._isNew) {
      this._store.dispatch(new IncidentAboutYouDetailsAddAction(this._incidentDetailsToSave));
    }
    else {
      this._incidentDetailsToSave.Id = this._incidentReportedById;
      this._incidentDetailsToSave = mergeWithSelectedIncidentReportedByData(this._incidentDetails.IncidentReportedBy, this._incidentDetailsToSave, this._claimsHelper.getUserId());
      this._store.dispatch(new IncidentAboutYouDetailsUpdateAction(this._incidentDetailsToSave));
    }
  }

  private _fieldHasRequiredError(fieldName: string): boolean {
    return (this._incidentAddUpdateForm.get(fieldName).hasError('required') && (!this._incidentAddUpdateForm.get(fieldName).pristine || this._submitted));
  }

  private _validateFormKeyFields() {
    for (var item of this._formKeyFields) {
      if (isNullOrUndefined(this._incidentAddUpdateForm.get(item).value) || this._incidentAddUpdateForm.get(item).value == "") {
        this._showNotification = true;
      }
    }
    return this._showNotification;
  }
  // Private methods - end

}