import { ChecklistState } from './checklist.reducer';
import { Action } from '@ngrx/store';
import * as Immutable from 'immutable';
import { Observable } from 'rxjs/Rx';
import { isNullOrUndefined } from 'util';
import { DataTableOptions } from '../../atlas-elements/common/models/ae-datatable-options';
import { PagingInfo } from '../../atlas-elements/common/models/ae-paging-info';
import { CommonHelpers } from '../../shared/helpers/common-helpers';
import { AtlasApiRequestWithParams } from '../../shared/models/atlas-api-response';
import * as checklistActions from '../actions/checklist.actions';
import { CheckItem } from '../models/checkitem.model';
import { CheckListInstance } from '../models/checklist-instance.model';
import { Checklist } from '../models/checklist.model';
import { CompanyOrExampleOrArchivedChecklist } from '../models/company-example-archived.model';
import { CheckListAssignment } from './../models/checklist-assignment.model';

export interface ChecklistState {
    checklist: Array<Checklist>,
    apiRequestWithParams: AtlasApiRequestWithParams,
    currentCheckList: Checklist;
    checklistTotalCount: number;
    ChecklistAddUpdateFormData: Checklist;
    ChecklistAddUpdateCompleted: boolean;
    loading: boolean,
    scheduledOrArchivedChecklist: Array<Checklist>,
    scheduledOrArchivedApiRequestWithParams: AtlasApiRequestWithParams,
    scheduledOrArchivedTotalCount: number,
    scheduledOrArchivedLoadingStatus: boolean,
    companyChecklist: Array<CompanyOrExampleOrArchivedChecklist>,
    companyApiRequestWithParams: AtlasApiRequestWithParams,
    companyTotalCount: number,
    exampleChecklist: Array<CompanyOrExampleOrArchivedChecklist>,
    exampleApiRequestWithParams: AtlasApiRequestWithParams,
    exampleTotalCount: number,
    archivedChecklist: Array<CompanyOrExampleOrArchivedChecklist>,
    archivedApiRequestWithParams: AtlasApiRequestWithParams,
    archivedTotalCount: number,
    loadingStatus: boolean,
    nameFilter: string,
    workspaceFilter: string,
    checkItems: Array<CheckItem>,
    checkItemsList: Array<CheckItem>,
    checkItemsTotalCount: number,
    checkItemsPagingInfo: PagingInfo
    assignmentsApiRequestWithParams: AtlasApiRequestWithParams,
    assignmentsTotalCount: number,
    assignmentsLoading: boolean,
    checklistId: string;
    checkListInstance: CheckListInstance;
    checklistActionItemId: string;
    hasChecklistStatsLoaded: boolean;
    checklistStats: any[];
}

const initialState: ChecklistState = {
    checklist: null,
    apiRequestWithParams: null,
    currentCheckList: null,
    checklistTotalCount: null,
    loading: false,
    ChecklistAddUpdateFormData: null,
    ChecklistAddUpdateCompleted: true,

    scheduledOrArchivedChecklist: null,
    scheduledOrArchivedApiRequestWithParams: null,
    scheduledOrArchivedTotalCount: null,
    scheduledOrArchivedLoadingStatus: false,
    companyChecklist: null,
    companyApiRequestWithParams: null,
    companyTotalCount: null,
    exampleChecklist: null,
    exampleApiRequestWithParams: null,
    exampleTotalCount: null,
    archivedChecklist: null,
    archivedApiRequestWithParams: null,
    archivedTotalCount: null,
    loadingStatus: null,
    nameFilter: null,
    workspaceFilter: null,
    checkItems: null,
    checkItemsList: null,
    checkItemsTotalCount: null,
    checkItemsPagingInfo: null,
    assignmentsApiRequestWithParams: null,
    assignmentsTotalCount: null,
    assignmentsLoading: false,
    checklistId: null,
    checkListInstance: null,
    checklistActionItemId: null,
    hasChecklistStatsLoaded: false,
    checklistStats: null,
}

