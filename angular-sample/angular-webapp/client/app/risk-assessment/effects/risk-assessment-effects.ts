import { Injectable } from '@angular/core';
import { URLSearchParams } from '@angular/http';
import { Router, NavigationExtras } from '@angular/router';
import { Actions, Effect, toPayload } from '@ngrx/effects';
import { Action, Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { isNullOrUndefined } from 'util';

import { AeSortModel, SortDirection } from '../../atlas-elements/common/models/ae-sort-model';
import { MessageEvent } from '../../atlas-elements/common/models/message-event.enum';
import * as errorActions from '../../shared/actions/error.actions';
import { RestClientService } from '../../shared/data/rest-client.service';
import { AtlasApiError } from '../../shared/error-handling/atlas-api-error';
import { extractInformationBarItems, extractRiskAssessmentInformationBarItems } from '../../shared/helpers/extract-helpers';
import { ObjectHelper } from '../../shared/helpers/object-helper';
import { StringHelper } from '../../shared/helpers/string-helper';
import { AtlasApiRequestWithParams, AtlasApiResponse, AtlasParams } from '../../shared/models/atlas-api-response';
import * as fromRoot from '../../shared/reducers/index';
import { MessengerService } from '../../shared/services/messenger.service';
import * as riskAssessmentActions from '../actions/risk-assessment-actions';
import { extractRiskAssessmentListData } from '../common/extract-helper';
import {
    combineControls,
    extractHazardsData,
    extractHazardsDataFromResponse,
    extractHazardsTotalCount,
    extractRiskAssessmentListPagingInfo,
    extractControlsTotalCount,
} from '../common/extract-helper';
import { Hazard } from '../models/hazard';
import { RiskAssessment } from '../models/risk-assessment';
import { RiskAssessmentControl } from '../models/risk-assessment-control';
import { RiskAssessmentHazard } from '../models/risk-assessment-hazard';
import { RASubstance } from '../models/risk-assessment-substance';
import { RAProcedures } from '../models/risk-assessments-procedures';
import { RiskAssessmentConstants } from '../risk-assessment-constants';
import { ClaimsHelperService } from '../../shared/helpers/claims-helper';
import { Md5 } from 'ts-md5/dist/md5';

@Injectable()
export class RiskAssessmentEffects {
    private _selectedRAItem: RiskAssessment;
    private _objectType: string;
    constructor(private _data: RestClientService
        , private _actions$: Actions
        , private _store: Store<fromRoot.State>
        , private _router: Router
        , private _messenger: MessengerService
        , private _claimsHelper: ClaimsHelperService) {
        this._objectType = 'Risk assessment';

    }

    @Effect()
    deleteRiskAssessment$: Observable<Action> = this._actions$.ofType(riskAssessmentActions.ActionTypes.DELETE_RISKASSESSMENT)
        .map(toPayload)
        .switchMap((payload) => {
            this._selectedRAItem = payload;
            let vm = ObjectHelper.createRemoveInProgressSnackbarMessage(this._objectType, payload.Name, payload.Id);
            this._messenger.publish('snackbar', vm);
            return this._data.delete('RiskAssessment/' + payload.Id);
        })
        .map(res => {
            let vm = ObjectHelper.createRemoveCompleteSnackbarMessage(this._objectType, this._selectedRAItem.Name, this._selectedRAItem.Name);
            this._messenger.publish('snackbar', vm);
            return new riskAssessmentActions.DeleteRiskAssessmentCompleteAction(true);
        }
        ).catch((error) => {
            return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Remove, this._objectType, this._selectedRAItem.Id)));
        });

    @Effect()
    archivedRiskAssessment$: Observable<Action> = this._actions$.ofType(riskAssessmentActions.ActionTypes.ARCHIVED_RISKASSESSMENT)
        .map(toPayload)
        .switchMap((payload) => {
            this._selectedRAItem = payload;
            let vm = ObjectHelper.createUpdateInProgressSnackbarMessage(this._objectType, payload.Name, payload.Id);
            this._messenger.publish('snackbar', vm);
            let params: URLSearchParams = new URLSearchParams();
            params.set('example', payload.IsExample);
            params.set('status', '4');
            return this._data.post('RiskAssessment/' + payload.Id, { id: payload.Id }, { search: params });
        })
        .map(res => {
            let vm = ObjectHelper.createUpdateCompleteSnackbarMessage(this._objectType, this._selectedRAItem.Name, this._selectedRAItem.Id);
            this._messenger.publish('snackbar', vm);
            return new riskAssessmentActions.ArchivedRiskAssessmentCompleteAction(true);
        }
        ).catch((error) => {
            return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Update, this._objectType, this._selectedRAItem.Id)));
        });

    @Effect()
    approveRiskAssessment$: Observable<Action> = this._actions$.ofType(riskAssessmentActions.ActionTypes.APPROVE_RISKASSESSMENT)
        .map(toPayload)
        .switchMap((payload) => {
            this._selectedRAItem = payload;
            let vm = ObjectHelper.createUpdateInProgressSnackbarMessage(this._objectType, payload.Name, payload.Id);
            this._messenger.publish('snackbar', vm);
            let params: URLSearchParams = new URLSearchParams();
            params.set('example', 'false');
            params.set('status', '2');
            return this._data.post('RiskAssessment/' + payload.Id, { id: payload.Id }, { search: params });
        })
        .map(res => {
            let vm = ObjectHelper.createUpdateCompleteSnackbarMessage(this._objectType, this._selectedRAItem.Name, this._selectedRAItem.Id);
            this._messenger.publish('snackbar', vm);
            let params = { id: this._selectedRAItem.Id, example: false }
            return new riskAssessmentActions.LoadRiskAssessmentAction(params);
        }
        ).catch((error) => {
            return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Update, this._objectType, this._selectedRAItem.Id)));
        });



    @Effect()
    loadRiskAssessment$: Observable<Action> = this._actions$.ofType(riskAssessmentActions.ActionTypes.LOAD_RISKASSESSMENT)
        .map(toPayload)
        .switchMap((payload) => {
            let params: URLSearchParams = new URLSearchParams();
            params.set('example', payload.example.toString());
            params.set('preview', 'true');
            return this._data.get('RiskAssessment/' + payload.id, { search: params });
        })
        .map(res => {
            return new riskAssessmentActions.LoadRiskAssessmentCompleteAction(res.json());
        }
        ).catch((error) => {
            return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, this._objectType, 'Loading Risk Assessment')));
        });

    @Effect()
    loadRiskAssessmentList$: Observable<Action> = this._actions$.ofType(riskAssessmentActions.ActionTypes.LOAD_RISKASSESSMENTS)
        .map((action: riskAssessmentActions.LoadRiskAssessments) => action.payload)
        .withLatestFrom(this._store, (payload, state) => {
            return {
                _payload: payload, _nameFilterFromState: state.riskAssessmentState.nameFilter,
                _workSpaceFilterFromState: state.riskAssessmentState.workspaceFilter,
                _siteFilterFromState: state.riskAssessmentState.siteFilter,
                _assessmentTypeFilterFromState: state.riskAssessmentState.assessmentTypeFilter,
                _sectorFilterFromState: state.riskAssessmentState.sectorFilter
            };
        })
        .switchMap((data) => {
            let params: URLSearchParams = new URLSearchParams();
            let currentUrl = this._router.url;
            params.set('pageNumber', data._payload.PageNumber.toString());
            params.set('pageNumber', data._payload.PageNumber.toString());
            params.set('pageSize', data._payload.PageSize.toString());
            params.set('sortField', data._payload.SortBy.SortField);
            params.set('fields', 'Id,Name,ReferenceNumber,ReviewDate,Assessor,ApprovedUser, StatusId,ReviewPeriod,Description,SiteId,Site,SiteLocation,ModifiedOn,RiskAssessmentWorkspaceTypes,RiskAssessmentType,AssessmentDate,RiskAssessmentSectors,RiskAssessmentTypeId,IsExample,Assessor_Name');
            params.set('direction', data._payload.SortBy.Direction === SortDirection.Ascending ? 'asc' : 'desc');

            //set filters
            if (!isNullOrUndefined(data._nameFilterFromState) && !StringHelper.isNullOrUndefinedOrEmpty(String(data._nameFilterFromState)))
                params.set('searchBoxFilter', data._nameFilterFromState);
            if (!isNullOrUndefined(data._workSpaceFilterFromState) && !StringHelper.isNullOrUndefinedOrEmpty(String(data._workSpaceFilterFromState)))
                params.set('workspaceRAFilter', data._workSpaceFilterFromState);
            if (!isNullOrUndefined(data._siteFilterFromState) && !StringHelper.isNullOrUndefinedOrEmpty(String(data._siteFilterFromState)))
                params.set('siteRAFilter', data._siteFilterFromState);
            if (!isNullOrUndefined(data._assessmentTypeFilterFromState) && !StringHelper.isNullOrUndefinedOrEmpty(String(data._assessmentTypeFilterFromState)))
                params.set('assessmenttypeRAFilter', data._assessmentTypeFilterFromState);
            if (currentUrl.indexOf(RiskAssessmentConstants.Routes.Examples) !== -1 && !isNullOrUndefined(data._sectorFilterFromState) && !StringHelper.isNullOrUndefinedOrEmpty(String(data._sectorFilterFromState)))
                params.set('sectorRAFilter', data._sectorFilterFromState);

            //append the filters
            data._payload.Params.forEach((element) => {
                if (!isNullOrUndefined(element.Value) && !StringHelper.isNullOrUndefinedOrEmpty(String(element.Value))) {
                    if (params.has(element.Key)) {
                        params.set(element.Key, element.Value.toString());
                    } else {
                        params.append(element.Key, element.Value.toString());
                    }
                }
            });
            return this._data.get('RiskAssessment', { search: params })
        })
        .map((res) => {
            return new riskAssessmentActions.LoadRiskAssessmentsCompleteAction({ RiskAssessmentList: extractRiskAssessmentListData(res), PagingInfo: extractRiskAssessmentListPagingInfo(res) });
        }).catch((error) => {
            return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'RiskAssessment', 'Loading RiskAssessment')));
        });

    @Effect()
    createRiskAssessment$: Observable<Action> = this._actions$.ofType(riskAssessmentActions.ActionTypes.CREATE_RISKASSESSMENT)
        .map(toPayload)
        .switchMap((payLoad) => {
            let params: URLSearchParams = new URLSearchParams();
            params.set('example', payLoad.IsExample.toString());
            let vm = ObjectHelper.createInsertInProgressSnackbarMessage('Risk Assessment', payLoad.Name);
            this._messenger.publish('snackbar', vm);
            return this._data.put('RiskAssessment', payLoad, { search: params })
                .map(res => {
                    let createdRiskAssessment = <RiskAssessment>res.json();
                    let vm = ObjectHelper.createInsertCompleteSnackbarMessage('Risk Assessment', createdRiskAssessment.Name);
                    this._messenger.publish('snackbar', vm);
                    return new riskAssessmentActions.LoadRiskAssessmentAction({ id: createdRiskAssessment.Id, example: createdRiskAssessment.IsExample });
                }).catch((error) => {
                    return Observable.of(new errorActions.CatchAPTErrorAction(new AtlasApiError(error, MessageEvent.Load, 'Risk Assessment', payLoad.Name, Md5.hashStr(payLoad.Name).toString())));
                });
        });

    @Effect()
    createProceduresRiskAssessment$: Observable<Action> = this._actions$.ofType(riskAssessmentActions.ActionTypes.PEOCEDURES_RISKASSESSMENT_CREATE)
        .map(toPayload)
        .switchMap((payLoad) => {
            let vm = ObjectHelper.createInsertInProgressSnackbarMessage('Risk Assessment Procedures', "RiskAssessmentProcedures");
            this._messenger.publish('snackbar', vm);
            return this._data.put('RAProcedures', payLoad);
        })
        .map(res => {
            let createdRAProcedures = <RAProcedures>res.json();
            let vm = ObjectHelper.createInsertCompleteSnackbarMessage('Risk Assessment Procedures', "RiskAssessmentProcedures");
            this._messenger.publish('snackbar', vm);
            return new riskAssessmentActions.ProceduresRiskAssessmentUpdateCompleteAction(createdRAProcedures);
        }
        ).catch((error) => {
            return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'RiskAssessment', 'Create Risk Assessment Procedures')));
        });
    @Effect()
    updateProceduresRiskAssessment$: Observable<Action> = this._actions$.ofType(riskAssessmentActions.ActionTypes.PEOCEDURES_RISKASSESSMENT_UPDATE)
        .map(toPayload)
        .switchMap((payLoad) => {
            let vm = ObjectHelper.createInsertInProgressSnackbarMessage(payLoad.Id, 'Risk Assessment Procedures');
            this._messenger.publish('snackbar', vm);
            return this._data.post('RAProcedures', payLoad);
        })
        .map(res => {
            let createdRAProcedures = <RAProcedures>res.json();
            let vm = ObjectHelper.createInsertCompleteSnackbarMessage(createdRAProcedures.Id, 'Risk Assessment Procedures');
            this._messenger.publish('snackbar', vm);
            return new riskAssessmentActions.ProceduresRiskAssessmentUpdateCompleteAction(createdRAProcedures);
        }
        ).catch((error) => {
            return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'RiskAssessment', 'Update Risk Assessment Procedures')));
        });

    @Effect()
    updateRiskAssessment$: Observable<Action> = this._actions$.ofType(riskAssessmentActions.ActionTypes.UPDATE_RISKASSESSMENT)
        .map(toPayload)
        .switchMap((payLoad) => {
            let params: URLSearchParams = new URLSearchParams();
            params.set('example', payLoad.IsExample.toString());
            let vm = ObjectHelper.createUpdateInProgressSnackbarMessage('RiskAssessment', payLoad.Name, payLoad.Id);
            this._messenger.publish('snackbar', vm);
            return this._data.post('RiskAssessment', payLoad, { search: params })
                .map(res => {
                    let updatedRiskAssessment = <RiskAssessment>res.json();
                    let vm = ObjectHelper.createUpdateCompleteSnackbarMessage('RiskAssessment', updatedRiskAssessment.Name, payLoad.Id);
                    this._messenger.publish('snackbar', vm);
                    return new riskAssessmentActions.LoadRiskAssessmentAction({ id: updatedRiskAssessment.Id, example: updatedRiskAssessment.IsExample });
                }
                ).catch((error) => {
                    return Observable.of(new errorActions.CatchAPTErrorAction(new AtlasApiError(error, MessageEvent.Update, 'RiskAssessment', payLoad.Id)));
                });
        })

    @Effect()
    riskAssessmentsInformationComponent$: Observable<Action> = this._actions$.ofType(riskAssessmentActions.ActionTypes.LOAD_RISKASSESSMENT_INFORMATION_COMPONENT)
        .switchMap((action) => {
            let params: URLSearchParams = new URLSearchParams();
            params.set('EmployeeId', action.payload);
            params.set('Area', '10');
            params.set('requestedCodes', '53,54,55,56,57');
            return this._data.get('Statistics', { search: params })
        })
        .map((informationBarItems) => {
            {
                return new riskAssessmentActions.LoadRiskAssessmentsInformationComponentCompleteAction(extractRiskAssessmentInformationBarItems(informationBarItems));
            }
        }).catch((error) => {
            return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'RiskAssessment', 'Loading RiskAssessment')));
        });
    @Effect()
    deleteDocument$: Observable<Action> = this._actions$.ofType(riskAssessmentActions.ActionTypes.REMOVE_DOCUMENT)
        .switchMap((action) => {
            let apiUrl = 'document/' + action.payload.Id;
            return this._data.delete(apiUrl)
        })
        .map((res) => {
            return new riskAssessmentActions.RemoveDocumentCompleteAction(true);
        }).catch((error) => {
            return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Update, 'RiskAssessment', 'Loading RiskAssessment')));
        });
    @Effect()
    loadRiskAssessmentMeasures$: Observable<Action> = this._actions$.ofType(riskAssessmentActions.ActionTypes.LOAD_RISKASSESSMENT_MEASURES)
        .map(toPayload)
        .switchMap((payload) => {
            let params: URLSearchParams = new URLSearchParams();
            params.set('riskassessmentId', payload.id);
            return this._data.get('Measures', { search: params });
        })
        .map((res) => {
            return new riskAssessmentActions.LoadRiskAssessmentMesauresCompleteAction(res.json());
        })
    @Effect()
    loadAdditionalControlsRiskAssesments$: Observable<Action> = this._actions$.ofType(riskAssessmentActions.ActionTypes.LOAD_ADDITIONAL_CONTROL_RISKASSESSMENT_LIST)
        .map(toPayload)
        .switchMap((payload) => {
            let params: URLSearchParams = new URLSearchParams();
            params.set('ControlsByCategoryFilter', '2');
            params.set('example', 'true')
            return this._data.get('Control', { search: params });
        })
        .map((res) => {
            return new riskAssessmentActions.LoadAdditionalControlsRiskAssessmentsListCompleteAction(res.json());
        })
    @Effect()
    loadAdditionalControlsCategoryText$: Observable<Action> = this._actions$.ofType(riskAssessmentActions.ActionTypes.LOAD_ADDITIONAL_CONTROL_CATEGORY_TEXT)
        .map(toPayload)
        .switchMap((payload) => {
            let params: URLSearchParams = new URLSearchParams();
            params.set('AdditionalControlsTextByRAIdFilter', payload);
            return this._data.get('AdditionalControlCategoryText', { search: params });
        })
        .map((res) => {
            return new riskAssessmentActions.LoadAdditionalControlsCategoryTextCompleteAction(res.json());
        })
    @Effect()
    loadRAAdditionalControlsList$: Observable<Action> = this._actions$.ofType(riskAssessmentActions.ActionTypes.LOAD_RA_ADDITIONAL_CONTROL_LIST)
        .map(toPayload)
        .switchMap((payload) => {
            let params: URLSearchParams = new URLSearchParams();
            params.set('AdditionalControlsByRAIdFilter', payload);
            return this._data.get('RAAdditionalControl', { search: params });
        })
        .map((res) => {
            return new riskAssessmentActions.LoadRAAdditionalControlsListCompleteAction(res.json());
        })
    @Effect()
    saveRAAdditionalControlsList$: Observable<Action> = this._actions$.ofType(riskAssessmentActions.ActionTypes.SAVE_ADDITIONAL_CONTROLS_LIST)
        .map(toPayload)
        .switchMap((payload) => {
            let params: URLSearchParams = new URLSearchParams();
            params.set('additional', 'true');
            return this._data.post('RAAdditionalControl/SaveAdditionalControls', payload, { search: params });
        })
        .map((res) => {
            return new riskAssessmentActions.SaveRAAdditionalControlsListCompleteAction(res.json());
        })
    @Effect()
    saveRAAdditionalControlsText$: Observable<Action> = this._actions$.ofType(riskAssessmentActions.ActionTypes.SAVE_ADDITIONAL_CONTROLS_TEXT)
        .map(toPayload)
        .switchMap((payload) => {
            let params: URLSearchParams = new URLSearchParams();
            params.set('additional', 'true');
            return this._data.post('AdditionalControlCategoryText/SaveAdditionalControlCategoryText', payload, { search: params });
        })
        .map((res) => {
            return new riskAssessmentActions.SaveRAAdditionalControlsTextCompleteAction(res.json());
        })
    @Effect()
    loadHazards$: Observable<Action> = this._actions$.ofType(riskAssessmentActions.ActionTypes.LOAD_HAZARDS)
        .map(toPayload)
        .switchMap((_payload) => {
            let exampleParams: URLSearchParams = new URLSearchParams();
            let companyParams: URLSearchParams = new URLSearchParams();
            let apiRequestParams = <AtlasApiRequestWithParams>_payload;
            let pageNumber = 1;
            if (!isNullOrUndefined(apiRequestParams)) {
                pageNumber = apiRequestParams.PageNumber;
                exampleParams.set('pageNumber', apiRequestParams.PageNumber.toString());
                exampleParams.set('pageSize', '50');
                exampleParams.set('example', 'true');
                companyParams.set('pageNumber', apiRequestParams.PageNumber.toString());
                companyParams.set('pageSize', '50');
                companyParams.set('example', 'false');
                let filterParams = apiRequestParams.Params;
                if (!isNullOrUndefined(filterParams)) {
                    filterParams.forEach((obj) => {
                        if (!isNullOrUndefined(obj.Value)) {
                            exampleParams.set(obj.Key, obj.Value.toString());
                            companyParams.set(obj.Key, obj.Value.toString());
                        }
                    });
                }
            }
            return Observable.forkJoin(this._data.get('hazard', { search: exampleParams }), this._data.get('hazard', { search: companyParams }))
                .map((res) => {
                    return new riskAssessmentActions.LoadHazardsCompleteAction({ data: extractHazardsDataFromResponse(res), totalCount: extractHazardsTotalCount(res), pageNumber: pageNumber, isExample: false });
                })
        })
        .catch((error) => {
            return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'RiskAssessment', 'Load  Hazards')));
        });

    @Effect()
    loadExampleHazards$: Observable<Action> = this._actions$.ofType(riskAssessmentActions.ActionTypes.LOAD_EXAMPLE_HAZARDS)
        .map(toPayload)
        .switchMap((_payload) => {
            let params: URLSearchParams = new URLSearchParams();
            let apiRequestParams = <AtlasApiRequestWithParams>_payload;
            let pageNumber = 1;
            if (!isNullOrUndefined(apiRequestParams)) {
                pageNumber = apiRequestParams.PageNumber;
                params.set('pageNumber', apiRequestParams.PageNumber.toString());
                params.set('pageSize', '50');
                params.set('example', 'true');
                let filterParams = apiRequestParams.Params;
                if (!isNullOrUndefined(filterParams)) {
                    filterParams.forEach((obj) => {
                        if (!isNullOrUndefined(obj.Value)) {
                            params.set(obj.Key, obj.Value.toString());
                        }
                    });
                }
            }

            return this._data.get('hazard', { search: params })
                .mergeMap((res) => {
                    return [new riskAssessmentActions.LoadHazardsCompleteAction({ data: extractHazardsDataFromResponse([res]), totalCount: extractHazardsTotalCount([res]), pageNumber: pageNumber, isExample: true })];
                })
        })
        .catch((error) => {
            return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'RiskAssessment', 'Load example Hazards')));
        });


    @Effect()
    loadselectedHazardsHazards$: Observable<Action> = this._actions$.ofType(riskAssessmentActions.ActionTypes.Load_SELECTED_HAZARDS)
        .map(toPayload)
        .switchMap((payload) => {
            let params: URLSearchParams = new URLSearchParams();
            params.set('category', payload.category);
            params.set('riskassessmentId', payload.riskAssessmentId);
            return this._data.get('RiskAssessmentHazard', { search: params })
        })
        .map((res) => {
            {
                return new riskAssessmentActions.LoadSelectedHazardsCompleteAction(res.json());
            }
        });


    @Effect()
    loadExampleROEs$: Observable<Action> = this._actions$.ofType(riskAssessmentActions.ActionTypes.LOAD_EXAMPLE_ROUTES_OF_EXPOSURE)
        .map(toPayload)
        .switchMap((payload) => {
            let params: URLSearchParams = new URLSearchParams();
            payload.forEach((obj) => {
                params.set(obj.Key, obj.Value);
            });
            return this._data.get('hazard', { search: params })
                .mergeMap((res) => {
                    return [new riskAssessmentActions.LoadRoutesOfExposureCompleteAction(extractHazardsData(res))];
                })
        })
        .catch((error) => {
            return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'RiskAssessment', 'Load example Routes Of Exposure')));
        });

    @Effect()
    loadROEsByRiskAssessmentId$: Observable<Action> = this._actions$.ofType(riskAssessmentActions.ActionTypes.LOAD_ROUTES_OF_EXPOSURE_BY_RISKASSESSMENT_ID)
        .map(toPayload)
        .switchMap((payload) => {
            let params: URLSearchParams = new URLSearchParams();
            params.set('riskassessmentId', payload.riskassessmentId);
            params.set('category', payload.category);
            return this._data.get('RiskAssessmentHazard', { search: params })
                .mergeMap((res) => {
                    return [new riskAssessmentActions.LoadRoutesOfExposureByRiskAssessmentIdCompleteAction(res.json())];
                })
        })
        .catch((error) => {
            return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'RiskAssessment', 'Load Risk Assessment Routes Of Exposure by Id')));
        });

    @Effect()
    createRiskAssessmentROE$: Observable<Action> = this._actions$.ofType(riskAssessmentActions.ActionTypes.CREATE_RISKASSESSMENT_ROUTE_OF_EXPOSURE)
        .map(toPayload)
        .switchMap((payload) => {
            let vm = ObjectHelper.createInsertInProgressSnackbarMessage('RiskAssessment routes of exposure', payload.Name)
            this._messenger.publish('snackbar', vm);
            return this._data.put('RiskAssessmentHazard', payload)
                .mergeMap((res) => {
                    let vm = ObjectHelper.createInsertCompleteSnackbarMessage('RiskAssessment routes of exposure', payload.Name);
                    this._messenger.publish('snackbar', vm);
                    let riskAssessmentHazard: RiskAssessmentHazard = <RiskAssessmentHazard>res.json();
                    return [new riskAssessmentActions.CreateUpdateRiskAssessmentHazardCompleteAction(riskAssessmentHazard)];
                })
                .catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'RiskAssessment Routes Of Exposure', payload.Name)));
                });
        });

    @Effect()
    updateRiskAssessmentROE$: Observable<Action> = this._actions$.ofType(riskAssessmentActions.ActionTypes.UPDATE_RISKASSESSMENT_ROUTE_OF_EXPOSURE)
        .map(toPayload)
        .switchMap((payload) => {
            let vm = ObjectHelper.createUpdateInProgressSnackbarMessage('RiskAssessment routes of exposure', payload.Name, payload.Id);
            this._messenger.publish('snackbar', vm);
            return this._data.post('RiskAssessmentHazard', payload)
                .mergeMap((res) => {
                    let vm = ObjectHelper.createUpdateCompleteSnackbarMessage('RiskAssessment routes of exposure', payload.Name, payload.Id);
                    this._messenger.publish('snackbar', vm);
                    let riskAssessmentHazard: RiskAssessmentHazard = <RiskAssessmentHazard>res.json();
                    return [new riskAssessmentActions.CreateUpdateRiskAssessmentHazardCompleteAction(riskAssessmentHazard)];
                })
                .catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'RiskAssessment Routes Of Exposure', payload.Id)));
                });
        });

    @Effect()
    removeRiskAssessmentROE$: Observable<Action> = this._actions$.ofType(riskAssessmentActions.ActionTypes.REMOVE_RISKASSESSMENT_ROUTE_OF_EXPOSURE)
        .map(toPayload)
        .switchMap((payload) => {
            let params: URLSearchParams = new URLSearchParams();
            params.set('id', payload.Id);
            let vm = ObjectHelper.createRemoveInProgressSnackbarMessage('RiskAssessment routes of exposure', payload.Name, payload.Id);
            this._messenger.publish('snackbar', vm);
            return this._data.delete('RiskAssessmentHazard', { search: params })
                .mergeMap((res) => {
                    let vm = ObjectHelper.createRemoveCompleteSnackbarMessage('RiskAssessment routes of exposure', payload.Name, payload.Id);
                    this._messenger.publish('snackbar', vm);
                    return [new riskAssessmentActions.RemoveRiskAssessmentHazardCompleteAction(payload.Id)];
                })
                .catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'RiskAssessment Routes Of Exposure', null, payload.Id)));
                });
        });

    @Effect()
    loadRiskAssessmentSubstances$: Observable<Action> = this._actions$.ofType(riskAssessmentActions.ActionTypes.LOAD_RISKASSESSMENT_SUBSTANCES)
        .map(toPayload)
        .switchMap((payload: AtlasApiRequestWithParams) => {
            let params: URLSearchParams = new URLSearchParams();
            params.set('RASubstanceByRiskAssessmentId', payload.Params["currentRiskAssessmentId"].toString());
            params.set('pageNumber', payload.PageNumber.toString());
            params.set('pageSize', payload.PageSize.toString());
            params.set('sortField', payload.SortBy.SortField);
            params.set('direction', payload.SortBy.Direction === SortDirection.Ascending ? 'asc' : 'desc');
            return this._data.get('RASubstance', { search: params });
        })
        .map(res => {
            return new riskAssessmentActions.LoadRiskAssessmentSubstancesCompleteAction(<AtlasApiResponse<RASubstance>>res.json());
        }
        ).catch((error) => {
            return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'Risk asessment', 'Risk assessment')));
        });
    @Effect()
    loadRiskAssessmentCoshhInventory$: Observable<Action> = this._actions$.ofType(riskAssessmentActions.ActionTypes.LOAD_COSHHINVENTORY)
        .map(toPayload)
        .switchMap((payload) => {
            let params: URLSearchParams = new URLSearchParams();
            params.set('isExample', payload);
            return this._data.get('coshhinventory', { search: params });
        })
        .map((res) => {
            return new riskAssessmentActions.LoadCoshhInventoryComplete(res.json());
        }).catch((error) => {
            return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'Risk asessment-coshh inventory', 'Risk asessment-coshh inventory')));
        });
    @Effect()
    addRiskAssessmentSubstance$: Observable<Action> = this._actions$.ofType(riskAssessmentActions.ActionTypes.ADD_RASUBSTANCE)
        .map(toPayload)
        .switchMap((payload) => {
            let vm = ObjectHelper.createInsertInProgressSnackbarMessage('Substance', '')
            this._messenger.publish('snackbar', vm);
            let params: URLSearchParams = new URLSearchParams();

            return this._data.put('RASubstance', payload, { search: params });
        })
        .map((res) => {
            let vm = ObjectHelper.createInsertCompleteSnackbarMessage('Substance', '');
            this._messenger.publish('snackbar', vm);
            return new riskAssessmentActions.AddRASubstanceActionComplete(res.json());
        }).catch((error) => {
            return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Create, 'Risk asessment-substance', 'Risk asessment-substance')));
        });
    @Effect()
    updateRiskAssessmentSubstance$: Observable<Action> = this._actions$.ofType(riskAssessmentActions.ActionTypes.UPDATE_RASUBSTANCE)
        .map(toPayload)
        .switchMap((payload) => {
            let vm = ObjectHelper.createUpdateInProgressSnackbarMessage('Substance', '', '')
            this._messenger.publish('snackbar', vm);
            let params: URLSearchParams = new URLSearchParams();

            return this._data.post('RASubstance', payload, { search: params });
        })
        .map((res) => {
            let vm = ObjectHelper.createUpdateCompleteSnackbarMessage('Substance', '', '');
            this._messenger.publish('snackbar', vm);
            return new riskAssessmentActions.UpdateRASubstanceActionComplete(res.json());
        }).catch((error) => {
            return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Update, 'Risk asessment-substance', 'Risk asessment-substance')));
        });
    @Effect()
    removeRiskAssessmentSubstance$: Observable<Action> = this._actions$.ofType(riskAssessmentActions.ActionTypes.REMOVE_RASUBSTANCE)
        .map(toPayload)
        .switchMap((payload) => {
            let vm = ObjectHelper.createRemoveInProgressSnackbarMessage('Substance', '', '')
            this._messenger.publish('snackbar', vm);
            let params: URLSearchParams = new URLSearchParams();
            params.set('id', payload);
            return this._data.delete('RASubstance', { search: params })
                .mergeMap((res) => {
                    let vm = ObjectHelper.createRemoveCompleteSnackbarMessage('Substance', '', '');
                    this._messenger.publish('snackbar', vm);
                    return [new riskAssessmentActions.RemoveRASubstanceActionComplete(payload)];
                })
        }).catch((error) => {
            return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Remove, 'Risk asessment-substance', 'Risk asessment-substance')));
        });
    @Effect()
    addCoshhInventorySubstance$: Observable<Action> = this._actions$.ofType(riskAssessmentActions.ActionTypes.ADD_RACOSHINVENTORY)
        .map(toPayload)
        .switchMap((payload) => {
            let vm = ObjectHelper.createInsertInProgressSnackbarMessage('Substance', '')
            this._messenger.publish('snackbar', vm);
            let params: URLSearchParams = new URLSearchParams();

            return this._data.put('coshhinventory', payload, { search: params });
        })
        .map((res) => {
            let vm = ObjectHelper.createInsertCompleteSnackbarMessage('Substance', '');
            this._messenger.publish('snackbar', vm);
            return new riskAssessmentActions.AddRACoshhInventoryActionComplete(res.json());
        }).catch((error) => {
            return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Create, 'Risk asessment-coshh inventory', 'Risk asessment-coshh inventory')));
        });

    @Effect()
    createRiskAssessmentHazard$: Observable<Action> = this._actions$.ofType(riskAssessmentActions.ActionTypes.CREATE_RISKASSESSMENT_HAZARD)
        .map(toPayload)
        .switchMap((_payload) => {
            let vm = ObjectHelper.createInsertInProgressSnackbarMessage('RiskAssessment Hazard', _payload.Name)
            this._messenger.publish('snackbar', vm);
            return this._data.put('RiskAssessmentHazard', _payload)
                .map((res) => {
                    let riskAssessmentHazard: RiskAssessmentHazard = <RiskAssessmentHazard>res.json();
                    let vm = ObjectHelper.createInsertCompleteSnackbarMessage('RiskAssessment Hazard', riskAssessmentHazard.Name);
                    this._messenger.publish('snackbar', vm);
                    return new riskAssessmentActions.CreateUpdateRiskAssessmentHazardCompleteAction(riskAssessmentHazard);
                })
        })
        .catch((error) => {
            return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'RiskAssessment', 'Create RiskAssessment Hazard')));
        });

    @Effect()
    updateRiskAssessmentHazard$: Observable<Action> = this._actions$.ofType(riskAssessmentActions.ActionTypes.UPDATE_RISKASSESSMENT_HAZARD)
        .map(toPayload)
        .switchMap((_payload) => {
            let vm = ObjectHelper.createUpdateInProgressSnackbarMessage('RiskAssessment Hazard', _payload.Name, _payload.Id);
            this._messenger.publish('snackbar', vm);
            return this._data.post('RiskAssessmentHazard', _payload)
                .map((res) => {
                    let riskAssessmentHazard: RiskAssessmentHazard = <RiskAssessmentHazard>res.json();
                    let vm = ObjectHelper.createUpdateCompleteSnackbarMessage('RiskAssessment Hazard', riskAssessmentHazard.Name, riskAssessmentHazard.Id);
                    this._messenger.publish('snackbar', vm);
                    return new riskAssessmentActions.CreateUpdateRiskAssessmentHazardCompleteAction(riskAssessmentHazard);
                })
        })
        .catch((error) => {
            return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'RiskAssessment', 'Update RiskAssessment Hazard')));
        });

    @Effect()
    removeRiskAssessmentHazard$: Observable<Action> = this._actions$.ofType(riskAssessmentActions.ActionTypes.REMOVE_HAZARD)
        .map(toPayload)
        .switchMap((_payload) => {
            let params: URLSearchParams = new URLSearchParams();
            params.set('id', _payload);
            let vm = ObjectHelper.operationInProgressSnackbarMessage('Removing hazard from risk assessment');
            this._messenger.publish('snackbar', vm);
            return this._data.delete('RiskAssessmentHazard', { search: params })
                .mergeMap((res) => {
                    let vm = ObjectHelper.operationCompleteSnackbarMessage('Removing hazard from risk assessment completed');
                    this._messenger.publish('snackbar', vm);
                    return [new riskAssessmentActions.RemoveRiskAssessmentHazardCompleteAction(_payload)];
                })
        })
        .catch((error) => {
            return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'RiskAssessment', 'Remove hazard from risk assessment')));
        });
    @Effect()
    createHazard$: Observable<Action> = this._actions$.ofType(riskAssessmentActions.ActionTypes.CREATE_HAZARD)
        .map(toPayload)
        .withLatestFrom(this._store, (payload, state) => { return { _payload: payload, _state: state.riskAssessmentState }; })
        .switchMap((data) => {
            let hazard = <Hazard>data._payload;
            hazard.IsExample = data._state.currentRiskAssessment.IsExample;
            let vm = ObjectHelper.createInsertInProgressSnackbarMessage('Hazard', data._payload.Name)
            this._messenger.publish('snackbar', vm);
            return this._data.put('Hazard', hazard)
                .map((res) => {
                    let createdHazard: Hazard = <Hazard>res.json();
                    let vm = ObjectHelper.createInsertCompleteSnackbarMessage('Hazard', createdHazard.Name);
                    this._messenger.publish('snackbar', vm);
                    let riskAssessmentHazard: RiskAssessmentHazard = data._payload;
                    riskAssessmentHazard.PrototypeId = createdHazard.Id;
                    riskAssessmentHazard.PictureId = createdHazard.PictureId;
                    riskAssessmentHazard.IsSharedPrototype = createdHazard.IsExample;
                    riskAssessmentHazard.Category = createdHazard.Category;
                    riskAssessmentHazard.RiskAssessmentId = data._state.currentRiskAssessment.Id;
                    return new riskAssessmentActions.CreateRiskAssessmentHazardAction(riskAssessmentHazard);
                })
        })
        .catch((error) => {
            return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'Hazard', 'Create  Hazard')));
        });





    @Effect()
    loadRiskAssessmentHazards$: Observable<Action> = this._actions$.ofType(riskAssessmentActions.ActionTypes.LOAD_RISKASSESSMENT_HAZARDS)
        .map(toPayload)
        .switchMap((payload) => {
            let apiRequestParams = <AtlasApiRequestWithParams>payload;
            let params: URLSearchParams = new URLSearchParams();
            params.set('riskassessmentId', payload.id);
            params.set('category', payload.category);
            return this._data.get('RiskAssessmentHazard', { search: params });
        })
        .map((res) => {
            return new riskAssessmentActions.LoadRiskAssessmentHazardsCompleteAction(res.json());
        })

    @Effect()
    loadRiskAssessmentTasks$: Observable<Action> = this._actions$.ofType(riskAssessmentActions.ActionTypes.LOAD_RISKASSESSMENT_TASKS)
        .map(toPayload)
        .switchMap((payload) => {
            let apiRequestParams = <AtlasApiRequestWithParams>payload;
            let params: URLSearchParams = new URLSearchParams();
            if (!isNullOrUndefined(apiRequestParams)) {
                params.set('pageNumber', apiRequestParams.PageNumber.toString());
                params.set('pageSize', apiRequestParams.PageSize.toString());
                params.set('sortField', apiRequestParams.SortBy.SortField);
                params.set('fields', 'Id,Title,DueDate,SubObjectId,Description,AssignedUserName,IndividualToTrain');
                params.set('direction', apiRequestParams.SortBy.Direction === SortDirection.Ascending ? 'asc' : 'desc');
                let filterParams = apiRequestParams.Params;
                if (!isNullOrUndefined(filterParams)) {
                    filterParams.forEach((obj) => {
                        params.set(obj.Key, obj.Value.toString());
                    });
                }
            }
            return this._data.get('TasksView', { search: params });
        })
        .map((res) => {
            return new riskAssessmentActions.LoadRiskAssessmentTasksCompleteAction(res.json());
        })
        .catch((error) => {
            return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'RiskAssessment', 'Load routes of exposure tasks')));
        });

    @Effect()
    createRiskAssessmentTask$: Observable<Action> = this._actions$.ofType(riskAssessmentActions.ActionTypes.CREATE_RISKASSESSMENT_TASK)
        .map(toPayload)
        .switchMap((payload) => {
            let vm = ObjectHelper.createInsertInProgressSnackbarMessage('Further control measures task', payload.Title);
            this._messenger.publish('snackbar', vm);
            return this._data.put('Measures', payload)
                .mergeMap((res) => {
                    let vm = ObjectHelper.createInsertCompleteSnackbarMessage('Further control measures task', payload.Title);
                    this._messenger.publish('snackbar', vm);
                    let _apiRequestParams: AtlasApiRequestWithParams = <AtlasApiRequestWithParams>{};
                    _apiRequestParams.PageNumber = 1;
                    _apiRequestParams.PageSize = 10;
                    _apiRequestParams.SortBy = <AeSortModel>{};
                    _apiRequestParams.SortBy.Direction = SortDirection.Ascending;
                    _apiRequestParams.SortBy.SortField = 'Title';
                    _apiRequestParams.Params = [];
                    _apiRequestParams.Params.push(new AtlasParams('filterByRegObjId', payload.RegardingObjectId));
                    return [new riskAssessmentActions.LoadRiskAssessmentTasksAction(_apiRequestParams)];
                })
                .catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'Further control measures', payload.Title)));
                });
        });

    @Effect()
    updateRiskAssessmentTask$: Observable<Action> = this._actions$.ofType(riskAssessmentActions.ActionTypes.UPDATE_RISKASSESSMENT_TASK)
        .map(toPayload)
        .switchMap((payload) => {
            let vm = ObjectHelper.createUpdateInProgressSnackbarMessage('Further control measures task', payload.Title, payload.Id);
            this._messenger.publish('snackbar', vm);
            let params: URLSearchParams = new URLSearchParams();
            params.set('IsRiskAssessmentTask', 'true');
            return this._data.post('Measures', payload, { search: params })
                .map((res) => {
                    let vm = ObjectHelper.createUpdateCompleteSnackbarMessage('Further control measures task', payload.Title, payload.Id);
                    this._messenger.publish('snackbar', vm);
                    return new riskAssessmentActions.UpdateRiskAssessmentCompleteTaskAction(res.json());
                })
                .catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'Further control measures', payload.Id)));
                });
        });

    @Effect()
    removeRiskAssessmentTask$: Observable<Action> = this._actions$.ofType(riskAssessmentActions.ActionTypes.REMOVE_RISKASSESSMENT_TASK)
        .map(toPayload)
        .switchMap((payload) => {
            let params: URLSearchParams = new URLSearchParams();
            params.set('id', payload.Id);
            let vm = ObjectHelper.createRemoveInProgressSnackbarMessage('further control measures task', payload.Title, payload.Id);
            this._messenger.publish('snackbar', vm);
            return this._data.delete('Task', { search: params })
                .mergeMap((res) => {
                    let vm = ObjectHelper.createRemoveCompleteSnackbarMessage('further control measures task', payload.Title, payload.Id);
                    this._messenger.publish('snackbar', vm);
                    let _apiRequestParams: AtlasApiRequestWithParams = <AtlasApiRequestWithParams>{};
                    _apiRequestParams.PageNumber = 1;
                    _apiRequestParams.PageSize = 10;
                    _apiRequestParams.SortBy = <AeSortModel>{};
                    _apiRequestParams.SortBy.Direction = SortDirection.Ascending;
                    _apiRequestParams.SortBy.SortField = 'Title';
                    _apiRequestParams.Params = [];
                    _apiRequestParams.Params.push(new AtlasParams('filterByRegObjId', payload.RegardingObjectId));
                    return [new riskAssessmentActions.LoadRiskAssessmentTasksAction(_apiRequestParams)];
                })
                .catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Remove, 'further control measure task', payload.Title, payload.Id)));
                });
        });

    @Effect()
    loadRiskAssessmentTaskById$: Observable<Action> = this._actions$.ofType(riskAssessmentActions.ActionTypes.LOAD_RISKASSESSMENT_TASK_BY_ID)
        .map(toPayload)
        .switchMap((payload) => {
            let params: URLSearchParams = new URLSearchParams();
            params.set('id', payload);
            return this._data.get('Task', { search: params })
                .mergeMap((res) => {
                    return [new riskAssessmentActions.LoadRiskAssessmentTaskByIdCompleteAction(res.json())];
                })
                .catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'further control measures', payload.Id)));
                });
        });

    @Effect()
    loadRiskAssessmentsCount$: Observable<Action> = this._actions$.ofType(riskAssessmentActions.ActionTypes.LOAD_RISKASSESSMENT_COUNT)
        .map(toPayload)
        .withLatestFrom(this._store, (payload, state) => {
            return {
                _payload: payload,
                _nameFilterFromState: state.riskAssessmentState.nameFilter,
                _workSpaceFilterFromState: state.riskAssessmentState.workspaceFilter,
                _siteFilterFromState: state.riskAssessmentState.siteFilter,
                _assessmentTypeFilterFromState: state.riskAssessmentState.assessmentTypeFilter,
                _sectorFilterFromState: state.riskAssessmentState.sectorFilter
            };
        })
        .switchMap((data) => {
            let payload = data._payload;
            let currentUrl = this._router.url;
            let params: URLSearchParams = new URLSearchParams();
            if (!isNullOrUndefined(data._nameFilterFromState) &&
                !StringHelper.isNullOrUndefinedOrEmpty(String(data._nameFilterFromState))) {
                params.set('searchBoxFilter', data._nameFilterFromState);
            }
            if (!isNullOrUndefined(data._workSpaceFilterFromState) &&
                !StringHelper.isNullOrUndefinedOrEmpty(String(data._workSpaceFilterFromState))) {
                params.set('workspaceRAFilter', data._workSpaceFilterFromState);
            }
            if (!isNullOrUndefined(data._siteFilterFromState) &&
                !StringHelper.isNullOrUndefinedOrEmpty(String(data._siteFilterFromState))) {
                params.set('siteRAFilter', data._siteFilterFromState);
            }
            if (!isNullOrUndefined(data._assessmentTypeFilterFromState) &&
                !StringHelper.isNullOrUndefinedOrEmpty(String(data._assessmentTypeFilterFromState))) {
                params.set('assessmenttypeRAFilter', data._assessmentTypeFilterFromState);
            }
            if (!isNullOrUndefined(data._sectorFilterFromState) &&
                !StringHelper.isNullOrUndefinedOrEmpty(String(data._sectorFilterFromState))) {
                params.set('sectorRAFilter', data._sectorFilterFromState);
            }
            params.set('companyId', payload.companyId);
            params.set('optionalParam1', payload.optional);
            return this._data.get('riskassessment/RiskAssessmentCountByStatus', { search: params });
        })
        .map((res) => {
            let itemsList = res.json();
            let items = new Map<string, number>();
            Object.keys(itemsList).forEach((key) => {
                items.set(key, itemsList[key]);
            });
            return new riskAssessmentActions.LoadRiskAssessmentsCountComplete(items);
        })

    @Effect()
    copyRiskAssessment$: Observable<Action> = this._actions$.ofType(riskAssessmentActions.ActionTypes.COPY_RISKASSESSMENT)
        .map(toPayload)
        .switchMap((payload) => {
            let params: URLSearchParams = new URLSearchParams();
            params.set('example', payload.example);
            params.set('copyToDifferentCompany', payload.copyToDifferentCompany);
            let vm = ObjectHelper.createCopyInProgressSnackbarMessage('Risk assessment', payload.Name, payload.Id);
            this._messenger.publish('snackbar', vm);
            return this._data.put('RiskAssessment', payload, { search: params })
                .map((res) => {
                    let response = res.json();
                    let vm = ObjectHelper.createCopyCompleteSnackbarMessage('Risk assessment', response.Name, payload.Id);
                    this._messenger.publish('snackbar', vm);
                    let path: string = (response.IsExample ? '/risk-assessment/edit/example/' : '/risk-assessment/edit/') + response.Id;
                    if (payload.copyToDifferentCompany) {
                        path = path + '?cid=' + payload.CompanyId;
                    }
                    let navigationExtras: NavigationExtras = {
                        queryParamsHandling: 'merge'
                    };
                    this._router.navigate([path], navigationExtras);
                    return new riskAssessmentActions.CopyRiskAssessmentCompleteAction(res.json());
                })
                .catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Copy, 'Risk assessment', null, payload.Id)));
                });
        })

    @Effect()
    exportRiskAssessmentPreviewAction$: Observable<Action> = this._actions$.ofType(riskAssessmentActions.ActionTypes.EXPORT_RISKASSESSMENT_PREVIEW)
        .map((action: riskAssessmentActions.ExportRiskAssessmentsPreviewAction) => action.payload)
        .switchMap((payload) => {
            let params: URLSearchParams = new URLSearchParams();
            params.set('pdf', 'true');
            let vm = ObjectHelper.createInsertInProgressSnackbarMessage("Risk assesment pdf", payload.Title);
            this._messenger.publish('snackbar', vm);
            return this._data.post('RiskAssessment', payload, { search: params })
                .map((res) => {
                    let vm = ObjectHelper.createInsertCompleteSnackbarMessage("Risk assesment pdf", payload.Title);
                    this._messenger.publish('snackbar', vm);
                    return new riskAssessmentActions.ExportRiskAssessmentsPreviewActionComplete(res.json());
                })
                .catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Create, 'Risk assessment pdf', null)));
                })

        });

    @Effect()
    reviewRiskAssessment$: Observable<Action> = this._actions$.ofType(riskAssessmentActions.ActionTypes.REVIEW_RISKASSESSMENT_ACTION)
        .map(toPayload)
        .switchMap((payload) => {
            let vm = ObjectHelper.createUpdateInProgressSnackbarMessage(this._objectType, "", payload[0].Id);
            this._messenger.publish('snackbar', vm);
            let params: URLSearchParams = new URLSearchParams();
            params.set('comments', payload.pop());
            return this._data.post('RiskAssessment/' + payload[0].Id, payload[0], { search: params })
                .mergeMap((res) => {
                    let vm = ObjectHelper.createUpdateCompleteSnackbarMessage(this._objectType, "", payload[0].Id);
                    this._messenger.publish('snackbar', vm);
                    let createdRiskAssessment = <RiskAssessment>res.json();
                    return [new riskAssessmentActions.LoadRiskAssessmentAction({ id: createdRiskAssessment.Id, example: createdRiskAssessment.IsExample })
                        , new riskAssessmentActions.ReviewRiskAssessmentCompleteAction(true)];
                })
                .catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Update, this._objectType, "", payload[0].Id)));
                });
        });

    @Effect()
    loadFrequenlyUsedControls$: Observable<Action> = this._actions$.ofType(riskAssessmentActions.ActionTypes.LOAD_FREQUENTLY_USED_CONTROLS)
        .map(toPayload)
        .switchMap((payload) => {
            let params: URLSearchParams = new URLSearchParams();
            params.set('companyId', payload.companyId);
            params.set('exampleOnly', payload.isExample);
            return this._data.get('control', { search: params });
        })
        .map((res) => {
            return new riskAssessmentActions.LoadFrequentlyUsedControlsComplete(res.json());
        })
        .catch((error) => {
            return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'risk assessment', 'frequently used controls')));
        })

    @Effect()
    loadSuggestedControls$: Observable<Action> = this._actions$.ofType(riskAssessmentActions.ActionTypes.LOAD_SUGGESTED_CONTROLS)
        .map(toPayload)
        .switchMap((payload) => {
            let params: URLSearchParams = new URLSearchParams();
            params.set('ControlsByCategoryFilter', payload.ControlsByCategoryFilter);
            params.set('hazardControlsFilter', payload.hazardControlsFilter);
            params.set('example', 'true');
            params.set('pageNumber', '1');
            params.set('pageSize', '50');
            return this._data.get('Control', { search: params });
        })
        .map((res) => {
            return new riskAssessmentActions.LoadSuggestedControlsComplete(res.json().Entities);
        })
        .catch((error) => {
            return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'risk assessment', 'suggested controls')));
        })

    @Effect()
    addControl$: Observable<Action> = this._actions$.ofType(riskAssessmentActions.ActionTypes.ADD_CONTROL)
        .map(toPayload)
        .switchMap((payload) => {
            let vm = ObjectHelper.createInsertInProgressSnackbarMessage('risk assessment control', payload.Name);
            this._messenger.publish('snackbar', vm);
            return this._data.put('RiskAssessmentControl', payload)
                .map((res) => {
                    let createdControl: RiskAssessmentControl = <RiskAssessmentControl>res.json();
                    let vm = ObjectHelper.createInsertCompleteSnackbarMessage('risk assessment control', payload.Name);
                    this._messenger.publish('snackbar', vm);
                    return new riskAssessmentActions.AddControlComplete(createdControl);
                })
                .catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Create, 'risk assessment control', payload.Name)));
                })
        })


    @Effect()
    removeControl$: Observable<Action> = this._actions$.ofType(riskAssessmentActions.ActionTypes.REMOVE_CONTROL)
        .map(toPayload)
        .switchMap((payload) => {
            let vm = ObjectHelper.createRemoveInProgressSnackbarMessage('risk assessment control', payload.Name, payload.Id)
            this._messenger.publish('snackbar', vm);
            return this._data.delete('RiskAssessmentControl/' + payload.Id)
                .map((res) => {
                    let vm = ObjectHelper.createRemoveCompleteSnackbarMessage('risk assessment control', payload.Name, payload.Id)
                    this._messenger.publish('snackbar', vm);
                    return new riskAssessmentActions.RemoveControlComplete(payload.Id);
                })
                .catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Remove, 'risk assessment control', payload.Name, payload.Id)));
                })
        })

    @Effect()
    loadAllControls$: Observable<Action> = this._actions$.ofType(riskAssessmentActions.ActionTypes.LOAD_ALL_CONTROLS)
        .map(toPayload)
        .switchMap((payload) => {
            let exampleParams: URLSearchParams = new URLSearchParams();
            exampleParams.set('example', 'true');
            exampleParams.set('sortField', payload.SortBy.SortField);
            exampleParams.set('direction', payload.SortBy.Direction === SortDirection.Ascending ? 'asc' : 'desc');
            let companyParams: URLSearchParams = new URLSearchParams();
            companyParams.set('example', 'false');
            companyParams.set('sortField', payload.SortBy.SortField);
            companyParams.set('direction', payload.SortBy.Direction === SortDirection.Ascending ? 'asc' : 'desc');
            exampleParams.set('pageNumber', payload.PageNumber.toString());
            exampleParams.set('pageSize', payload.PageSize.toString());
            companyParams.set('pageNumber', payload.PageNumber.toString());
            companyParams.set('pageSize', payload.PageSize.toString());
            if (!isNullOrUndefined(payload.Params)) {
                payload.Params.forEach((obj) => {
                    if (!isNullOrUndefined(obj.Value)) {
                        exampleParams.set(obj.Key, obj.Value.toString());
                        companyParams.set(obj.Key, obj.Value.toString());
                    }
                });
            }
            return Observable.forkJoin(this._data.get('Control', { search: exampleParams }), this._data.get('Control', { search: companyParams }))
                .map((res) => {
                    return new riskAssessmentActions.LoadAllControlsComplete({data: combineControls(res), totalCount: extractControlsTotalCount(res), pageNumber: payload.PageNumber});
                })
                .catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'risk assessment', 'example controls')));
                })
        })

    @Effect()
    createControl$: Observable<Action> = this._actions$.ofType(riskAssessmentActions.ActionTypes.CREATE_CONTROL)
        .map(toPayload)
        .switchMap((payload) => {
            let vm = ObjectHelper.createInsertInProgressSnackbarMessage('risk assessment control', payload.control.Name);
            this._messenger.publish('snackbar', vm);
            return this._data.put('Control', payload.control)
                .mergeMap((res) => {
                    let controlToSave: RiskAssessmentControl = res.json();
                    controlToSave.PrototypeId = controlToSave.Id;
                    controlToSave.Id = null;
                    controlToSave.IsSharedPrototype = payload.isSharedPrototype;
                    controlToSave.RiskAssessmentHazardId = payload.hazardId;
                    controlToSave.RiskAssessmentId = payload.riskAssessmentId;
                    let vm = ObjectHelper.createInsertCompleteSnackbarMessage('risk assessment control', payload.control.Name)
                    this._messenger.publish('snackbar', vm);
                    return [new riskAssessmentActions.AddControl(controlToSave), new riskAssessmentActions.CreateControlCompleteAction(res.json())];
                })
                .catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Create, 'risk assessment control', payload.control.Name)));
                })
        })

    @Effect()
    updateRiskAssessmentControl$: Observable<Action> = this._actions$.ofType(riskAssessmentActions.ActionTypes.UPDATE_RISK_ASSESSMENT_CONTROL)
        .map(toPayload)
        .switchMap((payload) => {
            let vm = ObjectHelper.createUpdateInProgressSnackbarMessage('risk assessment control', payload.Name, payload.Id);
            this._messenger.publish('snackbar', vm);
            return this._data.post('RiskAssessmentControl', payload)
                .map((res) => {
                    let vm = ObjectHelper.createUpdateCompleteSnackbarMessage('risk assessment control', payload.Name, payload.Id);
                    this._messenger.publish('snackbar', vm);
                    return new riskAssessmentActions.UpdateRiskAssessmentControlCompleteAction(res.json());
                })
                .catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Update, 'risk assessment control', payload.Name, payload.Id)));
                })
        });

    @Effect()
    loadRAHazardCategoryText$: Observable<Action> = this._actions$.ofType(riskAssessmentActions.ActionTypes.LOAD_RA_HAZARD_CATEGORY_TEXT)
        .map(toPayload)
        .switchMap((payload) => {
            let params: URLSearchParams = new URLSearchParams();
            params.set('pageNumber', '1');
            params.set('pageSize', '10');
            params.set('sortField', 'CreatedOn');
            params.set('direction', 'desc');
            params.set('RAHazardCategoryTextByRAIdFilter', payload.Id);
            return this._data.get('RAHazardCategoryText', { search: params })
                .map((res) => {
                    return new riskAssessmentActions.LoadRaHazardCategoryTextComplete(res.json())
                })
                .catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Update, 'risk assessment hazard category text', '', payload.Id)));
                })
        })

    @Effect()
    updateRiskAssessmentPrintDescriptionStatus$: Observable<Action> = this._actions$.ofType(riskAssessmentActions.ActionTypes.UPDATE_RA_PRINT_DESCRIPTION_STATUS)
        .map(toPayload)
        .switchMap((payload) => {
            let params: URLSearchParams = new URLSearchParams();
            params.set('example', payload.example.toString);
            return this._data.post('RiskAssessment', payload.data, { search: params })
                .map((res) => {
                    return new riskAssessmentActions.UpdateRAPrintDescriptionStatusCompleteAction(true);
                })
                .catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Update, 'risk assessment', payload.data.Name, payload.data.Id)));
                })
        })

    @Effect()
    createRAHazardCategoryText$: Observable<Action> = this._actions$.ofType(riskAssessmentActions.ActionTypes.CREATE_RA_HAZARD_CATEGORY_TEXT)
        .map(toPayload)
        .switchMap((payload) => {
            return this._data.put('RAHazardCategoryText', payload)
                .map((res) => {
                    return new riskAssessmentActions.CreateRaHazardCategoryTextComplete(res.json())
                })
                .catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Create, 'risk assessment notes', '', payload.Text)));
                })
        })

    @Effect()
    updateRAHazardCategoryText$: Observable<Action> = this._actions$.ofType(riskAssessmentActions.ActionTypes.UPDATE_RA_HAZARD_CATEGORY_TEXT)
        .map(toPayload)
        .switchMap((payload) => {
            return this._data.post('RAHazardCategoryText', payload)
                .map((res) => {
                    return new riskAssessmentActions.UpdateRaHazardCategoryTextComplete(res.json())
                })
                .catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Update, 'risk assessment notes', '', payload.Text)));
                })
        })

    @Effect()
    loadRAControlsCategoryText$: Observable<Action> = this._actions$.ofType(riskAssessmentActions.ActionTypes.LOAD_RA_CONTROLS_CATEGORY_TEXT)
        .map(toPayload)
        .switchMap((payload) => {
            let params: URLSearchParams = new URLSearchParams();

            if (!isNullOrUndefined(payload)) {
                payload.forEach((obj) => {
                    if (!isNullOrUndefined(obj.Value)) {
                        params.set(obj.Key, obj.Value.toString());
                        params.set(obj.Key, obj.Value.toString());
                    }
                });
            }
            return this._data.get('AdditionalControlCategoryText', { search: params })
                .map((res) => {
                    return new riskAssessmentActions.LoadRaControlsCategoryTextComplete(res.json())
                })
                .catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Update, 'risk assessment controls category text', '', payload.Id)));
                })
        })

    @Effect()
    createRAControlsCategoryText$: Observable<Action> = this._actions$.ofType(riskAssessmentActions.ActionTypes.CREATE_RA_CONTROLS_CATEGORY_TEXT)
        .map(toPayload)
        .switchMap((payload) => {
            return this._data.put('AdditionalControlCategoryText', payload)
                .map((res) => {
                    return new riskAssessmentActions.CreateRaControlsCategoryTextComplete(res.json())
                })
                .catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Create, 'risk assessment controls notes', '', payload.Text)));
                })
        })

    @Effect()
    updateRAControlsCategoryText$: Observable<Action> = this._actions$.ofType(riskAssessmentActions.ActionTypes.UPDATE_RA_CONTROLS_CATEGORY_TEXT)
        .map(toPayload)
        .switchMap((payload) => {
            return this._data.post('AdditionalControlCategoryText', payload)
                .map((res) => {
                    return new riskAssessmentActions.UpdateRaControlsCategoryTextComplete(res.json())
                })
                .catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Update, 'risk assessment controls notes', '', payload.Text)));
                })
        })
}
