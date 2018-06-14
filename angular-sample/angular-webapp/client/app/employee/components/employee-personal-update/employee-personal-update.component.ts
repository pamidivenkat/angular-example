import { CommonValidators } from './../../../shared/validators/common-validators';
import { AeSelectEvent } from '../../../atlas-elements/common/ae-select.event';
import { EmployeeFullEntityService } from '../../services/employee-fullentity.service';
import { StringHelper } from '../../../shared/helpers/string-helper';
import { AeClassStyle } from '../../../atlas-elements/common/ae-class-style.enum';
import { Gender } from '../../common/gender.enum';
import { isNullOrUndefined } from 'util';
import { StorageService } from '../../../shared/services/storage.service';

import {
  calculateAge,
  mapEthnicgroupsToAeSelectItems,
  getAeSelectItemsFromEnum,
  updateEthnicGroup
} from '../../common/extract-helpers';
import {
  EmployeePersonalLoadCompleteAction,
  EmployeePersonalUpdateAction,
  EmployeeDOBChangeAction
} from '../../actions/employee.actions';
import { AeSelectItem } from '../../../atlas-elements/common/models/ae-select-item';
import { AeListItem } from '../../../atlas-elements/common/models/ae-list-item';
import { SalutationCode } from '../../common/salutationcode.enum';
import { BehaviorSubject, Observable } from 'rxjs/Rx';
import { Employee, EmployeeEthinicGroup, EmployeePayrollDetails } from '../../models/employee.model';
import { ClaimsHelperService } from '../../../shared/helpers/claims-helper';
import { Store } from '@ngrx/store';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LocaleService, TranslationService } from 'angular-l10n';
import { BaseComponent } from '../../../shared/base-component';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  OnDestroy
} from '@angular/core';
import * as fromRoot from '../../../shared/reducers';
import * as Immutable from 'immutable';
import { nameFieldValidator, niNumberValidator } from '../../common/employee-validators';
import { EmployeeFullEntity } from "../../../employee/models/employee-full.model";
import { Subscription } from 'rxjs/Rx';
import { EthnicGroup } from "../../../shared/models/lookup.models";

