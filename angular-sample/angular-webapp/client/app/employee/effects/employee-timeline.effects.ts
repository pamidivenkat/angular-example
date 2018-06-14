import { extractPagingInfo, extractEmployeeTimelineEntities } from '../common/extract-helpers';
import { EmployeeEvent } from '../employee-timeline/models/emloyee-event';
import { extractEmployeeEventData } from '../common/extract-helpers';
import { Timeline } from '../models/timeline';
import { SortDirection } from '../../atlas-elements/common/models/ae-sort-model';
import { AtlasApiResponse } from '../../shared/models/atlas-api-response';
import { Jsonp, URLSearchParams } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import { EmployeeFullEntityService } from '../services/employee-fullentity.service';
import { ClaimsHelperService } from '../../shared/helpers/claims-helper';
import { RestClientService } from '../../shared/data/rest-client.service';
import { Action, Store } from '@ngrx/store';
import { Actions, Effect, toPayload } from '@ngrx/effects';
import { Injectable } from '@angular/core';
import * as fromRoot from '../../shared/reducers/index';
import * as employeeActions from '../actions/employee.actions';
import { EmployeeLoadTimelineLoadAction } from "../actions/employee.actions";
import { Document } from '../../document/models/document';


import { ObjectHelper } from './../../shared/helpers/object-helper';
import { MessengerService } from './../../shared/services/messenger.service';
import * as errorActions from './../../shared/actions/error.actions';
import { AtlasApiError } from './../../shared/error-handling/atlas-api-error';
import { MessageEvent } from '../../atlas-elements/common/models/message-event.enum';
import { isNullOrUndefined } from "util";
import { DateTimeHelper } from './../../shared/helpers/datetime-helper';
import { StringHelper } from './../../shared/helpers/string-helper';

@Injectable()
export class EmployeeTimelineEffects {
    private _objectType: string;
    constructor(private _data: RestClientService
        , private _actions$: Actions
        , private _store: Store<fromRoot.State>
        , private _claimsHelper: ClaimsHelperService
        , private _employeeFullEntityService: EmployeeFullEntityService
        , private _messenger: MessengerService
    ) {

    }

