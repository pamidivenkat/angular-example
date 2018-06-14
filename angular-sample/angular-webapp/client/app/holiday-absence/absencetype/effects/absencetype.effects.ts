import { SortDirection } from './../../../atlas-elements/common/models/ae-sort-model';
import { Observable } from 'rxjs/Rx';
import { Action, Store } from '@ngrx/store';
import { Injectable } from '@angular/core';
import { RestClientService } from '../../../shared/data/rest-client.service';
import { Actions, Effect, toPayload } from '@ngrx/effects';
import * as fromRoot from '../../../shared/reducers/index';
import * as errorActions from '../../../shared/actions/error.actions';
import { URLSearchParams } from '@angular/http';
import { ClaimsHelperService } from '../../../shared/helpers/claims-helper';
import { AtlasApiError } from '../../../shared/error-handling/atlas-api-error';
import { MessageEvent } from '../../../atlas-elements/common/models/message-event.enum';
import { ObjectHelper } from '../../../shared/helpers/object-helper';
import { MessengerService } from '../../../shared/services/messenger.service';
import * as absenceTypeActions from '../../absencetype/actions/absencetype.actions';
import * as commonActions from '../../../shared/actions/company.actions';
import { AbsenceType } from './../../../shared/models/company.models';
import { extractAbsenceTypeDetails } from "../../common/extract-helpers";
import { AtlasApiResponse, AtlasApiRequest, AtlasApiRequestWithParams, AtlasParams } from '../../../shared/models/atlas-api-response';

@Injectable()
export class AbsenceTypeEffects {

    private _absenceTypeData: Map<string, any> = new Map();

    @Effect()
    absenceTypeAdd$: Observable<Action> = this._actions$.ofType(absenceTypeActions.ActionTypes.ABSENCE_TYPE_ADD)
        .map(toPayload)
        .withLatestFrom(this._store, (payload: AbsenceType, state) => { return { _payload: payload, absenceTypePagingInfo: state.commonState.AbsenceTypePagingInfo }; })
        .switchMap((pl) => {
            let vm = ObjectHelper.createInsertInProgressSnackbarMessage('Absence Type', pl._payload.TypeName);
            this._messenger.publish('snackbar', vm);
            return this._data.put(`AbsenceType?create=true`, pl._payload)
                .mergeMap((res) => {
                    let atlasParams: AtlasParams[] = new Array();
                    let vm = ObjectHelper.createInsertCompleteSnackbarMessage('Absence Type', pl._payload.TypeName);
                    this._messenger.publish('snackbar', vm);
                    return [
                        new absenceTypeActions.AbsenceTypeAddCompleteAction(true),
                        new commonActions.LoadAbsenceTypeAction(true)
                    ];
                })
                .catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Create, 'Absence Type', pl._payload.TypeName)));
                })
        });
    @Effect()
    loadAbsenceTypeById$: Observable<Action> = this._actions$.ofType(absenceTypeActions.ActionTypes.ABSENCE_TYPE_DETAILS_BY_ID_LOAD)
        .map(toPayload)
        .switchMap((payload) => {
            let isExample = '?example=false';
            if (payload.AbsenceType.IsExample == true) {
                isExample = '?example=true';
            }
            return this._data.get(`AbsenceType/` + payload.AbsenceType.Id + isExample)
                .map((res) => extractAbsenceTypeDetails(res))
                .mergeMap((absenceTypeDetails: AbsenceType) => {
                    return [
                        new absenceTypeActions.AbsenceTypeByIdLoadCompleteAction(absenceTypeDetails),
                    ];
                })
                .catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'Absence Type', payload.AbsenceType.Id)));
                })
        });
    @Effect()
    loadAbsenceTypeUpdate$: Observable<Action> = this._actions$.ofType(absenceTypeActions.ActionTypes.ABSENCE_TYPE_UPDATE)
        .map(toPayload)
        .withLatestFrom(this._store, (payload: AbsenceType, state) => { return { _payload: payload, absenceTypePagingInfo: state.commonState.AbsenceTypePagingInfo }; })
        .switchMap((pl) => {
            let vm = ObjectHelper.createUpdateInProgressSnackbarMessage('Absence Type', pl._payload.TypeName, pl._payload.Id);
            this._messenger.publish('snackbar', vm);
            return this._data.post(`AbsenceType?custom=true`, pl._payload)
                .mergeMap((res) => {
                    let atlasParams: AtlasParams[] = new Array();
                    let vm = ObjectHelper.createUpdateCompleteSnackbarMessage('Absence Type', pl._payload.TypeName, pl._payload.Id);
                    this._messenger.publish('snackbar', vm);
                    return [
                        new absenceTypeActions.AbsenceTypeUpdateCompleteAction(true),
                        new commonActions.LoadAbsenceTypeAction(true)
                       ];
                })
                .catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Update, 'Absence Type', pl._payload.TypeName, pl._payload.Id)));
                })
        });
    @Effect()
    loadAbsenceTypeDelete$: Observable<Action> = this._actions$.ofType(absenceTypeActions.ActionTypes.ABSENCE_TYPE_REMOVE)
        .map(toPayload)
        .withLatestFrom(this._store, (payload: AbsenceType, state) => { return { _payload: payload, absenceTypePagingInfo: state.commonState.AbsenceTypePagingInfo }; })
        .switchMap((pl) => {
            let absenceTypeId: string = pl._payload.Id;
            let vm = ObjectHelper.createRemoveInProgressSnackbarMessage('Absence Type', pl._payload.TypeName, pl._payload.Id);
            this._messenger.publish('snackbar', vm);
            return this._data.delete(`AbsenceType/${absenceTypeId}`)
                .mergeMap((res) => {
                    let atlasParams: AtlasParams[] = new Array();
                    let vm = ObjectHelper.createRemoveCompleteSnackbarMessage('Absence Type', pl._payload.TypeName, pl._payload.Id);
                    this._messenger.publish('snackbar', vm);
                    return [
                        new absenceTypeActions.AbsenceTypeDeleteCompleteAction(true),
                        new commonActions.LoadAbsenceTypeAction(true)
                    ];
                })
                .catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Remove, 'Absence Type', pl._payload.TypeName, pl._payload.Id)));
                })
        });

    constructor(private _data: RestClientService
        , private _actions$: Actions
        , private _store: Store<fromRoot.State>
        , private _claimsHelperService: ClaimsHelperService
        , private _messenger: MessengerService) {

    }
}