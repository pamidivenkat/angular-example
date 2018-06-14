import { CheckListInstance } from '../models/checklist-instance.model';
import { AtlasApiRequestWithParams, AtlasParams } from '../../shared/models/atlas-api-response';
import { CheckListAssignment } from '../models/checklist-assignment.model';
import { CheckItem } from '../models/checkitem.model';
import { Checklist } from '../models/checklist.model';
import { MessengerService } from '../../shared/services/messenger.service';
import { StringHelper } from '../../shared/helpers/string-helper';
import { isNullOrUndefined } from 'util';
import { AtlasApiError } from '../../shared/error-handling/atlas-api-error';
import { MessageEvent } from '../../atlas-elements/common/models/message-event.enum';
import * as errorActions from '../../shared/actions/error.actions';
import { ObjectHelper } from '../../shared/helpers/object-helper';
import { getAtlasParamValueByKey } from '../../root-module/common/extract-helpers';
import { ClaimsHelperService } from '../../shared/helpers/claims-helper';
import {
    extractActionItemsWithAttachments,
    extractAssignmentsData,
    extractAssignmentsPagingInfo,
    extractCheckItemsData,
    extractChecklistListData,
    extractChecklistPagingInfo
} from '../common/extract-helper';
import { AeSortModel, SortDirection } from '../../atlas-elements/common/models/ae-sort-model';
import { URLSearchParams } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import { _stateFactory, Action, Store } from '@ngrx/store';
import { Actions, Effect, toPayload } from '@ngrx/effects';
import { RestClientService } from '../../shared/data/rest-client.service';
import { Injectable } from '@angular/core';
import * as fromRoot from '../../shared/reducers/index';
import * as checklistActions from '../actions/checklist.actions';

