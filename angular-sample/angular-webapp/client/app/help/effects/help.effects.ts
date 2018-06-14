import { Injectable } from '@angular/core';
import { URLSearchParams } from '@angular/http';
import { Actions, Effect, toPayload } from '@ngrx/effects';
import { Action, Store } from '@ngrx/store';
import { Observable } from 'rxjs/Rx';

import { SortDirection } from '../../atlas-elements/common/models/ae-sort-model';
import { MessageEvent } from '../../atlas-elements/common/models/message-event.enum';
import { RestClientService } from '../../shared/data/rest-client.service';
import { ClaimsHelperService } from '../../shared/helpers/claims-helper';
import { State } from '../../shared/reducers';
import * as fromRoot from '../../shared/reducers/index';
import * as helpActions from '../actions/help.actions';
import * as errorActions from './../../shared/actions/error.actions';
import { AtlasApiError } from './../../shared/error-handling/atlas-api-error';
import { ObjectHelper } from './../../shared/helpers/object-helper';
import { MessengerService } from './../../shared/services/messenger.service';


@Injectable()
export class HelpEffects {
    private _objectType: string = 'Help content';
    constructor(
        private _data: RestClientService,
        private _actions$: Actions,
        private _store: Store<fromRoot.State>,
        private _claimsHelper: ClaimsHelperService,
        private _messenger: MessengerService
    ) {
    }

