import { MyTraining } from './../models/my-training';
import { AtlasApiResponse } from './../../shared/models/atlas-api-response';
import { ClaimsHelperService } from './../../shared/helpers/claims-helper';
import { type } from './../../shared/util';
import { Action } from '@ngrx/store';

export const ActionTypes = {
    MY_TRAINING_LOAD: type('[My Trainings] My trainings Load'),
    MY_TRAINING_LOAD_COMPLETE: type('[My Trainings] My trainings Load complete'),
    MY_TEAM_TASKS_COUNT: type('[Trainings] My team tasks count'),
    MY_TEAM_TASKS_COUNT_COMPLETE: type('[Trainings] My team tasks count complete')
}

export class MyTrainingLoadAction implements Action {
    type = ActionTypes.MY_TRAINING_LOAD;
    constructor(public payload: string) {

    }
}

export class MyTrainingLoadCompleteAction implements Action {
    type = ActionTypes.MY_TRAINING_LOAD_COMPLETE;
    constructor(public payload: AtlasApiResponse<MyTraining>) {

    }
}

export class MyTeamTrainingTasksCountAction implements Action {
    type = ActionTypes.MY_TEAM_TASKS_COUNT;
    constructor(public payload: string) {

    }
}

export class MyTeamTrainingTasksCountCompleteAction implements Action {
    type = ActionTypes.MY_TEAM_TASKS_COUNT_COMPLETE;
    constructor(public payload: boolean) {

    }
}

export type Actions = MyTrainingLoadAction
    | MyTrainingLoadCompleteAction
    | MyTeamTrainingTasksCountAction
    | MyTeamTrainingTasksCountCompleteAction;