import { PersonalisedEmployeesInfo } from '../../models/personalised-employees-info';
import { SortDirection } from '../../../atlas-elements/common/models/ae-sort-model';
import { Observable } from 'rxjs/Rx';
import { Action, Store } from '@ngrx/store';
import { RestClientService } from '../../../shared/data/rest-client.service';
import { Injectable } from '@angular/core';
import * as fromRoot from '../../../shared/reducers/index';
import { Actions, Effect, toPayload } from '@ngrx/effects';
import * as employeeContractPersonalisationActions from '.././actions/contract-personalisation.actions';
import * as contractActions from '../../../document/company-documents/actions/contracts.actions';
import { Http, URLSearchParams } from '@angular/http';
import { AtlasApiResponse } from '../../../shared/models/atlas-api-response';
import * as errorActions from '../../../shared/actions/error.actions';
import { AtlasApiError } from '../../../shared/error-handling/atlas-api-error';
import { MessageEvent } from '../../../atlas-elements/common/models/message-event.enum';
import { MessengerService } from '../../../shared/services/messenger.service';
import { ObjectHelper } from '../../../shared/helpers/object-helper';
import { ContractDetails, EmployeeContractDetails } from "../../../document/models/contract-details.model";
import { DateTimeHelper } from "../../../shared/helpers/datetime-helper";
import { extractContractDetails, extractContractEmployeeDetails } from "../../../document/common/contract-personalisation-extract-helper";
import { isNullOrUndefined } from "util";
import { LoadContractsListAction } from "../../../document/company-documents/actions/contracts.actions";

@Injectable()
export class ContractPersonalisationEffects {
    private _objectType: string = "Employee contract";
    constructor(private _data: RestClientService, private _actions$: Actions, private _store: Store<fromRoot.State>, private _messenger: MessengerService) {
    }

    @Effect()
    contractDetails$: Observable<Action> = this._actions$.ofType(employeeContractPersonalisationActions.ActionTypes.EMPLOYEE_CONTRACT_PERSONALISATION_LOAD)
        .map(toPayload)
        .switchMap((payload) => {
            let params: URLSearchParams = new URLSearchParams();
            params.set("ContractId", payload.contractId);
            params.set('withAttributes', payload.withAttributes)
            return this._data.get('ContractTemplate/GetContractDetails', { search: params }).map(res => {
                if (payload.withAttributes) {
                    return new employeeContractPersonalisationActions.LoadPersonalisedDocumentComplete(extractContractDetails(res));
                }
                else {
                    return new employeeContractPersonalisationActions.EmployeeContractPersonalisationLoadComplete(
                        { ContractDetails: extractContractDetails(res), EmployeesContractDetails: extractContractEmployeeDetails(res) });
                }
            });
        });

    @Effect()
    loadPersonalisedDocuments$: Observable<Action> = this._actions$.ofType(employeeContractPersonalisationActions.ActionTypes.LOAD_PERSONALDOCUMENTS_SOURCEDOCUMENT)
        .map(toPayload)
        .switchMap((payload) => {
            let params: URLSearchParams = new URLSearchParams();
            params.set("sourceDocumentId", payload.Id);
            params.set('version', payload.Version);
            params.set('optionalParam1', '0');
            params.set('optionalParam2', '0');
            params.set('optionalParam3', 'true');
            return this._data.get('documentproducer', { search: params });
        })
        .map(res => {
            let personalisedEmployeesInfo = res.json() as PersonalisedEmployeesInfo[];
            return new employeeContractPersonalisationActions.LoadPersonalisedDocumentsBySourceComplete(personalisedEmployeesInfo);
        }).catch((error) => {
            return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, this._objectType, '')));
        });

    @Effect()
    personaliseDocuement$: Observable<Action> = this._actions$.ofType(employeeContractPersonalisationActions.ActionTypes.PERSONALISE_DOCUMENT)
        .map(toPayload)
        .switchMap((payload) => {
            let vm = ObjectHelper.createUpdateInProgressSnackbarMessage('Document personlisation', payload.FileNameAndTitle, payload.Id);
            this._messenger.publish('snackbar', vm);
            return this._data.post('ContractTemplate/GenerateEmployeeContracts?IsCreate=true', payload).map(res => {
                let vm = ObjectHelper.createUpdateCompleteSnackbarMessage('Document personlisation', payload.FileNameAndTitle, payload.Id);
                this._messenger.publish('snackbar', vm);
                return new employeeContractPersonalisationActions.PersonaliseDocumentCompleteAction(true)
            }).catch((error) => {
                return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'Document personlisation', '')));
            })
        });
    @Effect()
    bulkDistribution$: Observable<Action> = this._actions$.ofType(employeeContractPersonalisationActions.ActionTypes.DOCUMENT_BULK_DISTRIBUTE_ACTION)
        .map(toPayload)
        .switchMap((payload) => {
            let vm = ObjectHelper.createUpdateInProgressSnackbarMessage('Bulk Distribution', payload.EmployeeGroup, payload.sourceId);
            this._messenger.publish('snackbar', vm);
            return this._data.post('ContractTemplate/BulkDistributeDocument', payload).map(res => {
                let vm = ObjectHelper.createUpdateCompleteSnackbarMessage('Bulk Distribution', payload.EmployeeGroup, payload.sourceId);
                this._messenger.publish('snackbar', vm);
                return new employeeContractPersonalisationActions.DocumentBulkDistributionCompleteAction(true);
            }).catch((error) => {
                return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'Bulk Distribution123', '')));
            })
        });

    @Effect()
    updatePersonalisedDocument$: Observable<Action> = this._actions$.ofType(employeeContractPersonalisationActions.ActionTypes.UPDATE_PERSONALISED_DOCUMENT)
        .map(toPayload)
        .switchMap((payload) => {
            let vm = ObjectHelper.createUpdateInProgressSnackbarMessage('Employee personalised document', payload.Title, payload.Id);
            this._messenger.publish('snackbar', vm);
            return this._data.post('documentproducer/UpdateGeneratedDoc?IsContract=true&withAttributes=true', payload).map(res => {
                let vm = ObjectHelper.createUpdateCompleteSnackbarMessage('Employee personalised document', payload.Title, payload.Id);
                this._messenger.publish('snackbar', vm);
                return new employeeContractPersonalisationActions.UpdatePersonalisedDocumentComplete(true)
            }).catch((error) => {
                return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'Employee personalised document', '')));
            })
        });
}