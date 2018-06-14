import { EmployeeGroup } from './../../../shared/models/company.models';
import { extractEmployeeGroupList, extractEmployeeGroupPagingInfo } from '../../common/extract-helpers';
import { SortDirection } from '../../../atlas-elements/common/models/ae-sort-model';
import { Observable } from 'rxjs/Rx';
import { Action, Store } from '@ngrx/store';
import { RestClientService } from '../../../shared/data/rest-client.service';
import { Injectable } from '@angular/core';
import * as fromRoot from '../../../shared/reducers/index';
import { Actions, Effect, toPayload } from '@ngrx/effects';
import * as employeeGroupActions from '../actions/employee-group.actions';
import { Http, URLSearchParams } from '@angular/http';
import { AtlasApiResponse } from '../../../shared/models/atlas-api-response';
import * as errorActions from '../../../shared/actions/error.actions';
import { AtlasApiError } from '../../../shared/error-handling/atlas-api-error';
import { MessageEvent } from '../../../atlas-elements/common/models/message-event.enum';

import { MessengerService } from '../../../shared/services/messenger.service';
import { ObjectHelper } from '../../../shared/helpers/object-helper';
import { EmployeeGroupAssociation } from '../../../employee/models/employee-group-association.model';
import { Employee } from '../../../employee/models/employee.model';
import { EmployeeContractPersonalisationLoad } from "../../../document/contract-personalisation/actions/contract-personalisation.actions";
const EMPTY_GUID = '00000000-0000-0000-0000-000000000000';

@Injectable()
export class EmployeeGroupEffects {
    private _objectType: string = "Employee Group";
    constructor(private _data: RestClientService, private _actions$: Actions, private _store: Store<fromRoot.State>, private _messenger: MessengerService) {

    }

