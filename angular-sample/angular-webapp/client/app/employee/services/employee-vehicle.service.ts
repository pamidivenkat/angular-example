import {
    EmployeeVehicleEngineCCLoadAction,
    EmployeeVehicleFuelTypesLoadAction,
    EmployeeVehicleInfoAddAction,
    EmployeeVehicleInfoDeleteAction,
    EmployeeVehicleInfoLoadAction,
    EmployeeVehicleInfoLoadByIdAction,
    EmployeeVehicleInfoLoadOnPageChangeAction,
    EmployeeVehicleInfoLoadOnSortAction,
    EmployeeVehicleInfoUpdateAction
} from '../actions/employee.actions';
import { VehicleDetails } from '../models/vehicle-details';
import { AtlasApiResponse } from '../../shared/models/atlas-api-response';
import { Store } from '@ngrx/store';
import { Injectable, OnInit } from '@angular/core';
import * as fromRoot from '../../shared/reducers/index';


@Injectable()
export class EmployeeVehicleService implements OnInit {
    private _vehicleInfo$: AtlasApiResponse<VehicleDetails>;

    constructor(private _store: Store<fromRoot.State>) {

    }

    ngOnInit() {

    }

    AddVehicleInfo(_vehicle: VehicleDetails) {
        this._store.dispatch(new EmployeeVehicleInfoAddAction(_vehicle));
    }

    LoadVehicleInfo() {
        this._store.dispatch(new EmployeeVehicleInfoLoadAction(true));
    }

    SelectVehicleInfo(_vehicle: VehicleDetails) {
        this._store.dispatch(new EmployeeVehicleInfoLoadByIdAction(_vehicle));
    }

    UpdateVehicleInfo(_vehicle: VehicleDetails) {
        this._store.dispatch(new EmployeeVehicleInfoUpdateAction(_vehicle));
    }

    DeleteVehicleInfo(_vehicle: VehicleDetails) {
        this._store.dispatch(new EmployeeVehicleInfoDeleteAction(_vehicle));
    }

    LoadVehicleEngineCCTypes() {
        this._store.dispatch(new EmployeeVehicleEngineCCLoadAction(true));
    }

    LoadVehicleFuelTypes() {
        this._store.dispatch(new EmployeeVehicleFuelTypesLoadAction(true));
    }

    LoadVehicleDetailsOnPageChange($event) {
        this._store.dispatch(new EmployeeVehicleInfoLoadOnPageChangeAction({ pageNumber: $event.pageNumber, noOfRows: $event.noOfRows }));
    }

    LoadVehicleDetailsOnSort($event) {
        this._store.dispatch(new EmployeeVehicleInfoLoadOnSortAction({ SortField: $event.SortField, Direction: $event.Direction }));
    }

}