import { AtlasApiRequest } from './../../../shared/models/atlas-api-response';
import { AddCPPAction } from './../../../construction-phase-plans/manage-construction-plan/actions/manage-cpp.actions';
import { MethodStatement, MSPPE, MSSafetyRespAssigned, MSSupportingDocuments, MSProcedure, MSOtherRiskAssessments } from './../../models/method-statement';
import { getAtlasParamValueByKey } from '../../../root-module/common/extract-helpers';
import { extractPagingInfo } from '../../../employee/common/extract-helpers';
import { SortDirection } from '../../../atlas-elements/common/models/ae-sort-model';
import { Observable } from 'rxjs/Rx';
import { Action, Store } from '@ngrx/store';
import { RestClientService } from '../../../shared/data/rest-client.service';
import { Injectable } from '@angular/core';
import * as fromRoot from '../../../shared/reducers/index';
import { Actions, Effect, toPayload } from '@ngrx/effects';
import { Http, URLSearchParams } from '@angular/http';
import { AtlasApiResponse, AtlasParams } from '../../../shared/models/atlas-api-response';
import * as errorActions from '../../../shared/actions/error.actions';
import { AtlasApiError } from '../../../shared/error-handling/atlas-api-error';
import { MessageEvent } from '../../../atlas-elements/common/models/message-event.enum';
import { MessengerService } from '../../../shared/services/messenger.service';
import { ObjectHelper } from '../../../shared/helpers/object-helper';
import * as ManageMethodStatementActions from './../actions/manage-methodstatement.actions';
import * as MethodStatementActions from './../../actions/methodstatements.actions';
import { isNullOrUndefined } from 'util';
import { Procedure } from './../../procedures/models/procedure';
import { LoadMethodStatementByIdAction } from "./../actions/manage-methodstatement.actions";

@Injectable()
export class ManageMethodStatementEffects {
    private _pageName = 'Method statements';

    @Effect()
    loadMehtodStatementById$: Observable<Action> =
    this._actions$.ofType(ManageMethodStatementActions.ActionTypes.LOAD_METHOD_STATEMENT_BY_ID)
        .map((action: ManageMethodStatementActions.LoadMethodStatementByIdAction) => action.payload)
        .switchMap((pl) => {
            let params: URLSearchParams = new URLSearchParams();
            let url = 'methodstatement/' + pl.Id;
            params.set('example', pl.IsExample ? 'true' : 'false');
            params.set('preview', 'true');
            return this._data.get(url, { search: params });
        })
        .map((res) => {
            return new ManageMethodStatementActions.LoadMethodStatementByIdCompleteAction(<MethodStatement>res.json());
        }).catch((error) => {
            return Observable
                .of(new errorActions
                    .CatchErrorAction(new AtlasApiError(error
                        , MessageEvent.Load
                        , 'Method statement'
                        , null)));
        });

    @Effect()
    updateMethodStatement$: Observable<Action> = this._actions$.ofType(ManageMethodStatementActions.ActionTypes.UPDATE_METHOD_STATEMENT)
        .map((action: ManageMethodStatementActions.UpdateMethodStatementAction) => action.payload)
        .switchMap((pl) => {
            let params: URLSearchParams = new URLSearchParams();
            let url = 'MethodStatement';
            let vm = ObjectHelper.createUpdateInProgressSnackbarMessage('Method Statement', pl.MethodStatement.Name, pl.MethodStatement.Id);
            this._messenger.publish('snackbar', vm);
            return this._data.post(url, pl.MethodStatement, { search: params })
                .mergeMap((res) => {
                    let vm = ObjectHelper.createUpdateCompleteSnackbarMessage('Method Statement', pl.MethodStatement.Name, pl.MethodStatement.Id);
                    this._messenger.publish('snackbar', vm);
                    return [
                        new ManageMethodStatementActions.LoadMethodStatementByIdAction({ Id: pl.MethodStatement.Id, IsExample: pl.MethodStatement.IsExample }),
                        new MethodStatementActions.UpdateMethodStatementAction(true)
                    ];
                }).catch((error) => {
                    return Observable
                        .of(new errorActions
                            .CatchErrorAction(new AtlasApiError(error
                                , MessageEvent.Update
                                , 'Method statement'
                                , pl.MethodStatement.Name)));
                })
        });

