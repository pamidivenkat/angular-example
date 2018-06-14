import { User } from '../../../shared/models/user';
import { TrainingCourseUserModule } from '../../models/training-course-user-module';
import { extractDataTableOptions } from '../../../shared/helpers/extract-helpers';
import { isNullOrUndefined } from 'util';
import { Action } from '@ngrx/store';
import { AeSortModel } from '../../../atlas-elements/common/models/ae-sort-model';
import { TrainingCourse, TrainingModule } from '../../models/training-course';
import * as TrainingCourseActions from '../actions/training-courses.actions';
import { Observable } from 'rxjs/Rx';
import * as Immutable from 'immutable';
import { AtlasApiRequestWithParams, AtlasApiResponse } from '../../../shared/models/atlas-api-response';
import { PagingInfo } from '../../../atlas-elements/common/models/ae-paging-info';
import { DataTableOptions } from '../../../atlas-elements/common/models/ae-datatable-options';

export interface TrainingCourseState {
    isTrainingCourseListLoading: boolean;
    TrainingCourseList: Immutable.List<TrainingCourse>;
    TrainingModuleList: TrainingModule[];
    SelectedTrainingModuleList: TrainingCourse;
    TrainingCoursePagingInfo: PagingInfo;
    TrainingCourseSortingInfo: AeSortModel;
    TrainingCourseAddUpdateFormData: TrainingCourse;
    IsTrainingCourseAddUpdateInProgress: boolean;
    IsTrainingCourseDeleteInProgress: boolean;
    IsTrainingCourseStatusUpdateInProgress: boolean;
    SelectedTrainingCourseId: String;
    filters: Map<string, string>;
    isTrainingCourseModuleListLoading: boolean;
    TrainingCourseUserModuleList: Immutable.List<TrainingCourseUserModule>;
    TrainingCourseUserModulePagingInfo: PagingInfo;
    TrainingCourseUserModuleListTotalCount: number;
    apiRequestWithParams: AtlasApiRequestWithParams,
    IsAssignedUsersInviteComplete: boolean;
    IsPublicUserInviteComplete: boolean;
    IsRemoveOrReInviteComplete: boolean;
}


const initialState: TrainingCourseState = {
    isTrainingCourseListLoading: false,
    TrainingCourseList: null,
    TrainingModuleList: null,
    SelectedTrainingModuleList: null,
    TrainingCoursePagingInfo: null,
    TrainingCourseSortingInfo: null,
    TrainingCourseAddUpdateFormData: null,
    IsTrainingCourseAddUpdateInProgress: false,
    IsTrainingCourseDeleteInProgress: false,
    IsTrainingCourseStatusUpdateInProgress: false,
    SelectedTrainingCourseId: "",
    filters: null,
    isTrainingCourseModuleListLoading: null,
    TrainingCourseUserModuleList: null,
    TrainingCourseUserModulePagingInfo: null,
    TrainingCourseUserModuleListTotalCount: null,
    apiRequestWithParams: null,
    IsAssignedUsersInviteComplete: null,
    IsPublicUserInviteComplete: null,
    IsRemoveOrReInviteComplete: null
}

