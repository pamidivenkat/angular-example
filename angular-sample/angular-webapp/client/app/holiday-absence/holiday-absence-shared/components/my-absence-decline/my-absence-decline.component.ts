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
import { BaseComponent } from '../../../../shared/base-component';
import { TranslationService, LocaleService } from 'angular-l10n';
import { ClaimsHelperService } from '../../../../shared/helpers/claims-helper';
import * as fromRoot from '../../../../shared/reducers';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs/Subscription';
import { isNullOrUndefined } from 'util';
import { Observable } from 'rxjs/Observable';
import { EmployeeConfig, MyAbsence } from '../../../models/holiday-absence.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AeLoaderType } from '../../../../atlas-elements/common/ae-loader-type.enum';
import { AbsenceStatus } from '../../../../shared/models/lookup.models';
import { StringHelper } from '../../../../shared/helpers/string-helper';
import {
  UpdateEmployeeAbsenceAction
  , LoadEmployeeAbsencesAction
  , ClearCurrentAbsence
} from '../../../actions/holiday-absence.actions';
import { showCompleteSnackbarMessage, showInProgressSnackbarMessage } from '../../../common/extract-helpers';
import { MessengerService } from '../../../../shared/services/messenger.service';
import { AeClassStyle } from '../../../../atlas-elements/common/ae-class-style.enum';

@Component({
  selector: 'my-absence-decline',
  templateUrl: './my-absence-decline.component.html',
  styleUrls: ['./my-absence-decline.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class MyAbsenceDeclineComponent extends BaseComponent implements OnInit {
  // Private field declarations
  private _employeeConfig: EmployeeConfig;
  private _myAbsence: MyAbsence;
  private _myAbsenceId: string;
  private _myAbsenceDeclineForm: FormGroup;
  private _loaderType: AeLoaderType = AeLoaderType.Bars;
  private _loading: boolean;
  private _absenceStatuses: Array<AbsenceStatus>;
  private _lightClass: AeClassStyle = AeClassStyle.Light;
  // End of private field declarations

  // Public field declarations
  @Input('absenceStatuses')
  set absenceStatuses(val: Array<AbsenceStatus>) {
    this._absenceStatuses = val;
  }
  get absenceStatuses() {
    return this._absenceStatuses;
  }
  

  @Input('myAbsence')
  set myAbsence(val: MyAbsence) {
    this._myAbsence = val;
    if (!isNullOrUndefined(val)) {
      this._loading = false;
      this._myAbsenceDeclineForm = null;
      this._initForm();
    }
  }
  get myAbsence() {
    return this._myAbsence;
  }
 
  get myAbsenceDeclineForm() {
    return this._myAbsenceDeclineForm;
  }
  get lightClass() {
    return this._lightClass;
  }
  get loaderType(){
    return this._loaderType;
  }
  get loading(){
    return this._loading;
  }
  // End of public field declarations

  // Output property declarations
  @Output()
  declineFormClose: EventEmitter<boolean> = new EventEmitter<boolean>();

  @Output()
  declineComplete: EventEmitter<MyAbsence> = new EventEmitter<MyAbsence>();
  // End of output propery declarations
  // constructor starts
  /**
   * Creates an instance of MyAbsenceHistoryComponent.
   * @param {LocaleService} _localeService
   * @param {TranslationService} _translationService
   * @param {ChangeDetectorRef} _cdRef
   * @param {Store<fromRoot.State>} _store
   * @param {ClaimsHelperService} _claimsHelper
   *
   * @memberOf MyAbsenceHistoryComponent
   */
  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _cdRef: ChangeDetectorRef
    , private _store: Store<fromRoot.State>
    , private _claimsHelper: ClaimsHelperService
    , private _fb: FormBuilder
    , private _messenger: MessengerService) {
    super(_localeService, _translationService, _cdRef);
  }
  // End of constructor

  // Private methods
  private _initForm(): void {
    this._myAbsenceDeclineForm = this._fb.group({
      Comment: [{ value: this._myAbsence.Comment, disabled: false }]
    });

    for (let name in this._myAbsenceDeclineForm.controls) {
      if (this._myAbsenceDeclineForm.controls.hasOwnProperty(name)) {

        let control = this._myAbsenceDeclineForm.controls[name];
        control.valueChanges.subscribe(v => {
          this._myAbsence[name] = v;
        });
      }
    }
  }

  private _getAbsenceStatusName(name: string) {
    let statusId: string = '';
    if (!isNullOrUndefined(this.absenceStatuses) &&
      !StringHelper.isNullOrUndefinedOrEmpty(name)) {
      return this.absenceStatuses
        .filter((item) => item.Name === name)
        .map(c => c.Id)[0];
    }
    return statusId;
  }


  private _fieldHasError(fieldName: string) {
    let messages: Array<string> = [];
    switch (fieldName) {
      case 'Comment': {
        if (!isNullOrUndefined(this._myAbsenceDeclineForm) &&
          !isNullOrUndefined(this._myAbsenceDeclineForm.get('Comment')) &&
          this._myAbsenceDeclineForm.get('Comment').hasError('required') &&
          !this._myAbsenceDeclineForm.get('Comment').pristine) {
          messages.push('Comment is required.');
        }
        break;
      }
    }
    return messages;
  }


  // End of private methods

  // Public methods
  public submitDeclineRequest($event) {
    if (this._myAbsenceDeclineForm.valid) {
      this._myAbsence.StatusId = this._getAbsenceStatusName('Declined');
      this._myAbsence.Status = null;
      this._myAbsence.DeclinedBy = this._claimsHelper.getUserId();
      this.declineComplete.emit(this._myAbsence);
    }
  }


  public onMyAbsenceFormClosed() {
    this.declineFormClose.emit(true);
  }

  ngOnInit() {
    this._myAbsence = new MyAbsence();
    this._initForm();
    this._loading = true;
  }
  // End of public methods
}
