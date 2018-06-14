import { AeInformationBarItem } from '../../atlas-elements/common/models/ae-informationbar-item';
import { Observable } from 'rxjs/Rx';
import { Action } from '@ngrx/store';
import * as taskHeadBannerActions from '../actions/task-information-bar.actions';

export interface TaskInformationBannerState {
    status: boolean,
    entities: AeInformationBarItem[]
}

const initialState = {
    status: false,
    entities: []
}

export function reducer(state = initialState, action: Action): TaskInformationBannerState {
    switch (action.type) {
        case taskHeadBannerActions.ActionTypes.LOAD_TASKHEADBANNER:
            {
                return Object.assign({}, state, { status: false });
            }
        case taskHeadBannerActions.ActionTypes.LOAD_TASKHEADBANNER_COMPLETE:
            {
                return Object.assign({}, state, { status: true, entities: action.payload });
            }
        default:
            return state;
    }
}

export function getTaskHeadBannerData(state$: Observable<TaskInformationBannerState>): Observable<AeInformationBarItem[]> {
    return state$.select(s => s.entities);
}

export function taskHeadBannerLoadStatus(state$: Observable<TaskInformationBannerState>): Observable<boolean> {
    return state$.select(s => s.status);
}