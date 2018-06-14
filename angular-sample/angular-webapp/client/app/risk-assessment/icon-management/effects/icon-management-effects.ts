import { AddIconCompleteAction, UpdateIconCompleteAction } from '../actions/icon-add-update.actions';
import { AtlasApiRequestWithParams, AtlasParams } from '../../../shared/models/atlas-api-response';
import { IconType } from '../models/icon-type.enum';
import { Icon } from '../models/icon';
import { Injectable } from '@angular/core';
import { URLSearchParams } from '@angular/http';
import { Actions, Effect, toPayload } from '@ngrx/effects';
import { Action, Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { isNullOrUndefined } from 'util';

import { extractHazardOrControlsList, extractPagingInfo } from '../../../risk-assessment/common/extract-helper';
import { RestClientService } from '../../../shared/data/rest-client.service';
import { ObjectHelper } from '../../../shared/helpers/object-helper';
import { MessengerService } from '../../../shared/services/messenger.service';
import * as iconAddUpdateActions from '../actions/icon-add-update.actions';
import * as iconManagementActions from '../actions/icon-management-actions';
import { SortDirection } from './../../../atlas-elements/common/models/ae-sort-model';
import { MessageEvent } from './../../../atlas-elements/common/models/message-event.enum';
import { addOrUpdateAtlasParamValue, getAtlasParamValueByKey } from './../../../root-module/common/extract-helpers';
import * as errorActions from './../../../shared/actions/error.actions';
import { AtlasApiError } from './../../../shared/error-handling/atlas-api-error';
import { StringHelper } from './../../../shared/helpers/string-helper';
import * as fromRoot from './../../../shared/reducers/index';

@Injectable()
export class IconManagementEffects {
    private _iconType: IconType;
    private _selectedIconItem: any;
    private _objectType: string = "";
    private _type: string = "";
    constructor(private _data: RestClientService
        , private _actions$: Actions
        , private _store: Store<fromRoot.State>
        , private _messenger: MessengerService
    ) {
        this._objectType = 'Icon';
    }
    @Effect()
    addIcon$: Observable<Action> = this._actions$.ofType(iconAddUpdateActions.ActionTypes.ADD_ICON)
        .map(toPayload)
        .switchMap((payload) => {
            let icon: Icon = <Icon>payload.icon;
            this._iconType = <IconType>payload.type;
            let vm = ObjectHelper.createInsertInProgressSnackbarMessage('Icon', icon.Name);
            this._messenger.publish('snackbar', vm);
            let params: URLSearchParams = new URLSearchParams();
            let apiEndPoint: string = this._iconType == IconType.Control ? 'Control' : 'Hazard';
            return this._data.put(apiEndPoint, icon, { search: params });
        })
        .map((res) => {
            let response: Icon = <Icon>res.json();
            let vm = ObjectHelper.createInsertCompleteSnackbarMessage('Icon', response.Name);
            this._messenger.publish('snackbar', vm);
            return new AddIconCompleteAction(true);
        }).catch((error) => {
            return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Create, 'Icon', 'Icon')));
        });

    @Effect()
    updateIcon$: Observable<Action> = this._actions$.ofType(iconAddUpdateActions.ActionTypes.UPDATE_ICON)
        .map(toPayload)
        .switchMap((payload) => {
            let icon: Icon = <Icon>payload.icon;
            this._iconType = <IconType>payload.type;
            let vm = ObjectHelper.createUpdateInProgressSnackbarMessage('Icon', icon.Name, icon.Id);
            this._messenger.publish('snackbar', vm);
            let params: URLSearchParams = new URLSearchParams();
            let apiEndPoint: string = this._iconType == IconType.Control ? 'Control' : 'Hazard';
            return this._data.post(apiEndPoint, icon, { search: params });
        })
        .map((res) => {
            let response: Icon = <Icon>res.json();
            let vm = ObjectHelper.createUpdateCompleteSnackbarMessage('Icon', response.Name, response.Id);
            this._messenger.publish('snackbar', vm);
            return new UpdateIconCompleteAction(true);
        }).catch((error) => {
            return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Update, 'Icon', 'Icon')));
        });
    @Effect()
    loadIcon$: Observable<Action> = this._actions$.ofType(iconAddUpdateActions.ActionTypes.LOAD_ICON)
        .map(toPayload)
        .switchMap((payload) => {
            let params: URLSearchParams = new URLSearchParams();
            params.set('id', payload.id);
            params.set('example', 'true');
            let apiEndPoint: string = ((<IconType>payload.type) == IconType.Control) ? 'Control' : 'Hazard';
            return this._data.get(apiEndPoint, { search: params });
        })
        .map((res) => {
            let response: Icon = <Icon>res.json();
            return new iconAddUpdateActions.LoadIconCompleteAction(response);
        }).catch((error) => {
            return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'Icon', 'Icon')));
        });
    @Effect()
    loadHazardOrControlsIcons$: Observable<Action> = this._actions$.ofType(iconManagementActions.ActionTypes.LOAD_HAZARDS_OR_CONTROLS_LIST)
        .map((action: iconManagementActions.LoadHazardsOrControlsListAction) => action.payload)
        .withLatestFrom(this._store, (payload, state) => { return { _payload: payload, _savedRequestFromState: state.iconManagementState.apiRequestWithParams }; })
        .switchMap((data) => {
            let params: URLSearchParams = new URLSearchParams();
            params.set('fields', 'Id,Name,PictureId,Description,Category,IsExample,Author.FirstName,Author.LastName,CreatedOn,ModifiedOn,Modifier.FirstName as modifierFirstName,Modifier.LastName as modifierLastName,Version');

            params.set('isExample', 'true');
            params.set('pageNumber', data._payload.PageNumber.toString());
            params.set('pageSize', data._payload.PageSize.toString());
            params.set('sortField', data._payload.SortBy.SortField);
            params.set('direction', data._payload.SortBy.Direction === SortDirection.Ascending ? 'asc' : 'desc');

            let controller = String(getAtlasParamValueByKey(data._payload.Params, "folder"));

            if (controller == "hazard") {
                if (!isNullOrUndefined(getAtlasParamValueByKey(data._payload.Params, "category")) && !StringHelper.isNullOrUndefinedOrEmpty(String(getAtlasParamValueByKey(data._payload.Params, "category")))) {
                    params.set('categoryHazardsFilter', getAtlasParamValueByKey(data._payload.Params, "category"));
                }
                if (!isNullOrUndefined(getAtlasParamValueByKey(data._payload.Params, "searchText")) && !StringHelper.isNullOrUndefinedOrEmpty(String(getAtlasParamValueByKey(data._payload.Params, "searchText")))) {
                    params.set('searchHazardsFilter', getAtlasParamValueByKey(data._payload.Params, "searchText"));
                }
            }
            else {
                if (!isNullOrUndefined(getAtlasParamValueByKey(data._payload.Params, "category")) && !StringHelper.isNullOrUndefinedOrEmpty(String(getAtlasParamValueByKey(data._payload.Params, "category")))) {
                    params.set('categoryControlsFilter', getAtlasParamValueByKey(data._payload.Params, "category"));
                }
                if (!isNullOrUndefined(getAtlasParamValueByKey(data._payload.Params, "searchText")) && !StringHelper.isNullOrUndefinedOrEmpty(String(getAtlasParamValueByKey(data._payload.Params, "searchText")))) {
                    params.set('searchControlFilter', getAtlasParamValueByKey(data._payload.Params, "searchText"));
                }
            }


            return this._data.get(controller, { search: params })
                .mergeMap((res) => {
                    return [new iconManagementActions.LoadHazardsOrControlsListCompleteAction({ HazardsOrControlsList: extractHazardOrControlsList(res), HazardsOrControlsListPagingInfo: extractPagingInfo(res) })];
                })
                .catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'Loading Hazards', '')));
                })
        });

    @Effect()
    RemoveIconItem$: Observable<Action> = this._actions$.ofType(iconManagementActions.ActionTypes.REMOVE_ICON)
        .map(toPayload)
        .switchMap((payload) => {
            let entity: string = payload.Type;
            this._selectedIconItem = payload.Entity;

            let vm = ObjectHelper.createRemoveInProgressSnackbarMessage(this._objectType, this._selectedIconItem.Name, this._selectedIconItem.Id);
            this._messenger.publish('snackbar', vm);
            return this._data.delete(entity + '/' + this._selectedIconItem.Id);
        })
        .map(res => {
            let vm = ObjectHelper.createRemoveCompleteSnackbarMessage(this._objectType, this._selectedIconItem.Name, this._selectedIconItem.Id);
            this._messenger.publish('snackbar', vm);
            return new iconManagementActions.RemoveIconItemCompleteAction(true);
        }
        ).catch((error) => {
            return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Remove, this._objectType, this._selectedIconItem.Id)));
        });

    @Effect()
    BulkRemoveIcons$: Observable<Action> = this._actions$.ofType(iconManagementActions.ActionTypes.BULK_REMOVE_ICON)
        .map(toPayload)
        .switchMap((payload) => {
            let entity: string = payload.Type;
            let params: URLSearchParams = new URLSearchParams();
            params.set('temp', 'true');
            let bulkIcons: Array<string> = payload.Icons;
            this._type = entity;
            this._selectedIconItem = { Name: "bulk icons", Id: bulkIcons[0] };
            let vm = ObjectHelper.createRemoveInProgressSnackbarMessage(this._type, this._selectedIconItem.Name, this._selectedIconItem.Id);
            this._messenger.publish('snackbar', vm);
            let url: string = entity + "/BulkRemove";
            return this._data.post(url, bulkIcons, { search: params });
        })
        .map(res => {
            let vm = ObjectHelper.createRemoveCompleteSnackbarMessage(this._type, this._selectedIconItem.Name, this._selectedIconItem.Id);
            this._messenger.publish('snackbar', vm);
            return new iconManagementActions.BulkRemoveIconItemCompleteAction(true);
        }
        ).catch((error) => {
            return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Remove, this._type, this._selectedIconItem.Id)));
        });
}
