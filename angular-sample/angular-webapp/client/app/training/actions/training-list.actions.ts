import { AeSortModel } from '../../atlas-elements/common/models/ae-sort-model';
import { MyTraining } from '../../home/models/my-training';
import { AtlasApiResponse } from '../../shared/models/atlas-api-response';
import { Action } from '@ngrx/store';
import { type } from '../../shared/util';

export const ActionTypes = {
    LOAD_TRAININGS: type('[Training] Load training list'),
    LOAD_TRAININGS_COMPLETE: type('[Training] Load training list complete'),
    SET_DEFAULT_FILTERS: type('[Training] Set default filters'),
    LOAD_TRAININGS_ON_PAGE_CHANGE: type('[Training] Load training list on page change'),
    LOAD_TRAININGS_ON_FILTER_CHANGE: type('[Training] Load training list on filter change'),
    LOAD_TRAININGS_ON_SORT: type('[Training] Load training list on sort'),
    UPDATE_TRAININGCOURSE_STATUS: type('[Training] Update training course status'),
    UPDATE_PASSED_TRAININGS: type('[Training] Update trainings that are already passed in local memory'),
    UPDATE_PASSED_TRAININGS_COMPLETE: type('[Training] Update trainings that are already passed in local memory complete'),
}


export class LoadTrainingsAction implements Action {
    type = ActionTypes.LOAD_TRAININGS;
    constructor(public payload: boolean) {

    }
}

export class LoadTrainingsCompleteAction implements Action {
    type = ActionTypes.LOAD_TRAININGS_COMPLETE;
    constructor(public payload: any) {
    }
}


export class SetDefaultFiltersAction implements Action {
    type = ActionTypes.SET_DEFAULT_FILTERS;
    constructor(public payload: Map<string, string>) {

    }
}


export class LoadTrainingsOnPageChangeAction implements Action {
    type = ActionTypes.LOAD_TRAININGS_ON_PAGE_CHANGE;
    constructor(public payload: { pageNumber: number, noOfRows: number }) {

    }
}

export class LoadTrainingsOnFilterChangeAction implements Action {
    type = ActionTypes.LOAD_TRAININGS_ON_FILTER_CHANGE;
    constructor(public payload: Map<string, string>) {

    }
}


export class LoadTrainingsOnSortAction implements Action {
    type = ActionTypes.LOAD_TRAININGS_ON_SORT;
    constructor(public payload: AeSortModel) {

    }
}

export class UpdateTrainingCourse implements Action {
    type = ActionTypes.UPDATE_TRAININGCOURSE_STATUS;
    constructor(public payload: any) {
    }
}

export class UpdatePassedTrainings implements Action {
    type = ActionTypes.UPDATE_PASSED_TRAININGS;
    constructor(public payload: Array<string>) {

    }
}

export class UpdatePassedTrainingsComplete implements Action {
    type = ActionTypes.UPDATE_PASSED_TRAININGS_COMPLETE;
    constructor(public payload: any) {
        
    }
}


export type Actions = LoadTrainingsAction
    | UpdatePassedTrainings
    | UpdatePassedTrainingsComplete
    | LoadTrainingsCompleteAction
    | SetDefaultFiltersAction
    | LoadTrainingsOnFilterChangeAction
    | LoadTrainingsOnPageChangeAction
    | LoadTrainingsOnSortAction
    | UpdateTrainingCourse; 