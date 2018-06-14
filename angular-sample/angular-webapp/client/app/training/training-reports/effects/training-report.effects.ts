import { StringHelper } from '../../../shared/helpers/string-helper';
import { isNullOrUndefined } from 'util';
import { getAtlasParamValueByKey } from '../../../root-module/common/extract-helpers';
import { extractPagingInfo } from '../../../employee/common/extract-helpers';
import { extractTrainingCoursePagingInfo, extractTrainingReportsList } from '../../common/extract-helper';
import { SortDirection } from '../../../atlas-elements/common/models/ae-sort-model';
import { Observable } from 'rxjs/Rx';
import { Action, Store } from '@ngrx/store';
import { RestClientService } from '../../../shared/data/rest-client.service';
import { Injectable } from '@angular/core';
import * as fromRoot from '../../../shared/reducers/index';
import { Actions, Effect, toPayload } from '@ngrx/effects';
import { Http, URLSearchParams } from '@angular/http';
import { AtlasApiResponse } from '../../../shared/models/atlas-api-response';
import * as errorActions from '../../../shared/actions/error.actions';
import { AtlasApiError } from '../../../shared/error-handling/atlas-api-error';
import { MessageEvent } from '../../../atlas-elements/common/models/message-event.enum';
import { TrainingReports } from '../../models/training-reports';
import { MessengerService } from '../../../shared/services/messenger.service';
import { ObjectHelper } from '../../../shared/helpers/object-helper';
import * as TrainingReportActions from '../actions/training-report.actions';
import { CatchErrorAction } from '../../../shared/actions/error.actions';

@Injectable()
export class TrainingReportsFromTrainingsEffects {
    constructor(private _data: RestClientService, private _actions$: Actions, private _messenger: MessengerService) {

    }
    @Effect()
    trainingReportsInfo$: Observable<Action> = this._actions$.ofType(TrainingReportActions.ActionTypes.TRAINING_REPORTS_LOAD)
        .map(toPayload)
        .switchMap((payload) => {
            let params: URLSearchParams = new URLSearchParams();
            params.set('direction', payload.SortBy.Direction === SortDirection.Ascending ? 'asc' : 'desc');
            params.set('pageNumber', payload.PageNumber.toString());
            params.set('pageSize', payload.PageSize.toString());
            params.set('sortField', payload.SortBy.SortField);
            params.set('TrainingUserCourseModuleExclDeletedUserFilter', 'true');
            params.set('TrainingUserCourseModuleExclLeaverFilter','true');
            payload.Params.forEach((element) => {
                if (!isNullOrUndefined(element.Value) && !StringHelper.isNullOrUndefinedOrEmpty(String(element.Value)))
                    params.append(element.Key, element.Value);
            });
            return this._data.get('TrainingReport', { search: params })
                .map((res) => {
                    return new TrainingReportActions.TrainingReportsLoadComplete({ data: extractTrainingReportsList(res), pagingInfo: extractTrainingCoursePagingInfo(res) });
                }).catch((error) => {
                    return Observable.of(new CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'Training Reports', null)));
                });
        });


    @Effect()
    trainingReportDownloadInfo$: Observable<Action> = this._actions$.ofType(TrainingReportActions.ActionTypes.TRAINING_REPORT_DOWNLOAD)
        .map(toPayload)
        .switchMap((payload) => {
            return this._data.get('TrainingUserCourseModule/' + payload + '?' + 'fields=' + 'Id,Certificates')
                .map((res) => {
                    return new TrainingReportActions.TrainingReportDownLoadCompleteAction(res.json().Certificates);
                }).catch((error) => {
                    return Observable.of(new CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'Training report', null)));
                });
        });
}