import {
  Component
  , OnInit
  , ChangeDetectionStrategy
  , ViewEncapsulation
  , OnDestroy
  , ChangeDetectorRef,
  Input,
  EventEmitter
} from '@angular/core';
import { BaseComponent } from './../../../../shared/base-component';
import { LocaleService, TranslationService } from 'angular-l10n';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ClaimsHelperService } from './../../../../shared/helpers/claims-helper';
import { ActivatedRoute } from '@angular/router';
import { IncidentReportedBySearchService } from '../../services/incident-reported-by-search.service';
import { Store } from '@ngrx/store';
import * as fromRoot from './../../../../shared/reducers';
import * as Immutable from 'immutable';
import { Observable } from 'rxjs/Observable';
import { AeSelectItem } from './../../../../atlas-elements/common/models/ae-select-item';
import { Subscription } from 'rxjs/Subscription';
import { isNullOrUndefined } from 'util';
import { LoadIncidentRIDDORAction, SaveRIDDORAction } from '../../actions/incident-riddor.actions';
import { IncidentRIDDOR, RIDDORReportedMedium } from '../../models/incident-riddor.model';
import { IFormBuilderVM, IFormFieldWrapper } from './../../../../shared/models/iform-builder-vm';
import { IncidentRIDDORForm } from '../../models/incident-riddor.form';
import { getAeSelectItemsFromEnum } from './../../../../shared/helpers/extract-helpers';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import {
  LoadMainIndustryAction
  , LoadMainActivityAction
  , LoadSubActivityAction
  , CountryLoadAction
  , LoadGeoLocationsAction
  , LoadLocalAuthoritiesAction,
  WorkProcessLoadAction,
  MainFactorLoadAction
} from './../../../../shared/actions/lookup.actions';
import { StringHelper } from './../../../../shared/helpers/string-helper';
import { OperationModes } from './../../../../shared/models/lookup.models';
import { ObjectHelper } from './../../../../shared/helpers/object-helper';
import { extractRIDDOR } from '../../common/extract-helpers';
import { IncidentLogService } from '../../services/incident-log.service';
import { CommonHelpers } from './../../../../shared/helpers/common-helpers';
import { AeClassStyle } from "./../../../../atlas-elements/common/ae-class-style.enum";
import { AeLoaderType } from "./../../../../atlas-elements/common/ae-loader-type.enum";

