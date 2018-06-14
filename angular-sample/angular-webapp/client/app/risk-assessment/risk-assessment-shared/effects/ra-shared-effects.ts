import { RiskAssessment } from './../../models/risk-assessment';
import { Injectable } from "@angular/core";
import { RestClientService } from './../../../shared/data/rest-client.service';
import { Store, Action } from "@ngrx/store";
import { Actions, Effect, toPayload } from '@ngrx/effects';
import * as fromRoot from './../../../shared/reducers/index';
import { Observable } from "rxjs/Observable";
import { Http, URLSearchParams } from '@angular/http';
import { isNullOrUndefined } from "util";
import { ObjectHelper } from './../../../shared/helpers/object-helper';
import { MessengerService } from './../../../shared/services/messenger.service';
import * as errorActions from './../../../shared/actions/error.actions';
import { AtlasApiError } from './../../../shared/error-handling/atlas-api-error';
import { MessageEvent } from './../../../atlas-elements/common/models/message-event.enum';
import * as raSharedActions from '../actions/ra-shared-actions';
import { AtlasParams, AtlasApiResponse, AtlasApiRequestWithParams } from './../../../shared/models/atlas-api-response';
import { SortDirection } from './../../../atlas-elements/common/models/ae-sort-model';
import { getAtlasParamValueByKey } from './../../../root-module/common/extract-helpers';

@Injectable()
export class RiskAssessmentSharedEffects {
    constructor(private _data: RestClientService
        , private _actions$: Actions
        , private _store: Store<fromRoot.State>
        , private _messenger: MessengerService) {

    }


    @Effect()
    loadRiskAssessment$: Observable<Action> = this._actions$.ofType(raSharedActions.ActionTypes.LOAD_LIVE_RISKASSESSMENTS)
        .map(toPayload)
        .switchMap((payload: AtlasApiRequestWithParams) => {
            let params: URLSearchParams = new URLSearchParams();           
            
            if(getAtlasParamValueByKey(payload.Params, 'Example')){
                 params.set('statusRAFilter', '0');
                 params.set('example', 'true');
            }else{
                 params.set('fields', 'Id,Name,ReferenceNumber,Site.Name as SiteName');
                 params.set('statusRAFilter', getAtlasParamValueByKey(payload.Params, 'Status'));
            }
            
            params.set('siteRAFilter', getAtlasParamValueByKey(payload.Params, 'SiteId'));
            params.set('searchBoxFilter', getAtlasParamValueByKey(payload.Params, 'Name'));
            params.set('pageNumber', payload.PageNumber.toString());
            params.set('pageSize', payload.PageSize.toString());
            params.set('sortField', payload.SortBy.SortField);
            params.set('direction', payload.SortBy.Direction === SortDirection.Ascending ? 'asc' : 'desc');
            return this._data.get('RiskAssessment', { search: params });
        })
        .map(res => {
            return new raSharedActions.LoadLiveRiskAssessmentsCompleteAction(<AtlasApiResponse<RiskAssessment>>res.json());
        }
        ).catch((error) => {
            return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'Risk asessment', 'Risk assessment')));
        });

}