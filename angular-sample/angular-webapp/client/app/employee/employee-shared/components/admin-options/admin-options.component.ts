import { Component, OnInit, ChangeDetectionStrategy, ViewEncapsulation, ChangeDetectorRef, Input, EventEmitter, Output, OnDestroy } from '@angular/core';
import { BaseComponent } from '../../../../shared/base-component';
import { LocaleService, TranslationService } from "angular-l10n";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Store } from "@ngrx/store";
import { ClaimsHelperService } from '../../../../shared/helpers/claims-helper';
import * as fromRoot from '../../../../shared/reducers';
import { AdminOptions, UserAdminDetails, UserCreateMode } from '../../../../employee/administration/models/user-admin-details.model';
import { isNullOrUndefined } from "util";
import { EmployeeInformation } from '../../../../employee/models/employee-information';
import { ActivatedRoute, Route, Router } from "@angular/router";
import { User } from '../../../../shared/models/user';
import { ObjectHelper } from '../../../../shared/helpers/object-helper';
import { MessengerService } from '../../../../shared/services/messenger.service';
import { EmployeeOptionsUpdateAction, LoadUnAssociatedUsersAction } from '../../../../employee/actions/employee.actions';
import { Subscription, Observable, Subject } from "rxjs/Rx";
import * as Immutable from 'immutable';
import { AeSelectItem } from '../../../../atlas-elements/common/models/ae-select-item';
import { extractUserCreationModes } from '../../../../employee/common/extract-helpers';
import { AtlasApiRequestWithParams, AtlasParams } from '../../../../shared/models/atlas-api-response';
import { SortDirection } from '../../../../atlas-elements/common/models/ae-sort-model';
import { emailFieldValidator, userNameFieldValidator, passwordPatternValidator, userNameMaxLengthValidator, PasswordValidation } from '../../../../employee/common/employee-validators';
import { AeInputType } from '../../../../atlas-elements/common/ae-input-type.enum';
import { EmployeeAdminService } from '../../../../employee/administration/services/employee-admin.service';
import { BehaviorSubject } from 'rxjs/Rx';
import { AeClassStyle } from './../../../../atlas-elements/common/ae-class-style.enum';
import { AeDatasourceType } from './../../../../atlas-elements/common/ae-datasource-type';
import { StringHelper } from '../../../../shared/helpers/string-helper';

