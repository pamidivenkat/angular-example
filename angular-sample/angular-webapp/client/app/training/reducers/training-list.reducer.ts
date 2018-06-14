import { PagingInfo } from '../../atlas-elements/common/models/ae-paging-info';
import { isNullOrUndefined } from 'util';
import { extractDataTableOptions } from '../../shared/helpers/extract-helpers';
import { MyTraining } from '../../home/models/my-training';
import { Observable } from 'rxjs/Rx';
import { Action } from '@ngrx/store';
import { AeSortModel } from '../../atlas-elements/common/models/ae-sort-model';
import { AtlasApiResponse } from '../../shared/models/atlas-api-response';
import { DataTableOptions } from '../../atlas-elements/common/models/ae-datatable-options';
import * as Immutable from 'immutable';
import * as trainingListActions from '../actions/training-list.actions';
export interface TrainingListState {
    loading: boolean;
    data: Immutable.List<MyTraining>;
    filters: Map<string, string>;
    pagingInfo: PagingInfo;
    sortInfo: AeSortModel;
}

const initialState: TrainingListState = {
    loading: false,
    data: null,
    filters: null,
    pagingInfo: null,
    sortInfo: null,
}


export function reducer(state = initialState, action: Action): TrainingListState {
    switch (action.type) {

        case trainingListActions.ActionTypes.LOAD_TRAININGS: {
            return Object.assign({}, state, { loading: true });
        }
        case trainingListActions.ActionTypes.LOAD_TRAININGS_COMPLETE: {
            let modifiedState = Object.assign({}, state, { loading: false, data: action.payload.data });
            if (!isNullOrUndefined(modifiedState.pagingInfo)) {
                if (action.payload.pagingInfo.PageNumber == 1) {
                    modifiedState.pagingInfo.TotalCount = action.payload.pagingInfo.TotalCount;
                }
                modifiedState.pagingInfo.PageNumber = action.payload.pagingInfo.PageNumber;
                modifiedState.pagingInfo.Count = action.payload.pagingInfo.Count;
            }
            else {
                modifiedState.pagingInfo = action.payload.pagingInfo;
            }
            if (isNullOrUndefined(modifiedState.sortInfo)) {
                modifiedState.sortInfo = <AeSortModel>{};
                modifiedState.sortInfo.SortField = 'StartDate';
                modifiedState.sortInfo.Direction = 1;
            }
            return modifiedState;
        }

        case trainingListActions.ActionTypes.SET_DEFAULT_FILTERS: {
            return Object.assign({}, state, { loading: true, filters: action.payload });
        }

        case trainingListActions.ActionTypes.LOAD_TRAININGS_ON_PAGE_CHANGE: {
            return Object.assign({}, state, { loading: true, pagingInfo: Object.assign({}, state.pagingInfo, { PageNumber: action.payload.pageNumber, Count: action.payload.noOfRows }) });
        }
        case trainingListActions.ActionTypes.LOAD_TRAININGS_ON_FILTER_CHANGE: {
            state.pagingInfo.PageNumber = 1;
            return Object.assign({}, state, { loading: true, filters: action.payload });
        }
        case trainingListActions.ActionTypes.LOAD_TRAININGS_ON_SORT: {
            if (!isNullOrUndefined(state.pagingInfo)) {
                state.pagingInfo.PageNumber = 1;
            }
            return Object.assign({}, state, { loading: true, sortInfo: Object.assign({}, state.sortInfo, { SortField: action.payload.SortField, Direction: action.payload.Direction }) });
        }

        default:
            return state;
    }
}

export function getTrainingListData(state$: Observable<TrainingListState>): Observable<Immutable.List<MyTraining>> {
    return state$.select(state => state && state.data);
};

export function getTrainingsListTotalCount(state$: Observable<TrainingListState>): Observable<number> {
    return state$.select(state => state.pagingInfo && state.pagingInfo.TotalCount);
}

export function getTrainingsListDataTableOptions(state$: Observable<TrainingListState>): Observable<DataTableOptions> {
    return state$.select(state => state.pagingInfo && state.sortInfo &&  extractDataTableOptions(state.pagingInfo,state.sortInfo));
}

export function getTrainingsLoadingStatus(state$: Observable<TrainingListState>): Observable<boolean> {
    return state$.select(state => state && state.loading);
}
