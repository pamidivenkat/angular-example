import { EnumHelper } from './../../../../shared/helpers/enum-helper';
import { SystemTenantId } from './../../../../shared/app.constants';
import { RouteParams } from './../../../../shared/services/route-params';
import { AeDatasourceType } from '../../../../atlas-elements/common/ae-datasource-type';
import { UserService } from '../../services/user.service';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewEncapsulation,
  OnChanges,
  OnDestroy
} from '@angular/core';
import { AeClassStyle } from '../../../../atlas-elements/common/ae-class-style.enum';
import { CommonValidators } from '../../../../shared/validators/common-validators';
import { subscribeOn } from 'rxjs/operator/subscribeOn';
import { Subscribable } from 'rxjs/Observable';
import { AeInputType } from '../../../../atlas-elements/common/ae-input-type.enum';
import { BaseComponent } from '../../../../shared/base-component';
import { ClaimsHelperService } from '../../../../shared/helpers/claims-helper';
import { AeSelectItem } from '../../../../atlas-elements/common/models/ae-select-item';
import { emailFieldValidator, onlySpaceValidator, nameFieldValidator } from '../../../../employee/common/employee-validators';
import { AdviceCardAssignment, User, UserArea } from '../../models/user.model';
import { Document } from '../../../../document/models/document';

import { UserSnackbarMessage } from '../../common/user-snackbar-message';
import { ObjectHelper } from '../../../../shared/helpers/object-helper';
import { MessengerService } from '../../../../shared/services/messenger.service';
import * as errorActions from '../../../../shared/actions/error.actions';
import { AtlasApiError } from '../../../../shared/error-handling/atlas-api-error';
import { MessageEvent } from '../../../../atlas-elements/common/models/message-event.enum';

import * as fromRoot from '../../../../shared/reducers/index';
import * as Immutable from 'immutable';
import { BehaviorSubject, Observable, Subscription } from 'rxjs/Rx';
import { isNullOrUndefined } from 'util';
import { Store } from '@ngrx/store';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LocaleService, TranslationService } from 'angular-l10n';
import { FileUploadService } from '../../../../shared/services/file-upload.service';
import { FileResult } from '../../../../atlas-elements/common/models/file-result';
import { Md5 } from 'ts-md5/dist/md5';


