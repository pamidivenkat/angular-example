import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, OnDestroy, Input, EventEmitter, Output } from "@angular/core";
import { LocaleService, TranslationService } from "angular-l10n";
import { Store } from "@ngrx/store";
import * as fromRoot from '../../shared/reducers/index';
import { RestClientService } from "../../shared/data/rest-client.service";
import { ClaimsHelperService } from "../../shared/helpers/claims-helper";
import { BaseComponent } from "../../shared/base-component";
import { EmailModel, User } from "../../email-shared/models/email.model";
import { EmailService } from "../../email-shared/services/email.service";
import { IFormBuilderVM, IFormFieldWrapper } from "../../shared/models/iform-builder-vm";
import { EmailForm, EmailValidations } from "../../email-shared/models/email.form";
import { BehaviorSubject, Subscription, Observable } from "rxjs/Rx";
import { isNullOrUndefined } from "util";
import { FormGroup } from "@angular/forms";
import * as Immutable from 'immutable';
import { LoadUsersAction } from "../../shared/actions/company.actions";
import { AeLoaderType } from "../../atlas-elements/common/ae-loader-type.enum";
import { SendEmailAction } from "../../email-shared/actions/email.actions";
import { StringHelper } from "../../shared/helpers/string-helper";

@Component({
  selector: "email",
  templateUrl: "./email.component.html",
  styleUrls: ["./email.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class EmailComponent extends BaseComponent implements OnInit, OnDestroy {
  // Private Fields
  private _emailModel: EmailModel;
  private _emailFormVM: IFormBuilderVM;
  private _formName: string;
  private _formFields: Array<IFormFieldWrapper<any>>;
  private _usersSubscription: Subscription;
  private _users$: Observable<User[]>;
  private _context: any;
  private _emailForm: FormGroup;
  private _showLoader: boolean;
  private _loaderBars: AeLoaderType = AeLoaderType.Bars;
  private _users: User[];
  private _emailToSubscription: Subscription;
  private _emailFromSubscription: Subscription;
  private _emailBodySubscription: Subscription;
  private _emailCcSubscription: Subscription;
  private _isTofieldValid: boolean;
  private _isFromfieldValid: boolean;
  private _isCcfieldValid: boolean;
  private _toEventSubscription: Subscription;
  private _fromEventSubscription: Subscription;
  private _ccEventSubscription: Subscription;
  private _type: string;
  private _instance: any;
  //private 
  // End of Private Fields

  // Public properties

  @Input('emailModel')
  set EmailModel(value: EmailModel) {
    this._emailModel = value;
    this._type = this._emailModel.Type;
  }
  get EmailModel() {
    return this._emailModel;
  }


  get emailFormVM() {
    return this._emailFormVM;
  }

  get ShowLoader() {
    return this._showLoader;
  }

  get loaderType() {
    return this._loaderBars;
  }

  get formFields() {
    return this._formFields;
  }
  // End of Public properties

  // Public Output bindings
  @Output('onCancel') onEmailCancel: EventEmitter<string>;
  // End of Public Output bindings

  // Public ViewChild bindings
  // End of Public ViewChild bindings

  // Public ContnetChild bindings
  // End of Public ContnetChild bindings

  // Constructor
  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _changeDetectordRef: ChangeDetectorRef
    , private _store: Store<fromRoot.State>
    , private _claimsHelper: ClaimsHelperService
    , private _emailService: EmailService
  ) {
    super(_localeService, _translationService, _changeDetectordRef);
    this.onEmailCancel = new EventEmitter<string>();
    this._isCcfieldValid = true;

  }
  // End of constructor

  // Private methods 
  private _bindFormInitialData() {

  }

  private validateEmail(email: string) {
    let pattern = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!isNullOrUndefined(email)) {
      if (!pattern.test(email)) {
        return false;
      }
      return true;
    }
  }

  private _resolveAttributes() {
    this._showLoader = true;
    this._emailModel.Body = null;
    this._emailService.getEmailTemplate(this._emailModel).first().subscribe((data) => {
      this._emailModel.Body = data.Body;
      this._emailForm.patchValue({
        Body: this._emailModel.Body
      });
      this._showLoader = false;
      this._cdRef.markForCheck();
    });
  }
  // End of private methods

  // Public methods
  ngOnInit() {
    this._showLoader = true;
    this._formName = 'EmailForm';
    this._emailFormVM = new EmailForm(this._formName, this._emailModel);
    this._formFields = this._emailFormVM.init();

    this._usersSubscription = this._store.let(fromRoot.getUsersData).subscribe(data => {
      if (!isNullOrUndefined(data)) {
        this._users = data;
      }
      else {
        this._store.dispatch(new LoadUsersAction(true));
      }
    });

    this._users$ = this._store.let(fromRoot.getUsersData);
    let toField = this._formFields.filter(f => f.field.name === 'To')[0];
    let fromField = this._formFields.filter(f => f.field.name === 'From')[0];
    let ccField = this._formFields.filter(f => f.field.name === 'Cc')[0];
    let bodyField = this._formFields.filter(f => f.field.name === 'Body')[0];

    this._users$.subscribe(<BehaviorSubject<User[]>>toField.context.getContextData().get('items'));
    this._users$.subscribe(<BehaviorSubject<User[]>>fromField.context.getContextData().get('items'));
    this._users$.subscribe(<BehaviorSubject<User[]>>ccField.context.getContextData().get('items'));

    (<EventEmitter<any>>bodyField.context.getContextData().get('onEditorReady')).subscribe((event) => {
      if (!isNullOrUndefined(event)) {
        this._instance = event.editor;
      }

      if (!isNullOrUndefined(this._emailModel) &&
        !StringHelper.isNullOrUndefinedOrEmpty(this._emailModel.Body)) {
        this._isTofieldValid = true;
        this._emailForm.get('Body').setValue(this._emailModel.Body);
      }
    });

    this._toEventSubscription = (<EventEmitter<any>>toField.context.getContextData().get('onInputEvent')).subscribe((event) => {
      if (this.validateEmail(event)) {
        this._isTofieldValid = true;
        this._emailModel.To = { Email: event };
        this._emailForm.get('To').setErrors(null);
        this._resolveAttributes();
      }
      else {
        this._isTofieldValid = false;
      }
    });
    this._fromEventSubscription = (<EventEmitter<any>>fromField.context.getContextData().get('onInputEvent')).subscribe((event) => {
      if (this.validateEmail(event)) {
        this._isFromfieldValid = true;
        this._emailForm.get('From').setErrors(null);
        this._emailModel.From = { Email: event };
        this._resolveAttributes();
      }
      else {
        this._isFromfieldValid = false;
      }
    });
    this._ccEventSubscription = (<EventEmitter<any>>ccField.context.getContextData().get('onInputEvent')).subscribe((event) => {
      if (this.validateEmail(event)) {
        this._isCcfieldValid = true;
        this._emailModel.Cc = { Email: event };
      }
      else {
        this._isCcfieldValid = false;
      }
    });
  }

  onFormValidityChange(status: boolean) {
    this._context.isValidEvent.emit(status);
  }

  onFormInit(fg: FormGroup) {
    this._emailForm = fg;
    this._emailService.getEmailTemplate(this._emailModel).first().subscribe((data) => {
      this._showLoader = false;
      let fromUser = [];
      fromUser.push(new User(this._claimsHelper.getUserId(), this._claimsHelper.getUserFirstName(), this._claimsHelper.getUserLastName(), true, this._claimsHelper.getEmpEmail()));
      this._emailModel = data;

      this._isFromfieldValid = true;
      this._emailForm.get('From').setErrors(null);
      this._emailModel.From = { User: fromUser[0] };

      this._emailForm.patchValue({
        Subject: this._emailModel.Subject,
        From: fromUser
      });

      if (!isNullOrUndefined(this._instance)) {
        this._emailForm.get('Body').setValue(this._emailModel.Body);
      }

      this._emailToSubscription = this._emailForm.get('To').valueChanges.subscribe((val) => {
        if (val[0]) {
          this._isTofieldValid = true;
          this._emailModel.To = { User: this._users.filter(x => x.Id == val)[0] };
          this._emailForm.get('To').setErrors(null);
          this._resolveAttributes();
        } else {
          this._emailForm.get('To').setErrors({ 'required': true });
        }
      });

      this._emailFromSubscription = this._emailForm.get('From').valueChanges.subscribe((val) => {
        if (val[0]) {
          this._isFromfieldValid = true;
          this._emailForm.get('From').setErrors(null);
          this._emailModel.From = { User: this._users.filter(x => x.Id == val)[0] };
          this._resolveAttributes();
        } else {
          this._emailForm.get('From').setErrors({ 'required': true });
        }

      });

      this._emailBodySubscription = this._emailForm.get('Body').valueChanges.subscribe((val) => {
        if (!StringHelper.isNullOrUndefinedOrEmpty(val)) {
          this._isFromfieldValid = true;
          this._emailForm.get('Body').setErrors(null);
          this._emailModel.Body = val;
          this._cdRef.markForCheck();
        }

      });

      this._emailCcSubscription = this._emailForm.get('Cc').valueChanges.subscribe((val) => {
        this._isCcfieldValid = true;
        this._emailModel.Cc = { User: this._users.filter(x => x.Id == val)[0] };
      });

    });
  }

  onCancel(e) {
    this.onEmailCancel.emit('Cancel');
  }

  onSubmit($event) {
    if (!this._isTofieldValid) {
      this._emailForm.get('To').setErrors({ 'required': true });
    }
    if (!this._isFromfieldValid) {
      this._emailForm.get('From').setErrors({ 'required': true });
    }
    if (this._emailForm.valid && this._isCcfieldValid && this._isFromfieldValid && this._isTofieldValid) {
      this._emailModel.Type = this._type;
      this._store.dispatch(new SendEmailAction(this._emailModel));
      this.onEmailCancel.emit('Cancel');
    }
  }

  formButtonNames() {
    return { Submit: 'Send' };
  }

  ngOnDestroy() {
    if (this._usersSubscription)
      this._usersSubscription.unsubscribe();
    if (this._emailToSubscription)
      this._emailToSubscription.unsubscribe();
    if (this._emailFromSubscription)
      this._emailFromSubscription.unsubscribe();
    if (this._emailCcSubscription)
      this._emailCcSubscription.unsubscribe();
    if (this._toEventSubscription)
      this._toEventSubscription.unsubscribe();
    if (this._ccEventSubscription)
      this._ccEventSubscription.unsubscribe();
    if (this._fromEventSubscription)
      this._fromEventSubscription.unsubscribe();

    if (!isNullOrUndefined(this._emailBodySubscription)) {
      this._emailBodySubscription.unsubscribe();
    }
  }
  // End of public methods
}

