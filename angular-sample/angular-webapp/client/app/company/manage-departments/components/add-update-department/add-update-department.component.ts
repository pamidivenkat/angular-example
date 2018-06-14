import {
  Component
  , OnInit
  , ChangeDetectionStrategy
  , OnDestroy
  , ChangeDetectorRef
  , Input
  , Output
  , EventEmitter
} from '@angular/core';
import { BaseComponent } from '../../../../shared/base-component';
import { LocaleService, TranslationService } from 'angular-l10n';
import { ClaimsHelperService } from '../../../../shared/helpers/claims-helper';
import * as fromRoot from '../../../../shared/reducers/index';
import * as Immutable from 'immutable';
import { Store } from '@ngrx/store';
import { OperationModes } from '../../../../holiday-absence/models/holiday-absence.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { isNullOrUndefined } from 'util';
import { DepartmentModel } from '../../models/department.model';
import { DepartmentType } from '../../models/department-type.enum';
import { CommonValidators } from '../../../../shared/validators/common-validators';
import { AeSelectItem } from '../../../../atlas-elements/common/models/ae-select-item';
import { EnumHelper } from '../../../../shared/helpers/enum-helper';
import { AeOrgChartNodeType } from '../../../../atlas-elements/common/models/ae-org-chart-node-model';
import { AeClassStyle } from '../../../../atlas-elements/common/ae-class-style.enum';

