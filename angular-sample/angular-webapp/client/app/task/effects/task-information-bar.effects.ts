import { ClaimsHelperService } from '../../shared/helpers/claims-helper';
// import { extractEmployeeStatistics } from '../common/extract-helpers';
import { Observable } from 'rxjs/Rx';
import { RestClientService } from '../../shared/data/rest-client.service';
import { Http, URLSearchParams } from '@angular/http';
import { Action, Store } from '@ngrx/store';
import { Actions, Effect } from '@ngrx/effects';
import { Injectable } from '@angular/core';
import * as Immutable from 'immutable';
import * as fromRoot from '../../shared/reducers/index';
import * as taskHeadBannerActions from '../actions/task-information-bar.actions';

import { AeInformationBarItemType } from '../../atlas-elements/common/ae-informationbar-itemtype.enum';
import { AeInformationBarItem } from '../../atlas-elements/common/models/ae-informationbar-item';
import { extractInformationBarItems } from '../../shared/helpers/extract-helpers';
import { CatchErrorAction } from '../../shared/actions/error.actions';
import { MessageEvent } from '../../atlas-elements/common/models/message-event.enum';
import { AtlasApiError } from './../../shared/error-handling/atlas-api-error';

@Injectable()
export class TaskHeadBannerEffects {
    constructor(private _data: RestClientService, private _actions$: Actions, private _store: Store<fromRoot.State>, private _claimsHelper: ClaimsHelperService) {

    }

    @Effect()
    taskHeadBannerData$: Observable<Action> = this._actions$.ofType(taskHeadBannerActions.ActionTypes.LOAD_TASKHEADBANNER)
        .switchMap(() => {
            let employeeId = this._claimsHelper.getEmpIdOrDefault();
            let params: URLSearchParams = new URLSearchParams();
            params.set('EmployeeId', employeeId);
            params.set('Area', '4');
            params.set('requestedCodes', '11,12,13,14,15,16');
            return this._data.get('Statistics', { search: params })
                .map((informationBarItems) => {
                    {
                        return new taskHeadBannerActions.LoadTaskHeadBannerCompleteAction(extractInformationBarItems(informationBarItems));
                    }
                }).catch((error) => {
                    return Observable.of(new CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'Task statistics', null)));
                });
        });

        }