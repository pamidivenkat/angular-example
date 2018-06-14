import { onlySpaceValidator } from './../../../common/employee-validators';
import { OnDestroy } from '@angular/core';
import { EmployeeGroupService } from '../../services/employee-group.service';
import { AeClassStyle } from '../../../../atlas-elements/common/ae-class-style.enum';
import { EmployeeGroup } from '../../../../shared/models/company.models';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewEncapsulation,
  OnChanges
} from '@angular/core';
import { CommonValidators } from '../../../../shared/validators/common-validators';

import { subscribeOn } from 'rxjs/operator/subscribeOn';
import { Subscribable } from 'rxjs/Observable';
import { AeInputType } from '../../../../atlas-elements/common/ae-input-type.enum';

import { BaseComponent } from '../../../../shared/base-component';
import { ClaimsHelperService } from '../../../../shared/helpers/claims-helper';
import { AeSelectItem } from '../../../../atlas-elements/common/models/ae-select-item';
import { emailFieldValidator } from '../../../common/employee-validators';

import * as fromRoot from '../../../../shared/reducers/index';
import * as Immutable from 'immutable';
import { BehaviorSubject, Observable, Subscription } from 'rxjs/Rx';
import { isNullOrUndefined } from 'util';
import { Store } from '@ngrx/store';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LocaleService, TranslationService } from 'angular-l10n';

@Component({
  selector: 'employee-group-form',
  templateUrl: './employee-group-form.component.html',
  styleUrls: ['./employee-group-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class EmployeeGroupFormComponent extends BaseComponent implements OnInit {

  //private field   
  private _employeeGroupForm: FormGroup;
  private _employeePeriodOptionList: Immutable.List<AeSelectItem<string>>;
  private _submitted: boolean = false;
  private _addOrUpdateActionType: string = "";
  private _lightClass: AeClassStyle = AeClassStyle.Light;
  private _vm: EmployeeGroup;
  private _headerTitle: string;
  private _buttonText: string;

  /**
*Member to specify whether to show/hide icon for checkbox
* default value is false
* @type {boolean}
* @memberOf AeCheckboxComponent
*/
  @Input('addOrUpdateActionType')
  get addOrUpdateActionType() {
    return this._addOrUpdateActionType;
  }
  set addOrUpdateActionType(val: string) {
    this._addOrUpdateActionType = val;
    this._headerTitle = this._addOrUpdateActionType === 'ADD' ? 'ADD_EMPLOYEE_GROUP' : 'UPDATE_EMPLOYEE_GROUP';
    this._buttonText = this._addOrUpdateActionType === 'ADD' ? 'BUTTONS.ADD' : 'BUTTONS.UPDATE';
  }

  /**
*EmployeeGroup model object, selected item
* @type {EmployeeGroup}
* @memberOf EmployeeGroupFormComponent
*/
  @Input('vm')
  get vm() {
    return this._vm;
  }
  set vm(value: EmployeeGroup) {
    this._vm = value;
  }

  @Output('onCancel') _onCancel: EventEmitter<string>;
  @Output('OnSaveComplete') _OnSaveComplete: EventEmitter<boolean>;
  //public properties
  get employeeGroupForm(): FormGroup {
    return this._employeeGroupForm;
  }
  get lightClass(): AeClassStyle {
    return this._lightClass;
  }
  get headerTitle(): string {
    return this._headerTitle;
  }
  get buttonText(): string {
    return this._buttonText;
  }
  //end of public properties
  //constructor start
  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _cdRef: ChangeDetectorRef
    , private _fb: FormBuilder
    , private _employeeGroupService: EmployeeGroupService
    , private _store: Store<fromRoot.State>
    , private _claimsHelper: ClaimsHelperService) {
    super(_localeService, _translationService, _cdRef);
    this._onCancel = new EventEmitter<string>();
    this._OnSaveComplete = new EventEmitter<boolean>();
  }

  // Private methods start
  private _initForm() {
    //pupulate update data condition
    this._vm = this._addOrUpdateActionType === 'UPDATE' ? this._vm : new EmployeeGroup(); //empty update modal
    let name = this._addOrUpdateActionType === 'UPDATE' ? this._vm.Name : '';
    let isContractualGroup = this._addOrUpdateActionType === 'UPDATE' ? this._vm.IsContractualGroup : false;
    this._employeeGroupForm = this._fb.group({
      Name: [{ value: name, disabled: false }, [Validators.required, onlySpaceValidator]],
      IsContractualGroup: [{ value: isContractualGroup, disabled: false }]
    });

  }
  // Private methods end
  ///public method start
  ngOnInit() {
    this._initForm();
  }

  checkForContractualPermission(): boolean {
    return this._claimsHelper.manageEmployeeGroup();
  }
  /**
   * Validate require field.
   * @private
   * @param {string} fieldName
   * @returns {boolean}
   * 
   * @memberOf EmployeeGroupFormComponent
   */
  fieldHasRequiredError(fieldName: string): boolean {
    if ( (this._employeeGroupForm.get(fieldName).hasError('required') ||  this._employeeGroupForm.get(fieldName).getError('onlySpace') == false) && (!this._employeeGroupForm.get(fieldName).pristine || this._submitted)) {
      return true;
    }
    return false;
  }

  /**
   * Submit form(add/update)
   * 
   * @private
   * @param {any} e
   * 
   * @memberOf EmployeeGroupFormComponent
   */
  onFormSubmit(e) {
    this._submitted = true;
    if (this._employeeGroupForm.valid) {
      //dispatch an action to save form
      let _formDataToSave: EmployeeGroup = Object.assign({}, this._vm, <EmployeeGroup>this._employeeGroupForm.value);
      if (this._addOrUpdateActionType === 'ADD') {
        this._employeeGroupService._createEmployeeGroup(_formDataToSave); //save action
      } else {
        this._employeeGroupService._updateEmployeeGroup(_formDataToSave); //save action
      }
      this._OnSaveComplete.emit(true); //emit to parent component
      this._employeeGroupForm.reset(); //clear form.
    }
  }

  /**
 * on slide-out pop cancel
 * @private
 * @param {any} e 
 * 
 * @memberOf EmployeeGroupFormComponent
 */
  onFormClosed(e) {
    this._employeeGroupForm.reset(); //clear form.
    this._onCancel.emit('add');
  }

  ngOnDestroy() {
  }
  //end of public methods
}