export function reducer(state = initialState, action: Action): ChecklistState {
    switch (action.type) {
        case checklistActions.ActionTypes.SET_INITIAL_STATE: {
            let modifiedState = Object.assign(state, initialState);
            return modifiedState;
        }
        case checklistActions.ActionTypes.CHECKLIST_CLEAR: {
            let modifiedState = Object.assign({}, state, {});
            if (isNullOrUndefined(modifiedState.currentCheckList) || (modifiedState.currentCheckList && action.payload != modifiedState.currentCheckList.Id)) {
                let modifiedState = Object.assign(state, initialState); //assigning inital state values  
                modifiedState.checklistId = <string>action.payload;
            }
            return modifiedState;
        }
        case checklistActions.ActionTypes.FILTER_BY_NAME_ACTION:
            {
                return Object.assign({}, state, { nameFilter: action.payload });
            }
        case checklistActions.ActionTypes.FILTER_BY_WORKSPACE_ACTION:
            {
                return Object.assign({}, state, { workspaceFilter: action.payload });
            }
        case checklistActions.ActionTypes.TODAYS_OR_COMPLETE_INCOMPLETE_CHECKLIST_LOAD:
            {
                return Object.assign({}, state, { loading: true, apiRequestWithParams: action.payload });
            }
        case checklistActions.ActionTypes.TODAYS_OR_COMPLETE_INCOMPLETE_CHECKLIST_LOAD_COMPLETE:
            {
                let modifiedState = Object.assign({}, state, {});
                if (!isNullOrUndefined(modifiedState.apiRequestWithParams)) {
                    if (action.payload.PagingInfo.PageNumber == 1) {
                        modifiedState.checklistTotalCount = action.payload.PagingInfo.TotalCount;
                    }
                }

                return Object.assign({}, modifiedState, { checklist: action.payload.CheckList, loading: false, currentCheckList: null });
            }

        case checklistActions.ActionTypes.SCHEDULED_OR_ARCHIVED_CHECKLIST_LOAD:
            {
                return Object.assign({}, state, { scheduledOrArchivedLoadingStatus: true, scheduledOrArchivedApiRequestWithParams: action.payload });
            }
        case checklistActions.ActionTypes.SCHEDULED_OR_ARCHIVED_CHECKLIST_LOAD_COMPLETE:
            {
                let modifiedState = Object.assign({}, state, {});
                if (!isNullOrUndefined(modifiedState.scheduledOrArchivedApiRequestWithParams)) {
                    if (action.payload.PagingInfo.PageNumber == 1) {
                        modifiedState.scheduledOrArchivedTotalCount = action.payload.PagingInfo.TotalCount;
                    }
                }

                return Object.assign({}, modifiedState, { scheduledOrArchivedChecklist: action.payload.CheckList, scheduledOrArchivedLoadingStatus: false, currentCheckList: null });
            }

        case checklistActions.ActionTypes.COMPANY_OR_EXAMPLE_OR_ARCHIVED_CHECKLIST_LOAD:
            {
                return Object.assign({}, state, {
                    loadingStatus: true,
                    companyApiRequestWithParams: action.payload, exampleApiRequestWithParams: action.payload, archivedApiRequestWithParams: action.payload
                });
            }
        case checklistActions.ActionTypes.COMPANY_CHECKLIST_LOAD_COMPLETE:
            {
                let modifiedState = Object.assign({}, state, {});
                if (!isNullOrUndefined(modifiedState.companyApiRequestWithParams)) {
                    if (action.payload.PagingInfo.PageNumber == 1) {
                        modifiedState.companyTotalCount = action.payload.PagingInfo.TotalCount;
                    }
                }

                return Object.assign({}, modifiedState, { companyChecklist: action.payload.Entities, loadingStatus: false, currentCheckList: null });
            }
        case checklistActions.ActionTypes.EXAMPLE_ARCHIVED_CHECKLIST_LOAD_COMPLETE:
            {
                let modifiedState = Object.assign({}, state, {});
                if (!isNullOrUndefined(modifiedState.exampleApiRequestWithParams)) {
                    if (action.payload.PagingInfo.PageNumber == 1) {
                        modifiedState.archivedTotalCount = action.payload.PagingInfo.TotalCount;
                    }
                }
                let tempState = { archivedChecklist: action.payload.Entities.filter((item) => item.IsArchived === true), loadingStatus: false, currentCheckList: null };
                return Object.assign({}, modifiedState, tempState);
            }
        case checklistActions.ActionTypes.EXAMPLE_CHECKLIST_LOAD_COMPLETE:
            {
                let modifiedState = Object.assign({}, state, {});
                if (!isNullOrUndefined(modifiedState.exampleApiRequestWithParams)) {
                    if (action.payload.PagingInfo.PageNumber == 1) {
                        modifiedState.exampleTotalCount = action.payload.PagingInfo.TotalCount;
                    }
                }

                return Object.assign({}, modifiedState, { exampleChecklist: action.payload.Entities.filter((item) => item.IsArchived === false), loadingStatus: false, currentCheckList: null });
            }
        case checklistActions.ActionTypes.ARCHIVED_CHECKLIST_LOAD_COMPLETE:
            {
                let modifiedState = Object.assign({}, state, {});
                if (!isNullOrUndefined(modifiedState.archivedApiRequestWithParams)) {
                    if (action.payload.PagingInfo.PageNumber == 1) {
                        modifiedState.archivedTotalCount = action.payload.PagingInfo.TotalCount;
                    }
                }

                return Object.assign({}, modifiedState, { archivedChecklist: action.payload.Entities, loadingStatus: false, currentCheckList: null });
            }
        case checklistActions.ActionTypes.CHECKLIST_LOAD:
            {
                let modifiedState = Object.assign({}, state, { loading: true });
                modifiedState.checkItemsPagingInfo = new PagingInfo(0, 0, 1, 10);
                return modifiedState;
            }
        case checklistActions.ActionTypes.CHECKLIST_LOAD_COMPLETE:
            {
                let modifiedState = Object.assign({}, state, {});
                if (!isNullOrUndefined(action.payload)) {
                    return Object.assign({}, modifiedState, {
                        currentCheckList: action.payload,
                        checkItemsTotalCount: isNullOrUndefined(action.payload.CheckItems) ? 0 : action.payload.CheckItems.length,
                        checkItemsList: isNullOrUndefined(action.payload.CheckItems) ? [] : action.payload.CheckItems.slice(state.checkItemsPagingInfo.PageNumber - 1, state.checkItemsPagingInfo.PageSize),
                        loading: false
                    });
                }
                return modifiedState;
            }
        case checklistActions.ActionTypes.CHECKLIST_ITEMS_LIST_ON_LOAD_COMPLETE:
            {
                let _request = <AtlasApiRequestWithParams>action.payload;
                let _modifiedState: ChecklistState = Object.assign({}, state);
                if (isNullOrUndefined(_modifiedState.currentCheckList)) return _modifiedState;
                let _checkItems = isNullOrUndefined(_modifiedState.currentCheckList.CheckItems) ? [] : _modifiedState.currentCheckList.CheckItems;
                let _checkItemsTotalCount = _checkItems ? _checkItems.length : 0;
                _checkItems = CommonHelpers.sortArray(_checkItems, _request.SortBy.SortField, _request.SortBy.Direction);
                let startPage = (_request.PageNumber * _request.PageSize) - _request.PageSize;
                let endPage = (_request.PageNumber * _request.PageSize);
                let slicedRecords = _checkItems && _checkItems.length > 0 ? _checkItems.slice(startPage, endPage) : [];
                _modifiedState = Object.assign({}, _modifiedState, { checkItemsList: slicedRecords });
                //DO NOT SEND slicedRecords.length to pagingInfo count
                _modifiedState.checkItemsPagingInfo = new PagingInfo(_request.PageSize, _checkItemsTotalCount, _request.PageNumber, _request.PageSize);
                return _modifiedState;
            }
        case checklistActions.ActionTypes.CHECKLIST_ITEM_ADD:
            {
                return Object.assign({}, state, {});
            }
        case checklistActions.ActionTypes.CHECKLIST_ITEM_UPDATE:
            {
                return Object.assign({}, state, {});
            }
        case checklistActions.ActionTypes.CHECKLIST_ITEM_REMOVE:
            {
                return Object.assign({}, state, {});
            }
        case checklistActions.ActionTypes.COPY_CHECKLIST:
            {
                return Object.assign({}, state, { nameFilter: null, workspaceFilter: null });
            }
        case checklistActions.ActionTypes.REMOVE_CHECKLIST:
            {
                return Object.assign({}, state, { nameFilter: null, workspaceFilter: null });
            }
        case checklistActions.ActionTypes.ARCHIVE_REINSTATE_CHECKLIST:
            {
                return Object.assign({}, state, { nameFilter: null, workspaceFilter: null });
            }
        case checklistActions.ActionTypes.CHECKLIST_ADD:
            {
                return Object.assign({}, state, { ChecklistAddUpdateCompleted: false, ChecklistAddUpdateFormData: action.payload });
            }

        case checklistActions.ActionTypes.CHECKLIST_ADD_COMPLETE:
            {
                return Object.assign({}, state, { ChecklistAddUpdateCompleted: true, currentCheckList: action.payload });
            }

        case checklistActions.ActionTypes.UPDATE_CHECKLIST_COMPLETE:
            {
                return Object.assign({}, state, { currentCheckList: action.payload });
            }
        case checklistActions.ActionTypes.LOAD_CHECKLIST_ASSIGNMENTS:
            {
                return Object.assign({}, state, { assignmentsLoading: true, assignmentsApiRequestWithParams: action.payload });
            }
        case checklistActions.ActionTypes.LOAD_CHECKLIST_ASSIGNMENTS_COMPLETE:
            {
                let modifiedState = Object.assign({}, state, {});
                if (!isNullOrUndefined(modifiedState.assignmentsApiRequestWithParams)) {
                    if (action.payload.PagingInfo.PageNumber === 1) {
                        modifiedState.assignmentsTotalCount = action.payload.PagingInfo.TotalCount;
                    }
                }
                modifiedState.currentCheckList.CheckListAssignments = action.payload.ChecklistAssignments;
                modifiedState.assignmentsLoading = false;
                return modifiedState;
            }
        case checklistActions.ActionTypes.CHECKLIST_ACTION_ITEMS_LOAD:
            {
                let modifiedState = Object.assign({}, state, { loading: true });
                return modifiedState;
            }
        case checklistActions.ActionTypes.CHECKLIST_ACTION_ITEMS_LOAD_COMPLETE:
            {
                let modifiedState = Object.assign({}, state, {});
                if (!isNullOrUndefined(action.payload)) {
                    return Object.assign({}, modifiedState, {
                        checkListInstance: action.payload,
                        loading: false
                    });
                }
                return modifiedState;
            }
        case checklistActions.ActionTypes.CHECKLIST_ACTION_ITEMS_UPDATE:
            {
                return Object.assign({}, state, { checkListInstance: action.payload });
            }

        case checklistActions.ActionTypes.CHECKLIST_ACTION_ITEMS_UPDATE_COMPLETE:
            {
                return Object.assign({}, state, { checkListInstance: action.payload });
            }
        case checklistActions.ActionTypes.CHECKLIST_ACTION_ITEMS_DOCUMENT_REMOVE:
            {
                return Object.assign({}, state, { checklistActionItemId: action.payload.InstanceActionId });
            }
        case checklistActions.ActionTypes.CHECKLIST_ACTION_ITEMS_UNLOAD:
            {
                return Object.assign({}, state, { checkListInstance: null });
            }
        case checklistActions.ActionTypes.CHECKLIST_ACTION_ITEMS_DOCUMENT_REMOVE_COMPLETE:
            {
                let modifiedState = Object.assign({}, state, {});
                if (!isNullOrUndefined(action.payload)) {
                    let checkListInstance = Object.assign({}, modifiedState.checkListInstance);
                    let attachments;
                    let attachmentIndex;
                    if (!isNullOrUndefined(modifiedState.checkListInstance.Attachments)) {
                        attachments = modifiedState.checkListInstance.Attachments.get(modifiedState.checklistActionItemId)
                        attachmentIndex = attachments.findIndex(s => s.Id == action.payload.Id);
                        attachments.splice(attachmentIndex, 1);
                        checkListInstance.Attachments.set(modifiedState.checklistActionItemId, attachments);
                        modifiedState.checkListInstance = checkListInstance;
                    }
                    else {
                        let instanceItemIndex;
                        if (!isNullOrUndefined(modifiedState.checkListInstance.InstanceItems)) {
                            attachments = modifiedState.checkListInstance.InstanceItems.find(s => s.Id == modifiedState.checklistActionItemId).Attachments;
                            instanceItemIndex = modifiedState.checkListInstance.InstanceItems.findIndex(s => s.Id == modifiedState.checklistActionItemId);
                            attachmentIndex = attachments.findIndex(s => s.Id == action.payload.Id);
                            attachments.splice(attachmentIndex, 1);
                            checkListInstance.InstanceItems[instanceItemIndex].Attachments = attachments;
                            modifiedState.checkListInstance = checkListInstance;
                        }

                    }
                }
                return modifiedState;


            }
        case checklistActions.ActionTypes.LOAD_CHECKLIST_STATS: {
            let modifiedState = Object.assign({}, state, { hasChecklistStatsLoaded: false });
            return modifiedState;
        }
        case checklistActions.ActionTypes.LOAD_CHECKLIST_STATS_COMPLETE: {
            let modifiedState = Object.assign({}, state, { hasChecklistStatsLoaded: true, checklistStats: action.payload });
            return modifiedState;
        }
        case checklistActions.ActionTypes.NULLIFY_CHECKLIST_STATS: {
            let modifiedState = Object.assign({}, state, { hasChecklistStatsLoaded: false, checklistStats: null });
            return modifiedState;
        }
        case checklistActions.ActionTypes.NULLIFY_CHECKLIST_GLOBAL_FILTER_PARAMS: {
            let modifiedState = Object.assign({}, state, { nameFilter: null, workspaceFilter: null });
            return modifiedState;
        }
        default:
            return state;
    }
}


