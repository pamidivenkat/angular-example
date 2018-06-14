import { extractTodaysOverviewStatisticsInformation } from '../common/extract-helpers';
import { DashboardArea } from '../common/dashboard-area.enum';
import { ClaimsHelperService } from '../../shared/helpers/claims-helper';
import { RestClientService } from '../../shared/data/rest-client.service';
import { Observable } from 'rxjs/Rx';
import { Action, Store } from '@ngrx/store';
import { Actions, Effect, toPayload } from '@ngrx/effects';
import { URLSearchParams } from '@angular/http';
import { Injectable } from '@angular/core';
import { isNullOrUndefined } from 'util';
import * as fromRoot from '../../shared/reducers/index';
import * as todaysOverviewActions from '../actions/todays-overview.actions';
import { AtlasApiError } from '../../shared/error-handling/atlas-api-error';
import { MessageEvent } from '../../atlas-elements/common/models/message-event.enum';
import { ObjectHelper } from '../../shared/helpers/object-helper';
import { MessengerService } from '../../shared/services/messenger.service';
import * as errorActions from '../../shared/actions/error.actions';

const EMPTY_GUID = '00000000-0000-0000-0000-000000000000';

@Injectable()
export class TodaysOverviewEffects {
    constructor(private _data: RestClientService, private _actions$: Actions, private _store: Store<fromRoot.State>) {

    }

    @Effect()
    todaysOverview$: Observable<Action> = this._actions$.ofType(todaysOverviewActions.ActionTypes.TODAYS_OVERVIEW_LOAD)
        .map(toPayload)
        .switchMap((payload) => {
            let params: URLSearchParams = new URLSearchParams();
            let empId: string = payload.EmployeeId;
            if (!isNullOrUndefined(empId)) {
                params.set('EmployeeId', empId);
            } else {
                params.set('EmployeeId', EMPTY_GUID);
            }
            params.set('Area', DashboardArea.TodaysOverview.toString());
            return this._data.get('Statistics', { search: params });
        })
        .map((res) => new todaysOverviewActions.TodaysOverviewLoadCompleteAction(extractTodaysOverviewStatisticsInformation(res)))
        .catch((error) => {
            return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'Todays overview', null)));
        });
}