    @Effect()
    loadTimelineData$: Observable<Action> = this._actions$.ofType(
        employeeActions.ActionTypes.EMPLOYEE_TIMELINE_DATA_LOAD,
        employeeActions.ActionTypes.LOAD_EMPLOYEE_TIMELINE_ON_PAGE_CHANGE,
        employeeActions.ActionTypes.LOAD_EMPLOYEE_TIMELINE_ON_SORT,
        employeeActions.ActionTypes.LOAD_EMPLOYEE_TIMELINE_ON_FILTERS_CHANGE)
        .map(toPayload)
        .withLatestFrom(this._store, (payload, state) => { return { _payload: payload, _state: state.employeeState }; })
        .switchMap((payLoad) => {
            let employeeId = payLoad._state.EmployeeId;
            let params: URLSearchParams = new URLSearchParams();
            params.set('action', 'getspecificfields');
            params.set('fields', 'Id,CategoryCode,Category,CategoryName,Title,Sensitivity,EmployeeId,ItemType,HasDocuments,CreatedOn,FileName,CreatedBy,ExpiryDate,ReminderInDays');
            params.set('employeeTimelineViewByEmpId', employeeId);

            //Paging
            if (payLoad._state.TimeLinePagingInfo) {
                params.set('pageNumber', payLoad._state.TimeLinePagingInfo.PageNumber ? payLoad._state.TimeLinePagingInfo.PageNumber.toString() : '1');
                params.set('pageSize', payLoad._state.TimeLinePagingInfo.Count ? payLoad._state.TimeLinePagingInfo.Count.toString() : '10');
            }
            else {
                params.set('pageNumber', '1');
                params.set('pageSize', '10');
            }
            //End of Paging
            //Sorting
            if (payLoad._state.TimeLineSortInfo) {
                params.set('sortField', payLoad._state.TimeLineSortInfo.SortField);
                params.set('direction', payLoad._state.TimeLineSortInfo.Direction === SortDirection.Ascending ? 'asc' : 'desc');
            }
            else {
                params.set('sortField', 'CreatedOn');
                params.set('direction', 'desc');
            }
            //End of Sorting       
            //Filtering
            if (payLoad._state.TimelineFilters && payLoad._state.TimelineFilters.size > 0) {
                payLoad._state.TimelineFilters.forEach((value: string, key: string) => {
                    params.set(key, value);
                });
            }
            // End of Filtering 
            return this._data.get('EmployeeTimelineView', { search: params })
                .map((res) => {
                    //<AtlasApiResponse<Timeline>>res.json()
                    return new employeeActions.EmployeeLoadTimelineLoadActionComplete({ TimelineData: extractEmployeeTimelineEntities(res), TimeLinePagingInfo: extractPagingInfo(res) });
                })
                .catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'Timeline', employeeId)));
                })
        })

    @Effect()
    addEmployeeEvent$: Observable<Action> = this._actions$.ofType(employeeActions.ActionTypes.EMPLOYEE_TIMELINE_ADD_EVENT)
        .map(toPayload)
        .withLatestFrom(this._store, (payload, state) => {
            return {
                _payload: payload
                , _empPersonal: state.employeeState.EmployeePersonalVM
                , _empInformation: state.employeeState.InformationVM
                , _eventTypes: state.lookupState.EventTypesData
                , _adminDetails: state.employeeState.EmployeeAdminDetails
            };
        })
        .switchMap((pl) => {
            let data = pl._payload;
            let apiUrl = 'EmployeeEventData';
            this._objectType = 'Employee event';
            let event = <EmployeeEvent>data;
            event.EmployeeId = pl._empPersonal.Id;
            let empName = pl._empPersonal.FirstName + ' ' + pl._empPersonal.Surname;
            let eventData = JSON.parse(event.EventData);
            let vm = ObjectHelper.createInsertInProgressSnackbarMessage(this._objectType, eventData['Title']);
            this._messenger.publish('snackbar', vm);
            return this._data.put(apiUrl, data)
                .map((res) => {
                    let event = <EmployeeEvent>res.json();
                    let eventData = JSON.parse(event.EventData);
                    this._objectType = 'Employee event';
                    let vm = ObjectHelper.createInsertCompleteSnackbarMessage(this._objectType, eventData['Title']);
                    this._messenger.publish('snackbar', vm);
                    if (!isNullOrUndefined(pl._eventTypes)) {
                        let isLeaverType = !isNullOrUndefined(pl._eventTypes
                            .find(c => c.Code === 5 && c.Id.toLowerCase() === pl._payload.EventTypeId.toLowerCase()));
                        if (isLeaverType) {
                            let leaverDetails = [{
                                LeaverTerminationDate: eventData['TerminationDate']
                            }];
                            this._store.dispatch(new employeeActions.LoadEmployeeLeaverEventDetailsComplete(leaverDetails));

                            // let terminationDate= new Date(eventData['TerminationDate']);
                            if (!isNullOrUndefined(pl._adminDetails) &&
                                (DateTimeHelper.getDatePart(eventData['TerminationDate']) <
                                    DateTimeHelper.getDatePart(new Date()))) {
                                pl._adminDetails.IsLeaver = true;
                                let hasUser = !StringHelper.isNullOrUndefinedOrEmpty(pl._adminDetails.UserName) ||
                                    !StringHelper.isNullOrUndefinedOrEmpty(pl._adminDetails.Email);
                                if (hasUser) {
                                    pl._adminDetails.IsActive = false;
                                }
                                let adminDetails = Object.assign({}, pl._adminDetails);
                                this._store.dispatch(new employeeActions.LoadEmployeeAdministrationDetailsCompleteAction(adminDetails));
                            }

                            if (!isNullOrUndefined(pl._empInformation) &&
                                (DateTimeHelper.getDatePart(eventData['TerminationDate']) <
                                    DateTimeHelper.getDatePart(new Date()))) {
                                pl._empInformation.IsLeaver = true;
                                let empInfo = Object.assign({}, pl._empInformation);
                                this._store.dispatch(new employeeActions.EmployeeInformationLoadCompleteAction(empInfo));
                            }
                        }
                    }
                    this._store.dispatch(new employeeActions.EmployeeLoadTimelineLoadAction(true));
                    return new employeeActions.AddEmployeeventComplete(true);
                })
                .catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Create, 'Employee event', empName)));
                })
        })



    @Effect()
    loadEmployeeEvent$: Observable<Action> = this._actions$.ofType(employeeActions.ActionTypes.EMPLOYEE_TIMELINE_LOAD_EMPLOYEE_EVENT)
        .map(toPayload)
        .switchMap((eventId) => {
            let params: URLSearchParams = new URLSearchParams();
            params.set('Id', eventId);
            return this._data.get(`EmployeeEventData/GetbyId`, { search: params })
                .map((res) => {
                    return new employeeActions.LoadEmployeeEventComplete(extractEmployeeEventData(res));
                })
                .catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'Timeline', eventId)));
                })
        })


    @Effect()
    updateDocument$: Observable<Action> = this._actions$.ofType(employeeActions.ActionTypes.EMPLOYEE_TIMELINE_UPDATE_DOCUMENT)
        .map(toPayload)
        .switchMap((payload) => {
            this._objectType = 'Document';
            let snackbarTitle: string;
            if (!isNullOrUndefined(payload.Title)) {
                snackbarTitle = payload.Title;
            }
            else {
                snackbarTitle = payload.FileName;
            }
            let vm = ObjectHelper.createUpdateInProgressSnackbarMessage(this._objectType, snackbarTitle, payload.Id);
            this._messenger.publish('snackbar', vm);
            return this._data.post('document', payload)
        })
        .map((res) => {
            this._objectType = 'Document';
            let response = <Document>res.json();
            let snackbarTitle: string;
            if (!isNullOrUndefined(response.Title)) {
                snackbarTitle = response.Title;
            }
            else {
                snackbarTitle = response.FileName;
            }
            let vm = ObjectHelper.createUpdateCompleteSnackbarMessage(this._objectType, snackbarTitle, response.Id);
            this._messenger.publish('snackbar', vm);
            return new EmployeeLoadTimelineLoadAction(true);

        });

    @Effect()
    updateEmployeeEvent$: Observable<Action> = this._actions$.ofType(employeeActions.ActionTypes.EMPLOYEE_TIMELINE_UPDATE_EVENT)
        .map(toPayload)
        .withLatestFrom(this._store, (payload, state) => {
            return {
                _payload: payload
                , _empPersonal: state.employeeState.EmployeePersonalVM
                , _empInformation: state.employeeState.InformationVM
                , _eventTypes: state.lookupState.EventTypesData
                , _adminDetails: state.employeeState.EmployeeAdminDetails
            };
        })
        .switchMap((pl) => {
            let data = pl._payload;
            let apiUrl = 'EmployeeEventData';
            let event = <EmployeeEvent>data;
            let eventData = JSON.parse(event.EventData);
            this._objectType = 'Employee Event';
            let vm = ObjectHelper.createUpdateInProgressSnackbarMessage(this._objectType, eventData['Title'], event.Id);
            this._messenger.publish('snackbar', vm);
            return this._data.post(apiUrl, data).map((res) => {
                let event = <EmployeeEvent>res.json();
                let eventData = JSON.parse(event.EventData);
                this._objectType = 'Employee Event';
                let vm = ObjectHelper.createUpdateCompleteSnackbarMessage(this._objectType, eventData['Title'], event.Id);
                this._messenger.publish('snackbar', vm);
                if (!isNullOrUndefined(pl._eventTypes)) {
                    let isLeaverType = !isNullOrUndefined(pl._eventTypes
                        .find(c => c.Code === 5 && c.Id.toLowerCase() === pl._payload.EventTypeId.toLowerCase()));
                    if (isLeaverType) {
                        let leaverDetails = [{
                            LeaverTerminationDate: eventData['TerminationDate']
                        }];
                        this._store.dispatch(new employeeActions.LoadEmployeeLeaverEventDetailsComplete(leaverDetails));

                        if (!isNullOrUndefined(pl._adminDetails) &&
                            (DateTimeHelper.getDatePart(eventData['TerminationDate']) <
                                DateTimeHelper.getDatePart(new Date()))) {
                            pl._adminDetails.IsLeaver = true;
                            let hasUser = !StringHelper.isNullOrUndefinedOrEmpty(pl._adminDetails.UserName) ||
                                !StringHelper.isNullOrUndefinedOrEmpty(pl._adminDetails.Email);
                            if (hasUser) {
                                pl._adminDetails.IsActive = false;
                            }
                            let adminDetails = Object.assign({}, pl._adminDetails);
                            this._store.dispatch(new employeeActions.LoadEmployeeAdministrationDetailsCompleteAction(adminDetails));
                        }

                        if (!isNullOrUndefined(pl._empInformation) &&
                            (DateTimeHelper.getDatePart(eventData['TerminationDate']) <
                                DateTimeHelper.getDatePart(new Date()))) {
                            pl._empInformation.IsLeaver = true;
                            let empInfo = Object.assign({}, pl._empInformation);
                            this._store.dispatch(new employeeActions.EmployeeInformationLoadCompleteAction(empInfo));
                        }
                    }
                }
                this._store.dispatch(new employeeActions.EmployeeLoadTimelineLoadAction(true));
                return new employeeActions.UpdateEmployeeEventComplete(true);
            });
        });


    @Effect()
    removeEmployeeEvent$: Observable<Action> = this._actions$.ofType(employeeActions.ActionTypes.EMPLOYEE_TIMELINE_REMOVE_EVENT)
        .map(toPayload)
        .withLatestFrom(this._store, (payload, state) => {
            return {
                _payload: payload
                , _empPersonal: state.employeeState.EmployeePersonalVM
                , _eventTypes: state.lookupState.EventTypesData
            };
        })
        .switchMap((pl) => {
            let data = pl._payload;
            let params: URLSearchParams = new URLSearchParams();
            let timeline = <Timeline>data;
            params.set('id', timeline.Id);
            this._objectType = 'Employee Event';
            let vm = ObjectHelper.createRemoveInProgressSnackbarMessage(this._objectType, timeline.Title, timeline.Id);
            this._messenger.publish('snackbar', vm);
            return Observable.forkJoin(this._data.delete('EmployeeEventData', { search: params }), Observable.of(data))
                .map((res) => {
                    this._objectType = 'Employee Event';
                    let vm = ObjectHelper.createRemoveCompleteSnackbarMessage(this._objectType, res[1].Title, res[1].Id);
                    this._messenger.publish('snackbar', vm);
                    this._store.dispatch(new employeeActions.EmployeeLoadTimelineLoadAction(true));
                    if (!isNullOrUndefined(pl._eventTypes)) {
                        let isLeaverType = !isNullOrUndefined(pl._eventTypes
                            .find(c => c.Code === 5 && c.Id.toLowerCase() === res[1]['Category'].toLowerCase()));
                        if (isLeaverType) {
                            this._store.dispatch(new employeeActions.LoadEmployeeLeaverEventDetailsComplete(null));
                        }
                    }
                    return new employeeActions.RemoveEmployeeEventComplete(true);
                });
        })

    @Effect()
    removeEmployeeDocument$: Observable<Action> = this._actions$.ofType(employeeActions.ActionTypes.EMPLOYEE_TIMELINE_REMOVE_DOCUMENT)
        .map(toPayload)
        .switchMap((data) => {
            let params: URLSearchParams = new URLSearchParams();
            let timeline = <Timeline>data;
            params.set('id', timeline.Id);
            this._objectType = 'Document';
            let vm = ObjectHelper.createRemoveInProgressSnackbarMessage(this._objectType, timeline.Title, timeline.Id);
            this._messenger.publish('snackbar', vm);
            return Observable.forkJoin(this._data.delete('document', { search: params }), Observable.of(data));

        })
        .map((res) => {
            this._objectType = 'Document';
            let vm = ObjectHelper.createRemoveCompleteSnackbarMessage(this._objectType, res[1].Title, res[1].Id);
            this._messenger.publish('snackbar', vm);
            this._store.dispatch(new employeeActions.EmployeeLoadTimelineLoadAction(true));
            return new employeeActions.RemoveEmployeeDocumentComplete(true);
        });

}