    @Effect()
    addMethodStatement$: Observable<Action> = this._actions$.ofType(ManageMethodStatementActions.ActionTypes.ADD_METHOD_STATEMENT)
        .map((action: ManageMethodStatementActions.AddMethodStatementAction) => action.payload)
        .switchMap((pl) => {
            let params: URLSearchParams = new URLSearchParams();
            let url = 'MethodStatement';
            let vm = ObjectHelper.createInsertInProgressSnackbarMessage('Method Statement', pl.Name);
            this._messenger.publish('snackbar', vm);
            return this._data.put(url, pl, { search: params })
                .map((res) => {
                    let vm = ObjectHelper.createInsertCompleteSnackbarMessage('Method Statement', pl.Name);
                    this._messenger.publish('snackbar', vm);
                    let ms = <MethodStatement>res.json();
                    return new ManageMethodStatementActions.LoadMethodStatementByIdAction({ Id: ms.Id, IsExample: ms.IsExample });
                }).catch((error) => {
                    return Observable
                        .of(new errorActions
                            .CatchErrorAction(new AtlasApiError(error
                                , MessageEvent.Update
                                , 'Method statement'
                                , pl.Name)));
                })
        });


    /*
    *  To update MS PPE category
    */

    @Effect()
    updateMSPPE$: Observable<Action> = this._actions$.ofType(ManageMethodStatementActions.ActionTypes.UPDATE_MSPPE)
        .map((action: ManageMethodStatementActions.UpdateMSPPEAction) => action.payload)
        .withLatestFrom(this._store, (payload, state) => {
            return {
                _payload: payload
                , _manageMSState: state.manageMethodStatementState.MethodStatement
            };
        })
        .switchMap((inputData) => {
            let pl = inputData._payload;
            let params: URLSearchParams = new URLSearchParams();
            let methodstatementId = pl.MethodStatementId;
            let vm = ObjectHelper.createUpdateInProgressSnackbarMessage(this._pageName, 'PPE category', methodstatementId);
            this._messenger.publish('snackbar', vm);
            return this._data.post('MSPPE/BulkUpdatePPE?methodStatementId='+methodstatementId, pl.MSPPE)
                .mergeMap((res) => {
                    let dd = [];
                    // if (!isNullOrUndefined(inputData._manageMSState.MSPPE)) {
                    //     dd = dd.slice(0).concat(Array.from(inputData._manageMSState.MSPPE));
                    // }
                    let newMSPPE: MSPPE[] = [];

                    if (!isNullOrUndefined(res) && !isNullOrUndefined(res.json())) {
                        newMSPPE = <MSPPE[]>res.json();
                        if (newMSPPE.length > 0) {
                            newMSPPE.forEach(newMSPPE => {
                                if (newMSPPE) {
                                    newMSPPE.PPECategory = pl.MSPPE.find(p => p.PPECategory.Id == newMSPPE.PPECategoryId).PPECategory;
                                }
                            })
                        }
                        dd = dd.slice(0).concat(Array.from(newMSPPE));
                    }

                    let newMS = Object.assign({}, inputData._manageMSState);
                    newMS.MSPPE = dd;

                    vm = ObjectHelper.createUpdateCompleteSnackbarMessage(this._pageName, 'PPE category', methodstatementId);
                    this._messenger.publish('snackbar', vm);
                    return [
                        new ManageMethodStatementActions.UpdateMSPPECompleteAction(newMSPPE),
                        new ManageMethodStatementActions.LoadMethodStatementByIdCompleteAction(newMS)
                    ];
                }).catch((error) => {
                    return Observable
                        .of(new errorActions
                            .CatchErrorAction(new AtlasApiError(error
                                , MessageEvent.Update
                                , 'Method statement'
                                , null)));
                });
        });


    /*
    *  To get MS resposibility by id
    */
    @Effect()
    loadMSSaftyResponsibilityById$: Observable<Action> =
    this._actions$.ofType(ManageMethodStatementActions.ActionTypes.LOAD_RESPONSIBILITY_BY_ID)
        .map((action: ManageMethodStatementActions.LoadMSSaftyResponsibilityByIdAction) => action.payload)
        .switchMap((pl) => {
            let params: URLSearchParams = new URLSearchParams();
            let url = 'MSSafetyRespAssigned/Getbyid/' + pl.Id;
            return this._data.get(url, { search: params });
        })
        .map((res) => {
            return new ManageMethodStatementActions.LoadMSSaftyResponsibilityByIdCompleteAction(<MSSafetyRespAssigned>res.json());
        }).catch((error) => {
            return Observable
                .of(new errorActions
                    .CatchErrorAction(new AtlasApiError(error
                        , MessageEvent.Load
                        , this._pageName
                        , null)));
        });


