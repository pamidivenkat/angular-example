import { isNullOrUndefined } from 'util';
import { extractPagingInfo, extractReportList, extractReportsInformationBarItems } from '../common/extract-helper';
import { SortDirection } from '../../atlas-elements/common/models/ae-sort-model';
import { extractInformationBarItems } from '../../shared/helpers/extract-helpers';
import { Observable } from 'rxjs/Rx';
import { Injectable } from '@angular/core';
import { Action, Store } from '@ngrx/store';
import { RestClientService } from '../../shared/data/rest-client.service';
import * as fromRoot from '../../shared/reducers/index';
import { Actions, Effect, toPayload } from '@ngrx/effects';
import * as ReportActions from '../actions/report-actions';
import { Http, URLSearchParams } from '@angular/http';

@Injectable()
export class ReportsEffects {
    constructor(private _data: RestClientService, private _actions$: Actions, private _store: Store<fromRoot.State>) {

    }

    @Effect()
    myabsences$: Observable<Action> = this._actions$.ofType(ReportActions.ActionTypes.LOAD_REPORTS, ReportActions.ActionTypes.LOAD_REPORTS_ONPAGECHANGE, ReportActions.ActionTypes.LOAD_REPORTS_ONSORT)
        .map(toPayload)
        .withLatestFrom(this._store, (payload, state) => { return { _payload: payload, _state: state.reportsState }; })
        .switchMap((payLoad) => {
            let params: URLSearchParams = new URLSearchParams();
            params.set('fields', 'Id,Name,CategoryId,IsPublished,Url,Version');
            let pageNumber = 1;
            let pageSize = 10;
            let sortField = 'Name';
            let direction = 'asc';
            if (payLoad._state && payLoad._state.Filters) {
                params.set('reportCategoryFilter', payLoad._state.Filters['reportCategoryFilter']);
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
            return this._data.get('Report', { search: params });
        })
        .map(res => {
            return new ReportActions.LoadReportsCompleteAction({ ReportsList: extractReportList(res), ReportsPagingInfo: extractPagingInfo(res) });
        }
        );

    @Effect()
    reportsInformationComponent$: Observable<Action> = this._actions$.ofType(ReportActions.ActionTypes.LOAD_INFORMATION_COMPONENT)
        .switchMap((action) => {
            let params: URLSearchParams = new URLSearchParams();
            params.set('EmployeeId', action.payload);
            params.set('Area', '6');
            params.set('requestedCodes', '27,28,29,30,31,32');
            return this._data.get('Statistics', { search: params })
        })
        .map((informationBarItems) => {
            {
                return new ReportActions.LoadReportsInformationComponentCompleteAction(extractReportsInformationBarItems(informationBarItems));
            }
        });

    @Effect()
    removeReport$: Observable<Action> = this._actions$.ofType(ReportActions.ActionTypes.REMOVE_REPORT)
        .switchMap((action) => {
            let params: URLSearchParams = new URLSearchParams();
            let apiUrl = 'Report/' + action.payload;
            return this._data.delete(apiUrl)
        })
        .map((informationBarItems) => {
            {
                return new ReportActions.LoadReportsAction({});
            }
        });

    @Effect()
    publishReport$: Observable<Action> = this._actions$.ofType(ReportActions.ActionTypes.PUBLISH_REPORT)
        .switchMap((action) => {
            let params: URLSearchParams = new URLSearchParams();
            params.set('id', action.payload);
            params.set('publish', 'true');
            return this._data.post('report', null, { search: params })
        })
        .map((informationBarItems) => {
            {
                return new ReportActions.LoadReportsAction({});
            }
        });
}