@Component({
  selector: 'employee-personal-update',
  templateUrl: './employee-personal-update.component.html',
  styleUrls: ['./employee-personal-update.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmployeePersonalUpdateComponent extends BaseComponent implements OnInit, OnDestroy {
  //private fields start
  private _updateEmployee: Employee;
  private _updateEmpForm: FormGroup;
  private _employeeTitles: Immutable.List<AeSelectItem<number>>;
  private _genderList: Immutable.List<AeSelectItem<number>>;
  private _isDateValid: boolean = true;
  private _showOtherEthinicty: boolean = false;
  private _saveBtnClass: AeClassStyle;
  private _lightClass: AeClassStyle = AeClassStyle.Light;
  private _toggleUpdateForm: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private _employeeAgeSubscription: Subscription;
  private _toggleUpdateFormSubscription: Subscription;
  private _employeePersonalVMSubscription: Subscription;
  private _ethnicGroupData: Immutable.List<AeSelectItem<string>>;
  private _ethnicGroups: Array<EthnicGroup>;
  //end of private fields  

  // Input properties declarations
  @Input('toggle')
  get toggleUpdateForm() {
    return this._toggleUpdateForm.getValue();
  }
  set toggleUpdateForm(val: boolean) {
    if (!isNullOrUndefined(val)) {
      this._toggleUpdateForm.next(val);
    }
  }

  @Input('ethnicGroups')
  set ethnicGroups(val: Array<EthnicGroup>) {
    this._ethnicGroups = val;
  }
  get ethnicGroups() {
    return this._ethnicGroups;
  }
  
  // end of Input properties declarations

  // Output properties declarations
  @Output('aeClose')
  private _aeClose: EventEmitter<boolean> = new EventEmitter<boolean>();
  // end of Output properties declarations
  //public properties
  get updateEmpForm(): FormGroup {
    return this._updateEmpForm;
  }
  get employeeTitles() {
    return this._employeeTitles;
  }
  get updateEmployee(): Employee {
    return this._updateEmployee;
  }
  get lightClass(): AeClassStyle {
    return this._lightClass;
  }
  get showOtherEthinicty(): boolean {
    return this._showOtherEthinicty;
  }
  get genderList(): Immutable.List<AeSelectItem<number>> {
    return this._genderList;
  }
  get ethnicGroupData(): Immutable.List<AeSelectItem<string>> {
    return this._ethnicGroupData;
  }
  //public properties ends

  // constructor start
  /**
   * Creates an instance of EmployeePersonalUpdateComponent.
   * @param {LocaleService} _localeService 
   * @param {TranslationService} _translationService 
   * @param {ChangeDetectorRef} _cdRef 
   * @param {FormBuilder} _fb 
   * @param {Store<fromRoot.State>} _store 
   * @param {ClaimsHelperService} _claimsHelper 
   * 
   * @memberOf EmployeePersonalUpdateComponent
   */
  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _cdRef: ChangeDetectorRef
    , private _fb: FormBuilder
    , private _store: Store<fromRoot.State>
    , private _claimsHelper: ClaimsHelperService
    , private _storageService: StorageService
    , private _fullEntityService: EmployeeFullEntityService) {
    super(_localeService, _translationService, _cdRef);

  }
  //end of constructor


  // private method starts
  private _evaluateAge(val: Date) {
    if (this._isDateValid) {
      this._updateEmployee.DOB = val;
      this._store.dispatch(new EmployeeDOBChangeAction(val));
    } else {
      this._updateEmployee.DOB = null;
      this._store.dispatch(new EmployeeDOBChangeAction(null));
    }
  }
  private _initForm() {
    this._updateEmpForm = this._fb.group({
      Title: [{ value: this._updateEmployee.Title, disabled: false }, Validators.required],
      FirstName: [{ value: this._updateEmployee.FirstName, disabled: false },
      Validators.compose([Validators.required, nameFieldValidator])],
      MiddleName: [{ value: this._updateEmployee.MiddleName, disabled: false }, nameFieldValidator],
      Surname: [{ value: this._updateEmployee.Surname, disabled: false }, [Validators.required, nameFieldValidator]],
      KnownAs: [{ value: this._updateEmployee.KnownAs, disabled: false }],
      PreviousName: [{ value: this._updateEmployee.PreviousName, disabled: false }],
      Gender: [{ value: this._updateEmployee.Gender, disabled: false }],
      DOB: [{ disabled: false }, [Validators.required, CommonValidators.futureDate()]],
      Age: [{ value: this._updateEmployee.Age, disabled: true }],
      EthnicGroupValueId: [{ value: this._updateEmployee.EthnicGroup.EthnicGroupValueId, disabled: false }],
      Name: [{ value: (this._updateEmployee.EthnicGroup.Name || ''), disabled: false }],
      Nationality: [{ value: this._updateEmployee.Nationality, disabled: false }, [Validators.required, nameFieldValidator]],
      NINumber: [{ value: this._updateEmployee.EmployeePayrollDetails.NINumber, disabled: false }, niNumberValidator],
      TaxCode: [{ value: this._updateEmployee.EmployeePayrollDetails.TaxCode, disabled: false }]
    });

    this._updateEmpForm.get('DOB').setValue(new Date(this._updateEmployee.DOB));

    for (let name in this._updateEmpForm.controls) {
      if (this._updateEmpForm.controls.hasOwnProperty(name)) {
        let control = this._updateEmpForm.controls[name];
        control.valueChanges.subscribe(v => {
          switch (name) {
            case 'EthnicGroupValueId':
              this._updateEmployee.EthnicGroup.EthnicGroupValueId = v;
              break;
            case 'Name':
              this._updateEmployee.EthnicGroup.Name = v;
              break;
            case 'NINumber':
              this._updateEmployee.EmployeePayrollDetails.NINumber = v;
              break;
            case 'TaxCode':
              this._updateEmployee.EmployeePayrollDetails.TaxCode = v;
              break;
            default:
              this._updateEmployee[name] = v;
          }
        });
      }
    }
  }
  private _toggleOtherEthnicity() {
    if (!isNullOrUndefined(this._updateEmployee) &&
      !isNullOrUndefined(this._updateEmployee.EthnicGroup) &&
      this._updateEmployee.EthnicGroup.EthnicGroupValueType === 2) {
      this._showOtherEthinicty = true;
      this._updateEmpForm.get('Name').setValidators(Validators.required);
    } else {
      this._showOtherEthinicty = false;
      this._updateEmpForm.get('Name').clearValidators();
      this._updateEmpForm.get('Name').reset();
    }
  }
  //end of private methods
  //public method start
  ngOnInit() {
    this._saveBtnClass = AeClassStyle.Light;

    this._ethnicGroupData = mapEthnicgroupsToAeSelectItems(this.ethnicGroups);

    this._toggleUpdateFormSubscription = this._toggleUpdateForm.subscribe(status => {
      if (status === true) {
        this._employeeTitles = getAeSelectItemsFromEnum(SalutationCode);
        this._genderList = getAeSelectItemsFromEnum(Gender);
        this._cdRef.markForCheck();
      }
    });

    this._employeePersonalVMSubscription = this._store.select(c => c.employeeState.EmployeePersonalVM).subscribe((employeeVM: Employee) => {
      this._updateEmployee = JSON.parse(JSON.stringify(Object.assign({}, employeeVM))) as Employee;
      this._updateEmployee.DOB = new Date(employeeVM.DOB);
      if (isNullOrUndefined(this._updateEmployee.EthnicGroup)) {
        this._updateEmployee.EthnicGroup = new EmployeeEthinicGroup();
      }

      if (isNullOrUndefined(this._updateEmployee.EmployeePayrollDetails)) {
        this._updateEmployee.EmployeePayrollDetails = new EmployeePayrollDetails();
      }
      this._initForm();
      this._toggleOtherEthnicity();
      this._cdRef.markForCheck();
    });

    this._employeeAgeSubscription = this._store.let(fromRoot.getEmployeeAge).subscribe(age => {
      if (!StringHelper.isNullOrUndefinedOrEmpty(age)) {
        this._updateEmpForm.get('Age').setValue(age);
        this._cdRef.markForCheck();
      }
    });
  }

  ngOnDestroy(): void {
    if (!isNullOrUndefined(this._employeeAgeSubscription)) {
      this._employeeAgeSubscription.unsubscribe();
    }

    if (!isNullOrUndefined(this._employeePersonalVMSubscription)) {
      this._employeePersonalVMSubscription.unsubscribe();
    }

    if (!isNullOrUndefined(this._toggleUpdateFormSubscription)) {
      this._toggleUpdateFormSubscription.unsubscribe();
    }
  }


  isValidDate = function (val: boolean) {
    this._isDateValid = val;
    if (val)
      this._evaluateAge(this._updateEmpForm.get('DOB').value);
  }

  onDateSelect = (val: Date) => {
    this._evaluateAge(val);
  }

  onUpdateFormClosed(e) {
    this._aeClose.emit(false);
  }

  onUpdateFormSubmit(e) {
    if (this._updateEmpForm.valid) {
      let ethnicGroup = this.ethnicGroups.filter(c => c.Id === this._updateEmployee.EthnicGroup.EthnicGroupValueId)[0];
      this._updateEmployee = updateEthnicGroup(this._updateEmployee, ethnicGroup);
      this._fullEntityService.mergeData(this._updateEmployee).subscribe((empToSave: EmployeeFullEntity) => {
        if (!isNullOrUndefined(empToSave)) {
          this._store.dispatch(new EmployeePersonalUpdateAction(empToSave));
        }
      });
    }
  }

  onEthnicityChange(e: AeSelectEvent<string>) {
    if (!isNullOrUndefined(e.SelectedItem)) {
      let ethnicGroup = this.ethnicGroups.filter(c => c.Id == e.SelectedValue)[0];
      if (!isNullOrUndefined(ethnicGroup)) {
        if (ethnicGroup.EthnicGroupValueType == 2) {
          this._showOtherEthinicty = true;
          this._updateEmpForm.get('Name').setValue('');
          this._updateEmpForm.get('Name').setValidators(Validators.required);
        } else {
          this._showOtherEthinicty = false;
          this._updateEmpForm.get('Name').clearValidators();
          this._updateEmpForm.get('Name').reset();
        }
      }
    }
  }

  fieldHasRequiredError(fieldName: string): boolean {
    return this._updateEmpForm.get(fieldName).hasError('required');
  }

  fieldHasFutureDateError(fieldName: string): boolean {
    return this._updateEmpForm.get(fieldName).getError('nofutureDate') == true;
  }


  isFieldValid(fieldName: string): boolean {
    return this._updateEmpForm.get(fieldName).valid;
  }

  fieldHasInvalidName(fieldName: string): boolean {
    return this._updateEmpForm.get(fieldName).getError('validName') == false;
  }
  // public method ends

}
