import {
    EmployeePreviousEmploymentHistoryAddAction,
    EmployeePreviousEmploymentHistoryLoadAction,
    EmployeePreviousEmploymentHistoryLoadOnPageChangeAction,
    EmployeePreviousEmploymentHistoryLoadOnSortAction,
    EmployeePreviousEmploymentHistoryRemoveAction,
    EmployeePreviousEmploymentHistoryUpdateAction
} from '../actions/employee.actions';
import { PreviousEmployment } from '../models/previous-employment';
import { AtlasApiResponse } from '../../shared/models/atlas-api-response';
import { Store } from '@ngrx/store';
import { Injectable, OnInit } from '@angular/core';
import * as fromRoot from '../../shared/reducers/index';


@Injectable()
export class EmployeePreviousEmploymentHistoryService implements OnInit {
    private _vehicleInfo$: AtlasApiResponse<PreviousEmployment>;

    constructor(private _store: Store<fromRoot.State>) {

    }

    ngOnInit() {

    }

    LoadPreviousEmploymentHistory() {
        this._store.dispatch(new EmployeePreviousEmploymentHistoryLoadAction(true));
    }

    AddPreviousEmploymentHistory(_prevEmployer: PreviousEmployment) {
        this._store.dispatch(new EmployeePreviousEmploymentHistoryAddAction(_prevEmployer));
    }

    UpdatePreviousEmploymentHistory(_prevEmployer: PreviousEmployment) {
        this._store.dispatch(new EmployeePreviousEmploymentHistoryUpdateAction(_prevEmployer));
    }

    RemovePreviousEmploymentHistory(_prevEmployer: PreviousEmployment) {
        this._store.dispatch(new EmployeePreviousEmploymentHistoryRemoveAction(_prevEmployer));
    }

    LoadPreviousEmploymentHistoryOnPageChange($event) {
        this._store.dispatch(new EmployeePreviousEmploymentHistoryLoadOnPageChangeAction({ pageNumber: $event.pageNumber, noOfRows: $event.noOfRows }));
    }

    LoadPreviousEmploymentHistoryOnSort($event) {
        this._store.dispatch(new EmployeePreviousEmploymentHistoryLoadOnSortAction({ SortField: $event.SortField, Direction: $event.Direction }));
    }

}