@Component({
  selector: 'riddor-add-update',
  templateUrl: './incident-riddor.component.html',
  styleUrls: ['./incident-riddor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class IncidentRiddorComponent extends BaseComponent implements OnInit, OnDestroy {
  // private fields start
  private _context: any;
  private _geoRegions: Immutable.List<AeSelectItem<string>>;
  private _countries: Immutable.List<AeSelectItem<string>>;
  private _localAuthorities: Immutable.List<AeSelectItem<string>>;
  private _mainIndustries: Immutable.List<AeSelectItem<string>>;
  private _mainActivities: Immutable.List<AeSelectItem<string>>;
  private _subActivities: Immutable.List<AeSelectItem<string>>;
  private _workProcessData: Immutable.List<AeSelectItem<string>>;
  private _mainFactorData: Immutable.List<AeSelectItem<string>>;
  private _incidentId: string;
  private _incidentRIDDORFormVM: IFormBuilderVM;
  private _incidentRIDDORForm: FormGroup;
  private _formName: string;
  private _formFields: Array<IFormFieldWrapper<any>>;
  private _riddorMediumList: Immutable.List<AeSelectItem<number>>;
  private _incidentReportedToEntity: any;
  private _incidentReportedTo: IncidentRIDDOR;
  private _routeParamSubscription: Subscription;
  private _incidentReportedToSubscription: Subscription;
  private _countrySubscription: Subscription;
  private _mainIndustrySubscription: Subscription;
  private _mainActivitySubscription: Subscription;
  private _subActivitySubscription: Subscription;
  private _geoRegionSubscription: Subscription;
  private _localAuthoritySubscription: Subscription;
  private _incidentIdSubscription: Subscription;
  private _userSearchSubscription: Subscription;
  private _incidentCategorySubscription: Subscription;
  private _incidentCategoryObserver: Observable<string>;
  private _submitFormSubscription: Subscription;
  private _mainindustryValueChange$: Subscription;
  private _mainactivityValueChange$: Subscription;
  private _subActivityValueChange$: Subscription;
  private _countryValueChange$: Subscription;
  private _countyValueChange$: Subscription;
  private _reportedbyValueChange$: Subscription;
  private _isriddorValueChange$: Subscription;
  private _filterUserDataSubscription: Subscription;
  private _workProcessSubscription: Subscription;
  private _mainFactorSubscription: Subscription;
  private _workProcessChangeSubscription: Subscription;
  private _mainFactorChangeSubscription: Subscription;

  private _contextOtherMainIndustryFieldPropertyValue: BehaviorSubject<boolean>;
  private _contextOtherMainActivityFieldPropertyValue: BehaviorSubject<boolean>;
  private _contextOtherSubActivityFieldPropertyValue: BehaviorSubject<boolean>;
  private _contextMainActivityFieldPropertyValue: BehaviorSubject<boolean>;
  private _contextSubActivityFieldPropertyValue: BehaviorSubject<boolean>;
  private _contextMainIndustryFieldPropertyValue: BehaviorSubject<boolean>;
  private _contextReportedByFieldPropertyValue: BehaviorSubject<boolean>;
  private _contextReportedDateFieldPropertyValue: BehaviorSubject<boolean>;
  private _contextCountryFieldPropertyValue: BehaviorSubject<boolean>;
  private _contextCountyFieldPropertyValue: BehaviorSubject<boolean>;
  private _contextLocalAuthorityFieldPropertyValue: BehaviorSubject<boolean>;
  private _contextMediumFieldPropertyValue: BehaviorSubject<boolean>;
  private _contextWorkProcessFieldPropertyValue: BehaviorSubject<boolean>;
  private _contextOtherWorkProcessFieldPropertyValue: BehaviorSubject<boolean>;
  private _contextMainFactorFieldPropertyValue: BehaviorSubject<boolean>;
  private _contextOtherMainFactorFieldPropertyValue: BehaviorSubject<boolean>;

  private _onDemandIncidentIdLoader: BehaviorSubject<boolean> = new BehaviorSubject(null);
  private _mainActivityField: IFormFieldWrapper<any>;
  private _subActivityField: IFormFieldWrapper<any>;
  private _riddorSupportCountries = ['England', 'Wales', 'Scotland', 'Northern Ireland'];
  private _selectedUser: AeSelectItem<string>[];
  private _filteredUsers: AeSelectItem<string>[] = [];
  private _showRIDDORPreviewSlideOut: boolean = false;
  private _operationMode: OperationModes;
  private _submitted: boolean = false;
  private _showRIDDORFooter: boolean = false;
  private _isFatalitiesCategory: boolean = false;
  private _riddorPrintInfo: {
    Id: string,
    LocalAuthority: string;
    MainIndustryName: string;
    WorkProcessName: string;
    MainFactorName: string;
  };
  private _onDemandCountryLoader: BehaviorSubject<boolean> = new BehaviorSubject(null);
  private _onDemandMainIndustriesLoader: BehaviorSubject<boolean> = new BehaviorSubject(null);

  private _showNotification: boolean = false;
  private _riddorSaveStatusSubscription: Subscription;
  private _isNotificationRequired: boolean;
  private _initialRiddorValue: boolean;
  private _formKeyFields: Array<string> = [];
  private _showKeyFieldsNotification: boolean = false;
  private _lightClass: AeClassStyle = AeClassStyle.Light;
  private _saveRIDDOR: boolean = false;
  private _isDataLoading: boolean = false;
  private _loaderType: AeLoaderType = AeLoaderType.Bars;
  // end of private fields

  // public fields start
  @Input('context')
  get context() {
    return this._context;
  }
  set context(val: any) {
    this._context = val;
  }

  get showRIDDORFooter() {
    return this._showRIDDORFooter;
  }

  get riddorPrintInfo() {
    return this._riddorPrintInfo;
  }

  get incidentRIDDORFormVM() {
    return this._incidentRIDDORFormVM;
  }

  get showRIDDORPreviewSlideOut() {
    return this._showRIDDORPreviewSlideOut;
  }

  get showKeyFieldsPopUp() {
    return this._showKeyFieldsNotification;
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
  // end of public fields

  // constructor starts
  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _cdRef: ChangeDetectorRef
    , private _fb: FormBuilder
    , private _claimsHelper: ClaimsHelperService
    , private _router: ActivatedRoute
    , private _incidentReportedBySearchService: IncidentReportedBySearchService
    , private _store: Store<fromRoot.State>
    , private _incidentLogService: IncidentLogService) {
    super(_localeService, _translationService, _cdRef);
  }
  // end of constructor starts

  // private methods start

  private _checkIsFatalitiesCategory() {
    this._incidentCategorySubscription = this._incidentLogService.getIncidentCategory(this._incidentId)
      .subscribe((categoryName: string) => {
        if (!StringHelper.isNullOrUndefinedOrEmpty(categoryName) &&
          categoryName.toLowerCase() === 'fatalities') {
          if (!isNullOrUndefined(this._incidentRIDDORForm.get('IsRIDDORRequired'))) {
            this._incidentRIDDORForm.get('IsRIDDORRequired').setValue(true);
          }
        } else {
          if (!isNullOrUndefined(this._incidentRIDDORForm.get('IsRIDDORRequired'))) {
            this._incidentRIDDORForm.get('IsRIDDORRequired').setValue(false);
          }
        }
      });
  }

  private _handleAddMode() {
    this._incidentReportedTo = new IncidentRIDDOR();
    this._incidentReportedTo.Id = this._incidentId;
    this._incidentReportedTo.RIDDORReportedDate = new Date();
    this._incidentReportedTo.RIDDORReportedById = this._claimsHelper.getUserId();
    this._incidentReportedTo.RIDDORReportedByName = this._claimsHelper.getUserFullName();
    this._selectedUser = [];
    this._selectedUser.push(new AeSelectItem(this._incidentReportedTo.RIDDORReportedByName
      , this._incidentReportedTo.RIDDORReportedById
      , false));
    this._checkIsFatalitiesCategory();
    this._operationMode = OperationModes.Add;
  }

  private _fillDropdownControls(fieldName: string, options: Immutable.List<AeSelectItem<string>>) {
    (<BehaviorSubject<Immutable.List<AeSelectItem<string>>>>this._formFields.filter(f => f.field.name === fieldName)[0].context
      .getContextData()
      .get('options'))
      .next(options);
  }

  private _nullifyComplexProperties() {
    this._incidentReportedToEntity.LocalAuthority = null;
    this._incidentReportedToEntity.RIDDORReportedBy = null;
    this._incidentReportedToEntity.MainIndustry = null;
    this._incidentReportedToEntity.MainActivity = null;
    this._incidentReportedToEntity.SubActivity = null;
    this._incidentReportedToEntity.MainFactor = null;
    this._incidentReportedToEntity.WorkProcess = null;
  }

  private _onIncidentRIDDORFormSubmit() {
    if (!this._submitted) {
      this._submitted = true;
      if (this._incidentRIDDORForm.valid && (!this._incidentRIDDORForm.pristine || this.isAddMode())) {
        if (!this._validateFormKeyFields()) {
          this._saveRIDDORData();
          this._saveRIDDOR = true;
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

  private _validateFormKeyFields() {
    if (this._incidentRIDDORForm.get('IsRIDDORRequired').value) {
      this._formKeyFields = [];

      this._formFields.filter(f => f.context.getContextData().get('required') && (isNullOrUndefined(f.context.getContextData().get('propertyValue')) || f.context.getContextData().get('propertyValue').getValue() == true)).forEach(x => {
        this._formKeyFields.push(x.field.name);
      });
      for (var item of this._formKeyFields) {
        if (isNullOrUndefined(this._incidentRIDDORForm.get(item).value) || this._incidentRIDDORForm.get(item).value.toString() == "") {
          this._showKeyFieldsNotification = true;
        }
      }
    }
    return this._showKeyFieldsNotification;
  }

  private _saveRIDDORData() {
    let incidentRiddorDetailsToUpdate = this._incidentRIDDORForm.value;
    if (incidentRiddorDetailsToUpdate.IsRIDDORRequired) {
      this._isNotificationRequired = this._initialRiddorValue ? false : true;
    }
    else {
      this._isNotificationRequired = false;
    }
   
    if (this.isUpdateMode()) {
      this._incidentReportedToEntity = ObjectHelper.extract(this._incidentReportedTo, this._incidentReportedToEntity);
    } else if (this.isAddMode()) {
      this._incidentReportedToEntity = this._incidentReportedTo;
    }
    
    this._incidentReportedToEntity.IsNotificationRequired = this._isNotificationRequired;
    this._incidentReportedToEntity.OtherWorkProcess = incidentRiddorDetailsToUpdate.OtherWorkProcess;
    this._incidentReportedToEntity.OtherMainFactor = incidentRiddorDetailsToUpdate.OtherMainFactor;

    if (!isNullOrUndefined(this._incidentReportedToEntity)) {
      if (StringHelper.isNullOrUndefinedOrEmpty(this._incidentReportedToEntity.MainIndustryId) ||
        this._incidentReportedToEntity.MainIndustryId.toLowerCase() === 'other') {
        this._incidentReportedToEntity.MainIndustryId = null;
      } else {
        this._incidentReportedToEntity.OtherMainIndustry = null;
      }

      if (StringHelper.isNullOrUndefinedOrEmpty(this._incidentReportedToEntity.MainActivityId) ||
        this._incidentReportedToEntity.MainActivityId.toLowerCase() === 'other') {
        this._incidentReportedToEntity.MainActivityId = null;
      } else {
        this._incidentReportedToEntity.OtherMainActivity = null;
      }

      if (StringHelper.isNullOrUndefinedOrEmpty(this._incidentReportedToEntity.SubActivityId) ||
        this._incidentReportedToEntity.SubActivityId.toLowerCase() === 'other') {
        this._incidentReportedToEntity.SubActivityId = null;
      } else {
        this._incidentReportedToEntity.OtherSubActivity = null;
      }

      this._nullifyComplexProperties();
      this._store.dispatch(new SaveRIDDORAction({ isEdit: this.isUpdateMode(), RIDDOR: this._incidentReportedToEntity }));
    }
  }

  private _getContextPropertyValue(fieldName: string) {
    return <BehaviorSubject<boolean>>this._formFields.filter(f => f.field.name === fieldName)[0]
      .context
      .getContextData()
      .get('propertyValue');
  }

  private _setFormFieldProperties() {
    this._contextMainIndustryFieldPropertyValue = this._getContextPropertyValue('MainIndustryId');
    this._contextOtherMainIndustryFieldPropertyValue = this._getContextPropertyValue('OtherMainIndustry');
    this._contextMainActivityFieldPropertyValue = this._getContextPropertyValue('MainActivityId');
    this._contextOtherMainActivityFieldPropertyValue = this._getContextPropertyValue('OtherMainActivity');
    this._contextSubActivityFieldPropertyValue = this._getContextPropertyValue('SubActivityId');
    this._contextOtherSubActivityFieldPropertyValue = this._getContextPropertyValue('OtherSubActivity');
    this._contextReportedDateFieldPropertyValue = this._getContextPropertyValue('RIDDORReportedDate');
    this._contextReportedByFieldPropertyValue = this._getContextPropertyValue('RIDDORReportedById');
    this._contextMediumFieldPropertyValue = this._getContextPropertyValue('RIDDORReportedMedium');
    this._contextCountryFieldPropertyValue = this._getContextPropertyValue('CountryId');
    this._contextCountyFieldPropertyValue = this._getContextPropertyValue('CountyId');
    this._contextLocalAuthorityFieldPropertyValue = this._getContextPropertyValue('LocalAuthorityId');
    this._contextMainFactorFieldPropertyValue = this._getContextPropertyValue('WorkProcessId');
    this._contextOtherMainFactorFieldPropertyValue = this._getContextPropertyValue('OtherWorkProcess');
    this._contextWorkProcessFieldPropertyValue = this._getContextPropertyValue('MainFactorId');
    this._contextOtherWorkProcessFieldPropertyValue = this._getContextPropertyValue('OtherMainFactor');
  }
  // end of private methods

  // public methods start
  public getRIDDORSlideoutState() {
    return this._showRIDDORPreviewSlideOut ? 'expanded' : 'collapsed';
  }

  public onRIDDORSlideoutClosed() {
    this._showRIDDORPreviewSlideOut = false;
  }

  public openRIDDORPreview() {
    let mainIndustryName = '';
    let localAuthorityName = '';
    let workProcessName = '';
    let mainFactorName = '';
    if (!isNullOrUndefined(this._mainIndustries) &&
      this._mainIndustries.count() > 0 &&
      !StringHelper.isNullOrUndefinedOrEmpty(this._incidentReportedTo.MainIndustryId)) {
      let mainIndustry = this._mainIndustries.filter(c => c.Value.toLowerCase() ===
        this._incidentReportedTo.MainIndustryId.toLowerCase()).first();
      if (!isNullOrUndefined(mainIndustry)) {
        if (mainIndustry.Value.toLowerCase() === 'other') {
          mainIndustryName = this._incidentReportedTo.OtherMainIndustry;
        } else {
          mainIndustryName = mainIndustry.Text;
        }
      }
    }

    if (!isNullOrUndefined(this._localAuthorities) &&
      this._localAuthorities.count() > 0 &&
      !StringHelper.isNullOrUndefinedOrEmpty(this._incidentReportedTo.LocalAuthorityId)) {
      localAuthorityName = this._localAuthorities.filter(c => c.Value.toLowerCase() ===
        this._incidentReportedTo.LocalAuthorityId.toLowerCase()).map(c => c.Text).first();
      if (isNullOrUndefined(localAuthorityName)) {
        localAuthorityName = '';
      }
    }

    if (!isNullOrUndefined(this._workProcessData) &&
      this._workProcessData.count() > 0 &&
      !StringHelper.isNullOrUndefinedOrEmpty(this._incidentReportedTo.WorkProcessId)) {
      workProcessName = this._workProcessData.filter(c => c.Value.toLowerCase() ===
        this._incidentReportedTo.WorkProcessId.toLowerCase()).map(c => c.Text).first();
      if (isNullOrUndefined(workProcessName)) {
        workProcessName = '';
      }
    }
    if (!isNullOrUndefined(this._mainFactorData) &&
      this._mainFactorData.count() > 0 &&
      !StringHelper.isNullOrUndefinedOrEmpty(this._incidentReportedTo.MainFactorId)) {
      mainFactorName = this._mainFactorData.filter(c => c.Value.toLowerCase() ===
        this._incidentReportedTo.MainFactorId.toLowerCase()).map(c => c.Text).first();
      if (isNullOrUndefined(mainFactorName)) {
        mainFactorName = '';
      }
    }
    this._riddorPrintInfo = Object.create({
      Id: this._incidentId,
      LocalAuthority: localAuthorityName,
      MainIndustryName: mainIndustryName,
      WorkProcessName: workProcessName,
      MainFactorName: mainFactorName
    });
    this._showRIDDORPreviewSlideOut = true;
  }

  modalClosed() {
    return this._showNotification = false;
  }
  OnConfirmation() {
    this._showNotification = false;
    this._context.waitEvent.next(true);
  }
  showPopUp() {
    return this._showNotification;
  }

  keyFieldsModalClosed() {
    this._context.clearEvent.next(true);
    return this._showKeyFieldsNotification = false;
  }
  keyFieldsOnConfirmation() {
    this._showKeyFieldsNotification = false;
    if (!this._incidentRIDDORForm.pristine || this.isAddMode()) {
      this._saveRIDDORData();
      this._saveRIDDOR = true;
    }
    else {
      this._context.waitEvent.next(true);
    }
  }

  public isAddMode() {
    return this._operationMode === OperationModes.Add;
  }

  public isUpdateMode() {
    return this._operationMode === OperationModes.Update;
  }

  public onFormInit(fg: FormGroup) {
    this._incidentRIDDORForm = fg;

    this._mainindustryValueChange$ =
      this._incidentRIDDORForm.get('MainIndustryId').valueChanges.subscribe((val: string) => {
        if (!isNullOrUndefined(this._incidentReportedTo) &&
          this._incidentReportedTo.IsRIDDORRequired) {
          this._incidentReportedTo.MainIndustryId = val;
          if (!StringHelper.isNullOrUndefinedOrEmpty(val)) {
            if (val.toLowerCase() === 'other') {
              this._contextMainActivityFieldPropertyValue.next(false);
              this._contextSubActivityFieldPropertyValue.next(false);
              this._contextOtherMainIndustryFieldPropertyValue.next(true);
              this._contextOtherMainActivityFieldPropertyValue.next(true);
              this._contextOtherSubActivityFieldPropertyValue.next(true);

              this._mainActivities = Immutable.List([]);
              this._subActivities = Immutable.List([]);
              this._fillDropdownControls('MainActivityId', this._mainActivities);
              this._fillDropdownControls('SubActivityId', this._subActivities);
              this._incidentReportedTo.MainActivityId = 'other';
              this._incidentReportedTo.SubActivityId = 'other';
            } else {
              this._contextMainActivityFieldPropertyValue.next(true);
              this._contextSubActivityFieldPropertyValue.next(true);
              this._contextOtherMainIndustryFieldPropertyValue.next(false);
              this._contextOtherMainActivityFieldPropertyValue.next(false);
              this._contextOtherSubActivityFieldPropertyValue.next(false);
              this._mainActivities = null;
              this._subActivities = null;
              this._store.dispatch(new LoadMainActivityAction(val));
            }
          } else {
            this._contextMainActivityFieldPropertyValue.next(true);
            this._contextSubActivityFieldPropertyValue.next(true);
            this._contextOtherMainIndustryFieldPropertyValue.next(false);
            this._contextOtherMainActivityFieldPropertyValue.next(false);
            this._contextOtherSubActivityFieldPropertyValue.next(false);
            this._mainActivities = Immutable.List([]);
            this._subActivities = Immutable.List([]);
            this._fillDropdownControls('MainActivityId', this._mainActivities);
            this._fillDropdownControls('SubActivityId', this._subActivities);

            CommonHelpers.forceValueChange(() => {
              if (!isNullOrUndefined(this._incidentRIDDORForm.get('MainActivityId'))) {
                this._incidentRIDDORForm.get('MainActivityId').setValue('');
              }
            });
            CommonHelpers.forceValueChange(() => {
              if (!isNullOrUndefined(this._incidentRIDDORForm.get('SubActivityId'))) {
                this._incidentRIDDORForm.get('SubActivityId').setValue('');
              }
            });
          }
        }
      });

    this._mainactivityValueChange$ =
      this._incidentRIDDORForm.get('MainActivityId').valueChanges.subscribe((val) => {
        if (!isNullOrUndefined(this._incidentReportedTo) &&
          this._incidentReportedTo.IsRIDDORRequired) {
          this._incidentReportedTo.MainActivityId = val;

          if (!StringHelper.isNullOrUndefinedOrEmpty(val)) {
            if (val.toLowerCase() === 'other') {
              this._contextSubActivityFieldPropertyValue.next(false);
              this._contextOtherMainActivityFieldPropertyValue.next(true);
              this._contextOtherSubActivityFieldPropertyValue.next(true);

              this._subActivities = Immutable.List([]);
              this._fillDropdownControls('SubActivityId', this._subActivities);
              this._incidentReportedTo.SubActivityId = 'other';
            } else {
              this._contextSubActivityFieldPropertyValue.next(true);
              this._contextOtherMainActivityFieldPropertyValue.next(false);
              this._contextOtherSubActivityFieldPropertyValue.next(false);
              this._subActivities = null;
              this._store.dispatch(new LoadSubActivityAction(val));
            }
          } else {
            this._contextMainActivityFieldPropertyValue.next(true);
            this._contextSubActivityFieldPropertyValue.next(true);
            this._contextOtherMainIndustryFieldPropertyValue.next(false);
            this._contextOtherMainActivityFieldPropertyValue.next(false);
            this._contextOtherSubActivityFieldPropertyValue.next(false);
            this._subActivities = Immutable.List([]);
            this._fillDropdownControls('SubActivityId', this._subActivities);
            CommonHelpers.forceValueChange(() => {
              if (!isNullOrUndefined(this._incidentRIDDORForm.get('SubActivityId'))) {
                this._incidentRIDDORForm.get('SubActivityId').setValue('');
              }
            });
          }
        }
      });

    this._subActivityValueChange$ =
      this._incidentRIDDORForm.get('SubActivityId').valueChanges.subscribe((val) => {
        if (!isNullOrUndefined(this._incidentReportedTo) &&
          this._incidentReportedTo.IsRIDDORRequired) {
          this._incidentReportedTo.SubActivityId = val;
          if (!StringHelper.isNullOrUndefinedOrEmpty(val) &&
            val.toLowerCase() === 'other') {
            this._contextOtherSubActivityFieldPropertyValue.next(true);
          } else {
            this._contextOtherSubActivityFieldPropertyValue.next(false);
          }
        }
      });

    this._countryValueChange$ =
      this._incidentRIDDORForm.get('CountryId').valueChanges.subscribe((val) => {
        if (!isNullOrUndefined(this._incidentReportedTo) &&
          this._incidentReportedTo.IsRIDDORRequired) {
          this._incidentReportedTo.CountryId = val;
          if (!StringHelper.isNullOrUndefinedOrEmpty(val)) {
            this._geoRegions = null;
            this._localAuthorities = null;
            this._store.dispatch(new LoadGeoLocationsAction(val));
          } else {
            this._geoRegions = Immutable.List([]);
            this._localAuthorities = Immutable.List([]);
            this._fillDropdownControls('CountyId', this._geoRegions);
            this._fillDropdownControls('LocalAuthorityId', this._localAuthorities);

            CommonHelpers.forceValueChange(() => {
              if (!isNullOrUndefined(this._incidentRIDDORForm.get('CountyId'))) {
                this._incidentRIDDORForm.get('CountyId').setValue('');
              }
            });

            CommonHelpers.forceValueChange(() => {
              if (!isNullOrUndefined(this._incidentRIDDORForm.get('LocalAuthorityId'))) {
                this._incidentRIDDORForm.get('LocalAuthorityId').setValue('');
              }
            });
          }
        }
      });

    this._countyValueChange$ = this._incidentRIDDORForm.get('CountyId').valueChanges.subscribe((val) => {
      if (!isNullOrUndefined(this._incidentReportedTo) &&
        this._incidentReportedTo.IsRIDDORRequired) {
        this._incidentReportedTo.CountyId = val;
        if (!StringHelper.isNullOrUndefinedOrEmpty(val)) {
          this._localAuthorities = null;
          this._store.dispatch(new LoadLocalAuthoritiesAction(val));
        } else {
          this._localAuthorities = Immutable.List([]);
          this._fillDropdownControls('LocalAuthorityId', this._localAuthorities);
          CommonHelpers.forceValueChange(() => {
            if (!isNullOrUndefined(this._incidentRIDDORForm.get('LocalAuthorityId'))) {
              this._incidentRIDDORForm.get('LocalAuthorityId').setValue('');
            }
          });
        }
      }
    });

    this._mainActivitySubscription = this._store.let(fromRoot.getMainActivitiesData).subscribe(data => {
      if (!isNullOrUndefined(data)) {
        if (isNullOrUndefined(this._mainActivities)) {
          this._mainActivities = data;
          this._fillDropdownControls('MainActivityId', this._mainActivities);
          if (!isNullOrUndefined(this._incidentReportedToEntity) &&
            !StringHelper.isNullOrUndefinedOrEmpty(this._incidentReportedToEntity.MainIndustryId) &&
            !StringHelper.isNullOrUndefinedOrEmpty(this._incidentReportedToEntity.MainActivityId) &&
            this._mainActivities.findIndex(c => c.Value.toLowerCase() ===
              this._incidentReportedToEntity.MainActivityId.toLowerCase()) !== -1) {
            CommonHelpers.forceValueChange(() => {
              if (!isNullOrUndefined(this._incidentRIDDORForm.get('MainActivityId'))) {
                this._incidentRIDDORForm.get('MainActivityId').setValue(this._incidentReportedToEntity.MainActivityId);
              }
            });
          } else {
            CommonHelpers.forceValueChange(() => {
              if (!isNullOrUndefined(this._incidentRIDDORForm.get('MainActivityId'))) {
                this._incidentRIDDORForm.get('MainActivityId').setValue('');
              }
            });
          }
        }
      }
    });

    this._subActivitySubscription = this._store.let(fromRoot.getSubActivitiesData).subscribe(data => {
      if (!isNullOrUndefined(data)) {
        if (isNullOrUndefined(this._subActivities)) {
          this._subActivities = data;
          this._fillDropdownControls('SubActivityId', this._subActivities);
          if (!isNullOrUndefined(this._incidentReportedToEntity) &&
            !StringHelper.isNullOrUndefinedOrEmpty(this._incidentReportedToEntity.MainActivityId) &&
            !StringHelper.isNullOrUndefinedOrEmpty(this._incidentReportedToEntity.SubActivityId) &&
            this._subActivities.findIndex(c => c.Value.toLowerCase() ===
              this._incidentReportedToEntity.SubActivityId.toLowerCase()) !== -1) {
            CommonHelpers.forceValueChange(() => {
              if (!isNullOrUndefined(this._incidentRIDDORForm.get('SubActivityId'))) {
                this._incidentRIDDORForm.get('SubActivityId').setValue(this._incidentReportedToEntity.SubActivityId);
              }
            });
          } else {
            CommonHelpers.forceValueChange(() => {
              if (!isNullOrUndefined(this._incidentRIDDORForm.get('SubActivityId'))) {
                this._incidentRIDDORForm.get('SubActivityId').setValue('');
              }
            });
          }
        }
      }
    });

    this._reportedbyValueChange$ = this._incidentRIDDORForm.get('RIDDORReportedById').valueChanges.subscribe((val) => {
      if (this._filteredUsers != null && this._filteredUsers.length > 0 && typeof (val[0]) === 'string') {
        this._incidentReportedTo.RIDDORReportedById = val[0];
        this._filteredUsers.filter(x => x.Value === val[0]).map(user => {
          this._incidentReportedTo.RIDDORReportedByName = user.Text;
        });
      }
    });

    this._geoRegionSubscription = this._store.let(fromRoot.getGeoLocationsData).subscribe(data => {
      if (!isNullOrUndefined(data)) {
        if (isNullOrUndefined(this._geoRegions)) {
          this._geoRegions = data;
          this._localAuthorities = Immutable.List([]);
          this._fillDropdownControls('CountyId', this._geoRegions);
          this._fillDropdownControls('LocalAuthorityId', this._localAuthorities);
          if (!isNullOrUndefined(this._incidentReportedToEntity) &&
            !isNullOrUndefined(this._incidentReportedToEntity.LocalAuthority) &&
            !isNullOrUndefined(this._incidentReportedToEntity.LocalAuthority.GeoRegion) &&
            !StringHelper.isNullOrUndefinedOrEmpty(this._incidentReportedToEntity.LocalAuthority.GeoRegion.CountryId) &&
            !StringHelper.isNullOrUndefinedOrEmpty(this._incidentReportedToEntity.LocalAuthority.GeoRegionId) &&
            this._geoRegions.findIndex(c => c.Value.toLowerCase() ===
              this._incidentReportedToEntity.LocalAuthority.GeoRegionId.toLowerCase()) !== -1) {
            CommonHelpers.forceValueChange(() => {
              if (!isNullOrUndefined(this._incidentRIDDORForm.get('CountyId'))) {
                this._incidentRIDDORForm.get('CountyId').setValue(this._incidentReportedToEntity.LocalAuthority.GeoRegionId);
              }
            });
          } else {
            CommonHelpers.forceValueChange(() => {
              if (!isNullOrUndefined(this._incidentRIDDORForm.get('CountyId'))) {
                this._incidentRIDDORForm.get('CountyId').setValue('');
              }
            });
          }
        }
      }
    });

    this._localAuthoritySubscription = this._store.let(fromRoot.getLocalAuthoritiesData).subscribe(data => {
      if (!isNullOrUndefined(data)) {
        if (isNullOrUndefined(this._localAuthorities)) {
          this._localAuthorities = data;
          this._fillDropdownControls('LocalAuthorityId', this._localAuthorities);
          if (!isNullOrUndefined(this._incidentReportedToEntity) &&
            !isNullOrUndefined(this._incidentReportedToEntity.LocalAuthority) &&
            !StringHelper.isNullOrUndefinedOrEmpty(this._incidentReportedToEntity.LocalAuthority.GeoRegionId) &&
            !StringHelper.isNullOrUndefinedOrEmpty(this._incidentReportedToEntity.LocalAuthorityId) &&
            this._localAuthorities.findIndex(c => c.Value.toLowerCase() ===
              this._incidentReportedToEntity.LocalAuthorityId.toLowerCase()) !== -1) {
            CommonHelpers.forceValueChange(() => {
              if (!isNullOrUndefined(this._incidentRIDDORForm.get('LocalAuthorityId'))) {
                this._incidentRIDDORForm.get('LocalAuthorityId').setValue(this._incidentReportedToEntity.LocalAuthorityId);
              }
            });
          } else {
            CommonHelpers.forceValueChange(() => {
              if (!isNullOrUndefined(this._incidentRIDDORForm.get('LocalAuthorityId'))) {
                this._incidentRIDDORForm.get('LocalAuthorityId').setValue('');
              }
            });
          }
        }
      }
    });

    this._incidentReportedToSubscription =
      Observable.combineLatest(this._onDemandMainIndustriesLoader,
        this._onDemandCountryLoader,
        this._store.let(fromRoot.getIncidentReportedToData)).subscribe((vals) => {
          if (StringHelper.coerceBooleanProperty(vals[0]) &&
            StringHelper.coerceBooleanProperty(vals[1])) {
            let data = vals[2];
            if (!isNullOrUndefined(data)) {
              this._isDataLoading = false;
              this._incidentReportedToEntity = data;
              if (!StringHelper.isNullOrUndefinedOrEmpty(data.Id)) {
                this._incidentReportedTo = extractRIDDOR(data);
                this._initialRiddorValue = this._incidentReportedTo.IsRIDDORRequired;
                this._operationMode = OperationModes.Update;
                this._selectedUser = [];
                if (!StringHelper.isNullOrUndefinedOrEmpty(this._incidentReportedTo.RIDDORReportedById)) {
                  this._selectedUser.push(new AeSelectItem(this._incidentReportedTo.RIDDORReportedByName
                    , this._incidentReportedTo.RIDDORReportedById
                    , false));
                } else {
                  this._incidentReportedTo.RIDDORReportedById = this._claimsHelper.getUserId();
                  this._incidentReportedTo.RIDDORReportedByName = this._claimsHelper.getUserFullName();
                  this._selectedUser.push(new AeSelectItem(this._incidentReportedTo.RIDDORReportedByName
                    , this._incidentReportedTo.RIDDORReportedById
                    , false));
                }
                this._incidentRIDDORForm.patchValue({
                  IsRIDDORRequired: this._incidentReportedTo.IsRIDDORRequired,
                  MainIndustryId: this._incidentReportedTo.MainIndustryId,
                  MainActivityId: this._incidentReportedTo.MainActivityId,
                  SubActivityId: this._incidentReportedTo.SubActivityId,

                  OtherMainIndustry: this._incidentReportedTo.OtherMainIndustry,
                  OtherMainActivity: this._incidentReportedTo.OtherMainActivity,
                  OtherSubActivity: this._incidentReportedTo.OtherSubActivity,
                  RIDDORReportedById: this._selectedUser,
                  RIDDORReportedDate: new Date(this._incidentReportedTo.RIDDORReportedDate),
                  RIDDORReportedMedium: this._incidentReportedTo.RIDDORReportedMedium,
                  CountryId: this._incidentReportedTo.CountryId
                });
              } else {
                this._handleAddMode();
              }
            }
          }
        });

    this._isriddorValueChange$ = this._incidentRIDDORForm.get('IsRIDDORRequired').valueChanges.subscribe((val) => {
      this._incidentReportedTo.IsRIDDORRequired = StringHelper.coerceBooleanProperty(val);
      this._showRIDDORFooter = this._incidentReportedTo.IsRIDDORRequired;
      if (this._incidentReportedTo.IsRIDDORRequired) {
        this._contextMainIndustryFieldPropertyValue.next(true);
        this._contextOtherMainIndustryFieldPropertyValue.next(false);
        this._contextMainActivityFieldPropertyValue.next(true);
        this._contextOtherMainActivityFieldPropertyValue.next(false);
        this._contextSubActivityFieldPropertyValue.next(true);
        this._contextOtherSubActivityFieldPropertyValue.next(false);
        this._contextReportedByFieldPropertyValue.next(true);
        this._contextReportedDateFieldPropertyValue.next(true);
        this._contextCountryFieldPropertyValue.next(true);
        this._contextCountyFieldPropertyValue.next(true);
        this._contextLocalAuthorityFieldPropertyValue.next(true);
        this._contextMediumFieldPropertyValue.next(true);
        this._contextMainFactorFieldPropertyValue.next(true);
        this._contextOtherMainFactorFieldPropertyValue.next(false);
        this._contextWorkProcessFieldPropertyValue.next(true);
        this._contextOtherWorkProcessFieldPropertyValue.next(false);
        if (!isNullOrUndefined(this._incidentRIDDORForm) &&
          !isNullOrUndefined(this._incidentReportedTo)) {
          this._incidentRIDDORForm.patchValue({
            MainIndustryId: this._incidentReportedTo.MainIndustryId,
            WorkProcessId: this._incidentReportedTo.WorkProcessId,
            MainFactorId: this._incidentReportedTo.MainFactorId,
            OtherMainFactor: this._incidentReportedTo.OtherMainFactor,
            OtherWorkProcess: this._incidentReportedTo.OtherWorkProcess,
            OtherMainIndustry: this._incidentReportedTo.OtherMainIndustry,
            OtherMainActivity: this._incidentReportedTo.OtherMainActivity,
            OtherSubActivity: this._incidentReportedTo.OtherSubActivity,
            RIDDORReportedById: this._selectedUser,
            RIDDORReportedDate: new Date(this._incidentReportedTo.RIDDORReportedDate),
            RIDDORReportedMedium: this._incidentReportedTo.RIDDORReportedMedium,
            CountryId: this._incidentReportedTo.CountryId
          });
        }

      } else {
        this._contextMainIndustryFieldPropertyValue.next(false);
        this._contextOtherMainIndustryFieldPropertyValue.next(false);
        this._contextMainFactorFieldPropertyValue.next(false);
        this._contextOtherMainFactorFieldPropertyValue.next(false);
        this._contextWorkProcessFieldPropertyValue.next(false);
        this._contextOtherWorkProcessFieldPropertyValue.next(false);
        this._contextMainActivityFieldPropertyValue.next(false);
        this._contextOtherMainActivityFieldPropertyValue.next(false);
        this._contextSubActivityFieldPropertyValue.next(false);
        this._contextOtherSubActivityFieldPropertyValue.next(false);
        this._contextReportedByFieldPropertyValue.next(false);
        this._contextReportedDateFieldPropertyValue.next(false);
        this._contextCountryFieldPropertyValue.next(false);
        this._contextCountyFieldPropertyValue.next(false);
        this._contextLocalAuthorityFieldPropertyValue.next(false);
        this._contextMediumFieldPropertyValue.next(false);
      }
    });

    for (let name in this._incidentRIDDORForm.controls) {
      if (this._incidentRIDDORForm.controls.hasOwnProperty(name)) {
        let allowedColumns = ['OtherMainIndustry', 'OtherMainActivity', 'OtherSubActivity'
          , 'LocalAuthorityId', 'RIDDORReportedDate', 'RIDDORReportedMedium', 'OtherWorkProcess', 'OtherMainFactor'];
        if (allowedColumns.indexOf(name) !== -1) {
          let control = this._incidentRIDDORForm.controls[name];
          control.valueChanges.subscribe((v) => {
            this._incidentReportedTo[name] = v;
          });
        }
      }
    }

    this._workProcessChangeSubscription = this._incidentRIDDORForm.get('WorkProcessId').valueChanges.subscribe((val) => {
      if (!isNullOrUndefined(this._workProcessData)) {
        this._incidentReportedTo.WorkProcessId = val;
        let otherWorkProcessField = this._formFields.filter(f => f.field.name === 'OtherWorkProcess')[0];
        let visibilitySubjectWP = (<BehaviorSubject<boolean>>otherWorkProcessField.context.getContextData().get('propertyValue'));
        let otherWorkProcessItem = this._workProcessData.toArray().filter(f => f.Value === val && f.Text == 'Other process not listed above')[0];
        if (!isNullOrUndefined(otherWorkProcessItem)) {
          visibilitySubjectWP.next(true);
        }
        else {
          this._incidentReportedTo.OtherWorkProcess = null;
          this._incidentRIDDORForm.patchValue({
            OtherWorkProcess: null,
          });
          visibilitySubjectWP.next(false);
        }
      }
    });

    this._mainFactorChangeSubscription = this._incidentRIDDORForm.get('MainFactorId').valueChanges.subscribe((val) => {
      if (!isNullOrUndefined(this._mainFactorData)) {
        this._incidentReportedTo.MainFactorId = val;
        let otherMainFactorField = this._formFields.filter(f => f.field.name === 'OtherMainFactor')[0];
        let visibilitySubjectMF = (<BehaviorSubject<boolean>>otherMainFactorField.context.getContextData().get('propertyValue'));
        let otherMainFactorItem = this._mainFactorData.toArray().filter(f => f.Value === val && f.Text == 'Other cause not listed')[0];
        if (!isNullOrUndefined(otherMainFactorItem)) {
          visibilitySubjectMF.next(true);
        }
        else {
          this._incidentReportedTo.OtherMainFactor = null;
          this._incidentRIDDORForm.patchValue({
            OtherMainFactor: null,
          });
          visibilitySubjectMF.next(false);
        }
      }
    });
  }

  public onFormValidityChange(status: boolean) {
    this._context.isValidEvent.emit(status);
  }

  ngOnInit() {
    this._formName = 'IncidentRIDDORForm';
    this._incidentRIDDORFormVM = new IncidentRIDDORForm(this._formName);
    this._formFields = this._incidentRIDDORFormVM.init();
    let mainIndustryField = this._formFields.filter(f => f.field.name === 'MainIndustryId')[0];
    this._mainActivityField = this._formFields.filter(f => f.field.name === 'MainActivityId')[0];
    this._subActivityField = this._formFields.filter(f => f.field.name === 'SubActivityId')[0];
    let selecUserField = this._formFields.filter(f => f.field.name === 'RIDDORReportedById')[0];
    let countryField = this._formFields.filter(f => f.field.name === 'CountryId')[0];
    let workProcessIdField = this._formFields.filter(f => f.field.name === 'WorkProcessId')[0];
    let mainFactorIdField = this._formFields.filter(f => f.field.name === 'MainFactorId')[0];
    this._riddorMediumList = getAeSelectItemsFromEnum(RIDDORReportedMedium).sort((a, b) => a.Text.localeCompare(b.Text)).toList();
    let riddorMediumField = this._formFields.filter(f => f.field.name === 'RIDDORReportedMedium')[0];
    (<BehaviorSubject<Immutable.List<AeSelectItem<number>>>>riddorMediumField.context.getContextData()
      .get('options'))
      .next(this._riddorMediumList);

    this._setFormFieldProperties();

    this._routeParamSubscription = this._router.params.subscribe(params => {
      if (!isNullOrUndefined(params['id'])) {
        this._incidentId = params['id'];
        if (!StringHelper.isNullOrUndefinedOrEmpty(this._incidentId)) {
          this._isDataLoading = true;
          this._store.dispatch(new LoadIncidentRIDDORAction(this._incidentId));
        } else {
          this._onDemandIncidentIdLoader.next(true);
        }
      } else {
        this._onDemandIncidentIdLoader.next(true);
      }
    });

    this._mainIndustrySubscription = this._store.let(fromRoot.getMainIndustriesData).subscribe(data => {
      if (!isNullOrUndefined(data)) {
        if (isNullOrUndefined(this._mainIndustries)) {
          this._mainIndustries = data;
          (<BehaviorSubject<Immutable.List<AeSelectItem<string>>>>mainIndustryField.context
            .getContextData()
            .get('options'))
            .next(this._mainIndustries);
          this._onDemandMainIndustriesLoader.next(true);
        }
      } else {
        this._store.dispatch(new LoadMainIndustryAction(true));
      }
    });

    this._workProcessSubscription = this._store.let(fromRoot.getWorkProcessImmutableData).subscribe(data => {
      if (!isNullOrUndefined(data)) {
        this._workProcessData = data;
        (<BehaviorSubject<Immutable.List<AeSelectItem<string>>>>workProcessIdField.context
          .getContextData()
          .get('options'))
          .next(this._workProcessData);
      }
      else {
        this._store.dispatch(new WorkProcessLoadAction());
      }
    });

    this._mainFactorSubscription = this._store.let(fromRoot.getMainFactorImmutableData).subscribe(mainFactorData => {
      if (!isNullOrUndefined(mainFactorData)) {
        this._mainFactorData = mainFactorData;
        (<BehaviorSubject<Immutable.List<AeSelectItem<string>>>>mainFactorIdField.context
          .getContextData()
          .get('options'))
          .next(this._mainFactorData);
      }
      else {
        this._store.dispatch(new MainFactorLoadAction());
      }
    });


    this._riddorSaveStatusSubscription = this._store.let(fromRoot.getIncidentRiddorSaveStatus).subscribe((value) => {
      if (value && this._saveRIDDOR) {
        this._saveRIDDOR = false;
        if (!isNullOrUndefined(this._incidentReportedTo)) {
          if (this._isNotificationRequired) {
            this._showNotification = true;
          }
          else {
            this._context.waitEvent.next(true);
          }
          this._cdRef.markForCheck();
        }
      }
    });




    this._submitFormSubscription = this._context.submitEvent.subscribe((value) => {
      if (value) {
        this._onIncidentRIDDORFormSubmit();
      }
    });

    this._countrySubscription = this._store.let(fromRoot.getCountryImmutableData).subscribe(data => {
      if (!isNullOrUndefined(data)) {
        if (isNullOrUndefined(this._countries)) {
          this._countries = data.filter((item) => {
            return this._riddorSupportCountries.indexOf(item.Text) !== -1;
          }).toList();
          (<BehaviorSubject<Immutable.List<AeSelectItem<string>>>>countryField.context
            .getContextData()
            .get('options'))
            .next(this._countries);
          this._onDemandCountryLoader.next(true);
          // this._cdRef.markForCheck();
        }
      } else {
        this._store.dispatch(new CountryLoadAction(true));
      }
    });



    this._userSearchSubscription =
      (<EventEmitter<any>>selecUserField.context.getContextData().get('searchEvent')).subscribe((event) => {
        this._filterUserDataSubscription = this._incidentReportedBySearchService.getFilteredUserData(event.query).subscribe((data) => {
          (<BehaviorSubject<AeSelectItem<string>[]>>selecUserField.context.getContextData().get('items')).next(data);
          this._filteredUsers = data;
        });
      });

    this._incidentIdSubscription =
      Observable.combineLatest(this._onDemandIncidentIdLoader,
        this._store.let(fromRoot.getIncidentId)).subscribe((vals) => {
          if (StringHelper.coerceBooleanProperty(vals[0]) &&
            (!StringHelper.isNullOrUndefinedOrEmpty(vals[1]))) {
            this._incidentId = vals[1];
            this._store.dispatch(new LoadIncidentRIDDORAction(this._incidentId));
          }
        });
  }

  ngOnDestroy() {
    if (!isNullOrUndefined(this._routeParamSubscription)) {
      this._routeParamSubscription.unsubscribe();
    }

    if (!isNullOrUndefined(this._incidentReportedToSubscription)) {
      this._incidentReportedToSubscription.unsubscribe();
    }

    if (!isNullOrUndefined(this._mainIndustrySubscription)) {
      this._mainIndustrySubscription.unsubscribe();
    }

    if (!isNullOrUndefined(this._mainActivitySubscription)) {
      this._mainActivitySubscription.unsubscribe();
    }

    if (!isNullOrUndefined(this._subActivitySubscription)) {
      this._subActivitySubscription.unsubscribe();
    }

    if (!isNullOrUndefined(this._countrySubscription)) {
      this._countrySubscription.unsubscribe();
    }

    if (!isNullOrUndefined(this._localAuthoritySubscription)) {
      this._localAuthoritySubscription.unsubscribe();
    }

    if (!isNullOrUndefined(this._geoRegionSubscription)) {
      this._geoRegionSubscription.unsubscribe();
    }

    if (!isNullOrUndefined(this._incidentIdSubscription)) {
      this._incidentIdSubscription.unsubscribe();
    }

    if (!isNullOrUndefined(this._userSearchSubscription)) {
      this._userSearchSubscription.unsubscribe();
    }

    if (!isNullOrUndefined(this._incidentCategorySubscription)) {
      this._incidentCategorySubscription.unsubscribe();
    }

    if (!isNullOrUndefined(this._submitFormSubscription)) {
      this._submitFormSubscription.unsubscribe();
    }

    if (!isNullOrUndefined(this._countyValueChange$)) {
      this._countyValueChange$.unsubscribe();
    }

    if (!isNullOrUndefined(this._countryValueChange$)) {
      this._countryValueChange$.unsubscribe();
    }

    if (!isNullOrUndefined(this._mainindustryValueChange$)) {
      this._mainindustryValueChange$.unsubscribe();
    }

    if (!isNullOrUndefined(this._submitFormSubscription)) {
      this._mainactivityValueChange$.unsubscribe();
    }

    if (!isNullOrUndefined(this._reportedbyValueChange$)) {
      this._reportedbyValueChange$.unsubscribe();
    }

    if (!isNullOrUndefined(this._isriddorValueChange$)) {
      this._isriddorValueChange$.unsubscribe();
    }

    if (!isNullOrUndefined(this._subActivityValueChange$)) {
      this._subActivityValueChange$.unsubscribe();
    }

    if (!isNullOrUndefined(this._filterUserDataSubscription)) {
      this._filterUserDataSubscription.unsubscribe();
    }
    if (this._riddorSaveStatusSubscription) {
      this._riddorSaveStatusSubscription.unsubscribe();
    }

    if (!isNullOrUndefined(this._workProcessSubscription)) {
      this._workProcessSubscription.unsubscribe();
    }

    if (!isNullOrUndefined(this._workProcessChangeSubscription)) {
      this._workProcessChangeSubscription.unsubscribe();
    }

    if (!isNullOrUndefined(this._mainFactorSubscription)) {
      this._mainFactorSubscription.unsubscribe();
    }

    if (!isNullOrUndefined(this._mainFactorChangeSubscription)) {
      this._mainFactorChangeSubscription.unsubscribe();
    }
  }
  // end of public methods

}
