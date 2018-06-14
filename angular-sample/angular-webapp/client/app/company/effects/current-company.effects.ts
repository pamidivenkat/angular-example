import { extractInformationBarItems } from '../../shared/helpers/extract-helpers';
import { State } from '../../shared/reducers';
import { isNullOrUndefined } from 'util';

import { Observable } from 'rxjs/Rx';
import { RestClientService } from '../../shared/data/rest-client.service';
import { Http, URLSearchParams } from '@angular/http';
import { Action, Store } from '@ngrx/store';
import { Actions, Effect, toPayload } from '@ngrx/effects';
import { Injectable } from '@angular/core';
import * as fromRoot from '../../shared/reducers/index';

import { ObjectHelper } from './../../shared/helpers/object-helper';
import { MessengerService } from './../../shared/services/messenger.service';
import * as errorActions from './../../shared/actions/error.actions';
import { AtlasApiError } from './../../shared/error-handling/atlas-api-error';
import { MessageEvent } from '../../atlas-elements/common/models/message-event.enum';
import * as companyActions from '../actions/company.actions';
import { extractCompany } from "../common/extract-helpers";
import { ClaimsHelperService } from "../../shared/helpers/claims-helper";


@Injectable()
export class CurrentCompanyEffects {
    private _objectType: string = 'Company';
    constructor(
        private _data: RestClientService,
        private _actions$: Actions,
        private _store: Store<fromRoot.State>,
        private _claimsHelper: ClaimsHelperService,
        private _messenger: MessengerService
    ) {
    }
    @Effect()
    loadCompany$: Observable<Action> = this._actions$.ofType(companyActions.ActionTypes.COMPANY_LOAD_DATA)
        .switchMap((action) => {
            let companyId = this._claimsHelper.getCompanyId().toLowerCase();
            if (!isNullOrUndefined(action.payload)) {
                companyId = action.payload;
            }

            let params: URLSearchParams = new URLSearchParams();
            params.set('IsManageCompany', 'true');
            return this._data.get(`company/${companyId}`, { search: params });
        })
        .map((res) => new companyActions.CompanyLoadCompleteAction(extractCompany(res)))
        .catch((error) => {
            return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, this._objectType, null)));
        });

    @Effect()
    companyInformationComponent$: Observable<Action> = this._actions$.ofType(companyActions.ActionTypes.COMPANY_INFORMATION_COMPONENT)
        .switchMap((action) => {
            let params: URLSearchParams = new URLSearchParams();
            params.set('EmployeeId', action.payload);
            params.set('Area', '9');
            params.set('requestedCodes', '48,49,50,51,52');
            return this._data.get('Statistics', { search: params })
        })
        .map((informationBarItems) => {
            {
                return new companyActions.CompanyInformationComponentCompleteAction(extractInformationBarItems(informationBarItems));
            }
        }).catch((error) => {
            return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, this._objectType, null)));
        });
    @Effect()
    uploadCompanyLogo$: Observable<Action> = this._actions$.ofType(companyActions.ActionTypes.UPLOAD_COMPANY_LOGO)
        .switchMap((action) => {
            let vm = ObjectHelper.createUpdateInProgressSnackbarMessage('Upload company logo', null, action.payload);
            this._messenger.publish('snackbar', vm);
            let companyId = this._claimsHelper.getCompanyId().toLowerCase();
            let params: URLSearchParams = new URLSearchParams();
            params.set('cid', companyId);
            params.set('logoDocumentId', action.payload);
            params.set('action', 'UploadLogo');
            return this._data.post('Company/UploadLogo', {}, { search: params })
                .mergeMap(() => {
                    let vm = ObjectHelper.createUpdateCompleteSnackbarMessage('Upload company logo', null, action.payload);
                    this._messenger.publish('snackbar', vm);
                    return Observable.of(new companyActions.UploadCompanyLogoCompleteAction())
                }).catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Upload, this._objectType, 'upload logo')));
                });
        });
}