    /*
    *  To delete MS resposibility
    */
    @Effect()
    msSaftyResponsibilityDelete$: Observable<Action> =
    this._actions$.ofType(ManageMethodStatementActions.ActionTypes.DELETE_MSRESPONSIBILITY)
        .map(toPayload)
        .switchMap((pl) => {
            let id: string = pl.Id;
            let vm = ObjectHelper.createRemoveInProgressSnackbarMessage(this._pageName, 'Responsibility', pl.MethodStatementId);
            this._messenger.publish('snackbar', vm);
            return this._data.delete(`MSSafetyRespAssigned/${id}`)
                .mergeMap((res) => {
                    let vm = ObjectHelper.createRemoveCompleteSnackbarMessage(this._pageName, 'Responsibility', pl.MethodStatementId);
                    this._messenger.publish('snackbar', vm);
                    return [
                        new ManageMethodStatementActions.DeleteMSSaftyResponsibilityCompleteAction(pl.Id),
                        new ManageMethodStatementActions.MSResponsibilityDeleteListAction(pl),
                        new ManageMethodStatementActions.LoadMSResponsibilitiesPagingSortingAction(new AtlasApiRequest(1, 10, 'CreatedOn', SortDirection.Ascending))
                    ];
                })
                .catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(
                        new AtlasApiError(error, MessageEvent.Remove, this._pageName, 'Responsibility', pl.MethodStatementId)));
                });
        });



    /*
    *  To add MS responsibility
    */
    @Effect()
    msResponsibilityAdd$: Observable<Action> =
    this._actions$.ofType(ManageMethodStatementActions.ActionTypes.ADD_MSRESPONSIBILITY)
        .map(toPayload)
        .switchMap((pl: MSSafetyRespAssigned) => {

            let vm = ObjectHelper.createInsertInProgressSnackbarMessage('Responsibility', pl.MethodStatementId);
            this._messenger.publish('snackbar', vm);
            let safetyRespAssignedPerson = pl.ResponsiblePerson;
            return this._data.put(`MSSafetyRespAssigned`, pl)
                .mergeMap((res) => {
                    let vm = ObjectHelper.createInsertCompleteSnackbarMessage('Responsibility', pl.MethodStatementId);
                    this._messenger.publish('snackbar', vm);
                    let response = <MSSafetyRespAssigned>(res.json());
                    response.ResponsiblePerson = safetyRespAssignedPerson;
                    return [
                        new ManageMethodStatementActions.AddMSResponsibilityCompleteAction(response),
                        new ManageMethodStatementActions.MSResponsibilityListCompleteAction(response),
                        new ManageMethodStatementActions.LoadMSResponsibilitiesPagingSortingAction(new AtlasApiRequest(1, 10, 'CreatedOn', SortDirection.Ascending))
                    ];
                })
                .catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(
                        new AtlasApiError(error, MessageEvent.Create, 'Responsibility', pl.MethodStatementId)));
                })
        });


    /*
    *  To update MS resposibility
    */

    @Effect()
    msResponsibilityUpdate$: Observable<Action> = this._actions$.ofType(ManageMethodStatementActions.ActionTypes.UPDATE_MSRESPONSIBILITY)
        .map(toPayload)
        .switchMap((pl: MSSafetyRespAssigned) => {

            let vm = ObjectHelper.createInsertInProgressSnackbarMessage('Responsibility', pl.MethodStatementId);
            this._messenger.publish('snackbar', vm);
            let safetyRespAssignedPerson = pl.ResponsiblePerson;
            return this._data.post(`MSSafetyRespAssigned`, pl)
                .mergeMap((res) => {
                    let vm = ObjectHelper.createInsertCompleteSnackbarMessage('Responsibility', pl.MethodStatementId);
                    this._messenger.publish('snackbar', vm);
                    let response = <MSSafetyRespAssigned>(res.json());
                    response.ResponsiblePerson = safetyRespAssignedPerson;
                    return [
                        new ManageMethodStatementActions.UpdateMSResponsibilityCompleteAction(response),
                        new ManageMethodStatementActions.MSResponsibilityListCompleteAction(<MSSafetyRespAssigned>(pl)),
                    ];
                })
                .catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(
                        new AtlasApiError(error, MessageEvent.Create, 'Responsibility', pl.MethodStatementId)));
                });
        });

    @Effect()
    msProcedureDelete$: Observable<Action> =
    this._actions$.ofType(ManageMethodStatementActions.ActionTypes.DELETE_MS_PROCEDURE)
        .map(toPayload)
        .withLatestFrom(this._store, (payload, state) => {
            return {
                _payload: payload
                , _manageMSState: state.manageMethodStatementState.MethodStatement
            };
        })
        .switchMap((inputData) => {
            let procedureId: string = inputData._payload;
            let vm = ObjectHelper.createRemoveInProgressSnackbarMessage(this._pageName, 'Procedure', procedureId);
            this._messenger.publish('snackbar', vm);
            return this._data.delete(`MSProcedure/${procedureId}`)
                .mergeMap((res) => {
                    let dd: Array<MSProcedure> = [];
                    if (!isNullOrUndefined(inputData._manageMSState.MSProcedures)) {
                        dd = dd.slice(0).concat(Array.from(inputData._manageMSState.MSProcedures));
                    }

                    dd = dd.slice(0).filter(c => c.Id.toLowerCase() !== procedureId.toLowerCase());

                    let newMS = Object.assign({}, inputData._manageMSState);
                    newMS.MSProcedures = dd;

                    vm = ObjectHelper.createRemoveCompleteSnackbarMessage(this._pageName, 'Procedure', procedureId);
                    this._messenger.publish('snackbar', vm);
                    return [
                        new ManageMethodStatementActions.DeleteMSProcedureCompleteAction(true),
                        new ManageMethodStatementActions.LoadMethodStatementByIdCompleteAction(newMS)
                    ];
                })
                .catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(
                        new AtlasApiError(error, MessageEvent.Remove, this._pageName, 'Procedure', procedureId)));
                });
        });

    @Effect()
    msProceduresAdd$: Observable<Action> =
    this._actions$.ofType(ManageMethodStatementActions.ActionTypes.ADD_MS_PROCEDURE)
        .map(toPayload)
        .withLatestFrom(this._store, (payload, state) => {
            return {
                _payload: payload
                , _manageMSState: state.manageMethodStatementState.MethodStatement
            };
        })
        .switchMap((inputData) => {
            let vm = ObjectHelper.createInsertInProgressSnackbarMessage(this._pageName, 'Procedure');
            this._messenger.publish('snackbar', vm);

            let params: URLSearchParams = new URLSearchParams();
            params.set('isCollection', 'true');
            params.set('isBulkUpdate', 'false');
            return this._data.post(`MSProcedure/BulkUpdateProcedures`, inputData._payload, { search: params })
                .mergeMap((res) => {
                    let dd = [];
                    if (!isNullOrUndefined(inputData._manageMSState.MSProcedures)) {
                        dd = dd.slice(0).concat(Array.from(inputData._manageMSState.MSProcedures));
                    }

                    if (!isNullOrUndefined(res) && !isNullOrUndefined(res.json())) {
                        dd = dd.slice(0).concat(Array.from(res.json()));
                    }

                    let newMS = Object.assign({}, inputData._manageMSState);
                    newMS.MSProcedures = dd;

                    vm = ObjectHelper.createInsertCompleteSnackbarMessage(this._pageName, 'Procedure');
                    this._messenger.publish('snackbar', vm);
                    return [
                        new ManageMethodStatementActions.AddMSProcedureCompleteAction(res.json()),
                        new ManageMethodStatementActions.LoadMethodStatementByIdCompleteAction(newMS)
                    ];
                })
                .catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(
                        new AtlasApiError(error, MessageEvent.Create, this._pageName, 'Procedure', '')));
                });
        });

    @Effect()
    msProceduresUpdate$: Observable<Action> =
    this._actions$.ofType(ManageMethodStatementActions.ActionTypes.UPDATE_MS_PROCEDURE)
        .map(toPayload)
        .withLatestFrom(this._store, (payload, state) => {
            return {
                _payload: payload
                , _manageMSState: state.manageMethodStatementState.MethodStatement
            };
        })
        .switchMap((inputData) => {
            let dataToSave: MSProcedure = inputData._payload;
            let vm = ObjectHelper.createUpdateInProgressSnackbarMessage(this._pageName, 'Procedure', dataToSave.Id);
            this._messenger.publish('snackbar', vm);
            return this._data.post(`MSProcedure`, dataToSave)
                .mergeMap((res) => {
                    let dd: Array<MSProcedure> = [];
                    if (!isNullOrUndefined(inputData._manageMSState.MSProcedures)) {
                        dd = dd.slice(0).concat(Array.from(inputData._manageMSState.MSProcedures));
                    }

                    dd = dd.slice(0).filter(c => c.Id.toLowerCase() !== dataToSave.Id.toLowerCase());
                    dd = dd.concat(<MSProcedure>res.json());

                    let newMS = Object.assign({}, inputData._manageMSState);
                    newMS.MSProcedures = dd;

                    vm = ObjectHelper.createUpdateCompleteSnackbarMessage(this._pageName, 'Procedure', dataToSave.Id);
                    this._messenger.publish('snackbar', vm);
                    return [
                        new ManageMethodStatementActions.UpdateMSProcedureCompleteAction(res.json()),
                        new ManageMethodStatementActions.LoadMethodStatementByIdCompleteAction(newMS)
                    ];
                })
                .catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(
                        new AtlasApiError(error, MessageEvent.Update, this._pageName, 'Procedure', '')));
                });
        });

    @Effect()
    msProceduresUpdateOrder$: Observable<Action> =
    this._actions$.ofType(ManageMethodStatementActions.ActionTypes.UPDATE_MS_PROCEDURE_ORDER)
        .map(toPayload)
        .withLatestFrom(this._store, (payload, state) => {
            return {
                _payload: payload
                , _manageMSState: state.manageMethodStatementState.MethodStatement
            };
        })
        .switchMap((inputData) => {
            let dataToSave: MSProcedure = inputData._payload;
            let vm = ObjectHelper.operationInProgressSnackbarMessage('Updating procedure\'s order...');
            this._messenger.publish('snackbar', vm);

            let params: URLSearchParams = new URLSearchParams();
            params.set('isCollection', 'true');
            params.set('isBulkUpdate', 'true');

            return this._data.post(`MSProcedure/BulkUpdateProcedures`, dataToSave, { search: params })
                .mergeMap((res) => {
                    let resultantProcedures = <Array<MSProcedure>>res.json();

                    let newMS = Object.assign({}, inputData._manageMSState);
                    newMS.MSProcedures.forEach((proc) => {
                        let filteredProcs = resultantProcedures.filter(c => c.Id.toLowerCase() === proc.Id.toLowerCase());
                        if (!isNullOrUndefined(filteredProcs) && filteredProcs.length > 0) {
                            proc.OrderIndex = filteredProcs[0].OrderIndex;
                        }
                    });

                    vm = ObjectHelper.operationCompleteSnackbarMessage('Procedure\'s order has been updated.');
                    this._messenger.publish('snackbar', vm);
                    return [
                        new ManageMethodStatementActions.LoadMethodStatementByIdCompleteAction(newMS)
                    ];
                })
                .catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(
                        new AtlasApiError(error, MessageEvent.Update, this._pageName, 'Procedure', '')));
                });
        });

    @Effect()
    procedureDatsForMS$: Observable<Action> =
    this._actions$.ofType(ManageMethodStatementActions.ActionTypes.LOAD_PROCEDURE_FOR_MS)
        .map(toPayload)
        .switchMap((requestParms) => {
            let params: URLSearchParams = new URLSearchParams();
            params.set('ProcedureByGroupId', getAtlasParamValueByKey(requestParms.Params, 'ProcedureGroup'));
            params.set('pageNumber', requestParms.PageNumber.toString());
            params.set('pageSize', requestParms.PageSize.toString());
            params.set('sortField', requestParms.SortBy.SortField);
            params.set('direction', requestParms.SortBy.Direction === SortDirection.Ascending ? 'asc' : 'desc');
            let procedureType = getAtlasParamValueByKey(requestParms.Params, 'exampleType');

            if (procedureType === 'All' || procedureType === 'Examples') {
                params.set('methodStatementId', getAtlasParamValueByKey(requestParms.Params, 'MethodStatementId'));
                params.set('includeClientProcedures', ((procedureType === 'All') ? 'true' : 'false'));
                return this._data
                    .get('Procedure/GetProceduresForMS', { search: params })
                    .map(res => new ManageMethodStatementActions
                        .LoadProceduresForMSCompleteAction(<AtlasApiResponse<Procedure>>res.json()));
            } else if (procedureType === 'Owned') {
                params.set('fields', 'Id,Name,ProcedureGroup.Name as ProcedureGroupName,ProcedureGroupId,Description,IsExample');
                params.set('ByMethodStatementId', getAtlasParamValueByKey(requestParms.Params, 'MethodStatementId'));
                params.set('isExample', getAtlasParamValueByKey(requestParms.Params, 'example'));
                return this._data
                    .get('Procedure/GetSpecificFields', { search: params })
                    .map(res => new ManageMethodStatementActions
                        .LoadProceduresForMSCompleteAction(<AtlasApiResponse<Procedure>>res.json()));
            }
        })
        .catch((error) => {
            return Observable.of(new errorActions.CatchErrorAction(
                new AtlasApiError(error, MessageEvent.Load, this._pageName, 'Procedure', '')));
        });

    @Effect()
    getMSSupportingDocumentsById$: Observable<Action> = this._actions$.ofType(ManageMethodStatementActions.ActionTypes.LOAD_SUPPORTING_DOCUMENTS_BY_ID)
        .map((action: ManageMethodStatementActions.LoadSupportingDocumentsByIdAction) => action.payload)
        .switchMap((pl) => {
            let params: URLSearchParams = new URLSearchParams();
            params.set('objectId', pl.Id);
            params.set('otc', '600');
            params.set('tag', "MS SD - " + pl.Id);
            params.set('example', pl.IsExample ? 'true' : 'false');

            return this._data.get('Attachment', { search: params });
        })
        .map((res) => {
            let docs = <MSSupportingDocuments[]>res.json();
            return new ManageMethodStatementActions.LoadSupportingDocumentsByIdCompleteAction(docs);
        }).catch((error) => {
            return Observable
                .of(new errorActions
                    .CatchErrorAction(new AtlasApiError(error
                        , MessageEvent.Load
                        , 'Method statement'
                        , null)));
        });


    @Effect()
    updateMethodStatementStatus$: Observable<Action> = this._actions$.ofType(ManageMethodStatementActions.ActionTypes.UPDATE_METHOD_STATEMENT_STATUS)
        .map((action: ManageMethodStatementActions.UpdateMethodStatementStatusAction) => action.payload)
        .withLatestFrom(this._store, (payload, state) => {
            return {
                _payload: payload,
                _msState: state.methodStatementsState
            };
        })
        .switchMap((inputData) => {
            let pl = inputData._payload;
            let params: URLSearchParams = new URLSearchParams();
            let url = 'methodstatementstatus/UpdateStatus';
            params.set('example', pl.IsExample ? 'true' : 'false');
            params.set('isApprove', 'true');
            let vm = ObjectHelper.createUpdateInProgressSnackbarMessage("Method statement", null, pl.Data.MethodStatementId);
            this._messenger.publish('snackbar', vm);
            return this._data.post(url, pl.Data, { search: params })
                .mergeMap((res) => {
                    let vm = ObjectHelper.createUpdateCompleteSnackbarMessage("Method statement", null, pl.Data.MethodStatementId);
                    this._messenger.publish('snackbar', vm);
                    return [
                        new ManageMethodStatementActions.UpdateMethodStatementStatusCompleteAction(<boolean>res.json()),
                        new MethodStatementActions.ClearMethodStatementStateAction(true)
                    ];
                }).catch((error) => {
                    return Observable
                        .of(new errorActions
                            .CatchErrorAction(new AtlasApiError(error
                                , MessageEvent.Update
                                , 'Method statement', null, pl.Data.MethodStatementId)));
                });
        });

    @Effect()
    getMSAttachmentsById$: Observable<Action> = this._actions$.ofType(ManageMethodStatementActions.ActionTypes.GET_METHOD_STATEMENT_ATTACHMENTS)
        .map((action: ManageMethodStatementActions.GetMethodStatementAttachmentAction) => action.payload)
        .switchMap((pl) => {
            let params: URLSearchParams = new URLSearchParams();
            params.set('MSId', pl.Id);
            params.set('GetRAAttachemnts', 'true');
            params.set('example', pl.IsExample ? 'true' : 'false');
            return this._data.get('methodstatement', { search: params });
        })
        .map((res) => {
            return new ManageMethodStatementActions.GetMethodStatementAttachmentCompleteAction(<string[]>(res.json()));
        }).catch((error) => {
            return Observable
                .of(new errorActions
                    .CatchErrorAction(new AtlasApiError(error
                        , MessageEvent.Load
                        , 'Method statement attachments'
                        , 'Method statement'
                        , null)));
        });


    @Effect()
    saveMethodStatementtoAtlas$: Observable<Action> = this._actions$.ofType(ManageMethodStatementActions.ActionTypes.SAVE_METHOD_STATEMENT_TO_ATLAS)
        .map((action: ManageMethodStatementActions.SaveMethodStatementPreviewAction) => action.payload)
        .switchMap((pl) => {
            let params: URLSearchParams = new URLSearchParams();
            params.set('pdf', 'true');
            let vm = ObjectHelper.createInsertInProgressSnackbarMessage("Method Statement", pl.FileName);
            this._messenger.publish('snackbar', vm);
            return this._data.post('RiskAssessment', pl, { search: params })
                .map((res) => {
                    let vm = ObjectHelper.createInsertCompleteSnackbarMessage("Method Statement", pl.FileName);
                    this._messenger.publish('snackbar', vm);
                    return new ManageMethodStatementActions.SaveMethodStatementPreviewCompleteAction(res.json());
                }).catch((error) => {
                    return Observable
                        .of(new errorActions
                            .CatchErrorAction(new AtlasApiError(error
                                , MessageEvent.Create
                                , 'Method statement'
                                , pl.FileName)));
                });
        });


    /*
*  To delete MS other risk assessment
*/
    @Effect()
    msOtherRiskAssessmentDelete$: Observable<Action> =
    this._actions$.ofType(ManageMethodStatementActions.ActionTypes.DELETE_MSOTHER_RISKASSESSMENT)
        .map(toPayload)
        .switchMap((pl) => {
            let id: string = pl.Id;
            let vm = ObjectHelper.createRemoveInProgressSnackbarMessage(this._pageName, 'Other risk assessment', pl.MethodStatementId);
            this._messenger.publish('snackbar', vm);
            return this._data.delete(`MSOtherRiskAssessments/${id}`)
                .mergeMap((res) => {
                    let vm = ObjectHelper.createRemoveCompleteSnackbarMessage(this._pageName, 'Other risk assessment', pl.MethodStatementId);
                    this._messenger.publish('snackbar', vm);
                    return [
                        new ManageMethodStatementActions.DeleteMSOtherRiskAssessmentCompleteAction(pl.Id)
                    ];
                })
                .catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(
                        new AtlasApiError(error, MessageEvent.Remove, this._pageName, 'Other risk assessment', pl.MethodStatementId)));
                });
        });

    /*
*  To updte  MS  risk assessment
*/

    @Effect()
    updateMSOtherRA$: Observable<Action> = this._actions$.ofType(ManageMethodStatementActions.ActionTypes.ADD_MSOTHER_RISKASSESSMENT)
        .map((action: ManageMethodStatementActions.AddMSOtherRAAction) => action.payload)
        .withLatestFrom(this._store, (payload, state) => {
            return {
                _payload: payload
                , _manageMSState: state.manageMethodStatementState.MethodStatement
            };
        })
        .switchMap((inputData) => {
            let pl = inputData._payload;
            let params: URLSearchParams = new URLSearchParams();
            let methodstatementId = pl[0].MethodStatementId;
            let vm = ObjectHelper.createUpdateInProgressSnackbarMessage(this._pageName, 'Other Riskassessment', methodstatementId);
            this._messenger.publish('snackbar', vm);
            return this._data.post('msotherriskassessments/BulkUpdate?isBulkUpdate=true', pl)
                .mergeMap((res) => {
                    let dd: Array<MSOtherRiskAssessments> = [];
                    if (!isNullOrUndefined(inputData._manageMSState.MSOtherRiskAssessments)) {
                        dd = dd.slice(0).concat(Array.from(inputData._manageMSState.MSOtherRiskAssessments));
                    }

                    dd = dd.slice(0).concat(<MSOtherRiskAssessments>res.json());

                    let newMS = Object.assign({}, inputData._manageMSState);
                    newMS.MSOtherRiskAssessments = dd;

                    vm = ObjectHelper.createUpdateCompleteSnackbarMessage(this._pageName, 'Other Riskassessment', methodstatementId);
                    this._messenger.publish('snackbar', vm);
                    return [
                        new ManageMethodStatementActions.AddMSOtherRACompleteAction(dd),
                        new ManageMethodStatementActions.LoadMethodStatementByIdCompleteAction(newMS)
                    ];
                }).catch((error) => {
                    return Observable
                        .of(new errorActions
                            .CatchErrorAction(new AtlasApiError(error
                                , MessageEvent.Update
                                , 'Method statement'
                                , null)));
                });
        });



    @Effect()
    addMethodStatementAttachment$: Observable<Action> = this._actions$.ofType(ManageMethodStatementActions.ActionTypes.ADD_METHOD_STATEMENT_ATTACHMENT)
        .map((action: ManageMethodStatementActions.AddMethodStatementAttachmentAction) => action.payload)
        .withLatestFrom(this._store, (payload, state) => {
            return {
                Documents: payload
                , AttachmentTargetObject: state.manageMethodStatementState.MethodStatement
            };
        })
        .switchMap((pl) => {
            let objectType = 'Attachment';
            let objectIdentifier = '';
            let params: URLSearchParams = new URLSearchParams();
            params.set('isAttachment', 'true');
            params.set('isBulkInsert', 'true');
            params.set('tag', 'MS SD - ' + pl.AttachmentTargetObject.Id);

            let url = 'Attachment';
            let vm = ObjectHelper.createInsertInProgressSnackbarMessage(objectType, objectIdentifier);
            this._messenger.publish('snackbar', vm);
            return this._data.put(url, pl, { search: params })
                .map((res) => {
                    let vm = ObjectHelper.createInsertCompleteSnackbarMessage(objectType, objectIdentifier);
                    this._messenger.publish('snackbar', vm);
                    return new ManageMethodStatementActions.AddMethodStatementAttachmentCompleteAction(true);
                }).catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Create, objectType, objectIdentifier)));
                })
        });

    @Effect()
    deleteMethodStatementAttachment$: Observable<Action> = this._actions$.ofType(ManageMethodStatementActions.ActionTypes.DELETE_METHOD_STATEMENT_ATTACHMENT)
        .map((action: ManageMethodStatementActions.DeleteMethodStatementAttachmentAction) => action.payload)
        .withLatestFrom(this._store, (payload, state) => {
            return {
                Document: payload
                , MethodStatement: state.manageMethodStatementState.MethodStatement
            };
        })
        .switchMap((data) => {
            let objectType = 'Attachment';
            let params: URLSearchParams = new URLSearchParams();
            params.set('MsId', data.MethodStatement.Id);
            if (!data.MethodStatement.IsExample) {
                params.set('cid', data.MethodStatement.CompanyId);
            }
            let vm = ObjectHelper.createRemoveInProgressSnackbarMessage(objectType, data.Document.FileName, data.Document.Id);
            this._messenger.publish('snackbar', vm);
            return this._data.delete(`MethodStatement/DeleteAttachmnets/${data.Document.Id}`, { search: params })
                .map((res) => {
                    let vm = ObjectHelper.createRemoveCompleteSnackbarMessage(objectType, data.Document.FileName, data.Document.Id);
                    this._messenger.publish('snackbar', vm);
                    return new ManageMethodStatementActions.DeleteMethodStatementAttachmentCompleteAction(true);
                })
                .catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Remove, objectType, data.Document.FileName, data.Document.Id)));
                });
        });



    constructor(private _data: RestClientService
        , private _actions$: Actions
        , private _store: Store<fromRoot.State>
        , private _messenger: MessengerService) {

    }
}
