import { AtlasApiResponse, AtlasApiRequestWithParams, AtlasParams } from './../../../shared/models/atlas-api-response';
import { ClaimsHelperService } from './../../../shared/helpers/claims-helper';
import { Observable } from 'rxjs/Rx';
import { RestClientService } from './../../../shared/data/rest-client.service';
import { Http, URLSearchParams } from '@angular/http';
import { Action, Store } from '@ngrx/store';
import { Actions, Effect, toPayload } from '@ngrx/effects';
import { Injectable } from '@angular/core';
import * as fromRoot from './../../../shared/reducers/index';
import * as employeeAddActions from '../actions/employee-add.actions';
import { StringHelper } from './../../../shared/helpers/string-helper';
import { ObjectHelper } from './../../../shared/helpers/object-helper';
import { MessengerService } from './../../../shared/services/messenger.service';
import * as errorActions from './../../../shared/actions/error.actions';
import { AtlasApiError } from './../../../shared/error-handling/atlas-api-error';
import { MessageEvent } from './../../../atlas-elements/common/models/message-event.enum';
import { EmployeeFullEntity } from './../../../employee/models/employee-full.model';

@Injectable()
export class EmployeeAddEffects {
    constructor(private _data: RestClientService
        , private _actions$: Actions
        , private _claimsHelper: ClaimsHelperService
        , private _store: Store<fromRoot.State>
        , private _messenger: MessengerService
    ) {

    }

    @Effect()
    addEmployeeDetails$: Observable<Action> = this._actions$.ofType(employeeAddActions.ActionTypes.EMPLOYEE_DETAILS_ADD)
        .map(toPayload)
        .withLatestFrom(this._store, (payload: EmployeeFullEntity, state) => { return { payload: payload }; })
        .switchMap((pl) => {
            let payload = pl.payload;
            let empFullName = payload.FirstName + ' ' + payload.MiddleName + ' ' + payload.Surname;
            let vm = ObjectHelper.createInsertInProgressSnackbarMessage('Employee', empFullName);
            this._messenger.publish('snackbar', vm);
            return this._data.put(`Employee`, payload)
                .mergeMap((res) => {
                    let vm = ObjectHelper.createInsertCompleteSnackbarMessage('Employee', empFullName);
                    this._messenger.publish('snackbar', vm);
                    var newEmpId = res.json().Id;
                    return [
                        new employeeAddActions.EmployeeDetailsAddCompleteAction(newEmpId)
                    ];
                })
                .catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Create, 'Employee', 'Add employee')));
                })
        })

}