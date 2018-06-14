import { Injectable } from "@angular/core";
import { RestClientService } from "../../../shared/data/rest-client.service";
import { Store, Action } from "@ngrx/store";
import { Actions, Effect, toPayload } from '@ngrx/effects';
import * as fromRoot from '../../../shared/reducers/index';
import { Observable } from "rxjs/Observable";
import * as empoloyeeBulkUpdateActions from '../actions/employee-bulkupdate.actions';
import { Http, URLSearchParams } from '@angular/http';
import { isNullOrUndefined } from "util";
import { SortDirection } from "../../../atlas-elements/common/models/ae-sort-model";
import * as Immutable from 'immutable';
import { ObjectHelper } from "../../../shared/helpers/object-helper";
import { MessengerService } from "../../../shared/services/messenger.service";
import * as errorActions from '../../../shared/actions/error.actions';
import { AtlasApiError } from "../../../shared/error-handling/atlas-api-error";
import { MessageEvent } from '../../../atlas-elements/common/models/message-event.enum';
import { AtlasApiResponse, AtlasParams } from "../../../shared/models/atlas-api-response";
import { extractEmployees, extractEmployeePagingInfo, extractSuccessCount } from "../common/extract-helper";
@Injectable()
export class EmployeeBulkUpdateEffects {
    constructor(private _data: RestClientService
        , private _actions$: Actions
        , private _store: Store<fromRoot.State>
        , private _messenger: MessengerService) {

    }

    @Effect()
    loadEmployeesForBulkUpdate$: Observable<Action> = this._actions$.ofType(empoloyeeBulkUpdateActions.ActionTypes.EMPLOYEE_BULK_UPDATE_LOAD_EMPLOYEES)
        .map(toPayload)
        .switchMap((payLoad) => {
            let params: URLSearchParams = new URLSearchParams();
            params.set('pageNumber', payLoad.PageNumber.toString());
            params.set('pageSize', payLoad.PageSize.toString());
            params.set('employeesByLeaverFilter', '0');
            if (!isNullOrUndefined(payLoad.Params)) {
                let atlasParams = <Array<AtlasParams>>payLoad.Params;
                atlasParams.forEach((param, index) => {
                    params.set(payLoad.Params[index]._key, payLoad.Params[index]._value.toString());
                });
            }
            params.set('type', 'Bulk');
            return this._data.get('employee/GetBulkDetails', { search: params });
        })
        .map((res) => {
            return new empoloyeeBulkUpdateActions.EmployeeBulkUpdateLoadEmployeesCompleteAction({ Entities: extractEmployees(res), PagingInfo: extractEmployeePagingInfo(res) });
        }
        ).catch((error) => {
            return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'Employee', 'Employee Bulk Update Load Employees')));
        });



    @Effect()
    bulkUpdateEmployee$: Observable<Action> = this._actions$.ofType(empoloyeeBulkUpdateActions.ActionTypes.EMPLOYEE_BULK_UPDATE_UPDATE_EMPLOYEES)
        .map(toPayload)
        .switchMap((payLoad) => {
            let params: URLSearchParams = new URLSearchParams();
            params.set('isCollection', 'true');
            params.set('isBulkUpdate', 'true');
            params.set('skipUserEmail', 'false');
            let vm = ObjectHelper.operationInProgressSnackbarMessage('Updating Employees');
            this._messenger.publish('snackbar', vm);
            return this._data.post('employee/BulkUpdateEmployees', payLoad, { search: params });
        })
        .map((res) => {
            let vm = ObjectHelper.operationCompleteSnackbarMessage('Updating Employees Completed');
            this._messenger.publish('snackbar', vm);
            return new empoloyeeBulkUpdateActions.EmployeeBulkUpdateCompleteAction({ Entities: res.json(), successCount: extractSuccessCount(res) });
        }
        ).catch((error) => {
            return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Update, 'Employee', 'Some error occurred  while updating employees.')));
        });

    @Effect()
    autoSaveEmployee$: Observable<Action> = this._actions$.ofType(empoloyeeBulkUpdateActions.ActionTypes.EMPLOYEE_BULK_UPDATE_AUTO_SAVE)
        .map(toPayload)
        .switchMap((payLoad) => {
            let params: URLSearchParams = new URLSearchParams();
            params.set('autoSave', 'true');
            params.set('skipUserEmail', 'false');
            return this._data.post('employee', payLoad, { search: params });
        })
        .map((res) => {
            return new empoloyeeBulkUpdateActions.EmployeeBulkUpdateAutoSaveCompleteAction({ Id: res.json().Id, Status: true });
        }
        ).catch((error) => {
            return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Update, 'Employee', 'Some error occurred  while auto saving employee.')));
        });
}
