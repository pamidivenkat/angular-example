import { MessageType } from '../../../../atlas-elements/common/ae-message.enum';
import { AeAutoCompleteModel } from './../../../../atlas-elements/common/models/ae-autocomplete-model';
import { SortDirection } from '../../../../atlas-elements/common/models/ae-sort-model';
import { AtlasApiRequestWithParams, AtlasParams } from './../../../../shared/models/atlas-api-response';
import { AeDatasourceType } from '../../../../atlas-elements/common/ae-datasource-type';
import { ClaimsHelperService } from './../../../../shared/helpers/claims-helper';
import { TranslationService, LocaleService } from 'angular-l10n';
import { Store } from '@ngrx/store';
import { BaseComponent } from './../../../../shared/base-component';
import { Component, OnInit, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef, EventEmitter, Input, Output } from '@angular/core';
import * as fromRoot from './../../../../shared/reducers/index';
import { Observable, Subject, Subscription } from 'rxjs/Rx';
import { AeSelectItem } from '../../../../atlas-elements/common/models/ae-select-item';
import * as Immutable from 'immutable';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { LoadUsersAction } from "../../actions/delegation.actions";
import { isNullOrUndefined } from 'util';
import { DelegationService } from './../../services/delegation.service';
import { Delegation } from '../../models/delegation';
import { AeClassStyle } from './../../../../atlas-elements/common/ae-class-style.enum';