export function getChecklistStats(state$: Observable<ChecklistState>): Observable<Array<any>> {
    return state$.select(s => s.checklistStats);
}

export function getChecklistListData(state$: Observable<ChecklistState>): Observable<Array<Checklist>> {
    return state$.select(s => s && s.checklist);
}

export function getCurrentChecklistData(state$: Observable<ChecklistState>): Observable<Checklist> {
    return state$.select(s => s && s.currentCheckList);
}


export function getChecklistTotalCount(state$: Observable<ChecklistState>): Observable<number> {
    return state$.select(s => s && s.checklistTotalCount);
}

export function getChecklistPageInformation(state$: Observable<ChecklistState>): Observable<DataTableOptions> {
    return state$.select(state => state && state.apiRequestWithParams && new DataTableOptions(state.apiRequestWithParams.PageNumber, state.apiRequestWithParams.PageSize, state.apiRequestWithParams.SortBy.SortField, state.apiRequestWithParams.SortBy.Direction));
}

export function getChecklistLoadingStatus(state$: Observable<ChecklistState>): Observable<boolean> {
    return state$.select(s => s && s.loading);
}

// ScheduledOrArchiveChecklist methods start
export function getScheduledOrArchiveChecklistData(state$: Observable<ChecklistState>): Observable<Array<Checklist>> {
    return state$.select(s => s && s.scheduledOrArchivedChecklist);
}