    @Effect()
    updateEmployeeGroup$: Observable<Action> = this._actions$.ofType(employeeGroupActions.ActionTypes.EMPLOYEEGROUPS_UPDATE)
        .map(toPayload)
        .switchMap((data) => {
            //inprogrss snackbar msg
            let modal = <EmployeeGroup>data;
            let vm = ObjectHelper.createUpdateInProgressSnackbarMessage(this._objectType, modal.Name, modal.Id);
            this._messenger.publish('snackbar', vm);
            let params: URLSearchParams = new URLSearchParams();
            //query param
            params.set('Id', modal.Id);
            let fullEntity = this._data.get('employeegroup/Getbyid', { search: params });
            return Observable.forkJoin(fullEntity, Observable.of(modal))
        })
        .switchMap((res) => {
            let apiUrl = 'employeegroup';
            let fullEntity = res[0].json();
            let data = res[1];
            data = Object.assign({}, fullEntity, data);
            return this._data.post(apiUrl, data)
                .mergeMap((res) => {
                    let vm = ObjectHelper.createUpdateCompleteSnackbarMessage(this._objectType, data.Name, data.Id);
                    this._messenger.publish('snackbar', vm);
                    this._store.dispatch(new employeeGroupActions.EmployeeGroupsLoad(true)); //refreshh list
                    return Observable.of(new employeeGroupActions.UpdateEmployeeGroupsCompletedAction(true));
                }).catch((error) => {
                    this._store.dispatch(new employeeGroupActions.EmployeeGroupsLoad(true)); // refresh the grid listing
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Update, 'Employee Group', data.Name, data.Id)));
                });
        });


    @Effect()
    DeleteEmployeeGroupById$: Observable<Action> = this._actions$.ofType(employeeGroupActions.ActionTypes.EMPLOYEEGROUPS_DELETE)
        .map(toPayload)
        .switchMap((payload) => {
            //inprogrss snackbar msg
            let vm = ObjectHelper.createRemoveInProgressSnackbarMessage(this._objectType, payload.Name, payload.Id);
            this._messenger.publish('snackbar', vm);
            return Observable.forkJoin(this._data.delete('employeegroup/' + payload.Id), Observable.of(payload))
                .mergeMap((res) => {
                    this._store.dispatch(new employeeGroupActions.EmployeeGroupsLoad(true));
                    let vm = ObjectHelper.createRemoveCompleteSnackbarMessage(this._objectType, res[1].Name, payload.Id);
                    this._messenger.publish('snackbar', vm);
                    return [
                        new employeeGroupActions.DeleteEmployeeGroupsCompletedAction(true),
                        new employeeGroupActions.LoadEmployeeGroupsOnPageChangeAction({ pageNumber: 1, noOfRows: 10 })]
                }).
                catch((error) => {
                    this._store.dispatch(new employeeGroupActions.DeleteEmployeeGroupsCompletedAction(true));
                    return Observable.of(new errorActions.CatchAPTErrorAction(new AtlasApiError(error, MessageEvent.Remove, this._objectType, payload.Name, payload.Id)));
                });
        })

    @Effect()
    addEmployeeGroup$: Observable<Action> = this._actions$.ofType(employeeGroupActions.ActionTypes.EMPLOYEEGROUPS_ADD)
        .map(toPayload)
        .switchMap((data) => {
            let modal = <EmployeeGroup>data;
            let vm = ObjectHelper.createInsertInProgressSnackbarMessage(this._objectType, modal.Name);
            this._messenger.publish('snackbar', vm);
            let apiUrl = 'employeegroup';
            return this._data.put(apiUrl, data)
                .mergeMap((res) => {
                    let empGroup = res.json() as EmployeeGroup;
                    let vm = ObjectHelper.createInsertCompleteSnackbarMessage(this._objectType, modal.Name);
                    this._messenger.publish('snackbar', vm);
                    return [
                        new employeeGroupActions.AddEmployeeGroupsCompletedAction(true),
                        new employeeGroupActions.LoadEmployeeGroupsOnPageChangeAction({ pageNumber: 1, noOfRows: 10 })
                    ]
                }).catch((error) => {
                    this._store.dispatch(new employeeGroupActions.EmployeeGroupsLoad(true)); // refresh the grid listing
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Create, 'Employee Group', modal.Name)));
                });
        });

    @Effect()
    employeeGroups$: Observable<Action> = this._actions$.ofType(employeeGroupActions.ActionTypes.EMPLOYEEGROUPS_LOAD, employeeGroupActions.ActionTypes.LOAD_EMPLOYEE_GROUP_ON_SORT, employeeGroupActions.ActionTypes.LOAD_EMPLOYEE_GROUP_ON_PAGE_CHANGE)
        .map(toPayload)
        .withLatestFrom(this._store, (payload, state) => { return { _payload: payload, _state: state.employeeGroupState }; })
        .switchMap((payload) => {
            let params: URLSearchParams = new URLSearchParams();
            params.set('fields', 'Id,Name,IsContractualGroup');
            if (payload._state && payload._state.EmployeeGroupPagingInfo) {
                params.set('pageNumber', payload._state.EmployeeGroupPagingInfo.PageNumber ? payload._state.EmployeeGroupPagingInfo.PageNumber.toString() : '1');
                params.set('pageSize', payload._state.EmployeeGroupPagingInfo.Count ? payload._state.EmployeeGroupPagingInfo.Count.toString() : '10');
            }
            else {
                params.set('pageNumber', '1');
                params.set('pageSize', '10');
            }
            //End of Paging

            //Sorting
            if (payload._state && payload._state.EmployeeGroupSortingInfo) {
                params.set('sortField', payload._state.EmployeeGroupSortingInfo.SortField);
                params.set('direction', payload._state.EmployeeGroupSortingInfo.Direction === SortDirection.Ascending ? 'asc' : 'desc');
            }
            else {
                params.set('sortField', 'Name');
                params.set('direction', 'asc');
            }
            return this._data.get('employeegroup', { search: params });
        })
        .map(res => {
            return new employeeGroupActions.EmployeeGroupsLoadComplete({ EmployeeGroupList: extractEmployeeGroupList(res), EmployeeGroupsPagingInfo: extractEmployeeGroupPagingInfo(res) });
        }
        )
        .catch((error) => {
            return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'Employee Group', '')));
        });

    @Effect()
    GetGroupAssociatedEmployees$: Observable<Action> = this._actions$.ofType(employeeGroupActions.ActionTypes.LOAD_EMPLOYEE_GROUPS_EMPLOYEES)
        .withLatestFrom(this._store, (payload, state) => { return { _payload: payload, _state: state.employeeGroupState.isEmployeesLoading }; })
        .switchMap((pl) => {
            let params: URLSearchParams = new URLSearchParams();
            params.set('groupId', pl._payload.payload);
            params.set('siteId', "00000000-0000-0000-0000-000000000000");
            return this._data.get('EmployeeGroup/GetEmployeesByGroupAndSite', { search: params });

        })
        .map(res => {
            return new employeeGroupActions.LoadEmployeeGroupsEmployeesCompleteAction(<AtlasApiResponse<Employee>>res.json());
        })
        .catch((error) => {
            return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'Employee Group', '')));
        });

    @Effect()
    associateEmployees$: Observable<Action> = this._actions$.ofType(employeeGroupActions.ActionTypes.ASSOCIATE_EMPLOYEES_TO_EMPLOYEEGROUP)
        .map(toPayload)
        .switchMap((payload) => {
            let vm = ObjectHelper.createUpdateInProgressSnackbarMessage('Employee Group', payload.EmployeeGroupName, payload.EmployeeGroupId);
            this._messenger.publish('snackbar', vm);
            return this._data.post('employeegroupassociation', payload)
                .map((res) => {
                    if (payload.ReloadData) {
                        this._store.dispatch(new EmployeeContractPersonalisationLoad({ contractId: payload.ContractId, withAttributes: false }));
                    }

                    let vm = ObjectHelper.createUpdateCompleteSnackbarMessage('Employee Group', payload.EmployeeGroupName, payload.EmployeeGroupId);
                    this._messenger.publish('snackbar', vm);
                    return new employeeGroupActions.AssociateEmployeesToEmployeeGroupCompletedAction(false);
                }).catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Update, 'Employee Group', payload.EmployeeGroupId)));
                })
        });
}