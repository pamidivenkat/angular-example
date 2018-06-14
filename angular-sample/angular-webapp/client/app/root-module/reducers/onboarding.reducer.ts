import { Observable } from 'rxjs/Rx';
import { Action } from '@ngrx/store';
import { Onboarding } from '../models/onboarding';
import * as onBoardingActions from '../actions/onboarding.actions';

export interface OnBoardingState {
    status: boolean,
    entities : Onboarding[]
}

const initialState = {
    status: false,
    entities : []
}

export function reducer(state = initialState, action : Action) : OnBoardingState{
    switch(action.type){
        case onBoardingActions.ActionTypes.LOAD_ONBOARDING_STEPS:
        {
            return Object.assign({}, state, {status : false});
        }
        case onBoardingActions.ActionTypes.LOAD_ONBOARDING_STEPS_COMPLETE:
        {
            return Object.assign({}, state, {status: true, entities: action.payload });
        }
    }
}
 
 export function getOnBoardingSteps(state$ : Observable<OnBoardingState>) : Observable<Onboarding[]>{
    return state$.select(s => s && s.entities);
 }