export function TrainingCoursereducer(state = initialState, action: Action): TrainingCourseState {
    switch (action.type) {
        case TrainingCourseActions.ActionTypes.TRAINING_COURSES_LOAD:
            {
                let modifiedState = Object.assign({}, state, { isTrainingCourseListLoading: true });

                if (!isNullOrUndefined(action.payload.pageNumber)) {
                    if (isNullOrUndefined(modifiedState.TrainingCoursePagingInfo)) {
                        modifiedState.TrainingCoursePagingInfo = <PagingInfo>{};
                    }
                    modifiedState.TrainingCoursePagingInfo.PageNumber = action.payload.pageNumber;
                }
                if (!isNullOrUndefined(action.payload.noOfRows)) {
                    if (isNullOrUndefined(modifiedState.TrainingCoursePagingInfo)) {
                        modifiedState.TrainingCoursePagingInfo = <PagingInfo>{};
                    }
                    modifiedState.TrainingCoursePagingInfo.PageSize = action.payload.noOfRows;
                    modifiedState.TrainingCoursePagingInfo.Count = action.payload.noOfRows;
                }
                if (!isNullOrUndefined(action.payload.SortField)) {
                    if (isNullOrUndefined(modifiedState.TrainingCourseSortingInfo)) {
                        modifiedState.TrainingCourseSortingInfo = <AeSortModel>{};
                    }
                    modifiedState.TrainingCourseSortingInfo.SortField = action.payload.SortField;


                }
                if (!isNullOrUndefined(action.payload.Direction)) {
                    if (isNullOrUndefined(modifiedState.TrainingCourseSortingInfo)) {
                        modifiedState.TrainingCourseSortingInfo = <AeSortModel>{};
                    }
                    modifiedState.TrainingCourseSortingInfo.Direction = action.payload.Direction;
                }

                return modifiedState;

            }
        case TrainingCourseActions.ActionTypes.TRAINING_MODULE_LOAD:
            {
                return Object.assign({}, state, {});
            }
        case TrainingCourseActions.ActionTypes.TRAINING_MODULE_LOAD_COMPLETE:
            {
                return Object.assign({}, state, { TrainingModuleList: action.payload });
            }
        case TrainingCourseActions.ActionTypes.TRAINING_SELECTED_MODULE:
            {
                return Object.assign({}, state, {});
            }
        case TrainingCourseActions.ActionTypes.TRAINING_SELECTED_MODULE_COMPLETE:
            {
                return Object.assign({}, state, { SelectedTrainingModuleList: action.payload });
            }
        case TrainingCourseActions.ActionTypes.TRAINING_COURSE_ON_STATUS_CHANGE:
            {
                return Object.assign({}, state, { IsTrainingCourseStatusUpdateInProgress: false, TrainingCourseAddUpdateFormData: action.payload });
            }
        case TrainingCourseActions.ActionTypes.TRAINING_COURSE_ON_STATUS_CHANGE_COMPLETE:
            {
                return Object.assign({}, state, { IsTrainingCourseStatusUpdateInProgress: true });
            }
        case TrainingCourseActions.ActionTypes.TRAINING_COURSE_ON_FILTERS_CHANGE: {
            let modifiedState = Object.assign({}, state, { isTrainingCourseListLoading: true, filters: action.payload });

            if (!isNullOrUndefined(modifiedState.TrainingCoursePagingInfo)) {
                modifiedState.TrainingCoursePagingInfo.PageNumber = 1;
                modifiedState.TrainingCoursePagingInfo.PageSize = 10;
            }
            return modifiedState;
            //return Object.assign({}, state, { loading: false, isTrainingCourseListLoading: true, filters: action.payload });
        }
        case TrainingCourseActions.ActionTypes.TRAINING_COURSES_ADD:
            {
                return Object.assign({}, state, { IsTrainingCourseAddUpdateInProgress: true, TrainingCourseAddUpdateFormData: action.payload });
            }

        case TrainingCourseActions.ActionTypes.TRAINING_COURSES_ADD_COMPLETED:
            {
                return Object.assign({}, state, { IsTrainingCourseAddUpdateInProgress: false });
            }

        case TrainingCourseActions.ActionTypes.TRAINING_COURSES_UPDATE:
            {
                return Object.assign({}, state, { IsTrainingCourseAddUpdateInProgress: true, TrainingCourseAddUpdateFormData: action.payload });
            }

        case TrainingCourseActions.ActionTypes.TRAINING_COURSES_UPDATE_COMPLETE:
            {

                return Object.assign({}, state, { IsTrainingCourseAddUpdateInProgress: false });
            }

        case TrainingCourseActions.ActionTypes.TRAINING_COURSES_DELETE:
            {
                return Object.assign({}, state, { IsTrainingCourseDeleteInProgress: true, TrainingCourseAddUpdateFormData: action.payload, isTrainingCourseListLoading: true });
            }
        case TrainingCourseActions.ActionTypes.TRAINING_COURSES_DELETE_COMPLETE:
            {
                return Object.assign({}, state, { IsTrainingCourseDeleteInProgress: false, isTrainingCourseListLoading: false });
            }
        case TrainingCourseActions.ActionTypes.TRAINING_COURSES_LOAD_COMPLETE: {

            let modifiedState = Object.assign({}, state, { isTrainingCourseListLoading: true });
            if (!isNullOrUndefined(modifiedState.TrainingCoursePagingInfo)) {
                if (action.payload.TrainingCoursesPagingInfo.PageNumber == 1) {
                    modifiedState.TrainingCoursePagingInfo.TotalCount = action.payload.TrainingCoursesPagingInfo.TotalCount;
                }
                modifiedState.TrainingCoursePagingInfo.PageNumber = action.payload.TrainingCoursesPagingInfo.PageNumber;
                modifiedState.TrainingCoursePagingInfo.Count = action.payload.TrainingCoursesPagingInfo.Count;
            }
            else {
                modifiedState.TrainingCoursePagingInfo = action.payload.TrainingCoursesPagingInfo;
            }
            modifiedState.isTrainingCourseListLoading = false;
            modifiedState.TrainingCourseList = action.payload.TrainingCourseList;
            if (isNullOrUndefined(modifiedState.TrainingCourseSortingInfo)) {
                modifiedState.TrainingCourseSortingInfo = <AeSortModel>{};
                modifiedState.TrainingCourseSortingInfo.SortField = 'Title';
                modifiedState.TrainingCourseSortingInfo.Direction = 1;
            }
            return modifiedState;
        }
        case TrainingCourseActions.ActionTypes.LOAD_TRAINING_COURSE_INVITEES:
            {
                return Object.assign({}, state, { isTrainingCourseModuleListLoading: true, apiRequestWithParams: action.payload, IsAssignedUsersInviteComplete: false, IsPublicUserInviteComplete: false, IsRemoveOrReInviteComplete: false });
            }
        case TrainingCourseActions.ActionTypes.LOAD_TRAINING_COURSE_INVITEES_COMPLETE:
            {
                let modifiedState = Object.assign({}, state, {});
                if (!isNullOrUndefined(modifiedState.TrainingCourseUserModulePagingInfo)) {
                    if (action.payload.PagingInfo.PageNumber == 1) {
                        modifiedState.TrainingCourseUserModulePagingInfo.TotalCount = action.payload.PagingInfo.TotalCount;
                    }
                    modifiedState.TrainingCourseUserModulePagingInfo.PageNumber = action.payload.PagingInfo.PageNumber;
                    modifiedState.TrainingCourseUserModulePagingInfo.Count = action.payload.PagingInfo.Count;
                }
                else {
                    modifiedState.TrainingCourseUserModulePagingInfo = action.payload.PagingInfo;
                }
                modifiedState.isTrainingCourseModuleListLoading = false;
                modifiedState.TrainingCourseUserModuleList = Immutable.List<TrainingCourseUserModule>(action.payload.Entities);
                return modifiedState;
            }
        case TrainingCourseActions.ActionTypes.SEND_INVITE_FOR_SELECTED_COURSE:
            {
                return Object.assign({}, state, { IsAssignedUsersInviteComplete: false });
            }
        case TrainingCourseActions.ActionTypes.SEND_INVITE_FOR_SELECTED_COURSE_COMPLETE:
            {
                return Object.assign({}, state, { IsAssignedUsersInviteComplete: true });
            }
        case TrainingCourseActions.ActionTypes.INVITE_PUBLIC_USER_FOR_TRAINING_COURSE:
            {
                return Object.assign({}, state, { IsPublicUserInviteComplete: false });
            }
        case TrainingCourseActions.ActionTypes.INVITE_PUBLIC_USER_FOR_TRAINING_COURSE_COMPLETE:
            {
                return Object.assign({}, state, { IsPublicUserInviteComplete: true });
            }
        case TrainingCourseActions.ActionTypes.SEND_INVITE_FOR_SELECTED_COURSE_REGARDINGOBJECTS:
            {
                //set the assigned grid to loading status untill this action is completed..
                return Object.assign({}, state, { isTrainingCourseModuleListLoading: true, IsAssignedUsersInviteComplete: false });
            }
        case TrainingCourseActions.ActionTypes.SEND_INVITE_FOR_SELECTED_COURSE_REGARDINGOBJECTS_COMPLETE:
            {
                return Object.assign({}, state, { IsAssignedUsersInviteComplete: true });
            }
        case TrainingCourseActions.ActionTypes.REMOVE_OR_REINVITE_ASSIGNED_USERS_ACTION:
            {
                return Object.assign({}, state, { IsRemoveOrReInviteComplete: false });
            }
        case TrainingCourseActions.ActionTypes.REMOVE_OR_REINVITE_ASSIGNED_USERS_COMPLETE_ACTION:
            {
                return Object.assign({}, state, { IsRemoveOrReInviteComplete: true });
            }
        default:
            return state;
    }
}


