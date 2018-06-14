import { ActivatedRoute, Router } from '@angular/router';
import { EmployeeSecurityService } from './../../services/employee-security-service';
import { EmployeeTabs } from '../../common/employee-tabs';
import { isNullOrUndefined } from 'util';
import { EmployeeFullEntity } from '../../models/employee-full.model';
import { mergeEmployeePersonal, mapEthnicgroupsToAeSelectItems, extractPersonalDataFromFullEntity } from '../../common/extract-helpers';
import { AeClassStyle } from '../../../atlas-elements/common/ae-class-style.enum';
import {
  EmployeePersonalLoadAction,
  EmployeePersonalLoadCompleteAction
} from '../../actions/employee.actions';
import { Store } from '@ngrx/store';
import { Employee } from '../../models/employee.model';
import { Observable, BehaviorSubject } from 'rxjs/Rx';
import { ClaimsHelperService } from '../../../shared/helpers/claims-helper';
import { LocaleService, TranslationService } from 'angular-l10n';
import { BaseComponent } from '../../../shared/base-component';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewEncapsulation, OnDestroy } from '@angular/core';
import * as fromRoot from '../../../shared/reducers';
import { StringHelper } from "../../../shared/helpers/string-helper";
import { AeSelectItem } from '../../../atlas-elements/common/models/ae-select-item';
import { EmployeeEthinicGroupLoadAction } from "../../../shared/actions/lookup.actions";
import { EthnicGroup } from '../../../shared/models/lookup.models';
import { EmployeeFullEntityService } from "../../services/employee-fullentity.service";
import { Subscription } from 'rxjs/Rx';
import { SetSelectedEmployeeAction, SetTeamCalendarAction } from '../../../calendar/actions/calendar.actions';
import { CalendarEmployee } from "../../../calendar/model/calendar-models";
@Component({
  selector: 'employee-personal',
  templateUrl: './employee-personal.component.html',
  styleUrls: ['./employee-personal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class EmployeePersonalComponent extends BaseComponent implements OnInit, OnDestroy {
  // Private Fields
  private _employee: Employee;
  private _btnStyle: AeClassStyle;
  private _showUpdateEmpForm: boolean = false;
  private _dataLoadComplete: boolean = false;
  private _ethincGroupData: Array<EthnicGroup>;
  private _ethnicGroupSubscription: Subscription;
  private _employeePersonalSubscription: Subscription;
  private _employeeUpdateStatusSubscription: Subscription;
  private _canUpdate$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private _employeeStateSub: Subscription;
  // End of private Fields
  //public properties starts
  get canUpdate$(): BehaviorSubject<boolean> {
    return this._canUpdate$;
  }
  get btnStyle(): AeClassStyle {
    return this._btnStyle;
  }
  get dataLoadComplete(): boolean {
    return this._dataLoadComplete;
  }
  get showUpdateEmpForm(): boolean {
    return this._showUpdateEmpForm;
  }
  get ethincGroupData(): Array<EthnicGroup> {
    return this._ethincGroupData;
  }
  get employee(): Employee {
    return this._employee;
  }
  //public properties ends

  // constructor start

  /**
   * Creates an instance of EmployeePersonalComponent.
   * @param {LocaleService} _localeService
   * @param {TranslationService} _translationService
   * @param {ChangeDetectorRef} _cdRef
   * @param {Store<fromRoot.State>} _store
   * @param {ClaimsHelperService} _claimsHelper
   *
   * @memberOf EmployeePersonalComponent
   */
  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _cdRef: ChangeDetectorRef
    , private _store: Store<fromRoot.State>
    , private _claimsHelper: ClaimsHelperService
    , private _employeeDataService: EmployeeFullEntityService
    , private _employeeSecurityService: EmployeeSecurityService
    , private _activatedRoute: ActivatedRoute
    , private _router: Router
  ) {
    super(_localeService, _translationService, _cdRef);
  }
  // end of constructor

  // Private methods start
  private _canUpdate() {
    const statePersonal = this._store.let(fromRoot.getEmployeePersonalData);
    this._employeeStateSub = statePersonal.subscribe((val) => {
      if (val) {
        this._canUpdate$.next(this._employeeSecurityService.CanUpdatePersonal(val.Id));
      }
    });
  }
  // End of Private methods

  //public method start
  getEthnicity() {
    if (!isNullOrUndefined(this._employee) && !isNullOrUndefined(this._employee.EthnicGroup)) {
      if (this._employee.EthnicGroup.EthnicGroupValueType === 2) {
        return this._employee.EthnicGroup.Name;
      } else {
        return this._employee.EthnicGroup.EthnicGroupValueName;
      }
    } else {
      return null;
    }
  }
  getSlideoutState(): string {
    return this._showUpdateEmpForm ? 'expanded' : 'collapsed';
  }
  openEmpPersonalUpdateForm(e) {
    this._showUpdateEmpForm = true;
    //this.loadEthnicGroupData(); 
  }
  loadEthnicGroupData() {
    this._ethnicGroupSubscription = this._store.select(c => c.lookupState.EthnicGroupData).subscribe((ethnicGroupData) => {
      if (!isNullOrUndefined(ethnicGroupData)) {
        this._ethincGroupData = ethnicGroupData;
      } else {
        this._store.dispatch(new EmployeeEthinicGroupLoadAction(true));
      }
      this._cdRef.markForCheck();
    });
  }
  closeUpdateForm(e) {
    this._showUpdateEmpForm = false;
  }

  ngOnInit() {
    this._btnStyle = AeClassStyle.Light;
    this._canUpdate();
    this._employeePersonalSubscription = this._store.let(fromRoot.getEmployeePersonalData).subscribe(employee => {
      if (employee) {
        this._employee = employee;
        this._dataLoadComplete = true;
        this.loadEthnicGroupData();
        // let selectedEmp : CalendarEmployee = new CalendarEmployee();
        // selectedEmp.Id = employee.Id;
        // selectedEmp.Fullname = employee.FullName;
        // this._store.dispatch(new SetSelectedEmployeeAction(selectedEmp))
        this._store.dispatch(new SetTeamCalendarAction(false))
        this._cdRef.markForCheck();
      }
    });

    this._employeeUpdateStatusSubscription = this._store.let(fromRoot.getEmployeeUpdateStatus).subscribe(status => {
      if (status === true) {
        this._showUpdateEmpForm = false;
        this._employeeDataService.getData(this._employee.Id).subscribe((empData) => {
          let ethinicGroup: EthnicGroup = null;
          if (!isNullOrUndefined(empData.EthnicGroup) && this._ethincGroupData) {
            ethinicGroup = this._ethincGroupData.filter(c => c.Id === empData.EthnicGroup.EthnicGroupValueId)[0];
          }
          this._store.dispatch(new EmployeePersonalLoadCompleteAction(extractPersonalDataFromFullEntity(empData, ethinicGroup)));
        });
        this._cdRef.markForCheck();
      }
    });
  }

  ngOnDestroy(): void {
    if (this._employeeStateSub) {
      this._employeeStateSub.unsubscribe();
    }
    if (!isNullOrUndefined(this._ethnicGroupSubscription)) {
      this._ethnicGroupSubscription.unsubscribe();
    }

    if (!isNullOrUndefined(this._employeePersonalSubscription)) {
      this._employeePersonalSubscription.unsubscribe();
    }

    if (!isNullOrUndefined(this._employeeUpdateStatusSubscription)) {
      this._employeeUpdateStatusSubscription.unsubscribe();
    }
  }
  // End of public methods
}