@Component({
  selector: 'add-update-department',
  templateUrl: './add-update-department.component.html',
  styleUrls: ['./add-update-department.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddUpdateDepartmentComponent extends BaseComponent implements OnInit, OnDestroy {
  // private fields start
  private _operationMode: OperationModes;
  private _manageDepartmentForm: FormGroup;
  private _deptTeamVM: DepartmentModel;
  private _managers: Immutable.List<AeSelectItem<string>>;
  private _deptTypes: Immutable.List<AeSelectItem<number>>;
  // end of private fields

  // public field declarations start
  @Input('operationMode')
  set operationMode(val: OperationModes) {
    this._operationMode = val;
  }
  get operationMode() {
    return this._operationMode;
  }

  @Input('deptTeamVM')
  set deptTeamVM(val: DepartmentModel) {
    this._deptTeamVM = val;

    if (!isNullOrUndefined(val)) {
      this._prepareModel();
    }
  }
  get deptTeamVM() {
    return this._deptTeamVM;
  }


  @Input('managers')
  set managers(val: Immutable.List<AeSelectItem<string>>) {
    this._managers = val;
  }
  get managers() {
    return this._managers;
  }

  get manageDepartmentForm() {
    return this._manageDepartmentForm;
  }

  get deptTypes() {
    return this._deptTypes;
  }

  get lightClass() {
    return AeClassStyle.Light;
  }

  // end of public field declarations

  // Output declarations start
  @Output()
  saveCompleted: EventEmitter<DepartmentModel> = new EventEmitter<DepartmentModel>();

  @Output()
  cancelled: EventEmitter<boolean> = new EventEmitter<boolean>();
  // end of output declarations

  // constructor starts
  constructor(protected _changeDetector: ChangeDetectorRef
    , _localeService: LocaleService
    , _translationService: TranslationService
    , protected _claimsHelper: ClaimsHelperService
    , private _store: Store<fromRoot.State>
    , private _fb: FormBuilder
  ) {
    super(_localeService, _translationService, _changeDetector);
  }
  // end of constructor

  // private methods start
  private _isAddMode() {
    return this._operationMode == OperationModes.Add;
  }

  private _isUpdateMode() {
    return this._operationMode == OperationModes.Update;
  }

  getHeaderTitle() {
    if (this._isAddMode()) {
      return 'MANAGE_DEPARTMENT.ADD_DEPT_TEAM';
    } else if (this._isUpdateMode() &&
      !isNullOrUndefined(this._deptTeamVM)) {
      if (this._deptTeamVM.Type === AeOrgChartNodeType.Department) {
        return 'MANAGE_DEPARTMENT.EDIT_DEPT';
      } else if (this._deptTeamVM.Type === AeOrgChartNodeType.Team) {
        return 'MANAGE_DEPARTMENT.EDIT_TEAM';
      }
    } else {
      return 'loading...';
    }
  }

  private _prepareModel() {

  }

  private _fieldHasRequiredError(fieldName: string) {
    return !isNullOrUndefined(this._manageDepartmentForm.get(fieldName)) &&
      this._manageDepartmentForm.get(fieldName).hasError('required') &&
      !this._manageDepartmentForm.get(fieldName).pristine;
  }

  private _fieldHasWhitespaceError(fieldName: string) {
    return !isNullOrUndefined(this._manageDepartmentForm.get(fieldName)) &&
      this._manageDepartmentForm.get(fieldName).getError('hasWhiteSpace') &&
      !this._manageDepartmentForm.get(fieldName).pristine;
  }

  private _isFieldInvalid(fieldName: string): boolean {
    return !this._manageDepartmentForm.get(fieldName).valid &&
      !this._manageDepartmentForm.get(fieldName).pristine;
  }

  hasError(fieldName: string): boolean {
    let hasError: boolean = false;
    switch (fieldName) {
      case 'Name': {
        hasError = (this._fieldHasRequiredError(fieldName) ||
          this._fieldHasWhitespaceError(fieldName));
      }
        break;
      case 'Type': {
        hasError = (this._fieldHasRequiredError(fieldName));
      }
        break;
    }
    return hasError;
  }

  getErrorMessage(fieldName: string): string {
    let message;
    switch (fieldName) {
      case 'Name': {
        if (this.hasError(fieldName)) {
          message = 'VALIDATION_ERROR_MESSAGE.NAME_REQUIRED';
        }
      }
        break;
      case 'Type': {
        if (this.hasError(fieldName)) {
          message = 'VALIDATION_ERROR_MESSAGE.TYPE_REQUIRED';
        }
      }
        break;
    }
    return message;
  }

  private _initForm() {
    let disableTypeField: boolean = this._isUpdateMode();
    this._manageDepartmentForm = this._fb.group({
      Name: [{ value: this._deptTeamVM.Name, disabled: false }
        , Validators.compose([Validators.required, CommonValidators.whiteSpaceCheck])],
      Type: [{ value: this._deptTeamVM.Type, disabled: disableTypeField }, Validators.required],
      ManagerId: [{ value: this._deptTeamVM.ManagerId, disabled: false }],
      ParentDeptName: [{ value: this._deptTeamVM.ParentDepartmentName, disabled: true }]
    });

    for (let name in this._manageDepartmentForm.controls) {
      if (this._manageDepartmentForm.controls.hasOwnProperty(name)) {
        let control = this._manageDepartmentForm.controls[name];
        control.valueChanges.subscribe(v => {
          this._deptTeamVM[name] = v;
        });
      }
    }
  }

  onFormClosed(e) {
    this.cancelled.emit(true);
  }

  onFormSubmit(e) {
    if (!this._manageDepartmentForm.valid) {
      for (let name in this._manageDepartmentForm.controls) {
        if (this._manageDepartmentForm.controls.hasOwnProperty(name)) {
          let control = this._manageDepartmentForm.controls[name];
          control.markAsDirty();
        }
      }
      return;
    }
    this.saveCompleted.emit(this._deptTeamVM);
  }

  getSubmitButtonText() {
    if (this._isAddMode()) {
      return 'BUTTONS.ADD';
    } else if (this._isUpdateMode()) {
      return 'BUTTONS.UPDATE';
    } else {
      return 'BUTTONS.SAVE';
    }
  }

  // end of private methods

  // public methods start
  ngOnInit() {
    this._deptTypes = Immutable.List(EnumHelper
      .getAeSelectItems(DepartmentType)
      .filter(c => c.Value !== DepartmentType.Company));

    this._initForm();
  }

  ngOnDestroy() {

  }
  // end of public methods
}