export function getTrainingCourseList(state$: Observable<TrainingCourseState>): Observable<Immutable.List<TrainingCourse>> {
    return state$.select(s => s && s.TrainingCourseList);
};

export function getTrainingCourseState(state$: Observable<TrainingCourseState>): Observable<TrainingCourseState> {
    return state$.select(s => s);
};

export function getTrainingCourseTotalRecords(state$: Observable<TrainingCourseState>): Observable<number> {
    return state$.select(s => s && s.TrainingCoursePagingInfo && s.TrainingCoursePagingInfo.TotalCount);
};

export function gettTrainingCourseInProgressStatus(state$: Observable<TrainingCourseState>): Observable<boolean> {
    return state$.select(s => !isNullOrUndefined(s) && s.IsTrainingCourseAddUpdateInProgress);
}

export function addTrainingCourse(state$: Observable<TrainingCourseState>): Observable<TrainingCourse> {
    return state$.select(s => s.TrainingCourseAddUpdateFormData);
}

export function getDeleteTrainingCourseStatus(state$: Observable<TrainingCourseState>): Observable<boolean> {
    return state$.select(s => !isNullOrUndefined(s) && s.IsTrainingCourseDeleteInProgress);
}

export function getTrainingCourseForSelectedId(state$: Observable<TrainingCourseState>): Observable<TrainingCourse> {
    return state$.select(s => s.TrainingCourseAddUpdateFormData);
}

