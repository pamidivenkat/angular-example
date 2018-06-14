import { extractNewsData } from '../common/extract-helpers';
import { Injectable } from "@angular/core";
import { RestClientService } from '../../shared/data/rest-client.service';
import { Actions, Effect } from "@ngrx/effects";
import { Store, Action } from "@ngrx/store";
import * as fromRoot from '../../shared/reducers/index';
import { Observable } from "rxjs/Rx";
import * as newsActions from '../actions/news.actions';
import { Http, URLSearchParams } from '@angular/http';
import { ClaimsHelperService } from '../../shared/helpers/claims-helper';
import { AtlasApiError } from '../../shared/error-handling/atlas-api-error';
import { MessageEvent } from '../../atlas-elements/common/models/message-event.enum';
import { ObjectHelper } from '../../shared/helpers/object-helper';
import { MessengerService } from '../../shared/services/messenger.service';
import * as errorActions from '../../shared/actions/error.actions';

@Injectable()
export class NewsEffects {
    constructor(private _data: RestClientService, private _actions$: Actions, private _claims: ClaimsHelperService) { }

    @Effect()
    news$: Observable<Action> = this._actions$.ofType(newsActions.ActionTypes.LOAD_NEWS)
        .switchMap((map) => {
            let params: URLSearchParams = new URLSearchParams();
            params.set('action', 'getspecificfields');
            params.set('filterUserTipsView', 'true');
            params.set('direction', 'desc');
            params.set('fields', 'Id,Tip,Url,CreatedOn,Title');
            params.set('sortField', 'CreatedOn');
            params.set('isExample', 'true');
            params.set('pageNumber', '1');
            params.set('pageSize', '20');
            return this._data.get('tips', { search: params });
        }).map((res) => {
            return new newsActions.LoadNewsCompleteAction(extractNewsData(res.json()));
        }).catch((error) => {
            return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'News', null)));
        });
}