@Component({
  selector: 'admin-options',
  templateUrl: './admin-options.component.html',
  styleUrls: ['./admin-options.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class AdminOptionsComponent extends BaseComponent implements OnInit, OnDestroy {
  //private fields
  _isFormValid: boolean = true;
  private _OptionsForm: FormGroup;
  private _showManageNoEmailUsers: boolean = false;
  private _isNew: boolean = false;
  _adminOptionsVM: AdminOptions;
  private _employeeInformation: EmployeeInformation;
  private _employeeAdminDetails: UserAdminDetails;
  private _usersListToAssociate: BehaviorSubject<User[]> = new BehaviorSubject<User[]>([]);
  private _allUnAssociatedUsers: User[];
  private _isSaved: boolean = false;// remove this if not using
  private _optionsChanged: boolean = false; // remove this if not using

  private _userCreateModes: Immutable.List<AeSelectItem<number>>;
  private _differentEmails: Immutable.List<AeSelectItem<number>>;

  private _userNameErrorList: string[] = [];
  private _usersListToAssociateSubscription: Subscription;
  private _inputType: AeInputType = AeInputType.password;
  private _originalHasUserData: boolean = false;
  private _originalHasEmail: boolean = false;
  private _showWithoutEmailWithUserConfirmDialog: boolean = false;
  private _showWithDifferentEmailaddressConfirmDialog: boolean = false;
  private _showEmployeesWithNoemailConfirmDialog: boolean = false;
  private _defaultEmailToSelect: number = 1;
  private _employeeFullName: string;
  private _employeeFullNameSubscription: Subscription;
  private _isFormSubmit: boolean = false;
  _isFormSubmitFromOutside: BehaviorSubject<boolean> = new BehaviorSubject(false);
  private _isFormSubmitFromOutsideSubscription: Subscription;
  private _originalNoEmailUser: boolean = false;
  _doSubmitForm: BehaviorSubject<boolean> = new BehaviorSubject(false);
  _latestEmail: string;
  private _localDsType: AeDatasourceType = AeDatasourceType.Local;

  @Input('employeeInformation')
  set employeeInformation(val: EmployeeInformation) {
    this._employeeInformation = val;
    this._initOptionsVM(val);
    this._initOptionsForm();
    this._cdRef.markForCheck();
  }
  get employeeInformation() {
    return this._employeeInformation;
  }
 

  @Input('isNew')
  get isNew() {
    return this._isNew;
  }
  set isNew(val: boolean) {
    this._isNew = val;

  }

  @Input('employeeAdminDetails')
  set employeeAdminDetails(val: UserAdminDetails) {
    this._employeeAdminDetails = val;
    if (!isNullOrUndefined(val)) {
      this._adminOptionsVM.UserName = val.UserName;
      this._originalNoEmailUser = isNullOrUndefined(val.Email) || val.Email == '' ? true : false;
      //Checking page mode ADD/EDIT
      if ((!isNullOrUndefined(val)) && !isNullOrUndefined(val.Id)) {
        this._isNew = false;
      } else {
        this._isNew = true;
      }
      this._cdRef.markForCheck();
    }
  }
  get employeeAdminDetails() {
    return this._employeeAdminDetails;
  }
  
  get localDsType(): AeDatasourceType {
    return this._localDsType;
  }
  @Output()
  optionsModalToSave: EventEmitter<AdminOptions> = new EventEmitter<AdminOptions>();

  @Output()
  userSelect: EventEmitter<string> = new EventEmitter<string>();
  // constructor
  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _cdRef: ChangeDetectorRef
    , private _fb: FormBuilder
    , private _store: Store<fromRoot.State>
    , private _claimsHelper: ClaimsHelperService
    , private _router: Router
    , private _messenger: MessengerService
    , private _adminService: EmployeeAdminService) {
    super(_localeService, _translationService, _cdRef);
    if (isNullOrUndefined(this._adminOptionsVM)) {
      this._adminOptionsVM = new AdminOptions();
    }
    if (isNullOrUndefined(this._employeeAdminDetails)) {
      this._employeeAdminDetails = new UserAdminDetails();
    }
  }

  ngOnInit() {
    this._userCreateModes = extractUserCreationModes();
    if (this._isNew) {
      this._adminOptionsVM.HasEmail = true;
      this._cdRef.markForCheck();
    }
    this._setVisibilityAccess();
    this._initOptionsForm();

    this._employeeFullNameSubscription = this._store.let(fromRoot.getEmployeeFirstNameAndSurname).subscribe(name => {
      this._employeeFullName = name;
    });


    this._isFormSubmitFromOutsideSubscription = this._isFormSubmitFromOutside.subscribe(res => {
      if (res) {
        this._validateForm(true);
      }
    })

  }

  ngOnDestroy() {
    if (!isNullOrUndefined(this._employeeFullNameSubscription)) {
      this._employeeFullNameSubscription.unsubscribe();
    }
  }

  // private methods
  private _checkFormValidity() {
    if (this._OptionsForm.valid) {
      this._isFormValid = true;
    }
    else if (this._OptionsForm.get("CreateUser").value == false) {
      this._isFormValid = true;
    } else {
      this._isFormValid = false;
    }
  }

  private _initOptionsForm() {
    if (this.isNew && !isNullOrUndefined(this._adminOptionsVM)) {
      this._adminOptionsVM.HasEmail = true;
    }

    this._OptionsForm = this._fb.group({
      HasEmail: [{ value: this._adminOptionsVM.HasEmail, disabled: false }],
      HasUser: [{ value: this._adminOptionsVM.HasUser, disabled: this._getDisplayMode("HasUser") }],
      CreateUser: [{ value: false, disabled: false }],
      EmpEmailUser: [{ value: !isNullOrUndefined(this._adminOptionsVM.EmpEmailUser) ? this._adminOptionsVM.EmpEmailUser : null, disabled: false }],//2 v
      ExistingHasEmail: [{ value: false, disabled: false }],
      ExistingUserEmail: [{ value: '', disabled: false }],
      Email: [{ value: !isNullOrUndefined(this._adminOptionsVM.Email) ? this._adminOptionsVM.Email : '', disabled: false }], // 1v
      UserName: [{ value: !isNullOrUndefined(this._adminOptionsVM.UserName) ? this._adminOptionsVM.UserName : '', disabled: false }],//5 v
      UserCreateMode: [{ value: 0, disabled: false }],
      Password: [{ value: '', disabled: false }, [passwordPatternValidator]],//3 v
      ConfirmPassword: [{ value: '', disabled: false }, []],//2 v
    });
    this._validateFormchanges();
    this.configureValidations();
    this._cdRef.markForCheck();
  }

  /*
  *  To set the visibility of form fields by permissions
  * */

  private _validateFormchanges() {

    for (let name in this._OptionsForm.controls) {
      let control = this._OptionsForm.controls[name];
      control.valueChanges.subscribe(v => {
        this._adminOptionsVM[name] = v;
        if (this._isNew) {
          this.optionsModalToSave.emit(this._adminOptionsVM);
          this._checkFormValidity();

        }

        if (name === 'CreateUser') {
          this._createUserChange(v);
        }

      });
    }
  }
  private _setVisibilityAccess() {
    if (this._claimsHelper.canManageNoEmailUsers()) {
      this._showManageNoEmailUsers = true;
    }
    this._cdRef.markForCheck();
  }

  private _getDisplayMode(fieldName: string): boolean {
    switch (fieldName.toLowerCase()) {
      case 'hasemail':
        {
          return this._adminOptionsVM.HasEmail ? true : false;
        }
      case 'hasuser':
        {
          return this._adminOptionsVM.UserName ? true : false;
        }
      default:
        return false;

    }
  }

  private _initOptionsVM(empInfo: EmployeeInformation) {

    if (!isNullOrUndefined(empInfo)) {
      Object.keys(this._adminOptionsVM).forEach((keyName) => {
        if (Object.keys(empInfo).indexOf(keyName) != -1) {
          this._adminOptionsVM[keyName] = empInfo[keyName];
        }
      });
      this._adminOptionsVM.ExistingHasEmail = empInfo.HasEmail;
      this._originalHasUserData = empInfo.UserId ? true : false;

      if (empInfo.HasEmail) {
        this._adminOptionsVM.EmpEmailUser = empInfo.Email;
        this._originalHasEmail = empInfo.HasEmail ? true : false;
        this._cdRef.markForCheck();
      }
      this._adminOptionsVM.HasUser = empInfo.UserId ? true : false;
    }
  }

  private _emplist() {
    this._router.navigate(['/employee/manage']);
  }

  private _createUserChange(val: any) {
    this.configureValidations();
    this._optionsChanged = true;
    this._getAllUnAssociatedUsers();
    if (val == true && this._adminOptionsVM.HasEmail && this._isNew) {
      this.validateEmployeeEmail();
    } else {
      this.validateUserNameOrEmail();
    }
  }

  private _setUserName = function () {
    if (this._adminOptionsVM.HasEmail == false && !this._adminOptionsVM.HasUser && this._showManageNoEmailUsers == true && this.isNew) {
      var fname = this._adminOptionsVM.FirstName ? this._adminOptionsVM.FirstName.replace(/[\s]/g, '') : '';
      var lname = this._adminOptionsVM.Surname ? this._adminOptionsVM.Surname.replace(/[\s]/g, '') : '';
      this._adminOptionsVM.UserName = fname + lname;
    }
  }

  private _getAllUnAssociatedUsers() {
    this._usersListToAssociateSubscription = this._store.let(fromRoot.getUnAssociatedUsers).subscribe((allUnAssociatedUsers) => {
      if (!isNullOrUndefined(allUnAssociatedUsers)) {
        this._allUnAssociatedUsers = allUnAssociatedUsers;
        let filteredUsers = this._adminOptionsVM.HasEmail ? allUnAssociatedUsers.filter(user => user.HasEmail == true) : allUnAssociatedUsers.filter(user => user.HasEmail === false);
        this._usersListToAssociate.next(filteredUsers);
        this._cdRef.markForCheck();
      } else {
        this._store.dispatch(new LoadUnAssociatedUsersAction());
      }
    });
  }

  private _saveOptionsForm() {
    // validate form
    if (this._OptionsForm.valid) {
      if (this._isFormValid) {
        this.optionsModalToSave.emit(this._adminOptionsVM);
        this._doSubmitForm.next(true);
      }
    }
  }

  private _getUserNamePlaceholder(): string {
    if (this._adminOptionsVM.HasEmail)
      return 'Email address';
    else return 'User name'
  }

  private _fieldHasRequiredError(fieldName: string): boolean {
    if (this._OptionsForm.get(fieldName).hasError('required') && (!this._OptionsForm.get(fieldName).pristine || this._isFormSubmit)) {
      return false;
    }
    return true;
  }

  private _fieldRequiredError(fieldName: string): boolean {
    if (this._OptionsForm.get(fieldName).hasError('required') && (!this._OptionsForm.get(fieldName).pristine || this._isFormSubmit)) {
      return true;
    }
    return false;
  }
  // end of private methods

  // public methods

  _validateForm(submit: boolean) {
    this._isFormSubmit = submit;
    if (!this._adminOptionsVM.HasEmail) {
      this._OptionsForm.patchValue({ EmpEmailUser: '' });
    }
    if (!this._showManageNoEmailUsers) {
      this._OptionsForm.patchValue({ EmpEmailUser: this._adminOptionsVM.Email });
    }
    if (this._adminOptionsVM.HasEmail) {
      this.fieldIsCustomRequired('EmpEmailUser');
    }
    if (this._adminOptionsVM.HasEmail && this._adminOptionsVM.CreateUser) {
      this.fieldIsCustomRequired('Email');
      if (this._adminOptionsVM.UserCreateMode == 1) {
        this.fieldIsCustomRequired('Password');
        this.fieldIsCustomRequired('ConfirmPassword');
      }
    }
    if (!this._adminOptionsVM.HasEmail && this._adminOptionsVM.CreateUser) {
      this.fieldIsCustomRequired('UserName');
      if (this._adminOptionsVM.UserCreateMode == 1) {
        this.fieldIsCustomRequired('Password');
        this.fieldIsCustomRequired('ConfirmPassword');
        this._OptionsForm.patchValue({ "EmpEmailUser": null });
        this.fieldIsCustomRequired('EmpEmailUser');
      }
    }
    this._cdRef.markForCheck();


    if (this._OptionsForm.valid) {
      this._isFormValid = true;
    }
    else if (this._OptionsForm.get("CreateUser").value == false) {
      this._isFormValid = true;
    } else {
      this._isFormValid = false;
    }
  }

  updateControlValidation(control) {
    if (!isNullOrUndefined(control)) {
      control.clearValidators();
      control.markAsPristine();
      control.markAsUntouched();
      control.updateValueAndValidity();
    }
  }

  configureValidations() {
    this._OptionsForm.clearValidators();
    let fieldsHasValidations = ['EmpEmailUser', 'ExistingUserEmail', 'Email', 'UserName', 'Password', 'ConfirmPassword'];
    fieldsHasValidations.forEach((name) => {
      let control = this._OptionsForm.get(name);
      if (!isNullOrUndefined(control)) {
        this.updateControlValidation(control);
      }
    });

    if (this.showManageNoEmailUsers &&
      !isNullOrUndefined(this.adminOptionsVM) &&
      this.adminOptionsVM.HasEmail &&
      this.isNew) {
      this._OptionsForm.get('EmpEmailUser').setValidators([Validators.required, emailFieldValidator]);
    }

    if (this.showManageNoEmailUsers &&
      !isNullOrUndefined(this.adminOptionsVM) &&
      this.adminOptionsVM.HasEmail &&
      !this.isNew) {
      this._OptionsForm.get('EmpEmailUser').setValidators([Validators.required, emailFieldValidator]);
    }

    if (!isNullOrUndefined(this.adminOptionsVM) &&
      this.adminOptionsVM.CreateUser) {
      if (this.isExistingUserCreateMode()) {
        this._OptionsForm.get('ExistingUserEmail').setValidators([Validators.required]);
      } else if (this.isNewUserCreateMode()) {
        this._OptionsForm.setValidators(Validators.compose([PasswordValidation.MatchPassword, PasswordValidation.IsEmailRequired, PasswordValidation.IsEmpEmailRequired, PasswordValidation.IsPasswordRequired, PasswordValidation.IsUserNameRequired]));
        if (this.adminOptionsVM.HasEmail) {
          this._OptionsForm.get('Email').setValidators([Validators.required, emailFieldValidator]);
        } else {
          this._OptionsForm.get('UserName').setValidators([Validators.required, userNameFieldValidator, userNameMaxLengthValidator]);
        }
      }
    }
  }

  saveForm(inputText?: string) {
    this._isFormSubmit = true;
    if (this.isExistingUserCreateMode() &&
      StringHelper.isNullOrUndefinedOrEmpty(this._adminOptionsVM.UserId)) {
      return;
    }


    if (!this._OptionsForm.valid) {
      return;
    }

    if (inputText === 'accepted') {
      if (this._showWithDifferentEmailaddressConfirmDialog && this._adminOptionsVM.EmpEmailUser != this._adminOptionsVM.Email) {
        this._adminOptionsVM.EmpEmailUser = !isNullOrUndefined(this._latestEmail) ? this._latestEmail : this._adminOptionsVM.Email;   // When no email selected/chnaged manually user email is the default one to consider
        this._adminOptionsVM.Email = !isNullOrUndefined(this._latestEmail) ? this._latestEmail : this._adminOptionsVM.Email;
      }
      if (this._showWithoutEmailWithUserConfirmDialog) {
        this._adminOptionsVM.Email = this._adminOptionsVM.EmpEmailUser;
        this._adminOptionsVM.UserName = this._adminOptionsVM.EmpEmailUser;
        this._adminOptionsVM.HasEmail = true;
        this._cdRef.markForCheck();
        this._showWithoutEmailWithUserConfirmDialog = false;
      }

      this._showWithDifferentEmailaddressConfirmDialog = false;
      this._showEmployeesWithNoemailConfirmDialog = false;
      this._saveOptionsForm();
      this._doSubmitForm.next(true);
    } else
      // popup validations 
      if (this._originalNoEmailUser || ((this._adminOptionsVM.HasEmail === true && this._adminOptionsVM.CreateUser && this._adminOptionsVM.UserCreateMode == 0 && isNullOrUndefined(this._adminOptionsVM.Email)))) {
        this._showWithoutEmailWithUserConfirmDialog = true;
        this._doSubmitForm.next(false);

      }
      else if ((this._originalHasEmail && (this._adminOptionsVM.Email !== this._adminOptionsVM.EmpEmailUser)) || (this._adminOptionsVM.Email !== this._adminOptionsVM.EmpEmailUser && this._adminOptionsVM.HasEmail && this._adminOptionsVM.CreateUser)) {
        this._showWithDifferentEmailaddressConfirmDialog = true;
        this._doSubmitForm.next(false);


      } else if (!this._adminOptionsVM.HasEmail) {
        this._showEmployeesWithNoemailConfirmDialog = true;
        this._doSubmitForm.next(false);

      }
      else {
        this._saveOptionsForm();
      }
    this._cdRef.markForCheck();
  }

  validateEmployeeEmail() {
    // Duplicate employee email
    if (this._adminOptionsVM.HasEmail && !this._originalHasEmail && !isNullOrUndefined(this._adminOptionsVM.EmpEmailUser) && this._adminOptionsVM.EmpEmailUser != '') {
      if ((this.isNewUserCreateMode() || !this._adminOptionsVM.CreateUser) && this._adminOptionsVM.HasEmail) {
        this._adminService._checkForEmployeeDuplicateEmail(this._adminOptionsVM.EmpEmailUser).subscribe(isDuplicate => {
          if (isDuplicate === true) {
            this._OptionsForm.controls['EmpEmailUser'].setErrors({
              "empEmailNotUnique": true
            });
            this._isFormValid = false;
            this._cdRef.markForCheck();
          }
          else {
            this._isFormValid = true;
          }
        });
      } else {
        this._isFormValid = true;
      }
    }
  }

  validateUserNameOrEmail() {
    // Duplicate username
    if (this._adminOptionsVM.CreateUser && !this._originalHasUserData && (!isNullOrUndefined(this._adminOptionsVM.UserName) && this._adminOptionsVM.UserName != '' && !this._adminOptionsVM.HasEmail) || (this._adminOptionsVM.HasEmail && !isNullOrUndefined(this._adminOptionsVM.Email))) {
      if (this.isNewUserCreateMode() && !this._adminOptionsVM.HasEmail) {
        this._adminService._checkUserNameAvailability(this._adminOptionsVM.UserName, this._adminOptionsVM.HasEmail).subscribe(res => {
          if (!isNullOrUndefined(res) && res.Availability === 0) {  // user name available
            this._isFormValid = true;
          } else {
            this._isFormValid = false;
            this._OptionsForm.controls['UserName'].setErrors({
              "userNameNotUnique": true
            });
            this._cdRef.markForCheck();
          }
        })
      } else if (this.isNewUserCreateMode() && this._adminOptionsVM.HasEmail) {
        if (this.validateEmail(this._adminOptionsVM.Email)) {
          this._adminService._checkUserNameAvailability(this._adminOptionsVM.Email, this._adminOptionsVM.HasEmail).subscribe(res => {
            if (!isNullOrUndefined(res) && res.Availability === 0) {  // email available
              this._isFormValid = true;
            } else {

              this._OptionsForm.controls['Email'].setErrors({
                "userEmailNotUnique": true
              });
              this._cdRef.markForCheck();
              this._isFormValid = false;
            }
          });
        }
      }

    }
  }

  validateEmail(email: string) {
    let pattern = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!isNullOrUndefined(email)) {
      if (!pattern.test(email)) {
        return false;
      }
    }
    return true;
  }

  hasEmailChange(val: any) {
    this._optionsChanged = true;
    this._adminOptionsVM.HasEmail = val;
    let users: any;
    if (val === true) {
      users = this._allUnAssociatedUsers ? this._allUnAssociatedUsers.filter(user => user.HasEmail === true) : [];
      this._usersListToAssociate.next(users);
    } else {
      users = this._allUnAssociatedUsers ? this._allUnAssociatedUsers.filter(user => user.HasEmail === false) : [];
      this._usersListToAssociate.next(users);
    }
    this.configureValidations();
    this._cdRef.markForCheck();
  }

  disableHasEmail(): boolean {
    if (this._isNew)
      return false;
    else
      return this._originalHasEmail && this._adminOptionsVM.HasEmail;
  }

  isFieldInvalid(fieldName: string): boolean {
    return !this._OptionsForm.get(fieldName).valid &&
      !this._OptionsForm.get(fieldName).pristine;
  }

  fieldIsCustomRequired(fieldName: string): boolean {
    if (this._OptionsForm.get(fieldName).value == '' && this._OptionsForm.get(fieldName).valid == false && (!this._OptionsForm.get(fieldName).pristine || this._isFormSubmit)) {
      return true;
    }
    else {
      return false;
    }
  }

  onEmpEmailUser(e: any): void {
    this._optionsChanged = true;
    this._isSaved = false;
  }

  fieldHasInvalidEmail(fieldName: string): boolean {
    return this._OptionsForm.get(fieldName).getError('validEmail') == false;
  }

  employeeDuplicateEmail(fieldName: string): boolean {
    return this._OptionsForm.get(fieldName).getError('empEmailNotUnique') == true;
  }

  disableCreateUser(): boolean {
    return this._originalHasUserData && this._adminOptionsVM.HasUser;
  }

  changeUserCreateMode(e) {
    if (!isNullOrUndefined(e)) {
      if (e.Value === 1) {
        this._adminOptionsVM.UserCreateMode = UserCreateMode.NewUser;
      } else if (e.Value === 0) {
        this._adminOptionsVM.UserCreateMode = UserCreateMode.ExistingUser;
      }
    }

    if (!isNullOrUndefined(e) && e.Value === 1 && this._adminOptionsVM.HasEmail) {
      // copy employee email to user email - new user
      this._adminOptionsVM.Email = this._adminOptionsVM.EmpEmailUser;
      this._OptionsForm.patchValue({
        'Email': this._adminOptionsVM.EmpEmailUser
      });
    }
    if (!isNullOrUndefined(e) && e.Value === 1 && !this._adminOptionsVM.HasEmail) {
      this._OptionsForm.patchValue({
        'UserName': this._employeeFullName
      });
    }
    this.configureValidations();
  }

  isExistingUserCreateMode(): boolean {
    return !isNullOrUndefined(this._adminOptionsVM) &&
      this._adminOptionsVM.CreateUser === true &&
      this._adminOptionsVM.UserCreateMode == UserCreateMode.ExistingUser;
  }

  fieldHasInvalidUserNameFormat(fieldName: string): boolean {
    return this._OptionsForm.get(fieldName).getError('validUserName') == false;
  }

  onUserChanged(e) {
    if (e) {
      this._adminOptionsVM.UserId = e[0].Value;

      this._adminOptionsVM.Email = e[0].Entity.HasEmail ? e[0].Text : null;

    } else {
      this._adminOptionsVM.UserId = null;
      this._adminOptionsVM.Email = '';
    }
    this._cdRef.markForCheck();
  }

  onUserUnSelect(e: any) {
    this._adminOptionsVM.UserId = e.Id;
  }

  isNewUserCreateMode(): boolean {
    return !isNullOrUndefined(this._adminOptionsVM) &&
      this._adminOptionsVM.CreateUser === true &&
      this._adminOptionsVM.UserCreateMode == UserCreateMode.NewUser;
  }

  userEmailDuplicate(fieldName: string): boolean {
    return this._OptionsForm.get(fieldName).getError('userEmailNotUnique') == true;
  }

  userNameDuplicate(fieldName: string): boolean {
    return this._OptionsForm.get(fieldName).getError('userNameNotUnique') == true;
  }

  fieldHasInvalidPasswordPattern(fieldName: string): boolean {
    return this._OptionsForm.get(fieldName).getError('validPassword') == false;
  }

  fieldMatchPasswords(fieldName: string): boolean {
    if (this._OptionsForm.get('ConfirmPassword').value != '' && this._OptionsForm.get('Password').value != '' && this._OptionsForm.get('Password').valid)
      return this._OptionsForm.get(fieldName).valid ? false : true;
    return false;
    // return this._OptionsForm.get(fieldName).getError('validPasswordMatch') == false;
  }

  /**
*  pop-up close event
* 
* @param {*} event
* 
* @memberOf AdminOptionsComponent
*/
  withoutEmailWithUserConfirmModalClosed(event: any) {
    this._showWithoutEmailWithUserConfirmDialog = false;
  }

  /**
*  pop-up close event
* 
* @param {*} event
* 
* @memberOf AdminOptionsComponent
*/
  withDifferentEmailsConfirmModalClosed(event: any) {
    this._showWithDifferentEmailaddressConfirmDialog = false;
  }

  getEmailaddresses(): Array<AeSelectItem<number>> {
    let list: Array<AeSelectItem<number>> = new Array<AeSelectItem<number>>();
    let item1: AeSelectItem<number> = new AeSelectItem<number>();
    item1.Text = this._adminOptionsVM.EmpEmailUser;
    item1.Value = 0;
    let item2: AeSelectItem<number> = new AeSelectItem<number>();
    item2.Text = this._adminOptionsVM.Email;
    item2.Value = 1;
    list.push(item1);
    list.push(item2);
    return list;
  }

  changeLatestEmailRadioButton(e) {
    this._latestEmail = e.Text;
    this._cdRef.markForCheck();
  }

  /**
*  pop-up close event
* 
* @private
* @param {*} event
* 
* @memberOf AdminOptionsComponent
*/
  employeesWithNoemailConfirmDialogConfirmModalClosed(event: any) {
    this._showEmployeesWithNoemailConfirmDialog = false;
  }

  get lightClass() {
    return AeClassStyle.Light;
  }

  get optionsForm(): FormGroup {
    return this._OptionsForm;
  }

  get showManageNoEmailUsers(): boolean {
    return this._showManageNoEmailUsers;
  }

  get adminOptionsVM(): AdminOptions {
    return this._adminOptionsVM;
  }

  get originalHasUserData(): boolean {
    return this._originalHasUserData;
  }

  get userCreateModes(): Immutable.List<AeSelectItem<number>> {
    return this._userCreateModes;
  }

  get usersListToAssociate(): BehaviorSubject<User[]> {
    return this._usersListToAssociate;
  }

  get userNameErrorList(): string[] {
    return this._userNameErrorList;
  }

  get inputType(): AeInputType {
    return this._inputType;
  }

  get optionsChanged(): boolean {
    return this._optionsChanged;
  }

  get showWithoutEmailWithUserConfirmDialog(): boolean {
    return this._showWithoutEmailWithUserConfirmDialog;
  }

  get showWithDifferentEmailaddressConfirmDialog(): boolean {
    return this._showWithDifferentEmailaddressConfirmDialog;
  }

  get defaultEmailToSelect(): number {
    return this._defaultEmailToSelect;
  }

  get showEmployeesWithNoemailConfirmDialog(): boolean {
    return this._showEmployeesWithNoemailConfirmDialog;
  }

  // end of public methods
}