@Component({
  selector: 'delegation-add-update',
  templateUrl: './delegation-add-update.component.html',
  styleUrls: ['./delegation-add-update.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class DelegationAddUpdateComponent extends BaseComponent implements OnInit, OnDestroy {

  // Private fields
  private _action: string;
  private _delegationAddEditForm: FormGroup;
  private _userlistOptions$: Observable<AeSelectItem<string>[]>;
  private _userlistSubscription: Subscription;
  private _userList: Immutable.List<AeSelectItem<string>>;
  private _headerTitle: string;
  private _autosuggestUsers$: Observable<AeSelectItem<string>[]>;
  private _remoteDataSourceType: AeDatasourceType;
  private _authoriseHoliday: boolean;
  private _manageEmployee: boolean;
  private _viewEmployee: boolean;
  private _submitted: boolean = false;
  private _checkDelegationAccess: boolean;
  private _updateDelegationMessage: string;
  private _editDelegationDetails: Delegation;
  private _customValid: boolean;
  private _delegatedUserId: AeSelectItem<string>;
  private _delegatedManagerId: AeSelectItem<string>;
  private _selectedDeletedUser: AeAutoCompleteModel<string>[];
  private _validateUserSubscription: Subscription;
  private _lightClass: AeClassStyle = AeClassStyle.Light;
  private _messagetType = MessageType.Error;
  private _permissionValidationMessage: string;

  // end of Private fields 

  //Input Bindings
  @Input('action')
  get action() {
    return this._action;
  }
  set action(value: string) {
    this._action = value;
    this._headerTitle = this._action === 'Add' ? 'Add delegation' : 'Update delegation';
  }

  @Input('data')
  get data() {
    return this._editDelegationDetails;
  }
  set data(val: Delegation) {
    this._editDelegationDetails = val;
  }
  //End of Input Bindings
  // get methods
  get delegationAddEditForm() {
    return this._delegationAddEditForm;
  }
  get updateDelegationMessage() {
    return this._updateDelegationMessage;
  }
  get messagetType() {
    return this._messagetType;
  }
  get checkDelegationAccess() {
    return this._checkDelegationAccess;
  }
  get autosuggestUsers$() {
    return this._autosuggestUsers$;
  }
  get headerTitle(): string {
    return this._headerTitle;
  }
  get remoteDataSourceType() {
    return this._remoteDataSourceType;
  }
  get delegatedUserId() {
    return this._delegatedUserId;
  }
  get authoriseHoliday() {
    return this._authoriseHoliday;
  }
  get viewEmployee() {
    return this._viewEmployee;
  }
  get manageEmployee() {
    return this._manageEmployee;
  }
  get lightClass() {
    return this._lightClass;
  }
  get permissionValidationMessage() {
    return this._permissionValidationMessage;
  }

  //Output Variables
  @Output('onCancel') _onDelegationAddCancel: EventEmitter<string>;

  // Constructor
  constructor(protected _changeDetector: ChangeDetectorRef
    , protected _store: Store<fromRoot.State>
    , _localeService: LocaleService
    , _translationService: TranslationService
    , private _fb: FormBuilder
    , private _delegationService: DelegationService
    , protected _claimsHelper: ClaimsHelperService) {
    super(_localeService, _translationService, _changeDetector);
    this._onDelegationAddCancel = new EventEmitter<string>();
    this._userlistSubscription = new Subscription();
    this._userList = Immutable.List([]);
    this._remoteDataSourceType = AeDatasourceType.Remote;
    this._authoriseHoliday = true;
    this._manageEmployee = false;
    this._viewEmployee = false;
    this._customValid = true;
  }
  // End of Constructor

  // Public Methods
  ngOnInit() {
    if (this._action == 'Add') {
      this._initAddForm();
    } else if (this._action == 'Update') {
      this._initUpdateForm();
    }
    //   this._initForm();
    this._autosuggestUsers$ = this._store.let(fromRoot.getDelegationAutosuggestUserlistsData);
    this._checkDelegationAccess = this._claimsHelper.canManageHolidayDelegation();
  }
  ngOnDestroy() {
    if (this._validateUserSubscription)
      this._validateUserSubscription.unsubscribe();
  }
  // End of Public Methods

  // Private Methods
  searchDelegationUsers(e, type) {
    let apiRequestWithParams: AtlasApiRequestWithParams;
    let apiParams: AtlasParams[] = [];
    if (type != 'user') {
      apiParams.push(new AtlasParams("Permission", 'Ishoau'));
    }
    apiParams.push(new AtlasParams("SearchedQuery", e.query));
    apiRequestWithParams = new AtlasApiRequestWithParams(0, 0, 'FirstName', SortDirection.Ascending, apiParams);
    this._store.dispatch(new LoadUsersAction(apiRequestWithParams));
  }

  fieldHasRequiredError(fieldName: string): boolean {
    return (this._delegationAddEditForm.get(fieldName).hasError('required') && (!this._delegationAddEditForm.get(fieldName).pristine || this._submitted));
  }

  showMessage(): boolean {
    return !isNullOrUndefined(this._updateDelegationMessage) || !isNullOrUndefined(this._permissionValidationMessage);
  }

  hideMessage() {
    this._updateDelegationMessage = null;
  }

  hidePermissionValidationMessage() {
    this._permissionValidationMessage = null;
  }

  onSelectAutoSuggest($event: any) {
    this._customValid = true;
    this._selectedDeletedUser = $event;
    this._updateDelegationMessage = null;
    let managerId;
    if (this._checkDelegationAccess && this._action == 'Add') {
      if (this._delegationAddEditForm.get('ManagerId').value[0] == undefined) {
        this._updateDelegationMessage = null;
        this._updateDelegationMessage = 'DELEGATION.Please_select_manager';
        this._changeDetector.markForCheck();
        this._customValid = false;
      } else {
        if (this._delegationAddEditForm.get('ManagerId').value[0].Value == undefined) {
          managerId = this._delegationAddEditForm.get('ManagerId').value[0];
        } else {
          managerId = this._delegationAddEditForm.get('ManagerId').value[0].Value;
        }
        if (managerId == this._delegationAddEditForm.get('UserId').value[0]) {
          this._updateDelegationMessage = 'DELEGATION.Cannot_add_delegated_user';
          this._changeDetector.markForCheck();
          this._customValid = false;
        } else {
          let userId = this._delegationAddEditForm.get('UserId').value[0];
          this._validateUserSubscription = this._delegationService.isDelegationUserAlreadyExists(managerId, userId).first().subscribe((result) => {
            if (!isNullOrUndefined(result.Entities) && result.Entities.length > 0) {
              for (var i = 0; i < result.Entities.length; i++) {
                if (result.Entities[i].DeligatedUserId === userId) {
                  this._updateDelegationMessage = null;
                  this._updateDelegationMessage = 'DELEGATION.Delegated_user_already_exists';
                  this._changeDetector.markForCheck();
                  this._customValid = false;
                }
              }
            }
          });
        }
      }

    } else if (this._action == 'Add') {
      let managerId = this._claimsHelper.getUserId();
      let userId = this._delegationAddEditForm.get('UserId').value[0];
      this._validateUserSubscription = this._delegationService.isDelegationUserAlreadyExists(managerId, userId).first().subscribe((result) => {
        if (!isNullOrUndefined(result.Entities) && result.Entities.length > 0) {
          for (var i = 0; i < result.Entities.length; i++) {
            if (result.Entities[i].DeligatedUserId === userId) {
              this._updateDelegationMessage = null;
              this._updateDelegationMessage = 'DELEGATION.Delegated_user_already_exists';
              this._changeDetector.markForCheck();
              this._customValid = false;
            }
          }
        }
      });
    }


  }
  onClearManager($event: any) {
  }
  private _initAddForm() {
    this._delegatedManagerId = new AeSelectItem<string>(this._claimsHelper.getUserFullName(), this._claimsHelper.getUserId(), false);
    this._delegationAddEditForm = this._fb.group({
      ManagerId: [{ value: [this._delegatedManagerId], disabled: false }],
      UserId: [{ value: '', disabled: false }, [Validators.required]],
      DeligatedHA: [this._authoriseHoliday],
      DeligatedManageDE: [this._manageEmployee],
      DeligatedReadOnlyDE: [this._viewEmployee]
    });

    this.formValueChange();

  }
  private _initUpdateForm() {
    this._delegatedUserId = new AeSelectItem<string>(this._editDelegationDetails.FirstName + ' ' + this._editDelegationDetails.LastName, this._editDelegationDetails.DeligatedUserId, false);
    this._delegatedManagerId = new AeSelectItem<string>(this._editDelegationDetails.UserFirstName + ' ' + this._editDelegationDetails.UserLastName, this._editDelegationDetails.UserId, false);
    this._authoriseHoliday = this._editDelegationDetails.DeligatedHA;
    this._manageEmployee = this._editDelegationDetails.DeligatedManageDE;
    this._viewEmployee = this._editDelegationDetails.DeligatedReadOnlyDE;
    this._delegationAddEditForm = this._fb.group({
      ManagerId: [{ value: [this._delegatedManagerId], disabled: true }],
      UserId: [{ value: [this._delegatedUserId], disabled: true }, [Validators.required]],
      DeligatedHA: [this._authoriseHoliday],
      DeligatedManageDE: [this._manageEmployee],
      DeligatedReadOnlyDE: [this._viewEmployee]
    });

    this.formValueChange();
  }

  formValueChange() {
    this._delegationAddEditForm.valueChanges.subscribe((value) => {
      if (!value.DeligatedHA && !value.DeligatedManageDE && !value.DeligatedReadOnlyDE) {
        this._permissionValidationMessage = 'DELEGATION.Please_select_atleast_one_of_permission';
        this._changeDetector.markForCheck();
      } else {
        this._permissionValidationMessage = null
      }
    });
  }

  onAddCancel() {
    this._onDelegationAddCancel.emit('cancel');

  }
  onAddFormSubmit() {
    this._submitted = true;
    if (this._delegationAddEditForm.valid && this._customValid == true) {
      if (!this._delegationAddEditForm.value.DeligatedReadOnlyDE && !this._delegationAddEditForm.value.DeligatedManageDE && !this._delegationAddEditForm.value.DeligatedHA) {
        this._permissionValidationMessage = 'DELEGATION.Please_select_atleast_one_of_permission';
        this._changeDetector.markForCheck();
      } else {
        this._updateDelegationMessage = null;
        let _delegationDetails = new Delegation;
        if (this._action == 'Add') {
          _delegationDetails.DeligatedReadOnlyDE = this._delegationAddEditForm.value.DeligatedReadOnlyDE;
          _delegationDetails.DeligatedManageDE = this._delegationAddEditForm.value.DeligatedManageDE;
          _delegationDetails.DeligatedHA = this._delegationAddEditForm.value.DeligatedHA;
          _delegationDetails.Id = null;
          _delegationDetails.DeligatedUserId = this._delegationAddEditForm.value.UserId[0];
          _delegationDetails.FullName = this._selectedDeletedUser[0].Text;
          if (this._delegationAddEditForm.get('ManagerId').value[0] == undefined) {
            this._updateDelegationMessage = null;
            this._updateDelegationMessage = 'DELEGATION.Please_select_manager';
            this._changeDetector.markForCheck();
            this._customValid = false;
          } else {
            if (this._delegationAddEditForm.value.ManagerId[0].Value == undefined) {
              _delegationDetails.UserId = this._delegationAddEditForm.value.ManagerId[0];
            } else {
              _delegationDetails.UserId = this._delegationAddEditForm.value.ManagerId[0].Value;
            }
            this._delegationService.AddDelegation(_delegationDetails);
            this._onDelegationAddCancel.emit('cancel');
          }

        } else {
          _delegationDetails.DeligatedReadOnlyDE = this._delegationAddEditForm.value.DeligatedReadOnlyDE;
          _delegationDetails.DeligatedManageDE = this._delegationAddEditForm.value.DeligatedManageDE;
          _delegationDetails.DeligatedHA = this._delegationAddEditForm.value.DeligatedHA;
          _delegationDetails.Id = this._editDelegationDetails.Id;
          _delegationDetails.DeligatedUserId = this._editDelegationDetails.DeligatedUserId;
          _delegationDetails.UserId = this._editDelegationDetails.UserId;
          _delegationDetails.CreatedBy = this._editDelegationDetails.DeligatedUserId;

          _delegationDetails.CreatedOn = this._editDelegationDetails.CreatedOn;

          _delegationDetails.FirstName = this._editDelegationDetails.FirstName;
          _delegationDetails.FullName = this._editDelegationDetails.FirstName + ' ' + this._editDelegationDetails.LastName;
          _delegationDetails.LastName = this._editDelegationDetails.LastName;
          _delegationDetails.Email = this._editDelegationDetails.Email;
          this._delegationService.UpdateDelegation(_delegationDetails);
          this._onDelegationAddCancel.emit('cancel');
        }

      }


    }
  }
  //End of Private Methods

}
