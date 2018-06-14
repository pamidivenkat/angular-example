import { Injectable } from "@angular/core";
import { RestClientService } from "../../../shared/data/rest-client.service";
import { Store, Action } from "@ngrx/store";
import { Actions, Effect, toPayload } from '@ngrx/effects';
import * as fromRoot from '../../../shared/reducers/index';
import { Observable } from "rxjs/Observable";
import * as empoloyeeImportActions from '../actions/employee-import.actions';
import { Http, URLSearchParams } from '@angular/http';
import { isNullOrUndefined } from "util";
import { SortDirection } from "../../../atlas-elements/common/models/ae-sort-model";
import { extractImportHistory, extractPagingInfo, extractImportResults, extractTotalCount, extractImportEmployees, extractImportedEmployees } from "../common/extract-helper";
import { EmployeeImportParams } from "../models/employee-import-params";
import * as Immutable from 'immutable';
import { ObjectHelper } from "../../../shared/helpers/object-helper";
import { MessengerService } from "../../../shared/services/messenger.service";
import * as errorActions from '../../../shared/actions/error.actions';
import { AtlasApiError } from "../../../shared/error-handling/atlas-api-error";
import { MessageEvent } from '../../../atlas-elements/common/models/message-event.enum';
@Injectable()
export class EmployeeImportEffects {
    constructor(private _data: RestClientService
        , private _actions$: Actions
        , private _store: Store<fromRoot.State>
        , private _messenger: MessengerService) {

    }

    @Effect()
    importHistoryLoad$: Observable<Action> = this._actions$.ofType(empoloyeeImportActions.ActionTypes.EMPLOYEE_IMPORT_HISTORY_LOAD)
        .map(toPayload)
        .withLatestFrom(this._store, (payload, state) => { return { _payload: payload, _state: state.employeeImportState }; })
        .switchMap((payLoad) => {
            let params: URLSearchParams = new URLSearchParams();
            params.set('fields', 'Id,FileName,CreatedOn,Author.FirstName,Author.LastName,IsBackgroundJob,Status,FileStorageId');
            let pageNumber = 1;
            let pageSize = 10;
            let sortField = 'CreatedOn';
            let direction = 'desc';
            if (payLoad._state && payLoad._state.Filters) {
                if (!isNullOrUndefined(payLoad._state.Filters['pageNumber'])) {
                    pageNumber = payLoad._state.Filters['pageNumber'];
                }
                if (!isNullOrUndefined(payLoad._state.Filters['pageSize'])) {
                    pageSize = payLoad._state.Filters['pageSize'];
                }
                if (!isNullOrUndefined(payLoad._state.Filters['sortField'])) {
                    sortField = payLoad._state.Filters['sortField'];
                }
                if (!isNullOrUndefined(payLoad._state.Filters['direction'])) {
                    let sortDirection = '';
                    if (payLoad._state.Filters['direction'] == SortDirection.Ascending) {
                        sortDirection = 'asc';
                    }
                    else {
                        sortDirection = 'desc';
                    }
                    direction = sortDirection;
                }
            }
            params.set('pageNumber', pageNumber.toString());
            params.set('pageSize', pageSize.toString());
            params.set('sortField', sortField);
            params.set('direction', direction);
            params.set('id', '00000000-0000-0000-0000-000000000000');
            return this._data.get('importhistory', { search: params });
        })
        .map(res => {
            return new empoloyeeImportActions.EmployeeImportHistoryLoadCompleteAction({ ImportHistoryList: extractImportHistory(res), ImportHistoryPagingInfo: extractPagingInfo(res) });
        }
        );

    @Effect()
    importResultLoad$: Observable<Action> = this._actions$.ofType(empoloyeeImportActions.ActionTypes.EMPLOYEE_IMPORT_HISTORY_LOAD_IMPORT_RESULTS)
        .map(toPayload)
        .switchMap((payLoad) => {
            let params: URLSearchParams = new URLSearchParams();
            params.set('action', 'details');
            params.set('fileStorageId', payLoad['fileStorageId']);
            params.set('fileName', payLoad['fileName']);
            return this._data.get('importhistory', { search: params });
        })
        .map(res => {
            return new empoloyeeImportActions.EmployeeImportHistoryLoadImportResultsCompleteAction({ ImportResult: extractImportResults(res), PageNumber: 1, PageSize: 10 });
        }
        );
    @Effect()
    importDescription$: Observable<Action> = this._actions$.ofType(empoloyeeImportActions.ActionTypes.EMPLOYEE_IMPORT_DESCRIPTION_LOAD)
        .map(toPayload)
        .switchMap((payLoad) => {
            let params: URLSearchParams = new URLSearchParams();
            params.set('id', '17A79103-7B94-4AB8-ABCF-E045AD1CF554');
            return this._data.get('block', { search: params });
        })
        .map(res => {
            return new empoloyeeImportActions.EmployeeImportDescriptionLoadCompleteAction(res.json().Description);
        }
        );
    @Effect()
    importEmployees$: Observable<Action> = this._actions$.ofType(empoloyeeImportActions.ActionTypes.EMPLOYEE_IMPORT_EMPLOYEES)
        .map(toPayload)
        .withLatestFrom(this._store, (payload, state) => { return { _payload: payload, _state: state.employeeImportState }; })
        .switchMap((payLoad) => {
            let params: URLSearchParams = new URLSearchParams();
            let importParams = <EmployeeImportParams>payLoad._state.ImportParams;

            params.set('action', 'Import');
            params.set('fileStorageId', importParams ? importParams.FileStorageIdentifier : null);
            params.set('fileName', importParams ? importParams.FileName : null);
            params.set('isFromImport', 'true');
            return this._data.get('employee', { search: params });
        })
        .map(res => {
            return new empoloyeeImportActions.EmployeeImportCompleteAction({ Entities: extractImportEmployees(res), Count: (res.json() && res.json().Entities ? res.json().Entities.length : 0) });
        }
        );

    @Effect()
    bulkInsertImportEmployees$: Observable<Action> = this._actions$.ofType(empoloyeeImportActions.ActionTypes.EMPLOYEE_IMPORT_INSERT_EMPLOYEES)
        .map(toPayload)
        .withLatestFrom(this._store, (payload, state) => { return { _payload: payload, _state: state.employeeImportState }; })
        .switchMap((payLoad) => {
            let params: URLSearchParams = new URLSearchParams();
            params.set('isCollection', 'true');
            params.set('action', 'bulkinsert');
            params.set('fileStorageId', payLoad._state.ImportParams.FileStorageIdentifier);
            params.set('fileName', payLoad._state.ImportParams.FileName);
            params.set('skipUserEmail', 'false');
            let vm = ObjectHelper.createInsertInProgressSnackbarMessage('EMPLOYEE', 'Employee Import');
            this._messenger.publish('snackbar', vm);

            return this._data.put('employee', payLoad._payload, { search: params });
        })
        .map(res => {
            let vm = ObjectHelper.createInsertCompleteSnackbarMessage('EMPLOYEE', 'Employee Import');
            this._messenger.publish('snackbar', vm);
            return new empoloyeeImportActions.EmployeeBulkInsertActionComplete(extractImportedEmployees(res));
        }
        ).catch((error) => {
            return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Create, 'Employee', 'Employee Import')));
        });
}