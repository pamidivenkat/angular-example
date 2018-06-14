import { StringHelper } from '../../../shared/helpers/string-helper';
import {
  EmployeeDOBChangeAction,
  EmployeeEducationHistoryCreateAction,
  EmployeeEducationHistoryUpdateAction
} from '../../actions/employee.actions';
import { nameFieldValidator, onlySpaceValidator, endDateAfterOrEqualValidator } from '../../common/employee-validators';
import { isNullOrUndefined } from 'util';
import { BaseComponent } from '../../../shared/base-component';
import { ClaimsHelperService } from '../../../shared/helpers/claims-helper';
import { Store } from '@ngrx/store';
import { LocaleService, TranslationService } from 'angular-l10n';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AeClassStyle } from '../../../atlas-elements/common/ae-class-style.enum';
import { BehaviorSubject, Subscription } from 'rxjs/Rx';
import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { EducationDetails } from '../../models/education-history.model';
import * as fromRoot from '../../../shared/reducers/index';
import * as Immutable from 'immutable';

@Component({
  selector: 'education-history-add-update',
  templateUrl: './education-history-add-update.component.html',
  styleUrls: ['./education-history-add-update.component.scss']
})
export class EducationHistoryAddUpdateComponent extends BaseComponent implements OnInit {
  // Private Fields
  private _employeeEducationDetails: EducationDetails;
  private _empEducationHistoryAddUpdateForm: FormGroup;
  private _lightClass: AeClassStyle = AeClassStyle.Light;
  private _submitted: boolean = false;
  private _toggleEducationHistoryAddUpdateForm: BehaviorSubject<string> = new BehaviorSubject<string>("");
  private _toggleEducationHistoryAddUpdateFormSubscription: Subscription;
  private _currentEducationHistorySubscription: Subscription;
  private _isStartDateValid: boolean = true;
  private _isEndDateValid: boolean = true;
  // End of private Fields

  // Output properties declarations
  @Output('aeCloseEH')
  private _aeCloseEH: EventEmitter<boolean> = new EventEmitter<boolean>();
  // End of Output properties declarations

  //Public properties
  @Input('toggleEH')
  get toggleEducationHistoryAddUpdateForm() {
    return this._toggleEducationHistoryAddUpdateForm.getValue();
  }
  set toggleEducationHistoryAddUpdateForm(val: string) {
    this._toggleEducationHistoryAddUpdateForm.next(val);
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

  get light(){
    return this._lightClass;
  }

  get empEducationHistoryAddUpdateForm(){
    return this._empEducationHistoryAddUpdateForm;
  }
  
  ngOnInit() {
    let _currentEducationHistorySubscription = this._store.select(ed => ed.employeeState.CurrentEducationHistory).subscribe(ed => {
      if (!isNullOrUndefined(ed)) {
        this._employeeEducationDetails = ed;
        this._initForm();
      }
    });
    let _toggleEducationHistoryAddUpdateFormSubscription = this._toggleEducationHistoryAddUpdateForm.subscribe(status => {
      if (status == "add") {
        this._employeeEducationDetails = new EducationDetails();
        this._initForm();
      }
    });
  }

  ngOnDestroy() {
    if (this._currentEducationHistorySubscription)
      this._currentEducationHistorySubscription.unsubscribe();
    if (this._toggleEducationHistoryAddUpdateFormSubscription)
      this._toggleEducationHistoryAddUpdateFormSubscription.unsubscribe();
  }

  //End of public methods

  // Private methods start
  isUpdateMode() {
    return this.toggleEducationHistoryAddUpdateForm == "update";
  }
  onAddUpdateFormClosed(e) {
    this._aeCloseEH.emit(false);
  }

  onAddUpdateFormSubmit(e) {
    this._submitted = true;
    if (this._empEducationHistoryAddUpdateForm.valid) {
      let _empEducationDetailsToSave: EducationDetails = Object.assign({}, this._employeeEducationDetails, <EducationDetails>this._empEducationHistoryAddUpdateForm.value);    
      if (!StringHelper.isNullOrUndefinedOrEmpty(_empEducationDetailsToSave.Id)) {
        this._store.dispatch(new EmployeeEducationHistoryUpdateAction(_empEducationDetailsToSave));
      }
      else {
        this._store.dispatch(new EmployeeEducationHistoryCreateAction(_empEducationDetailsToSave));
      }
    }
  }

  private _initForm() {
    this._empEducationHistoryAddUpdateForm = this._fb.group({
      Institution: [{ value: this._employeeEducationDetails.Institution, disabled: false }, [Validators.required, nameFieldValidator, onlySpaceValidator]],
      StartDate: [{ value: this._employeeEducationDetails.StartDate ? new Date(this._employeeEducationDetails.StartDate) : null, disabled: false }],
      EndDate: [{ value: this._employeeEducationDetails.EndDate ? new Date(this._employeeEducationDetails.EndDate) : null, disabled: false }],
      Qualification: [{ value: this._employeeEducationDetails.Qualification, disabled: false }]
    },
      { validator: endDateAfterOrEqualValidator }
    );
  }

  // private _isValidStartDate = function (val: boolean) {
  //   this._isStartDateValid = val;
  // }

  // private _isValidEndDate = function (val: boolean) {
  //   this._isEndDateValid = val;
  // }

  // private _onStartDateSelect = (val: Date) => {
  //   if (this._isStartDateValid) {
  //     this._employeeEducationDetails.StartDate = val;
  //     //this._store.dispatch(new EmployeeDOBChangeAction(val));
  //   } else {
  //     this._employeeEducationDetails.StartDate = null;
  //     //this._store.dispatch(new EmployeeDOBChangeAction(null));
  //   }
  // }

  // private _onEndDateSelect = (val: Date) => {
  //   if (this._isEndDateValid) {
  //     this._employeeEducationDetails.EndDate = val;
  //     //this._store.dispatch(new EmployeeDOBChangeAction(val));
  //   } else {
  //     this._employeeEducationDetails.EndDate = null;
  //     //this._store.dispatch(new EmployeeDOBChangeAction(null));
  //   }
  // }

fieldHasRequiredError(fieldName: string): boolean {
    return (this._empEducationHistoryAddUpdateForm.get(fieldName).hasError('required') && (!this._empEducationHistoryAddUpdateForm.get(fieldName).pristine || this._submitted));
  }

  fieldHasInvalidName(fieldName: string): boolean {
    return this._empEducationHistoryAddUpdateForm.get(fieldName).getError('validName') == false;
  }
  fieldHasOnlySpaceCharacters(fieldName: string): boolean {
    return this._empEducationHistoryAddUpdateForm.get(fieldName).getError('onlySpace') == false;
  }
  formHasError(errorName: string): boolean {
    return !StringHelper.isNullOrUndefined(this._empEducationHistoryAddUpdateForm.get('StartDate').value)
      && !StringHelper.isNullOrUndefined(this._empEducationHistoryAddUpdateForm.get('EndDate').value)
      &&
      this._empEducationHistoryAddUpdateForm.errors && !this._empEducationHistoryAddUpdateForm.errors["endDateLessThanStartDate"]
  }
  // End of Private methods 

}
