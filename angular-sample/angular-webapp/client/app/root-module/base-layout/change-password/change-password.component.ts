import { FormBuilderService } from '../../../shared/services/form-builder.service';
import { passwordModel } from '../../models/password';
import { AeClassStyle } from '../../../atlas-elements/common/ae-class-style.enum';
import { LocaleService, TranslationService } from 'angular-l10n';
import { BaseComponent } from '../../../shared/base-component';
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
import * as fromRoot from '../../../shared/reducers/index';
import { isNullOrUndefined } from "util";
import { FormGroup, FormBuilder, Validators, FormControl } from "@angular/forms";
import { PasswordResetAction, PasswordResetCancelAction } from '../../../shared/actions/user.actions';
import { AeInputType } from "../../../atlas-elements/common/ae-input-type.enum";


@Component({
  selector: 'change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class ChangePasswordComponent extends BaseComponent implements OnInit, OnDestroy {

  @Output() cancel: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() update: EventEmitter<boolean> = new EventEmitter<boolean>();

  private _passwordStrength: any;
  private _errorList: any[];
  private _lightClass: AeClassStyle = AeClassStyle.Light;
  private _saveBtnClass: AeClassStyle;
  private _inputType: AeInputType = AeInputType.password;
  private _updateUserPasswordForm: FormGroup;
  private _showRequisities: boolean = false;
  private _submitted: boolean;
  private _samePassword: boolean;
  private _oldPasswordMismatch: boolean = false;
  private _passwordChangeSubscription$: Subscription;
  private _newPasswordValueChangeSubscription$: Subscription;
  private _maxlength: number = 20;
  private _oldPasswordValueChangeSubscription$: Subscription;
  // Constructor
  constructor(protected _localeService: LocaleService, protected _translationService: TranslationService, private _fb: FormBuilder,
    protected _cdRef: ChangeDetectorRef, private _store: Store<fromRoot.State>, private _fbService: FormBuilderService) {
    super(_localeService, _translationService, _cdRef);
  }
  // End of constructor

  get lightClass(): AeClassStyle {
    return this._lightClass;
  }
  get errorList(): any[] {
    return this._errorList;
  }
  get passwordStrength(): any {
    return this._passwordStrength;
  }
  get showRequisities(): boolean {
    return this._showRequisities;
  }
  get samePassword(): boolean {
    return this._samePassword;
  }

  get updateUserPasswordForm(): FormGroup {
    return this._updateUserPasswordForm;
  }

  get inputType(): AeInputType {
    return this._inputType;
  }

  get maxlength(): number {
    return this._maxlength;
  }

  private _initForm() {
    this._updateUserPasswordForm = this._fb.group({
      oldPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.pattern(new RegExp("(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,20})"))]],
      confirmPassword: ['', Validators.required]
    }, { validator: this._matchingPasswords('newPassword', 'confirmPassword') });
  }

  fieldHasInvalidPassword(fieldName: string): boolean {
    return this._updateUserPasswordForm.get(fieldName).hasError('pattern');
  }

  fieldHasSamePassword(): boolean {
    if (this._updateUserPasswordForm.get('oldPassword').valid) {
      if (this._updateUserPasswordForm.get('oldPassword').value == this._updateUserPasswordForm.get('newPassword').value) {
        this._samePassword = true;
        return this._samePassword;
      }
    }
  }

  fieldHasIncorrectPassword(): boolean {
    if (this._oldPasswordMismatch && this._updateUserPasswordForm.get('oldPassword').pristine) {
      return true;
    }

    else
      return false;
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
    if (this._updateUserPasswordForm.valid && !this.fieldHasSamePassword()) {
      let _userPasswordToSave: passwordModel = <passwordModel>this._updateUserPasswordForm.value;
      this._store.dispatch(new PasswordResetAction(_userPasswordToSave));
    }
  }

  private _onsuccessPwdReset() {
    this.update.emit(true);
  }

  onChangePasswordCancel() {
    this._store.dispatch(new PasswordResetCancelAction());
    this._oldPasswordValueChangeSubscription$ = this._store.let(fromRoot.getPasswordUpdateCancelStatus).subscribe();
    this.cancel.emit(false);
  }

  ngOnInit() {
    this._saveBtnClass = AeClassStyle.Light;
    this._initForm();
    this._passwordChangeSubscription$ = this._store.let(fromRoot.getPasswordChangeStatus).subscribe((passwordChanged) => {
      if (!isNullOrUndefined(passwordChanged)) {
        if (passwordChanged) {
          this._onsuccessPwdReset();
        }
        else {
          this._submitted = false;
          this._oldPasswordMismatch = true;
          this._showRequisities = false;
          this._fbService.reset(this._updateUserPasswordForm);
          this._updateUserPasswordForm.reset();
          //patchValue({ oldPassword: null, confirmPassword: null, newPassword: null });
          this._updateUserPasswordForm.markAsPristine();
          this._cdRef.markForCheck();
        }
      }
    });
    this._newPasswordValueChangeSubscription$ = this._updateUserPasswordForm.get('newPassword').valueChanges.subscribe((value: string) => {
      if (!isNullOrUndefined(value)) {
        if (value.length > 0) {
          this._showRequisities = true;
          this._samePassword = false;
        }
        else {
          this._showRequisities = false;
        }

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

    if (this._passwordChangeSubscription$) {
      this._passwordChangeSubscription$.unsubscribe();
    }
    if (this._oldPasswordValueChangeSubscription$) {
      this._oldPasswordValueChangeSubscription$.unsubscribe();
    }
  }
}