@Injectable()
export class ChecklistEffects {
    private _objectType: string = "Checklist";
    constructor(private _data: RestClientService
        , private _actions$: Actions
        , private _store: Store<fromRoot.State>
        , private _claimsHelper: ClaimsHelperService
        , private _messenger: MessengerService) {
    }
    @Effect()
    addGeneralCheckList$: Observable<Action> = this._actions$.ofType(checklistActions.ActionTypes.CHECKLIST_ADD)
        .map(toPayload)
        .switchMap((data) => {
            let modal = <Checklist>data;
            let vm = ObjectHelper.createInsertInProgressSnackbarMessage(this._objectType, modal.Name);
            this._messenger.publish('snackbar', vm);
            let apiUrl = 'CheckList?example=' + modal.IsExample;
            return this._data.put(apiUrl, data)
                .mergeMap((res) => {
                    let checklist = res.json() as Checklist;
                    let vm = ObjectHelper.createInsertCompleteSnackbarMessage(this._objectType, checklist.Name);
                    this._messenger.publish('snackbar', vm);
                    return [
                        new checklistActions.CheckListAddCompleteAction(checklist),
                        new checklistActions.NullifyCheckListStatsAction()
                    ]
                }).catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Create, this._objectType, modal.Name)));
                });
        });

    @Effect()
    loadTodaysOrCompleteIncompleteChecklist$: Observable<Action> = this._actions$.ofType(checklistActions.ActionTypes.TODAYS_OR_COMPLETE_INCOMPLETE_CHECKLIST_LOAD)
        .map((action: checklistActions.TodaysOrCompleteIncompleteChecklistLoadAction) => action.payload)
        .withLatestFrom(this._store, (payload, state) => { return { _payload: payload, _savedRequestFromState: state.checklistState.nameFilter, _savedWorkSpaceFromState: state.checklistState.workspaceFilter }; })
        .switchMap((data) => {
            let params: URLSearchParams = new URLSearchParams();
            params.set('pageNumber', data._payload.PageNumber.toString());
            params.set('pageNumber', data._payload.PageNumber.toString());
            params.set('pageSize', data._payload.PageSize.toString());
            params.set('sortField', data._payload.SortBy.SortField);
            params.set('fields', 'Id,Status,AssignedToId,ScheduledDate,CheckList.Id as CheckListId,CheckList.Name as Name,CheckList.WorkspaceTypes as Workspaces,ChecklistAssignment.AssignedTo.FirstName as firstname,ChecklistAssignment.AssignedTo.LastName as lastname,ChecklistAssignment.Periodicity,SiteId,Site.SiteNameAndPostcode as SiteName,SiteLocation');
            params.set('direction', data._payload.SortBy.Direction === SortDirection.Ascending ? 'asc' : 'desc');
            if (!isNullOrUndefined(data._savedRequestFromState) && !StringHelper.isNullOrUndefinedOrEmpty(String(data._savedRequestFromState)))
                params.set('checkListInstanceNameFilter', data._savedRequestFromState);
            if (!isNullOrUndefined(data._savedWorkSpaceFromState) && !StringHelper.isNullOrUndefinedOrEmpty(String(data._savedWorkSpaceFromState)))
                params.set('workspaceChecklistInstanceFilter', data._savedWorkSpaceFromState);
            data._payload.Params.forEach((element) => {
                if (!isNullOrUndefined(element.Value) && !StringHelper.isNullOrUndefinedOrEmpty(String(element.Value))) {
                    if (params.has(element.Key)) {
                        params.set(element.Key, element.Value);
                    } else {
                        params.append(element.Key, element.Value);
                    }
                }
            });
            return this._data.get('CheckListInstance', { search: params })
        })
        .map((res) => {
            return new checklistActions.TodaysOrCompleteIncompleteChecklistLoadCompleteAction({ CheckList: extractChecklistListData(res), PagingInfo: extractChecklistPagingInfo(res) });
        }).catch((error) => {
            return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, this._objectType, null)));
        });

    @Effect()
    loadScheduledOrArchivedChecklist$: Observable<Action> = this._actions$.ofType(checklistActions.ActionTypes.SCHEDULED_OR_ARCHIVED_CHECKLIST_LOAD)
        .map((action: checklistActions.ScheduledOrArchivedChecklistLoadAction) => action.payload)
        .withLatestFrom(this._store, (payload, state) => { return { _payload: payload, _savedRequestFromState: state.checklistState.nameFilter, _savedWorkSpaceFromState: state.checklistState.workspaceFilter }; })
        .switchMap((data) => {
            let params: URLSearchParams = new URLSearchParams();
            params.set('pageNumber', data._payload.PageNumber.toString());
            params.set('pageSize', data._payload.PageSize.toString());
            params.set('sortField', data._payload.SortBy.SortField);
            params.set('fields', 'Id,CheckList.Id as CheckListId,CheckList.Name as Name,CheckList.IsExample as IsExample,ScheduledDate,NextDueDate,CheckList.WorkspaceTypes as Workspaces,AssignedTo.FirstName as firstname,AssignedTo.LastName as lastname,Periodicity,SiteId,Site.SiteNameAndPostcode as SiteName,SiteLocation');
            if (!isNullOrUndefined(data._savedRequestFromState) && !StringHelper.isNullOrUndefinedOrEmpty(String(data._savedRequestFromState)))
                params.set('filterAssignmentByChecklistName', data._savedRequestFromState);
            if (!isNullOrUndefined(data._savedWorkSpaceFromState) && !StringHelper.isNullOrUndefinedOrEmpty(String(data._savedWorkSpaceFromState)))
                params.set('workspaceScheduledFilter', data._savedWorkSpaceFromState);
            params.set('direction', data._payload.SortBy.Direction === SortDirection.Ascending ? 'asc' : 'desc');
            data._payload.Params.forEach((element) => {
                if (!isNullOrUndefined(element.Value) && !StringHelper.isNullOrUndefinedOrEmpty(String(element.Value))) {
                    params.append(element.Key, element.Value);
                }
            });

            return this._data.get('checklistassignment', { search: params })
        })
        .map((res) => {
            return new checklistActions.ScheduledOrArchivedChecklistLoadCompleteAction({ CheckList: extractChecklistListData(res), PagingInfo: extractChecklistPagingInfo(res) });
        }).catch((error) => {
            return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, this._objectType, null)));
        });
    @Effect()
    loadComapnyOrExampleChecklist$: Observable<Action> = this._actions$.ofType(checklistActions.ActionTypes.COMPANY_OR_EXAMPLE_OR_ARCHIVED_CHECKLIST_LOAD)
        .map((action: checklistActions.CompanyOrExampleChecklistLoadAction) => action.payload)
        .withLatestFrom(this._store, (payload, state) => { return { _payload: payload, _savedRequestFromState: state.checklistState.nameFilter, _savedWorkSpaceFromState: state.checklistState.workspaceFilter }; })
        .switchMap((data) => {
            let params: URLSearchParams = new URLSearchParams();
            params.set('pageNumber', data._payload.PageNumber.toString());
            params.set('pageSize', data._payload.PageSize.toString());
            params.set('sortField', data._payload.SortBy.SortField);
            params.set('fields', 'Id,Name,IsExample,IsArchived,WorkspaceTypes,Sectors,SiteId,Site.SiteNameAndPostcode as SiteName,SiteLocation');
            params.set('direction', data._payload.SortBy.Direction === SortDirection.Ascending ? 'asc' : 'desc');
            if (!isNullOrUndefined(data._savedRequestFromState) && !StringHelper.isNullOrUndefinedOrEmpty(String(data._savedRequestFromState)))
                params.set('checkListNameFilter', data._savedRequestFromState);
            if (!isNullOrUndefined(data._savedWorkSpaceFromState) && !StringHelper.isNullOrUndefinedOrEmpty(String(data._savedWorkSpaceFromState)))
                params.set('workspaceChecklistFilter', data._savedWorkSpaceFromState);
            data._payload.Params.forEach((element) => {
                if (!isNullOrUndefined(element.Value) && !StringHelper.isNullOrUndefinedOrEmpty(String(element.Value)))
                    params.append(element.Key, element.Value);
            });

            if (!getAtlasParamValueByKey(data._payload.Params, "isExample") && !getAtlasParamValueByKey(data._payload.Params, "isArchivedChecklistFilter")) {
                return this._data.get('checklist', { search: params })
                    .map((res) => {
                        return new checklistActions.CompanyChecklistLoadCompleteAction(res.json());
                    })
                    .catch((error) => {
                        return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'Loading Company Checklist', null, 'companyChecklist')));
                    })
            } else if (getAtlasParamValueByKey(data._payload.Params, "isExample") && getAtlasParamValueByKey(data._payload.Params, "isArchivedChecklistFilter")) {
                return this._data.get('checklist', { search: params })
                    .map((res) => {
                        return new checklistActions.ExampleArchivedChecklistLoadCompleteAction(res.json())
                    })
                    .catch((error) => {
                        return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'Loading exmaple Checklist', null, 'exampleChecklist')));
                    })
            }
            else if (getAtlasParamValueByKey(data._payload.Params, "isExample")) {
                return this._data.get('checklist', { search: params })
                    .map((res) => {
                        return new checklistActions.ExampleChecklistLoadCompleteAction(res.json())
                    })
                    .catch((error) => {
                        return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'Loading exmaple Checklist', null, 'exampleChecklist')));
                    })
            }
            else {
                return this._data.get('checklist', { search: params })
                    .map((res) => {
                        return new checklistActions.ArchivedChecklistLoadCompleteAction(res.json())
                    })
                    .catch((error) => {
                        return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'Loading Archived checklist', null, 'archivedChecklist')));
                    })

            }
        })

    @Effect()
    loadCheckItems$: Observable<Action> = this._actions$.ofType(checklistActions.ActionTypes.CHECKLIST_LOAD)
        .map((action: checklistActions.ChecklistLoadAction) => action.payload)
        .switchMap((data) => {
            let params: URLSearchParams = new URLSearchParams();
            //params.set('id', data.id);
            params.set('example', data.example);
            return this._data.get('CheckList/' + data.id, { search: params });
        })
        .map((res) => {
            let result = res.json() as Checklist;
            if (!isNullOrUndefined(result) && !isNullOrUndefined(result.CheckItems)) {
                result.CheckItems = result.CheckItems.filter((_checkItem) => !_checkItem.IsDeleted).sort(((a, b) => a.CreatedOn > b.CreatedOn ? 1 : -1));
            }
            return new checklistActions.ChecklistLoadCompleteAction(result);
        }).catch((error) => {
            return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, this._objectType, null)));
        });

    @Effect()
    loadChecklistActionItems$: Observable<Action> = this._actions$.ofType(checklistActions.ActionTypes.CHECKLIST_ACTION_ITEMS_LOAD)
        .map((action: checklistActions.LoadChecklistActionItems) => action.payload)
        .switchMap((data) => {
            return this._data.get('CheckListInstance/' + data);
        })
        .map((res) => {
            let result = res.json() as CheckListInstance;
            if (!isNullOrUndefined(result) && !isNullOrUndefined(result.InstanceItems)) {
                result.InstanceItems = result.InstanceItems.filter((item) => ((item.IsDeleted == false))).sort((a, b) => {
                    return a.OrderIndex > b.OrderIndex ? 1 : -1;
                });
            }
            return new checklistActions.LoadChecklistActionItemsComplete(extractActionItemsWithAttachments(result));
        }).catch((error) => {
            return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, this._objectType, null)));
        });


    @Effect()
    UpdateChecklistActionItems$: Observable<Action> = this._actions$.ofType(checklistActions.ActionTypes.CHECKLIST_ACTION_ITEMS_UPDATE)
        .map(toPayload)
        .withLatestFrom(this._store, (payload, state) => { return { _payload: payload, _savedRequestFromState: state.checklistState.apiRequestWithParams }; })
        .switchMap((data) => {
            let snackBarMessage = !isNullOrUndefined(data._payload.CheckList) ? data._payload.CheckList.Name : '';
            let modal = <CheckListInstance>data._payload;
            let vm = ObjectHelper.createUpdateInProgressSnackbarMessage(this._objectType, snackBarMessage, data._payload.Id);
            this._messenger.publish('snackbar', vm);
            return this._data.post('CheckListInstance/', modal)
                .mergeMap(res => {
                    let checkListInstance = res.json() as CheckListInstance;
                    let vm = ObjectHelper.createUpdateCompleteSnackbarMessage(this._objectType, snackBarMessage, checkListInstance.Id);
                    this._messenger.publish('snackbar', vm);
                    return [
                        new checklistActions.updateChecklistActionItemsComplete(res.json()),
                        new checklistActions.TodaysOrCompleteIncompleteChecklistLoadAction(data._savedRequestFromState),
                        new checklistActions.NullifyCheckListStatsAction()
                    ];
                })
        }).catch((error) => {
            return Observable
                .of(new errorActions
                    .CatchErrorAction(new AtlasApiError(error
                        , MessageEvent.Create
                        , 'Checklist Action Items'
                        , null)));
        });


    @Effect()
    RemoveDocumentChecklistActionItems$: Observable<Action> = this._actions$.ofType(checklistActions.ActionTypes.CHECKLIST_ACTION_ITEMS_DOCUMENT_REMOVE)
        .map(toPayload)
        .switchMap((data) => {
            let modal = data;
            let vm = ObjectHelper.createUpdateInProgressSnackbarMessage(this._objectType, modal.Name, modal.Id);
            this._messenger.publish('snackbar', vm);
            return this._data.delete(`document/${modal.Id}`).map(res => {
                let checkListInstance = res.json() as CheckListInstance;
                let vm = ObjectHelper.createUpdateCompleteSnackbarMessage(this._objectType, modal.Name, modal.Id);
                this._messenger.publish('snackbar', vm);
                return new checklistActions.checklistActionItemsDocumentRemoveComplete(modal);
            })
                .catch((error) => {
                    return Observable
                        .of(new errorActions
                            .CatchErrorAction(new AtlasApiError(error
                                , MessageEvent.Update
                                , this._objectType
                                , modal.Name, modal.Id)));
                });
        });




    @Effect()
    getChecklistAssignments$: Observable<Action> = this._actions$.ofType(checklistActions.ActionTypes.LOAD_CHECKLIST_ASSIGNMENTS)
        .switchMap((data) => {
            let params: URLSearchParams = new URLSearchParams();
            params.set('pageNumber', data.payload.PageNumber.toString());
            params.set('pageSize', data.payload.PageSize.toString());
            params.set('sortField', data.payload.SortBy.SortField);
            params.set('direction', data.payload.SortBy.Direction === SortDirection.Ascending ? 'asc' : 'desc');
            data.payload.Params.forEach((element) => {
                if (!isNullOrUndefined(element.Value) && !StringHelper.isNullOrUndefinedOrEmpty(String(element.Value)))
                    params.append(element.Key, element.Value);
            });
            return this._data.get('ChecklistAssignment', { search: params });
        })
        .map((res) => {
            return new checklistActions.LoadChecklistAssignmentsComplete({ ChecklistAssignments: extractAssignmentsData(res), PagingInfo: extractAssignmentsPagingInfo(res) });
        })

    @Effect()
    addCheckItem$: Observable<Action> = this._actions$.ofType(checklistActions.ActionTypes.CHECKLIST_ITEM_ADD)
        .map((action: checklistActions.ChecklistItemAddAction) => action.payload)
        .withLatestFrom(this._store, (payload, state) => { return { _payload: payload, currentCheckList: state.checklistState.currentCheckList }; })
        .switchMap((data) => {
            let params: URLSearchParams = new URLSearchParams();
            let vm = ObjectHelper.operationInProgressSnackbarMessage('Check item adding...');
            this._messenger.publish('snackbar', vm);
            return this._data.put('CheckItem', data._payload)
                .mergeMap((res) => {
                    let vm = ObjectHelper.operationCompleteSnackbarMessage('Check item added.');
                    this._messenger.publish('snackbar', vm);
                    return [
                        new checklistActions.ChecklistLoadAction({ id: data.currentCheckList.Id, example: data.currentCheckList.IsExample })                        
                    ]
                })
                .catch((error) => {
                    let vm = ObjectHelper.operationCompleteSnackbarMessage('Check item added.');
                    this._messenger.publish('snackbar', vm);
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Create, 'CheckItem', null, data._payload.Id)));
                });
        });

    @Effect()
    updateCheckItem$: Observable<Action> = this._actions$.ofType(checklistActions.ActionTypes.CHECKLIST_ITEM_UPDATE)
        .map((action: checklistActions.ChecklistItemUpdateAction) => action.payload)
        .withLatestFrom(this._store, (payload, state) => { return { _payload: payload, currentCheckList: state.checklistState.currentCheckList }; })
        .switchMap((data) => {
            let params: URLSearchParams = new URLSearchParams();
            let vm = ObjectHelper.operationInProgressSnackbarMessage('Check item updating...');
            this._messenger.publish('snackbar', vm);
            return this._data.post('CheckItem', data._payload)
                .mergeMap((res) => {
                    let vm = ObjectHelper.operationCompleteSnackbarMessage('Check item updated.');
                    this._messenger.publish('snackbar', vm);
                    return [
                        new checklistActions.ChecklistLoadAction({ id: data.currentCheckList.Id, example: data.currentCheckList.IsExample })                        
                    ];
                })
                .catch((error) => {
                    let vm = ObjectHelper.operationCompleteSnackbarMessage('Check item updated.');
                    this._messenger.publish('snackbar', vm);
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Update, 'CheckItem', null, data._payload.Id)));
                });
        });

    @Effect()
    removeCheckItem$: Observable<Action> = this._actions$.ofType(checklistActions.ActionTypes.CHECKLIST_ITEM_REMOVE)
        .map((action: checklistActions.ChecklistItemRemoveAction) => action.payload)
        .withLatestFrom(this._store, (payload, state) => { return { _payload: payload, currentCheckList: state.checklistState.currentCheckList }; })
        .switchMap((data) => {
            let params: URLSearchParams = new URLSearchParams();
            params.set('id', data._payload.Id);
            let vm = ObjectHelper.operationInProgressSnackbarMessage('Check item removing...');
            this._messenger.publish('snackbar', vm);
            return this._data.delete('CheckItem', { search: params })
                .map((res) => {
                    let checkItem = res.json() as CheckItem;
                    let vm = ObjectHelper.operationCompleteSnackbarMessage('Check item removed.');
                    this._messenger.publish('snackbar', vm);
                    return new checklistActions.ChecklistLoadAction({ id: data.currentCheckList.Id, example: data.currentCheckList.IsExample });
                })
                .catch((error) => {
                    let vm = ObjectHelper.operationCompleteSnackbarMessage('Check item removed.');
                    this._messenger.publish('snackbar', vm);
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Update, 'CheckItem', null, data._payload.Id)));
                });
        });

    @Effect()
    addAssignment$: Observable<Action> = this._actions$.ofType(checklistActions.ActionTypes.ADD_CHECKLIST_ASSIGNMENT)
        .map(toPayload)
        .switchMap((data: CheckListAssignment) => {
            let snackBarVM = ObjectHelper.createInsertInProgressSnackbarMessage('Assignment', '');
            this._messenger.publish('snackbar', snackBarVM);
            return this._data.put('ChecklistAssignment', data)
                .mergeMap((res) => {
                    let snackBarVM = ObjectHelper.createInsertCompleteSnackbarMessage('Assignment', '');
                    this._messenger.publish('snackbar', snackBarVM);
                    let apiParams: AtlasApiRequestWithParams = <AtlasApiRequestWithParams>{};
                    apiParams.Params = new Array(new AtlasParams('ChecklistAssignmentsByChecklistId', res.json().CheckListId));
                    apiParams.PageNumber = 1;
                    apiParams.PageSize = 10;
                    apiParams.SortBy = <AeSortModel>{};
                    apiParams.SortBy.Direction = SortDirection.Ascending;
                    apiParams.SortBy.SortField = 'Name';
                    return [
                        new checklistActions.LoadChecklistAssignments(apiParams),
                        new checklistActions.NullifyCheckListStatsAction()
                    ]
                })
                .catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Create, 'Assignment', null)));
                });
        });

    @Effect()
    updateAssignment$: Observable<Action> = this._actions$.ofType(checklistActions.ActionTypes.UPDATE_CHECKLIST_ASSIGNMENT)
        .map(toPayload)
        .switchMap((data: CheckListAssignment) => {
            let snackBarVM = ObjectHelper.createUpdateCompleteSnackbarMessage('Assignment', '', '');
            this._messenger.publish('snackbar', snackBarVM);
            return this._data.post('ChecklistAssignment', data)
                .mergeMap((res) => {
                    let snackBarVM = ObjectHelper.createUpdateCompleteSnackbarMessage('Assignment', '', '');
                    this._messenger.publish('snackbar', snackBarVM);
                    let apiParams: AtlasApiRequestWithParams = <AtlasApiRequestWithParams>{};
                    apiParams.Params = new Array(new AtlasParams('ChecklistAssignmentsByChecklistId', res.json().CheckListId));
                    apiParams.PageNumber = 1;
                    apiParams.PageSize = 10;
                    apiParams.SortBy = <AeSortModel>{};
                    apiParams.SortBy.Direction = SortDirection.Ascending;
                    apiParams.SortBy.SortField = 'Name';
                    return [
                        new checklistActions.LoadChecklistAssignments(apiParams),
                        new checklistActions.NullifyCheckListStatsAction()
                    ]
                })
                .catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Update, 'Assignment', null)));
                });
        });

    @Effect()
    deleteAssignment$: Observable<Action> = this._actions$.ofType(checklistActions.ActionTypes.DELETE_CHECKLIST_ASSIGNMENT)
        .map(toPayload)
        .switchMap((data: CheckListAssignment) => {
            let vm = ObjectHelper.operationInProgressSnackbarMessage('Assignment removing...');
            this._messenger.publish('snackbar', vm);
            return this._data.delete('ChecklistAssignment/' + data.Id)
                .mergeMap((res) => {
                    let checkItem = res.json() as CheckItem;
                    let vm = ObjectHelper.operationCompleteSnackbarMessage('Assignment removed.');
                    this._messenger.publish('snackbar', vm);
                    let apiParams: AtlasApiRequestWithParams = <AtlasApiRequestWithParams>{};
                    apiParams.Params = new Array(new AtlasParams('ChecklistAssignmentsByChecklistId', data.CheckListId));
                    apiParams.PageNumber = 1;
                    apiParams.PageSize = 10;
                    apiParams.SortBy = <AeSortModel>{};
                    apiParams.SortBy.Direction = SortDirection.Ascending;
                    apiParams.SortBy.SortField = 'Name';
                    return [
                        new checklistActions.LoadChecklistAssignments(apiParams),
                        new checklistActions.NullifyCheckListStatsAction()
                    ]
                })
                .catch((error) => {
                    let vm = ObjectHelper.operationCompleteSnackbarMessage('Assignment removed.');
                    this._messenger.publish('snackbar', vm);
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Remove, 'CheckItem', null, data.Id)));
                });
        });


    @Effect()
    updateChecklist$: Observable<Action> = this._actions$.ofType(checklistActions.ActionTypes.UPDATE_CHECKLIST)
        .map((action: checklistActions.ChecklistUpdateAction) => action.payload)
        .switchMap((data) => {
            let params: URLSearchParams = new URLSearchParams();
            params.set('example', 'false');
            let vm = ObjectHelper.operationInProgressSnackbarMessage('Checklist updating...');
            this._messenger.publish('snackbar', vm);
            return this._data.post('checklist', data)
                .mergeMap((res) => {
                    let vm = ObjectHelper.operationCompleteSnackbarMessage('Checklist updated.');
                    this._messenger.publish('snackbar', vm);
                    var checklist = res.json() as Checklist;
                    return [
                        new checklistActions.ChecklistLoadAction({ id: checklist.Id, example: checklist.IsExample }),
                        new checklistActions.NullifyCheckListStatsAction()
                    ]
                }).catch((error) => {
                    let vm = ObjectHelper.operationCompleteSnackbarMessage('Checklist error occured.');
                    this._messenger.publish('snackbar', vm);
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Update, 'Checklist', data.Name, data.Id)));
                });
        });

    @Effect()
    copyChecklist$: Observable<Action> = this._actions$.ofType(checklistActions.ActionTypes.COPY_CHECKLIST)
        .map((action: checklistActions.CopyChecklistAction) => action.payload)
        .switchMap((data) => {
            let params: URLSearchParams = new URLSearchParams();
            params.set('example', data.isExample.toString());
            params.set('copy', 'true');
            let vm = ObjectHelper.operationInProgressSnackbarMessage('Copying checklist...');
            this._messenger.publish('snackbar', vm);
            return this._data.put('CheckList', data.checklist, { search: params }, )
                .mergeMap((res) => {
                    let vm = ObjectHelper.operationCompleteSnackbarMessage('Checklist copied.');
                    this._messenger.publish('snackbar', vm);
                    return [
                        new checklistActions.CheckListClearAction(data.checklist.Id),
                        new checklistActions.NullifyCheckListStatsAction()
                    ]
                })
                .catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Copy, 'Checklist', null, data.checklist.Id)));
                });
        });

    @Effect()
    removeChecklist$: Observable<Action> = this._actions$.ofType(checklistActions.ActionTypes.REMOVE_CHECKLIST)
        .map((action: checklistActions.RemoveChecklistAction) => action.payload)
        .switchMap((data) => {
            let params: URLSearchParams = new URLSearchParams();
            params.set('id', data.Id);
            let vm = ObjectHelper.operationInProgressSnackbarMessage('Removing checklist...');
            this._messenger.publish('snackbar', vm);
            return this._data.delete('CheckList', { search: params })
                .mergeMap((res) => {
                    let vm = ObjectHelper.operationCompleteSnackbarMessage('Checklist removed.');
                    this._messenger.publish('snackbar', vm);
                    return [
                        new checklistActions.CheckListClearAction(data.Id),
                        new checklistActions.NullifyCheckListStatsAction()
                    ]
                })
                .catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Remove, 'Checklist', null, data.Id)));
                });
        });

    @Effect()
    archiveOrReinstateChecklist$: Observable<Action> = this._actions$.ofType(checklistActions.ActionTypes.ARCHIVE_REINSTATE_CHECKLIST)
        .map((action: checklistActions.ArchiveOrReinstateChecklistAction) => action.payload)
        .switchMap((data) => {
            let params: URLSearchParams = new URLSearchParams();
            params.set('isArchived', data.IsArchived.toString());
            params.set('example', data.IsExample.toString());
            params.set('id', data.Id);
            let vm = ObjectHelper.operationInProgressSnackbarMessage(data.IsArchived ? 'Archiving checklist...' : 'Reinstating checklist...');
            this._messenger.publish('snackbar', vm);
            return this._data.post('CheckList', { id: data.Id }, { search: params })
                .mergeMap((res) => {
                    let vm = ObjectHelper.operationCompleteSnackbarMessage(data.IsArchived ? 'Checklist archived.' : 'Checklist reinstated.');
                    this._messenger.publish('snackbar', vm);
                    return [
                        new checklistActions.CheckListClearAction(data.Id),
                        new checklistActions.NullifyCheckListStatsAction()
                    ]
                })
                .catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Update, 'Checklist', null, data.Id)));
                })
        });

    @Effect()
    loadChecklistStats$: Observable<Action> = this._actions$.ofType(checklistActions.ActionTypes.LOAD_CHECKLIST_STATS)
        .map((action: checklistActions.LoadChecklistStatsAction) => action.payload)
        .switchMap((payload) => {
            let params: URLSearchParams = new URLSearchParams();
            let globalName = '';
            let workSpaces = '';
            if (!isNullOrUndefined(payload)) {
                let globalName = payload.filter(c => {
                    return c.hasOwnProperty("globalNameFilterValue");
                })
                let workSpaces = payload.filter(c => {
                    return c.hasOwnProperty("camaListOfSelectedWorkSpaces");
                })
                if (!isNullOrUndefined(globalName) && globalName.length > 0) {
                    params.set('checkListInstanceNameFilter', globalName[0].globalNameFilterValue);
                    params.set('filterAssignmentByChecklistName', globalName[0].globalNameFilterValue);
                    params.set('checkListNameFilter', globalName[0].globalNameFilterValue);
                }
                if (!isNullOrUndefined(workSpaces) && workSpaces.length > 0) {
                    params.set('workspaceScheduledFilter', workSpaces[0].camaListOfSelectedWorkSpaces);
                    params.set('workspaceChecklistFilter', workSpaces[0].camaListOfSelectedWorkSpaces);
                    params.set('workspaceChecklistInstanceFilter', workSpaces[0].camaListOfSelectedWorkSpaces);
                }
            }

            return this._data.get('CheckListInstance?isExample=false&forStats=true', { search: params })
                .map(res =>
                    new checklistActions.LoadChecklistStatsCompleteAction(res.json())
                )
                .catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'Loading Checklist Stats ', '')));
                })
        });
}