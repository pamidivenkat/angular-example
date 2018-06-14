import { EmployeeFullEntity } from '../models/employee-full.model';
import { isNullOrUndefined } from 'util';
import { StorageService } from '../../shared/services/storage.service';
import {
    calculateAge,
    extractPersonalDataFromFullEntity,
    mapEthnicgroupsToAeSelectItems,
    mergeEmployeePersonal,
    updateEthnicGroup,
    extractLastUpdatedUserInfo
} from '../common/extract-helpers';
import { ClaimsHelperService } from '../../shared/helpers/claims-helper';
import { Observable } from 'rxjs/Rx';
import { RestClientService } from '../../shared/data/rest-client.service';
import { Http, URLSearchParams } from '@angular/http';
import { Action, Store } from '@ngrx/store';
import { Actions, Effect, toPayload } from '@ngrx/effects';
import { Injectable } from '@angular/core';
import * as fromRoot from '../../shared/reducers/index';
import * as employeeActions from '../actions/employee.actions';

import { ObjectHelper } from './../../shared/helpers/object-helper';
import { MessengerService } from './../../shared/services/messenger.service';
import * as errorActions from './../../shared/actions/error.actions';
import { AtlasApiError } from './../../shared/error-handling/atlas-api-error';
import { MessageEvent } from '../../atlas-elements/common/models/message-event.enum';


@Injectable()
export class EmployeePersonalEffects {

    constructor(private _data: RestClientService
        , private _actions$: Actions
        , private _store: Store<fromRoot.State>
        , private _storageService: StorageService
        , private _messenger: MessengerService
        , private _claimsHelper: ClaimsHelperService
    ) {

    }

    @Effect()
    employeePersonalUpdate$: Observable<Action> = this._actions$.ofType(employeeActions.ActionTypes.EMPLOYEE_PERSONAL_UPDATE)
        .map(toPayload)
        .withLatestFrom(this._store, (payload, state) => { return { _payload: payload, _empPersonal: state.employeeState.EmployeePersonalVM }; })
        .switchMap((pl) => {
            let payload: EmployeeFullEntity = pl._payload;

            let employeeName = payload.FirstName + ' ' + payload.Surname;
            let vm = ObjectHelper.createUpdateInProgressSnackbarMessage('Employee', employeeName, payload.Id);
            this._messenger.publish('snackbar', vm);
            return this._data.post(`employee`, payload)
                .mergeMap((res) => {
                    let vm = ObjectHelper.createUpdateCompleteSnackbarMessage('Employee', employeeName, payload.Id);
                    this._messenger.publish('snackbar', vm);
                    if (this._claimsHelper.getEmpId() && this._claimsHelper.getEmpId().toLocaleLowerCase() == payload.Id.toLowerCase()) {
                        //if updated employee record is self then update claims
                        this._claimsHelper.TriggerToUpdatedClaimsFromEmpPersonal(res.json());
                    }
                    let body = {
                        ModifiedOn: Date.now(),
                        ModifiedFName: this._claimsHelper.getUserFirstName(),
                        ModifiedLName: this._claimsHelper.getUserLastName()
                    };
                    return [
                        new employeeActions.EmployeeJobLoadAction(payload.Id.toLowerCase()),
                        new employeeActions.EmployeePersonalUpdateCompleteAction(res.json()),                        
                        new employeeActions.LoadEmployeeStatCompleteAction(extractLastUpdatedUserInfo(body))                        
                    ]
                })
                .catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Update, 'Employee', employeeName)));
                })
        })
}