export function getTrainingCourseListDataTableOptions(state$: Observable<TrainingCourseState>): Observable<DataTableOptions> {
    return state$.select(state => state && state.TrainingCoursePagingInfo && state.TrainingCourseSortingInfo && extractDataTableOptions(state.TrainingCoursePagingInfo,state.TrainingCourseSortingInfo));
}

export function getTrainingCourseListDataLoading(state$: Observable<TrainingCourseState>): Observable<boolean> {
    return state$.select(s => !isNullOrUndefined(s) && s.isTrainingCourseListLoading);
};

export function getTrainingModulesData(state$: Observable<TrainingCourseState>): Observable<TrainingModule[]> {
    return state$.select(s => s && s.TrainingModuleList);
};
export function getTrainingSelectedModulesData(state$: Observable<TrainingCourseState>): Observable<TrainingCourse> {
    return state$.select(s => s && s.SelectedTrainingModuleList);
};
export function getTrainingCourseUserModulesData(state$: Observable<TrainingCourseState>): Observable<Immutable.List<TrainingCourseUserModule>> {
    return state$.select(s => s && s.TrainingCourseUserModuleList);
};
export function getTrainingCourseUserModulesDataLoading(state$: Observable<TrainingCourseState>): Observable<boolean> {
    return state$.select(s => !isNullOrUndefined(s) && s.isTrainingCourseModuleListLoading);
};
export function getTrainingCourseUserModulesDataTableoptions(state$: Observable<TrainingCourseState>): Observable<DataTableOptions> {
    return state$.select(state => state && state.TrainingCourseUserModulePagingInfo && extractDataTableOptions(state.TrainingCourseUserModulePagingInfo));
};
export function getTrainingCourseUserModulesTotalRecords(state$: Observable<TrainingCourseState>): Observable<number> {
    return state$.select(s => s && s.TrainingCourseUserModulePagingInfo && s.TrainingCourseUserModulePagingInfo.TotalCount);
};
export function getAssignedUsersInviteStatus(state$: Observable<TrainingCourseState>): Observable<boolean> {
    return state$.select(s => s && s.IsAssignedUsersInviteComplete);
};
export function getPublicUserInviteStatus(state$: Observable<TrainingCourseState>): Observable<boolean> {
    return state$.select(s => s && s.IsPublicUserInviteComplete);
};
export function getRemoveOrReInviteStatus(state$: Observable<TrainingCourseState>): Observable<boolean> {
    return state$.select(s => s && s.IsRemoveOrReInviteComplete);
};