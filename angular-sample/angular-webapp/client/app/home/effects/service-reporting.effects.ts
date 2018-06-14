import { extractServiceReportingStatisticsInformation } from '../common/extract-helpers';
import { AeInformationBarItem } from '../../atlas-elements/common/models/ae-informationbar-item';
import { isNullOrUndefined } from 'util';
import { Observable } from 'rxjs/Rx';
import { Action, Store } from '@ngrx/store';
import { Actions, Effect } from '@ngrx/effects';
import { RestClientService } from '../../shared/data/rest-client.service';
import { Injectable } from '@angular/core';
import * as fromRoot from '../../shared/reducers/index';
import * as serviceReportActions from '../actions/service-reporting.actions';
import { DashboardArea } from '../common/dashboard-area.enum';
import { Http, URLSearchParams } from '@angular/http';
import { AtlasApiError } from '../../shared/error-handling/atlas-api-error';
import { MessageEvent } from '../../atlas-elements/common/models/message-event.enum';
import { ObjectHelper } from '../../shared/helpers/object-helper';
import { MessengerService } from '../../shared/services/messenger.service';
import * as errorActions from '../../shared/actions/error.actions';

@Injectable()
export class ServiceReportEffects {
    constructor(private _data: RestClientService, private _actions$: Actions, private _store: Store<fromRoot.State>) {

    }

    @Effect()
    serviceReporting$: Observable<Action> = this._actions$.ofType(serviceReportActions.ActionTypes.LOAD_SERVICE_REPORTING)
        .switchMap((action) => {
            let params: URLSearchParams = new URLSearchParams();
            params.set('EmployeeId', action.payload);
            params.set('Area', '7');
            params.set('requestedCodes', '');
            return this._data.get('Statistics', { search: params })
        })
        .map((res) => new serviceReportActions.ServiceReportingLoadCompleteAction(extractServiceReportingStatisticsInformation(res)))
        .catch((error) => {
            return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'Statistics', null)));
        });
}