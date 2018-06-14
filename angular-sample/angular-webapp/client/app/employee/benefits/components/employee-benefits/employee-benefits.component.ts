import { EmployeeLoadBenefitsByIdAction } from './../../../actions/employee.actions';
import { EmployeePayrollDetails } from '../../../models/employee.model';
import { Store } from '@ngrx/store';
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
import * as fromRoot from './../../../../shared/reducers';
import { EmployeeBenefits } from "../../models/employee-benefits.model";
import { FormBuilder, Validators, FormGroup } from "@angular/forms";
import { EmployeeBenefitSaveAction } from "../../../actions/employee.actions";
import { AeInputType } from "../../../../atlas-elements/common/ae-input-type.enum";
import { Subscription } from 'rxjs/Rx';
import { AeClassStyle } from "../../../../atlas-elements/common/ae-class-style.enum";
import { Observable } from 'rxjs/Rx';
import { isNullOrUndefined } from "util";


@Component({
  selector: 'employee-benefits',
  templateUrl: './employee-benefits.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class EmployeeBenefitsComponent extends BaseComponent implements OnInit, OnDestroy {

  private _saveBtnClass: AeClassStyle;
  private _employeeBenefitForm: FormGroup;
  private _inputType: AeInputType = AeInputType.text;
  private _showSlideOutPanel: boolean = false;
  private _employeePersonalSubscription: Subscription;
  private _employeePayrollDetails: EmployeePayrollDetails;
  private _payrollFullEntity$: Observable<EmployeePayrollDetails>;
  private _employeePayrollFullEntitySubscription: Subscription;
  private _updateClicked: boolean = false;
  private _btnStyle: AeClassStyle = AeClassStyle.Light;

  constructor(protected _localeService: LocaleService, private _fb: FormBuilder,
    protected _translationService: TranslationService
    , protected _cdRef: ChangeDetectorRef
    , private _store: Store<fromRoot.State>
  ) {
    super(_localeService, _translationService, _cdRef);
  }

  onUpdateClick(e) {
    this._showSlideOutPanel = true;
  }

  getSlideoutState(): string {
    return this._showSlideOutPanel ? 'expanded' : 'collapsed';
  }

  onCancel(e) {
    this._showSlideOutPanel = (false);
  }

  onSave(payrollDetails: EmployeePayrollDetails) {
    this._store.dispatch(new EmployeeBenefitSaveAction(payrollDetails));
    this._showSlideOutPanel = false;
  }

  get showSlideOutPanel() {
    return this._showSlideOutPanel;
  }

  get btnStyle() {
    return this._btnStyle;
  }

  get payrollFullEntity$() {
    return this._payrollFullEntity$;
  }

  get employeePayrollDetails(): EmployeePayrollDetails {
    return this._employeePayrollDetails;
  }

  ngOnInit() {
    this._employeePersonalSubscription = this._store.let(fromRoot.getEmployeePersonalData).subscribe(employee => {
      if (employee) {
        this._employeePayrollDetails = employee.EmployeePayrollDetails;
        this._store.dispatch(new EmployeeLoadBenefitsByIdAction(this._employeePayrollDetails.Id));
      }
    });

    this._payrollFullEntity$ = this._store.let(fromRoot.getPayRollData);
  }

  ngOnDestroy(): void {
    this._employeePersonalSubscription.unsubscribe();
  }
}
