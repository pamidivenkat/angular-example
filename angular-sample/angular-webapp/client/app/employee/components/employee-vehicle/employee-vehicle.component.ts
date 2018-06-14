import { TranslationService } from 'angular-l10n';
import { LocaleService } from 'angular-l10n';
import { BaseComponent } from '../../../shared/base-component';
import { ActivatedRoute } from '@angular/router';
import { EmployeeSecurityService } from './../../services/employee-security-service';
import { AeDataActionTypes } from '../../models/action-types.enum';
import { AeSortModel } from '../../../atlas-elements/common/models/ae-sort-model';
import { AeClassStyle } from '../../../atlas-elements/common/ae-class-style.enum';
import { Store } from '@ngrx/store';
import { EmployeeVehicleService } from '../../services/employee-vehicle.service';
import { AeDataTableAction } from '../../../atlas-elements/common/models/ae-data-table-action';
import { BaseElement } from '../../../atlas-elements/common/base-element';
import { BaseElementGeneric } from '../../../atlas-elements/common/base-element-generic';
import { extend } from 'webdriver-js-extender/built/lib';
import { DataTableOptions } from '../../../atlas-elements/common/models/ae-datatable-options';
import { VehicleDetails } from '../../models/vehicle-details';
import { BehaviorSubject, Observable, Subject, Subscription } from 'rxjs/Rx';
import * as fromRoot from '../../../shared/reducers';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  OnChanges,
  OnDestroy,
  ViewEncapsulation
} from '@angular/core';
import * as Immutable from 'immutable';