export function getScheduledOrArchiveChecklistTotalCount(state$: Observable<ChecklistState>): Observable<number> {
    return state$.select(s => s && s.scheduledOrArchivedTotalCount);
}

export function getScheduledOrArchiveChecklistPageInformation(state$: Observable<ChecklistState>): Observable<DataTableOptions> {
    return state$.select(state => state && state.scheduledOrArchivedApiRequestWithParams && new DataTableOptions(state.scheduledOrArchivedApiRequestWithParams.PageNumber, state.scheduledOrArchivedApiRequestWithParams.PageSize, state.scheduledOrArchivedApiRequestWithParams.SortBy.SortField, state.scheduledOrArchivedApiRequestWithParams.SortBy.Direction));
}

export function getScheduledOrArchiveChecklistLoadingStatus(state$: Observable<ChecklistState>): Observable<boolean> {
    return state$.select(s => s && s.scheduledOrArchivedLoadingStatus);
}
//ScheduledOrArchiveChecklist method ends
// CompanyORExampleORArchived methods start
export function getCompanyChecklistData(state$: Observable<ChecklistState>): Observable<Array<CompanyOrExampleOrArchivedChecklist>> {
    return state$.select(s => s && s.companyChecklist);
}

export function getCompanyChecklistTotalCount(state$: Observable<ChecklistState>): Observable<number> {
    return state$.select(s => s && s.companyTotalCount);
}

