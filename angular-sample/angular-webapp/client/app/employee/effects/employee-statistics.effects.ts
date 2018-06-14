import { extractInformationBarItems } from '../../shared/helpers/extract-helpers';
import { StatisticCode } from '../../home/common/statisticcode.enum';
import { DashboardArea } from '../../home/common/dashboard-area.enum';
import { extractEmployeeStatistics } from '../common/extract-helpers';
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
export class EmployeeStatisticsEffects {
    constructor(private _data: RestClientService, private _actions$: Actions, private _store: Store<fromRoot.State>) {

    }

    getStatisticRequestCodes() {
        return [StatisticCode.HolidaysAvailable, StatisticCode.DocumentsAwaiting, StatisticCode.TrainingCourses].join(',');
    }

    @Effect()
    employeeStatistics$: Observable<Action> = this._actions$.ofType(employeeActions.ActionTypes.EMPLOYEE_STATISTICS_LOAD)
        .map(toPayload)
        .switchMap((payload) => {
            let params: URLSearchParams = new URLSearchParams();
            let employeeId: string = payload.EmployeeId;
            params.set('EmployeeId', employeeId);
            params.set('Area', DashboardArea.EmployeeSummary.toString());
            params.set('requestedCodes', this.getStatisticRequestCodes());
            return this._data.get('Statistics', { search: params })
            .map((res) => new employeeActions.EmployeeStatisticsLoadCompleteAction(extractInformationBarItems(res)))
            .catch((error) => {
                return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'Employee Statistic', payload.EmployeeId)));
            })
        })
}