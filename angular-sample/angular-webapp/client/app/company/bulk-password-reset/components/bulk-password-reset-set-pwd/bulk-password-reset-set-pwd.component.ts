import { AeClassStyle } from '../../../../atlas-elements/common/ae-class-style.enum';
import { AeInputType } from '../../../../atlas-elements/common/ae-input-type.enum';
import { isNullOrUndefined } from 'util';
import { ResetPasswordVM } from './../../models/reset-password-vm.model';
import { UserService } from './../../../../shared/services/user-services';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LocaleService, TranslationService } from 'angular-l10n';
import { BaseComponent } from '../../../../shared/base-component';
import { ChangeDetectionStrategy, ViewEncapsulation, ChangeDetectorRef, Component, OnDestroy, OnInit, EventEmitter, Output } from '@angular/core';
import { BehaviorSubject, Observable, Subject, Subscription } from 'rxjs/Rx';
import * as Immutable from 'immutable';
import { Store } from '@ngrx/store';
import * as fromRoot from '../../../../shared/reducers/index';

@Component({
  selector: 'bulk-password-reset-set-pwd',
  templateUrl: './bulk-password-reset-set-pwd.component.html',
  styleUrls: ['./bulk-password-reset-set-pwd.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush

})
export class BulkPasswordResetSetPwdComponent extends BaseComponent implements OnInit, OnDestroy {

  private _bulkResetForm: FormGroup;
  private _submitted: boolean;
  private _userIds: Array<any>;
  private _newPasswordValueChangeSubscription$: Subscription;
  private _showRequisities: boolean = false;
  private _errorList: any[];
  private _passwordStrength: any;
  private _samePassword: boolean;
  private _inputType: AeInputType = AeInputType.password;
  private _lightClass: AeClassStyle = AeClassStyle.Light;

  get bulkResetForm(){
    return this._bulkResetForm;
  }

  get inputType(){
    return this._inputType;
  }

  get samePassword(){
    return this._samePassword;
  }

  get showRequisities(){
    return this._showRequisities;
  }

  get passwordStrength(){
    return this._passwordStrength.class;
  }

  get passwordStrengthText(){
    return this._passwordStrength.Text;
  }

  get lightClass(){
    return this._lightClass;
  }

  get errorList(){
    return this._errorList;
  }

  constructor(
    protected _localeService: LocaleService,
    protected _translationService: TranslationService,
    protected _cdRef: ChangeDetectorRef,
    private _fb: FormBuilder,
    private _store: Store<fromRoot.State>,
    private _userService: UserService) {
    super(_localeService, _translationService, _cdRef);
  }

  private _initForm() {
    this._bulkResetForm = this._fb.group({
      newPassword: ['', [Validators.required, Validators.pattern(new RegExp("(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,20})"))]],
      confirmPassword: ['', Validators.required]
    }, { validator: this._matchingPasswords('newPassword', 'confirmPassword') });
  }
  closeBulkPasswordResetForm($event) {
    this.onAeClose.emit(true);
  }
  fieldHasInvalidPassword(fieldName: string): boolean {
    return this._bulkResetForm.get(fieldName).hasError('pattern');
  }

  fieldHasError(fieldName: string): boolean {
    return this._bulkResetForm.get(fieldName).hasError('required') && (!this._bulkResetForm.get(fieldName).pristine || this._submitted);
  }

  private _matchingPasswords(passwordKey: string, confirmPasswordKey: string) {
    return (_bulkResetForm: FormGroup): { [key: string]: any } => {
      let password = _bulkResetForm.controls[passwordKey];
      let confirmPassword = _bulkResetForm.controls[confirmPasswordKey];
      if (password.value !== confirmPassword.value) {
        return {
          mismatchedPasswords: true
        };
      }
    }
  }

  onChangePasswordFormSubmit() {
    this._submitted = true;
    if (this._bulkResetForm.valid) {
      let resetModel: ResetPasswordVM = new ResetPasswordVM();
      resetModel.ids = this._userIds;
      resetModel.password = this._bulkResetForm.get('newPassword').value;
      this.onSetManualPassword.emit(resetModel);
    }
  }


  private _onChangePasswordCancel() {
    this._bulkResetForm.get('newPassword').setValue(null);
  }


  // Public Output bindings   
  @Output()
  onSetManualPassword: EventEmitter<ResetPasswordVM> = new EventEmitter<ResetPasswordVM>();

  @Output()
  onAeClose: EventEmitter<boolean> = new EventEmitter<boolean>();

  // End of Public Output bindings

  ngOnInit() {
    this._initForm();

    this._newPasswordValueChangeSubscription$ = this._bulkResetForm.get('newPassword').valueChanges.subscribe((value: string) => {
      if (value.length > 0) {
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
          this._errorList.push('CHANGEPASSWORD.PSW_STRENGTH.CHAR_LENGTH');
        }
        if (!(/(?=.*[a-z])/.test(p))) {
          this._errorList.push('CHANGEPASSWORD.PSW_STRENGTH.LOWER_CASE');
        }
        if (!(/(?=.*[A-Z])/.test(p))) {
          this._errorList.push('CHANGEPASSWORD.PSW_STRENGTH.CAPITAL_LETTER');
        }
        if (p.search(/[0-9]/) < 0) {
          this._errorList.push('CHANGEPASSWORD.PSW_STRENGTH.ONE_DIGIT');
        }
        if (!(/([\\!@#\$%({}<\>._\-=\s+|?><,\^&\*~)])/.test(p))) {
          this._errorList.push('CHANGEPASSWORD.PSW_STRENGTH.SPECIAL_CHARACTER');
        }
      }

      switch (this._errorList.length) {
        case 0:
          {
            this._passwordStrength.Text = "CHANGEPASSWORD.STRONG";
            this._passwordStrength.class = "strong";

            break;
          }
        case 1: {
          this._passwordStrength.Text = "CHANGEPASSWORD.GOOD";
          this._passwordStrength.class = "good";
          break;
        }
        case 2: {
          this._passwordStrength.Text = "CHANGEPASSWORD.MEDIUM";
          this._passwordStrength.class = "medium";
          break;
        }
        case 3: {
          this._passwordStrength.Text = "CHANGEPASSWORD.WEAK";
          this._passwordStrength.class = "weak";

          break;
        }
        case 4: {
          this._passwordStrength.Text = "CHANGEPASSWORD.VERYWEAK";
          this._passwordStrength.class = "low";
          break;
        }
        case 5: {
          this._passwordStrength.Text = "CHANGEPASSWORD.INVALID";
          this._passwordStrength.class = "low";
          break;
        }
      }
    });
  }
  ngOnDestroy() {
    if (this._newPasswordValueChangeSubscription$) {
      this._newPasswordValueChangeSubscription$.unsubscribe();
    }
  }

}