export function getCompanyChecklistPageInformation(state$: Observable<ChecklistState>): Observable<DataTableOptions> {
    return state$.select(state => state && state.companyApiRequestWithParams && new DataTableOptions(state.companyApiRequestWithParams.PageNumber, state.companyApiRequestWithParams.PageSize, state.companyApiRequestWithParams.SortBy.SortField, state.companyApiRequestWithParams.SortBy.Direction));
}

export function getCompanyChecklistLoadingStatus(state$: Observable<ChecklistState>): Observable<boolean> {
    return state$.select(s => s && s.loadingStatus);
}
//CompanyORExampleORArchived methods ends

// CompanyORExampleORArchived methods start
export function getExampleChecklistData(state$: Observable<ChecklistState>): Observable<Array<CompanyOrExampleOrArchivedChecklist>> {
    return state$.select(s => s && s.exampleChecklist);
}

export function getExampleChecklistTotalCount(state$: Observable<ChecklistState>): Observable<number> {
    return state$.select(s => s && s.exampleTotalCount);
}

export function getExampleChecklistPageInformation(state$: Observable<ChecklistState>): Observable<DataTableOptions> {
    return state$.select(state => state && state.exampleApiRequestWithParams && new DataTableOptions(state.exampleApiRequestWithParams.PageNumber, state.exampleApiRequestWithParams.PageSize, state.exampleApiRequestWithParams.SortBy.SortField, state.exampleApiRequestWithParams.SortBy.Direction));
}