    @Effect()
    loadLatestReleases$: Observable<Action> = this._actions$.ofType(helpActions.ActionTypes.LOAD_LATEST_RELEASES)
        .switchMap((action) => {
            let params: URLSearchParams = new URLSearchParams();
            params.set('currentPage', action.payload.PageNumber);
            params.set('direction', 'desc');
            params.set('fields', action.payload.Params[0].Value);
            params.set('pageNumber', action.payload.PageNumber);
            params.set('pageSize', action.payload.PageSize);
            params.set('sortField', action.payload.SortBy.SortField);
            params.set('filterWhatsNewByCategory', action.payload.Params[1].Value);
            params.set('filterWhatsnewByIsActive','1')
            return this._data.get('whatsnew', { search: params })
        })
        .map((res) => {
            {
                return new helpActions.LoadLatestReleasesCompleteAction(res.json());
            }
        }).catch((error) => {
            return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, this._objectType, null)));
        });

    @Effect()
    LoadSelectedArticleBody$: Observable<Action> = this._actions$.ofType(helpActions.ActionTypes.LOAD_SELECTED_ARTICLE_BODY)
        .switchMap((action) => {
            let params: URLSearchParams = new URLSearchParams();
            params.set('action', 'getbyid');
            params.set('id', action.payload);
            params.set('fields', 'Id,Title,PublishDate,Body');
            return this._data.get('whatsnew', { search: params });
        })
        .map((res) => {
            {
                return new helpActions.LoadSelectedArticleBodyCompleteAction(res.json());
            }
        }).catch((error) => {
            return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, this._objectType, null)));
        });
    @Effect()
    loadHelpAreas$: Observable<Action> = this._actions$.ofType(helpActions.ActionTypes.LOAD_HELP_AREAS)
        .switchMap((action) => {
            let params: URLSearchParams = new URLSearchParams();
            params.set('direction', action.payload.SortBy.Direction == SortDirection.Ascending ? 'asc' : 'desc');
            params.set('fields', action.payload.Params[0].Value);
            params.set('pageNumber', action.payload.PageNumber);
            params.set('pageSize', action.payload.PageSize);
            params.set('sortField', action.payload.SortBy.SortField);
            return this._data.get('HelpArea', { search: params })
        })
        .map((res) => {
            {
                return new helpActions.LoadHelpAreasActionCompleteAction(res.json());
            }
        }).catch((error) => {
            return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, this._objectType, null)));
        });

    @Effect()
    loadHelpAreasContent$: Observable<Action> = this._actions$.ofType(helpActions.ActionTypes.LOAD_HELP_AREAS_CONTENT)
        .switchMap((action) => {
            let params: URLSearchParams = new URLSearchParams();

            params.set('direction', action.payload.SortBy.Direction == SortDirection.Ascending ? 'asc' : 'desc');
            params.set('HelpContentByArea', action.payload.Params[0].Value);
            params.set('fields', action.payload.Params[1].Value);
            params.set('pageNumber', action.payload.PageNumber);
            params.set('pageSize', action.payload.PageSize);
            params.set('sortField', action.payload.SortBy.SortField);


            return this._data.get('HelpContent/getspecificfields', { search: params })
        })
        .map((res) => {
            {
                return new helpActions.LoadHelpAreasContentActionCompleteAction(res.json());
            }
        }).catch((error) => {
            return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, this._objectType, null)));
        });

    @Effect()
    loadAllHelpContents$: Observable<Action> = this._actions$.ofType(helpActions.ActionTypes.LOAD_ALL_HELP_CONTENTS)
        .switchMap((action) => {
            let params: URLSearchParams = new URLSearchParams();
            params.set('currentPage', action.payload.PageNumber);
            params.set('direction', action.payload.SortBy.Direction == 0 ? "asc" : "desc");
            params.set('fields', 'Id,Title,PublishDate,Body,HelpAreaId,CreatedOn');
            params.set('pageNumber', action.payload.PageNumber);
            params.set('pageSize', action.payload.PageSize);
            params.set('sortField', action.payload.SortBy.SortField);
            return this._data.get('helpcontent', { search: params })
        })
        .map((res) => {
            {
                return new helpActions.LoadAllHelpContentsCompleteAction(res.json());
            }
        }).catch((error) => {
            return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, this._objectType, null)));
        });

    @Effect()
    loadHelpAreasContentBody$: Observable<Action> = this._actions$.ofType(helpActions.ActionTypes.LOAD_HELP_AREAS_CONTENT_BODY)
        .switchMap((action) => {
            let params: URLSearchParams = new URLSearchParams();
            return this._data.get(`HelpContent/getbyid/${action.payload}`, null)
        })
        .map((res) => {
            {
                return new helpActions.LoadHelpAreasContentBodyCompleteAction(res.json());
            }
        }).catch((error) => {
            return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, this._objectType, null)));
        });
    @Effect()
    loadHelpSearchAreasContentBody$: Observable<Action> = this._actions$.ofType(helpActions.ActionTypes.LOAD_HELP_SEARCH_AREAS_CONTENT_BODY)
        .switchMap((action) => {
            let params: URLSearchParams = new URLSearchParams();
            return this._data.get(`HelpContent/getbyid/${action.payload}`, null)
        })
        .map((res) => {
            {
                return new helpActions.LoadHelpSearchAreasContentBodyCompleteAction(res.json());
            }
        }).catch((error) => {
            return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, this._objectType, null)));
        });
    @Effect()
    loadHelpAreasSearchContent$: Observable<Action> = this._actions$.ofType(helpActions.ActionTypes.LOAD_HELP_AREAS_SEARCH_CONTENT)
        .switchMap((action) => {
            let params: URLSearchParams = new URLSearchParams();
            params.set('direction', action.payload.SortBy.Direction == SortDirection.Ascending ? 'asc' : 'desc');
            params.set('fields', action.payload.Params[0].Value);
            params.set('pageNumber', action.payload.PageNumber);
            params.set('pageSize', action.payload.PageSize);
            params.set('sortField', action.payload.SortBy.SortField);
            params.set('HelpSearchByContent', action.payload.Params[1].Value);
            return this._data.get('HelpContent/getspecificfields', { search: params })
        })
        .map((res) => {
            {
                return new helpActions.LoadHelpAreasSearchContentCompleteAction(res.json());
            }
        }).catch((error) => {
            return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, this._objectType, null)));
        });
    @Effect()
    addHelpContent$: Observable<Action> = this._actions$.ofType(helpActions.ActionTypes.ADD_HELP_CONTENT)
        .map(toPayload)
        .switchMap((payload) => {
            let vm = ObjectHelper.createInsertInProgressSnackbarMessage(this._objectType, '')
            this._messenger.publish('snackbar', vm);
            return this._data.put('helpcontent', payload);
        })
        .map((res) => {
            let vm = ObjectHelper.createInsertCompleteSnackbarMessage(this._objectType, '');
            this._messenger.publish('snackbar', vm);
            return new helpActions.AddHelpContentActionComplete(res.json());
        }).catch((error) => {
            return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Create, 'Help-Content', 'Help-Content')));
        });
    @Effect()
    updateHelpContent$: Observable<Action> = this._actions$.ofType(helpActions.ActionTypes.UPDATE_HELP_CONTENT)
        .map(toPayload)
        .switchMap((payload) => {
            let vm = ObjectHelper.createUpdateInProgressSnackbarMessage(this._objectType, '', '')
            this._messenger.publish('snackbar', vm);
            return this._data.post('helpcontent', payload);
        })
        .map((res) => {
            let vm = ObjectHelper.createUpdateCompleteSnackbarMessage(this._objectType, '', '');
            this._messenger.publish('snackbar', vm);
            return new helpActions.UpdateHelpContentActionComplete(res.json());
        }).catch((error) => {
            return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Update, 'Help-Content', 'Help-Content')));
        });
    @Effect()
    removeHelpContent$: Observable<Action> = this._actions$.ofType(helpActions.ActionTypes.REMOVE_HELP_CONTENT)
        .map(toPayload)
        .switchMap((payload) => {
            let vm = ObjectHelper.createRemoveInProgressSnackbarMessage(this._objectType, '', '')
            this._messenger.publish('snackbar', vm);
            let params: URLSearchParams = new URLSearchParams();
            params.set('id', payload);
            return this._data.delete('helpcontent', { search: params })
                .mergeMap((res) => {
                    let vm = ObjectHelper.createRemoveCompleteSnackbarMessage(this._objectType, '', '');
                    this._messenger.publish('snackbar', vm);
                    return [new helpActions.RemoveHelpContentActionComplete(payload)];
                })
        }).catch((error) => {
            return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Remove, 'Help-Content', 'Help-Content')));
        });
}