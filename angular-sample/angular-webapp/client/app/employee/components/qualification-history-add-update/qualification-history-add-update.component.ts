import { StringHelper } from '../../../shared/helpers/string-helper';
import {
  EmployeeQualificationHistoryCreateAction,
  EmployeeQualificationHistoryUpdateAction
} from '../../actions/employee.actions';
import { nameFieldValidator, onlySpaceValidator, dateCompletedValidator, expiryDateValidator } from '../../common/employee-validators';
import { isNullOrUndefined } from 'util';
import { BaseComponent } from '../../../shared/base-component';
import { ClaimsHelperService } from '../../../shared/helpers/claims-helper';
import { Store } from '@ngrx/store';
import { LocaleService, TranslationService } from 'angular-l10n';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AeClassStyle } from '../../../atlas-elements/common/ae-class-style.enum';
import { BehaviorSubject, Subscription } from 'rxjs/Rx';
import {
  ChangeDetectorRef
  , Component
  , EventEmitter
  , Input
  , OnInit
  , Output
  , ChangeDetectionStrategy
  , ViewEncapsulation
} from '@angular/core';
import { TrainingDetails } from '../../models/qualification-history.model';
import * as fromRoot from '../../../shared/reducers/index';
import * as Immutable from 'immutable';

@Component({
  selector: 'qualification-history-add-update',
  templateUrl: './qualification-history-add-update.component.html',
  styleUrls: ['./qualification-history-add-update.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class QualificationHistoryAddUpdateComponent extends BaseComponent implements OnInit {
  // Private Fields
  private _employeeQualificationDetails: TrainingDetails;
  private _empQualificationHistoryAddUpdateForm: FormGroup;
  private _lightClass: AeClassStyle = AeClassStyle.Light;
  private _submitted: boolean = false;
  private _toggleQualificationHistoryAddUpdateForm: BehaviorSubject<string> = new BehaviorSubject<string>("");
  private _toggleQualificationHistoryAddUpdateFormSubscription: Subscription;
  private _currentQualificationHistorySubscription: Subscription;
  private _showRemainingCount: boolean = true;
  // End of private Fields

  public get empQualificationHistoryAddUpdateForm() {
    return this._empQualificationHistoryAddUpdateForm;
  }

  public get showRemainingCount() {
    return this._showRemainingCount;
  }

  public get lightClass() {
    return this._lightClass;
  }

  // Output properties declarations
  @Output('aeCloseQH')
  private _aeCloseQH: EventEmitter<boolean> = new EventEmitter<boolean>();
  // End of Output properties declarations

  //Public properties
  @Input('toggleQH')
  get toggleQualificationHistoryAddUpdateForm() {
    return this._toggleQualificationHistoryAddUpdateForm.getValue();
  }
  set toggleQualificationHistoryAddUpdateForm(val: string) {
    this._toggleQualificationHistoryAddUpdateForm.next(val);
  }
  //End of public properties

  //constructor start
  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _cdRef: ChangeDetectorRef
    , private _fb: FormBuilder
    , private _store: Store<fromRoot.State>
    , private _claimsHelper: ClaimsHelperService) {
    super(_localeService, _translationService, _cdRef);

  }
  //end of constructor

  //public method start
  ngOnInit() {
    let _currentQualificationHistorySubscription = this._store.select(ed => ed.employeeState.CurrentQualificationHistory).subscribe(ed => {
      if (!isNullOrUndefined(ed)) {
        this._employeeQualificationDetails = ed;
        this._initForm();
      }
    });
    let _toggleQualificationHistoryAddUpdateFormSubscription = this._toggleQualificationHistoryAddUpdateForm.subscribe(status => {
      if (status == "add") {
        this._employeeQualificationDetails = new TrainingDetails();
        this._initForm();
      }
    });
  }

  ngOnDestroy() {
    if (this._currentQualificationHistorySubscription)
      this._currentQualificationHistorySubscription.unsubscribe();
    if (this._toggleQualificationHistoryAddUpdateFormSubscription)
      this._toggleQualificationHistoryAddUpdateFormSubscription.unsubscribe();
  }
  public isUpdateMode() {
    return this.toggleQualificationHistoryAddUpdateForm == "update";
  }

  //End of public methods

  // Private methods start
  public onAddUpdateFormClosed(e) {
    this._aeCloseQH.emit(false);
  }

  public onAddUpdateFormSubmit(e) {
    this._submitted = true;
    if (this._empQualificationHistoryAddUpdateForm.valid) {
      let _empQualificationDetailsToSave: TrainingDetails = Object.assign({}, this._employeeQualificationDetails, <TrainingDetails>this._empQualificationHistoryAddUpdateForm.value);
      if (!StringHelper.isNullOrUndefinedOrEmpty(_empQualificationDetailsToSave.Id)) {
        this._store.dispatch(new EmployeeQualificationHistoryUpdateAction(_empQualificationDetailsToSave));
      }
      else {
        this._store.dispatch(new EmployeeQualificationHistoryCreateAction(_empQualificationDetailsToSave));
      }
    }
  }

  private _initForm() {
    this._empQualificationHistoryAddUpdateForm = this._fb.group({
      Course: [{ value: this._employeeQualificationDetails.Course, disabled: false }, Validators.compose([Validators.required, onlySpaceValidator, nameFieldValidator])],
      CourseCode: [{ value: this._employeeQualificationDetails.CourseCode, disabled: false }],
      Qualification: [{ value: this._employeeQualificationDetails.Qualification, disabled: false }],
      DateStarted: [{ value: this._employeeQualificationDetails.DateStarted ? new Date(this._employeeQualificationDetails.DateStarted) : null, disabled: false }],
      DateCompleted: [{ value: this._employeeQualificationDetails.DateCompleted ? new Date(this._employeeQualificationDetails.DateCompleted) : null, disabled: false }],
      ExpiryDate: [{ value: this._employeeQualificationDetails.ExpiryDate ? new Date(this._employeeQualificationDetails.ExpiryDate) : null, disabled: false }],
      TrainerName: [{ value: this._employeeQualificationDetails.TrainerName, disabled: false }],
      Location: [{ value: this._employeeQualificationDetails.Location, disabled: false }],
      CourseGrade: [{ value: this._employeeQualificationDetails.CourseGrade, disabled: false }],
      Provider: [{ value: this._employeeQualificationDetails.Provider, disabled: false }],
      CourseDescription: [{ value: this._employeeQualificationDetails.CourseDescription, disabled: false }],
    },
      {
        validator: dateCompletedValidator
      },
    );
  }

  public fieldHasRequiredError(fieldName: string): boolean {
    return (this._empQualificationHistoryAddUpdateForm.get(fieldName).hasError('required') && (!this._empQualificationHistoryAddUpdateForm.get(fieldName).pristine || this._submitted));
  }

  fieldHasInvalidName(fieldName: string): boolean {
    return this._empQualificationHistoryAddUpdateForm.get(fieldName).getError('validName') == false;
  }

  public fieldHasOnlySpaceCharacters(fieldName: string): boolean {
    return this._empQualificationHistoryAddUpdateForm.get(fieldName).getError('onlySpace') == false;
  }

  public formHasError(errorName: string): boolean {
    return !StringHelper.isNullOrUndefined(this._empQualificationHistoryAddUpdateForm.get('DateStarted').value)
      && !StringHelper.isNullOrUndefined(this._empQualificationHistoryAddUpdateForm.get('DateCompleted').value)
      &&
      this._empQualificationHistoryAddUpdateForm.errors && (!StringHelper.isNullOrUndefined(this._empQualificationHistoryAddUpdateForm.errors["dateCompletedlValidator"]) && !this._empQualificationHistoryAddUpdateForm.errors["dateCompletedlValidator"])
  }


  public formHasExpiryError(errorName: string): boolean {
    return !StringHelper.isNullOrUndefined(this._empQualificationHistoryAddUpdateForm.get('DateCompleted').value)
      && !StringHelper.isNullOrUndefined(this._empQualificationHistoryAddUpdateForm.get('ExpiryDate').value)
      &&
      this._empQualificationHistoryAddUpdateForm.errors && (!StringHelper.isNullOrUndefined(this._empQualificationHistoryAddUpdateForm.errors["expiryDateValidator"]) && !this._empQualificationHistoryAddUpdateForm.errors["expiryDateValidator"])
  }

  // End of Private methods 

}