export function getExampleChecklistLoadingStatus(state$: Observable<ChecklistState>): Observable<boolean> {
    return state$.select(s => s && s.loadingStatus);
}
//CompanyORExampleORArchived methods ends
// CompanyORExampleORArchived methods start
export function getArchivedChecklistData(state$: Observable<ChecklistState>): Observable<Array<CompanyOrExampleOrArchivedChecklist>> {
    return state$.select(s => s && s.archivedChecklist);
}

export function getArchivedChecklistTotalCount(state$: Observable<ChecklistState>): Observable<number> {
    return state$.select(s => s && s.archivedTotalCount);
}

export function getArchivedChecklistPageInformation(state$: Observable<ChecklistState>): Observable<DataTableOptions> {
    return state$.select(state => state && state.archivedApiRequestWithParams && new DataTableOptions(state.archivedApiRequestWithParams.PageNumber, state.archivedApiRequestWithParams.PageSize, state.archivedApiRequestWithParams.SortBy.SortField, state.archivedApiRequestWithParams.SortBy.Direction));
}

export function getArchivedChecklistLoadingStatus(state$: Observable<ChecklistState>): Observable<boolean> {
    return state$.select(s => s && s.loadingStatus);
}
//CompanyORExampleORArchived methods ends 
//load sectors data