@Component({
  selector: 'employee-vehicle',
  templateUrl: './employee-vehicle.component.html',
  styleUrls: ['./employee-vehicle.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class EmployeeVehicleComponent extends BaseComponent implements OnInit, OnDestroy {
  private _vehicleList$: Observable<Immutable.List<VehicleDetails>>;
  private _vehicleDataTableOptions$: Observable<DataTableOptions>;
  private _totalCount$: Observable<number>;
  private _selectedvehicle: VehicleDetails;
  private _actions: Immutable.List<AeDataTableAction>;
  private _updateActionCommand = new Subject();
  private _deleteActionCommand = new Subject();
  private _slideoutState: boolean;
  private lightClass: AeClassStyle = AeClassStyle.Light;
  private darkClass: AeClassStyle = AeClassStyle.Dark;
  private _showDeleteConfirmDialog: boolean;
  private _actionType: string;
  private _updateActionCommandSubscription$: Subscription;
  private _deleteActionCommandSubscription$: Subscription;
  private _getEmployeeVehicleInfoSubscription$: Subscription;
  private _updateEmployeeVehicleInfoSubscription$: Subscription;
  private _deleteEmployeeVehicleInfoSubscription$: Subscription;
  private _vehicleDetailsLoaded$: Observable<boolean>;
  private _canUpdate$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private _keys = Immutable.List(['Make', 'Model', 'DateIssued', 'ReturnDate', 'InsuranceStartDate']);
  private _employeeStateSub: Subscription;
  private _actionsUpdated:boolean = false;

  //public properties start
  get canUpdate$(): BehaviorSubject<boolean> {
    return this._canUpdate$;
  }
  get vehicleList$(): Observable<Immutable.List<VehicleDetails>> {
    return this._vehicleList$;
  }
  get totalCount(): Observable<number> {
    return this._totalCount$;
  }
  get actions(): Immutable.List<AeDataTableAction> {
    return this._actions;
  }
  get vehicleDataTableOptions$(): Observable<DataTableOptions> {
    return this._vehicleDataTableOptions$;
  }
  get vehicleDetailsLoaded$(): Observable<boolean> {
    return this._vehicleDetailsLoaded$;
  }
  get keys() {
    return this._keys;
  }
  get slideoutState(): boolean {
    return this._slideoutState;
  }
  get actionType(): string {
    return this._actionType;
  }
  get showDeleteConfirmDialog() {
    return this._showDeleteConfirmDialog;
  }
  //public properties ends

  constructor(
    protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _cdr: ChangeDetectorRef
    , private _employeeVehicleService: EmployeeVehicleService
    , private _store: Store<fromRoot.State>
    , private _employeeSecurityService: EmployeeSecurityService
    , private _activatedRoute: ActivatedRoute
  ) {
    super(_localeService, _translationService, _cdr);

  }
  //private method starts
  private _setActions() {
    //Action buttons
    this._actions = Immutable.List([
      new AeDataTableAction("Update", this._updateActionCommand, false),
      new AeDataTableAction("Remove", this._deleteActionCommand, false)
    ]);
    //End of action buittons
  }

  private _canUpdate() {
    const statePersonal = this._store.let(fromRoot.getEmployeePersonalData);
    this._employeeStateSub = statePersonal.subscribe((val) => {
      if (val) {
        this._canUpdate$.next(this._employeeSecurityService.CanUpdateVehicle(val.Id));
        if (this._canUpdate$.value && !this._actionsUpdated) {
          this._setActions();
          this._actionsUpdated = true;
        }
      }
    });
  }
  //private method ends
  //public method starts
  ngOnInit() {
    this._canUpdate();
    this._employeeVehicleService.LoadVehicleEngineCCTypes();
    this._employeeVehicleService.LoadVehicleFuelTypes();
    this._vehicleList$ = this._store.let(fromRoot.getEmployeeVehiclesList);
    this._totalCount$ = this._store.let(fromRoot.getEmployeeVehiclesCount);
    this._vehicleDetailsLoaded$ = this._store.let(fromRoot.getHasVehiclesInformationLoadedData);
    this._vehicleDataTableOptions$ = this._store.let(fromRoot.getEmployeeVehiclesDataTableOptions);
    this._updateActionCommandSubscription$ = this._updateActionCommand.subscribe(_vehicle => {
      this._employeeVehicleService.SelectVehicleInfo(_vehicle as VehicleDetails);
    });

    this._deleteActionCommandSubscription$ = this._deleteActionCommand.subscribe(_vehicle => {
      this._selectedvehicle = _vehicle as VehicleDetails;
      this._showDeleteConfirmDialog = true;
    });

    this._getEmployeeVehicleInfoSubscription$ = this._store.let(fromRoot.getEmployeeVehicleInfoGetById).subscribe(res => {
      if (res) {
        this._selectedvehicle = res;
        this._actionType = AeDataActionTypes.Update;
        this._slideoutState = true;
      }
    });

    this._updateEmployeeVehicleInfoSubscription$ = this._store.let(fromRoot.addOrUpdateEmployeeVehicleInfo).subscribe(res => {
      if (!res) {
        this._employeeVehicleService.LoadVehicleInfo();
        this._slideoutState = false;
        this._cdr.markForCheck();
      }
    });

    this._deleteEmployeeVehicleInfoSubscription$ = this._store.let(fromRoot.deleteEmployeeVehicleInfo).subscribe(res => {
      if (res) {
        this._showDeleteConfirmDialog = false;
        this._employeeVehicleService.LoadVehicleInfo();
      }
    });
  }

  ngOnDestroy() {
    if (this._employeeStateSub) {
      this._employeeStateSub.unsubscribe();
    }
    this._updateActionCommandSubscription$.unsubscribe();
    this._deleteActionCommandSubscription$.unsubscribe();
    this._getEmployeeVehicleInfoSubscription$.unsubscribe();
    this._updateEmployeeVehicleInfoSubscription$.unsubscribe();
    this._deleteEmployeeVehicleInfoSubscription$.unsubscribe();
  }

  getSlideoutState(): string {
    return this._slideoutState ? 'expanded' : 'collapsed';
  }
  closeUpdateForm(e) {
    this._slideoutState = false;
  }

  openVehicleInfoAddForm() {
    this._actionType = AeDataActionTypes.Add;
    this._slideoutState = true;
  }

  deleteConfirmModalClosed(event: any) {
    this._showDeleteConfirmDialog = false;
  }

  deleteVehicleDetails(event: any) {
    this._employeeVehicleService.DeleteVehicleInfo(this._selectedvehicle);
  }

  onPageChange($event: any) {
    this._employeeVehicleService.LoadVehicleDetailsOnPageChange($event);
  }

  onSort($event: AeSortModel) {
    this._employeeVehicleService.LoadVehicleDetailsOnSort($event);
  }
  //public methods end
}
