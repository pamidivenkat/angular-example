import {
    EmployeesLoadAction,
    EmployeesLoadOnFiltetrChangeAction
} from '../employee-management/actions/employee-manage.actions';
import { Store } from '@ngrx/store';
import { Injectable, OnInit } from '@angular/core';
import * as fromRoot from '../../shared/reducers/index';

@Injectable()
export class EmployeeManageService implements OnInit {

    constructor(private _store: Store<fromRoot.State>) {

    }

    ngOnInit() {

    }

    LoadEmployees() {
        this._store.dispatch(new EmployeesLoadAction(true));
    }

    LoadEmployeesOnPageChange($event) {
        this._store.dispatch(new EmployeesLoadAction({ pageNumber: $event.pageNumber, noOfRows: $event.noOfRows }));
    }

    LoadEmployeesOnSort($event) {
        this._store.dispatch(new EmployeesLoadAction({ SortField: $event.SortField, Direction: $event.Direction }));
    }

    LoadEmployeesOnFilterChange(filters) {
        this._store.dispatch(new EmployeesLoadOnFiltetrChangeAction(filters));
    }
}