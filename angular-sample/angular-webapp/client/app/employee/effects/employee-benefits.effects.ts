import { EmployeePayrollDetails } from '../models/employee.model';
import { MessengerService } from '../../shared/services/messenger.service';
import { ObjectHelper } from '../../shared/helpers/object-helper';
import { EmployeeFullEntity } from '../models/employee-full.model';
import { EmployeeFullEntityService } from '../services/employee-fullentity.service';
import { AtlasApiError } from '../../shared/error-handling/atlas-api-error';
import { RestClientService } from '../../shared/data/rest-client.service';
import { Injectable } from '@angular/core';
import { Action, Store } from '@ngrx/store';
import { Observable } from 'rxjs/Rx';
import { effects } from '@ngrx/effects/src/effects-subscription';
import { Actions, Effect, toPayload } from '@ngrx/effects';
import * as fromRoot from '../../shared/reducers/index';
import * as employeeActions from '../actions/employee.actions';
import { Http, URLSearchParams } from '@angular/http';
import { EmployeeBenefitSaveCompleteAction } from "../actions/employee.actions";
import { MessageEvent } from '../../atlas-elements/common/models/message-event.enum';
import * as errorActions from './../../shared/actions/error.actions';



@Injectable()
export class EmployeeBenefitsEffects {

    constructor(private _data: RestClientService
        , private _actions$: Actions
        , private _store: Store<fromRoot.State>
        , private _employeeFullEntityService: EmployeeFullEntityService
        , private _messenger: MessengerService) {

    }

    @Effect()
    employeeBenefitsSave$: Observable<Action> = this._actions$.ofType(employeeActions.ActionTypes.EMPLOYEE_BENEFITS_SAVE)
        .map(toPayload)
        .withLatestFrom(this._store, (payload, state) => { return { _payload: payload, _empPersonal: state.employeeState.EmployeePersonalVM }; })
        .switchMap((pl) => {
            let payload: EmployeePayrollDetails = pl._payload;
            let employeeName = pl._empPersonal.FirstName + ' ' + pl._empPersonal.Surname
            let vm = ObjectHelper.createUpdateInProgressSnackbarMessage('Employee Benefits', employeeName, payload.Id);
            this._messenger.publish('snackbar', vm);
            return this._data.post(`EmployeePayroll`, payload)
                .map((res) => {
                    let vm = ObjectHelper.createUpdateCompleteSnackbarMessage('Employee Benefits', employeeName, payload.Id);
                    this._messenger.publish('snackbar', vm);
                    return new employeeActions.EmployeeBenefitSaveCompleteAction(true);
                })
                .catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Update, 'Employee Benefits', employeeName, payload.Id)));
                })
        })

    @Effect()
    loademployeeBenefitFullEntity$: Observable<Action> = this._actions$.ofType(employeeActions.ActionTypes.EMPLOYEE_BENEFITS_LOAD_BY_ID)
        .map(toPayload)
        .withLatestFrom(this._store, (payload, state) => { return { _payload: payload, _empPersonal: state.employeeState.EmployeePersonalVM }; })
        .switchMap((pl) => {
            let payrollId = pl._payload;
            let employeeName = pl._empPersonal.FirstName + ' ' + pl._empPersonal
            return this._data.get(`employeepayroll/getbyid/${payrollId}`)
                .map((res) => {
                    return new employeeActions.EmployeeLoadBenefitsByIdCompleteAction(<EmployeePayrollDetails>res.json());
                })
                .catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'Employee Benefits', employeeName, null)));
                })
        })
}