@Component({
  selector: 'user-add-update-form',
  templateUrl: './user-add-update-form.component.html',
  styleUrls: ['./user-add-update-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class UserAddUpdateFormComponent extends BaseComponent implements OnInit {
  //private field   
  private _userForm: FormGroup;
  private _submitted: boolean = false;
  private _addOrUpdateActionType: string = "";
  private _lightClass: AeClassStyle = AeClassStyle.Light;
  private _vm: User;
  private _adviceCardListStatusSubscription: Subscription;
  private _adviceCardListDataSubscription: Subscription;
  private _adviceCardOptionList: Immutable.List<AeSelectItem<string>>;
  private _adviceCardOptionItems: Array<any>;
  private _dataSouceType: AeDatasourceType;
  private _popHeadingText: string;
  private _popButtonText: string;
  private _samePassword: boolean;
  private _passwordStrength: any;
  private _errorList: any[];
  private _passwordChangeSubscription$: Subscription;
  private _newPasswordValueChangeSubscription$: Subscription;
  private _showRequisities: boolean = false;
  private _ctrlTypePassword: AeInputType = AeInputType.password;
  private _ctrlTypeSearch: AeInputType = AeInputType.search;
  private _isUserNameValid: boolean = true;
  private _validateUserNameSubscription: Subscription;
  private _EmailAvailabilitySubscription: Subscription;
  private _selectedFile: FileResult;
  private _imgPreviewSrcUrl: string = '';
  private _showFilePreview: boolean = false;
  private _cntrlTypeHidden: AeInputType = AeInputType.hidden;
  private _objectType: string = "Signature";
  private _selectedAdviceCards: Array<string>;
  private _adviceCardAssignments: Array<AdviceCardAssignment>;
  private _saveAdviceCardAssignments: Subscription;
  private _isEmailAvailable: boolean = false;
  private _isFileChange: boolean = false;
  private _areaItems: Immutable.List<AeSelectItem<number>>;

  get areaItems(): Immutable.List<AeSelectItem<number>> {
    return this._areaItems;
  }

  @Input('addOrUpdateActionType')
  set addOrUpdateActionType(val: string) {
    this._addOrUpdateActionType = val;
  }
  get addOrUpdateActionType() {
    return this._addOrUpdateActionType;
  }
 

  @Input('vm')
  set vm(value: User) {
    this._vm = value;
  }
  get vm() {
    return this._vm;
  }
  

  @Output('onCancel') _onCancel: EventEmitter<string>;
  @Output('OnSaveComplete') _OnSaveComplete: EventEmitter<boolean>;

  //constructor start
  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _cdRef: ChangeDetectorRef
    , private _fb: FormBuilder
    , private _userService: UserService
    , private _store: Store<fromRoot.State>
    , private _claimsHelper: ClaimsHelperService
    , private _fileUploadService: FileUploadService
    , private _messenger: MessengerService
    , private _routeParamsService: RouteParams
  ) {
    super(_localeService, _translationService, _cdRef);
    this._onCancel = new EventEmitter<string>();
    this._OnSaveComplete = new EventEmitter<boolean>();
    this._dataSouceType = AeDatasourceType.Local;
    this._isUserNameValid = true;
  }

  ngOnInit() {
    this._initForm();
    let userAddOrUpdateCompleted = this._store.let(fromRoot.getUserAddOrUpdateCompleted);
    let currentAddOrUpdateItem = this._store.let(fromRoot.CurrentUser);
    this._areaItems = Immutable.List(EnumHelper.getAeSelectItems(UserArea));
    let saveACNSubscription$ = Observable.combineLatest(currentAddOrUpdateItem, userAddOrUpdateCompleted, (currentUser, addOrUpdateUserStatus) => {
      if (!isNullOrUndefined(currentUser) && addOrUpdateUserStatus) {
        let userId = currentUser.Id;
        this._adviceCardAssignments = [];
        if (isNullOrUndefined(this._selectedAdviceCards) || this._selectedAdviceCards.length == 0) {
          this._adviceCardAssignments.push(new AdviceCardAssignment(userId, null));
        }
        else {
          this._selectedAdviceCards.forEach(item => {
            this._adviceCardAssignments.push(new AdviceCardAssignment(userId, item));
          });
        }
        this._userService._saveAssignments(this._adviceCardAssignments);
      }
    });

    this._saveAdviceCardAssignments = saveACNSubscription$.subscribe();

    //Subscription to get AdviceCards List
    this._adviceCardListDataSubscription = this._store.let(fromRoot.getAdviceCardNumberOptionListData).subscribe((res) => {
      if (isNullOrUndefined(res)) {
        this._userService._loadAdviceCardNumberOption();
      }
      else {
        this._adviceCardOptionItems = res;
      }
    });

    //Subscription to get AdviceCards List
    this._validateUserNameSubscription = this._store.let(fromRoot.validateUserName).subscribe((res) => {
      if (!isNullOrUndefined(res)) {
        this._isUserNameValid = res;
        this._cdRef.markForCheck();
      }
    });
    this._EmailAvailabilitySubscription = this._store.let(fromRoot.getEmailAvailability).subscribe((res) => {
      if (!isNullOrUndefined(res)) {
        this._isEmailAvailable = res;
        this._cdRef.markForCheck();
      }
    });

    //populate AdviceCards selected vlaue Signature in Update case
    if (this._addOrUpdateActionType === 'UPDATE') {
      let selectedAdviceCards = this._vm.AdviceCards.map(item => {
        return { CardNumber: item['CardNumber'], Id: item['Id'] };
      })
      this._userForm.get('AdviceCards').setValue(selectedAdviceCards);
      this._popHeadingText = 'UPDATE_POP_UP_HEADING';
      this._popButtonText = 'BUTTONS.UPDATE';
      if (!isNullOrUndefined(this._vm.Signature)) {
        this._imgPreviewSrcUrl = this._getImagePreviewUrl(this._vm.Signature);
        this._userForm.get("Signature").setValue(this._vm.Signature);
        this._showFilePreview = true;
      }
    } else {
      this._vm.Id = Md5.hashAsciiStr(this._addOrUpdateActionType).toString();
      this._popHeadingText = 'ADD_POP_UP_HEADING';
      this._popButtonText = 'BUTTONS.ADD';
    }

    //new password validation Subscription start
    this._newPasswordValueChangeSubscription$ = this._userForm.get('Password').valueChanges.subscribe((value: string) => {
      if (!isNullOrUndefined(value) && value.length > 0) {
        this._showRequisities = true;
        this._samePassword = false;
      }
      else {
        this._showRequisities = false;
      }
      if (!isNullOrUndefined(value)) {
        this._passwordStrength = {};
        this._errorList = [];
        var p = null;
        p = value;
        if (!(p.length <= 20 && p.length >= 8)) {
          this._errorList.push("Must be between 8 and 20 characters in length.");
        }
        if (!(/(?=.*[a-z])/.test(p))) {
          this._errorList.push("Must contain at least one lower-case letter (a-z).");
        }
        if (!(/(?=.*[A-Z])/.test(p))) {
          this._errorList.push("Must contain at least one capital letter (A-Z).");
        }
        if (p.search(/[0-9]/) < 0) {
          this._errorList.push("Must contain at least one digit (0-9).");
        }
        if (!(/([\\!@#\$%({}<\>._\-=\s+|?><,\^&\*~)])/.test(p))) {
          this._errorList.push("Must contain at least one special character (e.g. @%*!).");
        }

        switch (this._errorList.length) {
          case 0:
            {
              this._passwordStrength.Text = "Strong";
              this._passwordStrength.class = "strong";

              break;
            }
          case 1: {
            this._passwordStrength.Text = "Good";
            this._passwordStrength.class = "good";
            break;
          }
          case 2: {
            this._passwordStrength.Text = "Medium";
            this._passwordStrength.class = "medium";
            break;
          }
          case 3: {
            this._passwordStrength.Text = "Weak";
            this._passwordStrength.class = "weak";

            break;
          }
          case 4: {
            this._passwordStrength.Text = "Very Weak";
            this._passwordStrength.class = "low";
            break;
          }
          case 5: {
            this._passwordStrength.Text = "Invalid";
            this._passwordStrength.class = "low";
            break;
          }
        }
      }
    });
    // new password validation Subscription end

  }


  // Private methods start
  private _initForm() {
    //pupulate update data condition
    this._vm = this._addOrUpdateActionType === 'UPDATE' ? this._vm : new User(); //empty update modal
    this._userForm = this._fb.group({
      FirstName: [{ value: this._vm.FirstName ? this._vm.FirstName : '', disabled: false }, [Validators.required, nameFieldValidator]],
      LastName: [{ value: this._vm.LastName ? this._vm.LastName : '', disabled: false }, [Validators.required, nameFieldValidator]],
      HasEmail: [{ value: this._vm.Id ? (this._vm.HasEmail ? this._vm.HasEmail : false) : true, disabled: false }],
      UserName: [{ value: this._vm.UserName ? this._vm.UserName : null, disabled: false }],
      Password: [{ value: this._vm.Password ? this._vm.Password : '', disabled: false }],
      ConfirmPassword: [{ value: this._vm.ConfirmPassword ? this._vm.ConfirmPassword : '', disabled: false }],
      Email: [{ value: this._vm.Email ? this._vm.Email : '', disabled: false }],
      AdviceCards: [{ value: this._vm.AdviceCards ? this._vm.AdviceCards : '', disabled: false }],
      Telephone: [{ value: this._vm.Telephone ? this._vm.Telephone : '', disabled: false }, [CommonValidators.phoneUK()]],
      Signature: [{ value: this._vm.Signature ? this._vm.Signature : '', disabled: false }]
    }, { validator: this._matchingPasswords('Password', 'ConfirmPassword') });
    if (this.isCitationUser()) {
      let additionalGroup: FormGroup = this._fb.group({
        SalesforceUserId: [{ value: this._vm.SalesforceUserID ? this._vm.SalesforceUserID : '', disabled: false }, [Validators.required]],
        Area: [{ value: this._vm.Area ? this._vm.Area : '', disabled: false }],
        Qualifications: [{ value: this._vm.Qualifications ? this._vm.Qualifications : '', disabled: false }]
      });
      Object.keys(additionalGroup.controls).forEach(key => {
        let ctrl = additionalGroup.get(key);
        this._userForm.addControl(key, ctrl);
      });
    }

    if (this._vm.HasEmail) {
      this._userForm.get('Email').setValidators([Validators.required, CommonValidators.email()]);
    } else {
      this._userForm.get('UserName').setValidators([Validators.required, Validators.minLength(6), Validators.maxLength(24), Validators.pattern(new RegExp('^([a-zA-Z0-9]+)$'))]);
      this._userForm.get('Password').setValidators([Validators.required, Validators.pattern(new RegExp("(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,20})"))]);
      this._userForm.get('ConfirmPassword').setValidators([Validators.required]);
    }
  }
  public isCitationUser(): boolean {
    return this._vm.CompanyId ? this._vm.CompanyId.toLowerCase() == SystemTenantId.toLowerCase() : (this._claimsHelper.getCompanyId().toLowerCase() == SystemTenantId.toLowerCase() && (!this._routeParamsService.Cid || this._routeParamsService.Cid == SystemTenantId));
  }
  onEmailValueChanged(value: any) {
    let emailControl = this._userForm.get('Email');
    let userNameControl = this._userForm.get('UserName');
    let passwordControl = this._userForm.get('Password');
    let confirmPasswordControl = this._userForm.get('ConfirmPassword');

    if (!value) {
      userNameControl.setValidators([Validators.required, Validators.minLength(6), Validators.maxLength(24), Validators.pattern(new RegExp('^([a-zA-Z0-9]+)$'))]);
      passwordControl.setValidators([Validators.required, Validators.pattern(new RegExp("(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,20})"))]);
      confirmPasswordControl.setValidators([Validators.required]);
      emailControl.setValidators(null);
    } else {
      userNameControl.setValidators(null);
      passwordControl.setValidators(null);
      confirmPasswordControl.setValidators(null);
      emailControl.setValidators([Validators.required, CommonValidators.email()]);
    }

    userNameControl.updateValueAndValidity(); //Need to call this to trigger a update
    passwordControl.updateValueAndValidity();
    confirmPasswordControl.updateValueAndValidity();
    emailControl.updateValueAndValidity();
  }

  fieldHasInvalidPattern(fieldName: string): boolean {
    return this._userForm.get(fieldName).hasError('pattern');
  }

  private _matchingPasswords(passwordKey: string, confirmPasswordKey: string) {
    return (_userForm: FormGroup): { [key: string]: any } => {
      let password = _userForm.controls[passwordKey];
      let confirmPassword = _userForm.controls[confirmPasswordKey];
      if (password.value !== confirmPassword.value) {
        return {
          mismatchedPasswords: true
        };
      }
    }
  }

  // Disable 'had email' switch when user has email in update state.
  isDisabled(): boolean {
    if (this._addOrUpdateActionType === 'UPDATE' && this._vm.HasEmail) {
      return true;
    }
    return false;
  }

  /**
   * Validate require field.
   * @private
   * @param {string} fieldName
   * @returns {boolean}
   * 
   * @memberOf UserAddUpdateFormComponent
   */
  fieldHasRequiredError(fieldName: string): boolean {
    if ((this._userForm.get(fieldName).hasError('required')) && (!this._userForm.get(fieldName).pristine || this._submitted)) {
      return true;
    }
    return false;
  }

  fieldHasError(fieldName: string): boolean {
    if (this._userForm.get(fieldName).hasError('email') && (!this._userForm.get(fieldName).pristine || this._submitted)) {
      return true;
    }
    if (this._userForm.get(fieldName).hasError('phoneUK') && (!this._userForm.get(fieldName).pristine || this._submitted)) {
      return true;
    }
    return false;
  }

  fieldHasInvalidName(fieldName: string): boolean {
    return this._userForm.get(fieldName).getError('validName') == false;
  }

  private _isFileSelected(): boolean {
    return isNullOrUndefined(this._selectedFile);
  }

  fieldHasMaxError(fieldName: string): boolean {
    return this._userForm.get(fieldName).hasError('maxlength');
  }

  fieldHasMinError(fieldName: string): boolean {
    return this._userForm.get(fieldName).hasError('minlength');
  }

  hasEmail(): boolean {
    if (this._userForm.get('HasEmail').value === true) {
      this.onEmailValueChanged(true);
      return true;
    } else {
      return false;
    }
  }
  private _checkEmailAvailability() {
    if (this._addOrUpdateActionType === 'UPDATE' && this._vm.Email === this._userForm.get('Email').value) {
      this._isEmailAvailable = true;
    }
    return !this._isEmailAvailable;
  }


  /**
 * Submit form(add/update)
 * 
 * @private
 * @param {any} e
 * 
 * @memberOf UserAddUpdateFormComponent
 */
  onFormSubmit(e) {
    this._submitted = true;
    if (this._userForm.valid) {
      if (this._addOrUpdateActionType === 'UPDATE' && this._vm.UserName === this._userForm.get('UserName').value) {
        this._isUserNameValid = true;
      }
      if (!this._userForm.get('HasEmail').value && !this._isUserNameValid) {
        return false;
      } else if (this._userForm.get('HasEmail').value && !this._isEmailAvailable) {
        return false;
      }

      if (this._userForm.get('HasEmail').value && !this._isEmailAvailable) {
        return false;
      }

      let _formDataToSave: User = this._userForm.value;

      if (this._addOrUpdateActionType === 'ADD') {
        if (this._userForm.get('HasEmail').value) {
          //remove username properties, keep only email
          if (_formDataToSave.hasOwnProperty('UserName')) {
            delete _formDataToSave['UserName'];
          }

          if (_formDataToSave.hasOwnProperty('Password')) {
            delete _formDataToSave['Password'];
          }

          if (_formDataToSave.hasOwnProperty('ConfirmPassword')) {
            delete _formDataToSave['ConfirmPassword'];
          }

        } else {
          //keep username properties, remove email
          if (_formDataToSave.hasOwnProperty('Email'))
            delete _formDataToSave['Email'];
        }

        this._userService._createUser(_formDataToSave); //save action
      } else {
        _formDataToSave['Id'] = this._vm.Id; //append Id

        //Update all data from form to existing object, we need whole user object to update.
        Object.assign(this._vm, _formDataToSave);
        this._userService._updateUser(this._vm); //update action

      }
      this._OnSaveComplete.emit(true); //emit to parent component
      this._userForm.reset(); //clear form.
    }
  }

  /**
  * on slide-out pop cancel
  * @private
  * @param {any} e 
  * 
  * @memberOf UserAddUpdateFormComponent
  */
  onFormClosed(e) {
    this._userForm.reset(); //clear form.
    this._onCancel.emit('add');
  }

  onUserNameChange($event: any) {
    if (this._userForm.controls['UserName'].valid) {
      this._userService._validateUserName($event.event.target.value); //dispatch action to load
    }
  }

  onEmailChange($event: any) {
    if (this._userForm.controls['Email'].valid) {
      this._userService._validateEmail($event.event.target.value);
    }
  }

  onAdviceCardNumberChanged($event: any) {
    this._selectedAdviceCards = [];
    $event.map((selectItem => this._selectedAdviceCards.push(selectItem.Value)));
  }

  private _getImagePreviewUrl(fileId: string) {
    if (isNullOrUndefined(fileId))
      return null;
    return this._routeParamsService.Cid ? `/filedownload?documentId=${fileId}&cid=${this._routeParamsService.Cid}` : `/filedownload?documentId=${fileId}`;
  }

  onFilesSelected($event: FileResult[]) {
    this._selectedFile = $event[0];
    if (!isNullOrUndefined(this._selectedFile) && this._selectedFile.isValid) {
      let vm = ObjectHelper.createInsertInProgressSnackbarMessage(this._objectType, this._selectedFile.file.name);
      this._messenger.publish('snackbar', vm);
      this._isFileChange = true;
      let _documentToSave: Document = Object.assign({}, new Document());
      _documentToSave.LastModifiedDateTime = this._selectedFile.file.lastModifiedDate;
      _documentToSave.Category = 0;
      _documentToSave.FileName = this._selectedFile.file.name;
      _documentToSave.FileNameAndTitle = this._selectedFile.file.name;
      this._fileUploadService.Upload(_documentToSave, this._selectedFile.file).then((response: any) => {
        if (!isNullOrUndefined(response)) {
          let vm = ObjectHelper.createInsertCompleteSnackbarMessage(this._objectType, this._selectedFile.file.name);
          this._messenger.publish('snackbar', vm);
          this._imgPreviewSrcUrl = this._getImagePreviewUrl(response.Id);
          this._userForm.get("Signature").setValue(response.Id);
          this._showFilePreview = true;
          this._cdRef.markForCheck();
        }
      }, (error: string) => {
        new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Create, 'Signature', this._selectedFile.file.name));
      });
    }
  }

  OnDestroy() {
    if (this._adviceCardListStatusSubscription)
      this._adviceCardListStatusSubscription.unsubscribe();
    if (this._adviceCardListDataSubscription)
      this._adviceCardListDataSubscription.unsubscribe();
    if (this._passwordChangeSubscription$)
      this._passwordChangeSubscription$.unsubscribe();
    if (this._newPasswordValueChangeSubscription$)
      this._newPasswordValueChangeSubscription$.unsubscribe();
    if (this._validateUserNameSubscription)
      this._validateUserNameSubscription.unsubscribe();
    if (this._saveAdviceCardAssignments) {
      this._saveAdviceCardAssignments.unsubscribe();
    }
    if (this._EmailAvailabilitySubscription)
      this._EmailAvailabilitySubscription.unsubscribe();
  }

  get lightClass() {
    return this._lightClass;
  }

  get isUserNameValid() {
    return this._isUserNameValid;
  }

  get showRequisities() {
    return this._showRequisities;
  }

  get showFilePreview() {
    return this._showFilePreview;
  }

  get ctrlTypePassword() {
    return this._ctrlTypePassword;
  }

  get passwordStrength() {
    return this._passwordStrength;
  }

  get userForm() {
    return this._userForm;
  }

  get imgPreviewSrcUrl() {
    return this._imgPreviewSrcUrl;
  }

  get adviceCardOptionItems() {
    return this._adviceCardOptionItems;
  }

  get dataSouceType() {
    return this._dataSouceType;
  }

  get cntrlTypeHidden() {
    return this._cntrlTypeHidden;
  }

  get ctrlTypeSearch() {
    return this._ctrlTypeSearch;
  }

  get popHeadingText() {
    return this._popHeadingText;
  }
  get popButtonText() {
    return this._popButtonText;
  }
}
