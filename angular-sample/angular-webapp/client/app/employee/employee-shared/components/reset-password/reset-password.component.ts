import { FormBuilderService } from '../../../../shared/services/form-builder.service';
import { passwordModel } from '../../../../root-module/models/password';
import { AeClassStyle } from '../../../../atlas-elements/common/ae-class-style.enum';
import { LocaleService, TranslationService } from 'angular-l10n';
import { BaseComponent } from '../../../../shared/base-component';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewEncapsulation
} from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs/Rx';
import { Store } from '@ngrx/store';
import * as fromRoot from '../../../../shared/reducers/index';
import { isNullOrUndefined } from "util";
import { FormGroup, FormBuilder, Validators, FormControl } from "@angular/forms";
import { AeInputType } from "../../../../atlas-elements/common/ae-input-type.enum";
import { ResetPasswordVM } from "../../../../employee/administration/models/user-admin-details.model";
import { ManualResetPasswordAction } from "../../../../employee/actions/employee.actions";


@Component({
  selector: 'reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class ResetPasswordComponent extends BaseComponent implements OnInit, OnDestroy {

  // input 

  @Input('userId')
  get userId() {
    return this._userId;
  }
  set userId(val: string) {
    this._userId = val;
    this._cdRef.markForCheck();
  }

  @Output() cancel: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() update: EventEmitter<ResetPasswordVM> = new EventEmitter<ResetPasswordVM>();

  private _passwordStrength: any;
  private _errorList: any[];
  private _lightClass: AeClassStyle = AeClassStyle.Light;
  private _saveBtnClass: AeClassStyle;
  private _inputType: AeInputType = AeInputType.password;
  private _updateUserPasswordForm: FormGroup;
  private _showRequisities: boolean = false;
  private _submitted: boolean;
  private _samePassword: boolean;
  private _newPasswordValueChangeSubscription$: Subscription;
  private _maxlength: number = 20;
  private _userId: string;
  // Constructor
  constructor(protected _localeService: LocaleService, protected _translationService: TranslationService, private _fb: FormBuilder,
    protected _cdRef: ChangeDetectorRef, private _store: Store<fromRoot.State>, private _fbService: FormBuilderService) {
    super(_localeService, _translationService, _cdRef);
  }
  // End of constructor

  private _initForm() {
    this._updateUserPasswordForm = this._fb.group({
      newPassword: ['', [Validators.required, Validators.pattern(new RegExp("(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,20})"))]],
      confirmPassword: ['', Validators.required]
    }, { validator: this._matchingPasswords('newPassword', 'confirmPassword') });
  }

  fieldHasInvalidPassword(fieldName: string): boolean {
    return this._updateUserPasswordForm.get(fieldName).hasError('pattern');
  }

  fieldHasError(fieldName: string): boolean {
    return this._updateUserPasswordForm.get(fieldName).hasError('required') && (!this._updateUserPasswordForm.get(fieldName).pristine || this._submitted);
  }

  private _matchingPasswords(passwordKey: string, confirmPasswordKey: string) {
    return (_updateUserPasswordForm: FormGroup): { [key: string]: any } => {
      let password = _updateUserPasswordForm.controls[passwordKey];
      let confirmPassword = _updateUserPasswordForm.controls[confirmPasswordKey];
      if (password.value !== confirmPassword.value) {
        return {
          mismatchedPasswords: true
        };
      }
    }
  }

  onChangePasswordFormSubmit() {
    this._submitted = true;
    if (this._updateUserPasswordForm.valid) {
      let resetModel: ResetPasswordVM = new ResetPasswordVM();
      resetModel.IsEmailUser = false; // for no email users expected param is false
      resetModel.Email = '';
      resetModel.UserId = this._userId;
      resetModel.NewPassword = this._updateUserPasswordForm.get('newPassword').value;
      this.update.emit(resetModel);
    }

  }



  onChangePasswordCancel() {
    this.cancel.emit(false);
  }
  get UpdateUserPasswordForm() {
    return this._updateUserPasswordForm;
  }
  get ShowRequisities() {
    return this._showRequisities;
  }
  get Maxlength() {
    return this._maxlength;
  }
  get InputType() {
    return this._inputType;
  }
  get LightClass() {
    return this._lightClass;
  }
  get PasswordStrength() {
    return this._passwordStrength;
  }
  get samePassword(): boolean{
    return this._samePassword;
  }
  ngOnInit() {
    this._saveBtnClass = AeClassStyle.Light;
    this._initForm();
    this._newPasswordValueChangeSubscription$ = this._updateUserPasswordForm.get('newPassword').valueChanges.subscribe((value: string) => {
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

  ngOnDestroy(): void {
    if (this._newPasswordValueChangeSubscription$) {
      this._newPasswordValueChangeSubscription$.unsubscribe();
    }
  }
}
