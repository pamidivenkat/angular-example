import { extractEmployeesListData, extractEmployeesPagingInfo } from '../../common/extract-helpers';
import { SortDirection } from '../../../atlas-elements/common/models/ae-sort-model';
import { AtlasApiResponse } from '../../../shared/models/atlas-api-response';
import { URLSearchParams } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import { ClaimsHelperService } from '../../../shared/helpers/claims-helper';
import { RestClientService } from '../../../shared/data/rest-client.service';
import { Action, Store } from '@ngrx/store';
import { Actions, Effect, toPayload } from '@ngrx/effects';
import { Injectable } from '@angular/core';
import * as fromRoot from '../../../shared/reducers/index';
import * as employeeManageActions from '../actions/employee-manage.actions';
import { StringHelper } from "../../../shared/helpers/string-helper";

@Injectable()
export class ManageEmployeesListDataLoadEffects {
    constructor(private _data: RestClientService
        , private _actions$: Actions
        , private _store: Store<fromRoot.State>
        , private _claimsHelper: ClaimsHelperService
    ) {
    }

    @Effect()
    loadEmployees$: Observable<Action> = this._actions$.ofType(employeeManageActions.ActionTypes.EMPLOYEES_LOAD, 
    employeeManageActions.ActionTypes.EMPLOYEES_LOAD_ON_FILTER_CHANGE)
        .map(toPayload)
        .withLatestFrom(this._store, (payload, state) => { return { _payload: payload, _state: state.employeeManageState }; })
        .switchMap((payload) => {
            let params: URLSearchParams = new URLSearchParams();
            //Filtering
           if (payload._state.filters && payload._state.filters.size > 0) {
                payload._state.filters.forEach((value: string, key: string) => {
                    if(key === 'employeesByLeaverFilter' && (StringHelper.isNullOrUndefinedOrEmpty(value) || value == 'null')){
                        //do nothing
                    } else{
                        params.set(key, value);
                    }
                });
            }
            // End of Filtering

            //Paging
            if (payload._state && payload._state.pagingInfo) {
                params.set('pageNumber', payload._state.pagingInfo.PageNumber ? payload._state.pagingInfo.PageNumber.toString() : '1');
                params.set('pageSize', payload._state.pagingInfo.Count ? payload._state.pagingInfo.Count.toString() : '10');
            }
            else {
                params.set('pageNumber', '1');
                params.set('pageSize', '10');
            }
            //End of Paging

            //Sorting
            if (payload._state && payload._state.sortInfo) {
                params.set('sortField', payload._state.sortInfo.SortField);
                params.set('direction', payload._state.sortInfo.Direction === SortDirection.Ascending ? 'asc' : 'desc');
            }
            else {
                params.set('sortField', 'FullName');
                params.set('direction', 'asc');
            }
            //End of Sorting

            return this._data.get('employee', { search: params });
        })
        .map((res) => {
            return new employeeManageActions.EmployeesLoadCompleteAction({ EmployeesList: extractEmployeesListData(res), EmployeesPagingInfo: extractEmployeesPagingInfo(res) });
        });
}