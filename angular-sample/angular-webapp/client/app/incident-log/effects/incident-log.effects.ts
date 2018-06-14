import { Injectable } from '@angular/core';
import { Effect, Actions, toPayload } from '@ngrx/effects';
import { Observable } from 'rxjs/Rx';
import { Action, Store } from '@ngrx/store';
import * as incidentLogActions from '../actions/incident-log.actions';
import { RestClientService } from '../../shared/data/rest-client.service';
import { ClaimsHelperService } from '../../shared/helpers/claims-helper';
import * as fromRoot from '../../shared/reducers/index';
import { getSearchParamsFromFilters, extractIncidentListModel, extractIncidentLogStats } from '../common/extract-helpers';
import { URLSearchParams } from '@angular/http';

import { MessengerService } from '../../shared/services/messenger.service';
import { CatchErrorAction } from '../../shared/actions/error.actions';
import { MessageEvent } from '../../atlas-elements/common/models/message-event.enum';
import { AtlasApiError } from './../../shared/error-handling/atlas-api-error';

@Injectable()
export class IncidentLogEffects {

    @Effect()
    incidents$: Observable<Action> = this._actions$.ofType(incidentLogActions.ActionTypes.LOAD_INCIDENTS)
        .map(toPayload)
        .switchMap((data: any) => {
            let params: URLSearchParams = getSearchParamsFromFilters(data.Filters, data.PagingInfo, data.SortingInfo);
            params.set('fields', `Id,ReferenceNumber,WhenHappened,WhenReported,IncidentTypeName as CategoryName,InjuredPersonName,StatusId,CreatedBy,CreatedUser,ReportedUser`);
            return this._data.get('IncidentView/GetSpecificFields', { search: params })
                .map(res => {
                    let paging = data.PagingInfo;
                    if (parseInt(paging.get('pageNumber'), 10) === 1) {
                        paging.set('TotalCount', res.json().PagingInfo.TotalCount);
                    }
                    return new incidentLogActions.LoadIncidentsCompleteAction({
                        Incidents: extractIncidentListModel(res),
                        IncidentPagingInfo: paging
                    });
                }).catch((error) => {
                    return Observable.of(new CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'incident log', '', '')));
                });
        });

    @Effect()
    incidentLogStatsData$: Observable<Action> = this._actions$.ofType(incidentLogActions.ActionTypes.LOAD_INCIDENT_LOG_STATS)
        .map(toPayload)
        .withLatestFrom(this._store, (payload, state) => { return { _payload: payload, _state: state.lookupState }; })
        .switchMap((data) => {
            let employeeId = this._claimsHelper.getEmpIdOrDefault();
            let params: URLSearchParams = new URLSearchParams();
            params.set('EmployeeId', employeeId);
            params.set('Area', '8');
            params.set('requestedCodes', '45,46,47');
            return this._data.get('Statistics', { search: params })
                .map((res) => new incidentLogActions.LoadIncidentLogStatsCompleteAction(extractIncidentLogStats(res
                    , data._state.IncidentCategories)));
        })
        .catch((error) => {
            return Observable.of(new CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'incident log stats', '', '')));
        });

    constructor(private _data: RestClientService
        , private _actions$: Actions
        , private _store: Store<fromRoot.State>
        , private _claimsHelper: ClaimsHelperService) {

    }
}