export function getChecklistNameChange(state$: Observable<any>): Observable<any> {
    return state$.select(s => s.nameFilter);
}
export function getWorkSpaceChange(state$: Observable<any>): Observable<any> {
    return state$.select(s => s.workspaceFilter);
}
//CompanyORExampleORArchived methods ends

export function getCheckItemsData(state$: Observable<ChecklistState>): Observable<Array<CheckItem>> {
    return state$.select(s => s && s.checkItemsList);
}

export function getCheckItemsTotalCount(state$: Observable<ChecklistState>): Observable<number> {
    return state$.select(s => s && s.checkItemsTotalCount);
}

export function getCheckItemsPageInformation(state$: Observable<ChecklistState>): Observable<DataTableOptions> {
    return state$.select(state => state && state.checkItemsPagingInfo && new DataTableOptions(state.checkItemsPagingInfo.PageNumber, state.checkItemsPagingInfo.PageSize, (state.apiRequestWithParams && state.apiRequestWithParams.SortBy ? state.apiRequestWithParams.SortBy.SortField : ''), (state.apiRequestWithParams && state.apiRequestWithParams.SortBy ? state.apiRequestWithParams.SortBy.Direction : '')));
}

export function getCheckItemsLoadingStatus(state$: Observable<ChecklistState>): Observable<boolean> {
    return state$.select(s => s && s.loading);
}

//Preview checklist mehtods start
export function getCurrentChecklist(state$: Observable<ChecklistState>): Observable<Checklist> {
    return state$.select(s => s.currentCheckList);
}

export function getCurrentChecklistCheckItems(state$: Observable<ChecklistState>): Observable<Immutable.List<CheckItem>> {
    return state$.select(s => s && s.currentCheckList && s.currentCheckList.CheckItems && Immutable.List(s.currentCheckList.CheckItems.filter((item) => !item.IsDeleted)));
}

export function getCurrentChecklistCheckItemsLength(state$: Observable<ChecklistState>): Observable<number> {
    return state$.select(s => s && s.currentCheckList && s.currentCheckList.CheckItems && s.currentCheckList.CheckItems.filter((item) => !item.IsDeleted)).count();
}

export function getCurrentChecklistLoadingStatus(state$: Observable<ChecklistState>): Observable<boolean> {
    return state$.select(s => s.loading);
}

export function getChecklistAssignments(state$: Observable<ChecklistState>): Observable<Immutable.List<CheckListAssignment>> {
    return state$.select(s => s && s.currentCheckList && Immutable.List(s.currentCheckList.CheckListAssignments));
}
export function getChecklistAssignmentCount(state$: Observable<ChecklistState>): Observable<number> {
    return state$.select(s => s && s.assignmentsTotalCount);
}
export function getChecklistAssignmentPageInformation(state$: Observable<ChecklistState>): Observable<DataTableOptions> {
    return state$.select(s => s && s.assignmentsApiRequestWithParams && new DataTableOptions(s.assignmentsApiRequestWithParams.PageNumber, s.assignmentsApiRequestWithParams.PageSize, s.assignmentsApiRequestWithParams.SortBy.SortField, s.assignmentsApiRequestWithParams.SortBy.Direction));
}
export function getChecklistAssignmentLoadingStatus(state$: Observable<ChecklistState>): Observable<boolean> {
    return state$.select(s => s.assignmentsLoading);
}
export function getChecklistActionItemInstances(state$: Observable<ChecklistState>): Observable<CheckListInstance> {
    return state$.select(s => s.checkListInstance);
}
//Preview checklist mehtods start
