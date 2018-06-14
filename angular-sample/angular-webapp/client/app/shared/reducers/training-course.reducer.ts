import { isNullOrUndefined } from 'util';
import { TrainingCourse } from '../models/training-course.models';
import { Observable } from 'rxjs/Rx';
import { Action, ActionReducer, combineReducers } from '@ngrx/store';
import * as trainingCourseActions from '../actions/training-course.actions';
import { compose } from '@ngrx/core';
import { AtlasApiResponse } from '../../shared/models/atlas-api-response';

export interface TrainingCourseState {
    HasTrainingCourseListLoaded: boolean,
    TrainingCourseList: Array<TrainingCourse>,
    CurrentTrainingCourse: TrainingCourse,
    IsTrainingCourseAddUpdateInProgress: boolean,
    TrainingCourseGetStatus: boolean,
}

const initialState = {
    HasTrainingCourseListLoaded: false,
    TrainingCourseList: null,
    CurrentTrainingCourse: null,
    IsTrainingCourseAddUpdateInProgress: false,
    TrainingCourseGetStatus: false,
};

export function trainingCourseReducer(state = initialState, action: Action): TrainingCourseState {
    let currentState: TrainingCourseState;
    switch (action.type) {
        case trainingCourseActions.ActionTypes.TRAINING_COURSE_LOAD:
            currentState = Object.assign({}, state, { HasTrainingCourseListLoaded: false });
            break;
        case trainingCourseActions.ActionTypes.TRAINING_COURSE_LOAD_COMPLETE:
            currentState = Object.assign({}, state, { HasTrainingCourseListLoaded: true, TrainingCourseList: action.payload });
            break;
        case trainingCourseActions.ActionTypes.TRAINING_COURSE_CREATE:
            currentState = Object.assign({}, state, { IsTrainingCourseAddUpdateInProgress: true });
            break;
        case trainingCourseActions.ActionTypes.TRAINING_COURSE_CREATE_COMPLETE:
            currentState = Object.assign({}, state, { IsTrainingCourseAddUpdateInProgress: false, CurrentTrainingCourse: action.payload });
            break;
        case trainingCourseActions.ActionTypes.TRAINING_COURSE_GET:
            currentState = Object.assign({}, state, { TrainingCourseGetStatus: false, IsTrainingCourseAddUpdateInProgress: true, CurrentTrainingCourse: null });
            break;
        case trainingCourseActions.ActionTypes.TRAINING_COURSE_GET_COMPLETE:
            currentState = Object.assign({}, state, { TrainingCourseGetStatus: true, IsTrainingCourseAddUpdateInProgress: false, CurrentTrainingCourse: action.payload });
            break;
        default:
            currentState = state;
            break;
    }
    return currentState;
}


export function trainingCourseListDataLoadStatus(state$: Observable<TrainingCourseState>): Observable<boolean> {
    return state$.select(s => s.HasTrainingCourseListLoaded);
}
export function getNonAtlasTrainingCourseList(state$: Observable<TrainingCourseState>): Observable<TrainingCourse[]> {
    return state$.select(s => s.TrainingCourseList && s.TrainingCourseList.filter(obj => !obj.IsAtlasTraining).sort((a, b) => { return a.Title > b.Title ? 1 : -1 }));
}
export function getAllTrainingCourseList(state$: Observable<TrainingCourseState>): Observable<TrainingCourse[]> {
    return state$.select(s => s.TrainingCourseList  && s.TrainingCourseList.filter(obj => !obj.IsAtlasTraining || (obj.IsAtlasTraining && !obj.IsCompleted)));
}
export function getTrainingCourseProgressStatus(state$: Observable<TrainingCourseState>): Observable<boolean> {
    return state$.select(s => s.IsTrainingCourseAddUpdateInProgress);
}
export function getTrainingCourseGetStatus(state$: Observable<TrainingCourseState>): Observable<boolean> {
    return state$.select(s => s.TrainingCourseGetStatus);
}
