import {TrainingCourse } from '../models/training-course.models';
import { Action } from '@ngrx/store';
import { type } from '../../shared/util';

export const ActionTypes = {
    TRAINING_COURSE_LOAD: type('[TRAINING-COURSE] Load training courses'),
    TRAINING_COURSE_LOAD_COMPLETE: type('[TRAINING-COURSE] Load training courses complete'),
    TRAINING_COURSE_CREATE: type('[TRAINING-COURSE] Create training course'),
    TRAINING_COURSE_CREATE_COMPLETE: type('[TRAINING-COURSE] Create training course complete'),
    TRAINING_COURSE_GET: type('[TRAINING-COURSE] Get training course'),
    TRAINING_COURSE_GET_COMPLETE: type('[TRAINING-COURSE] Get training course complete')
};

export class TrainingCourseLoadAction implements Action {
    type = ActionTypes.TRAINING_COURSE_LOAD;
    constructor(public payload: any) {

    }
}

export class TrainingCourseLoadCompleteAction implements Action {
    type = ActionTypes.TRAINING_COURSE_LOAD_COMPLETE;
    constructor(public payload: Array<TrainingCourse>) {

    }
}
export class TrainingCourseCreateAction implements Action {
    type = ActionTypes.TRAINING_COURSE_CREATE;
    constructor(public payload: TrainingCourse) {

    }
}
export class TrainingCourseCreateCompleteAction implements Action {
    type = ActionTypes.TRAINING_COURSE_CREATE_COMPLETE;
    constructor(public payload: boolean) {

    }
}
export class TrainingCourseGetAction implements Action {
    type = ActionTypes.TRAINING_COURSE_GET;
    // payload is employee id
    constructor(public payload: any) {

    }
}
export class TrainingCourseGetCompleteAction implements Action {
    type = ActionTypes.TRAINING_COURSE_GET_COMPLETE;
    constructor(public payload: TrainingCourse) {

    }
}

export type Actions = TrainingCourseLoadAction 
    | TrainingCourseLoadCompleteAction
    | TrainingCourseCreateAction
    | TrainingCourseCreateCompleteAction
    | TrainingCourseGetAction
    | TrainingCourseGetCompleteAction;
   