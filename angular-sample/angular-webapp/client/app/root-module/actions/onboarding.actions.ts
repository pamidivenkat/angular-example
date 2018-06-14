import { Onboarding } from '../models/onboarding';
import { Constructor } from 'make-error';
import { Action } from '@ngrx/store';
import { type } from '../../shared/util';

export const ActionTypes = {
    LOAD_ONBOARDING_STEPS: type('[OnBoarding] load steps'),
    LOAD_ONBOARDING_STEPS_COMPLETE: type('[OnBoarding] load steps completed')
}

export class LoadOnBoardingStepsAction implements Action{
    type = ActionTypes.LOAD_ONBOARDING_STEPS;
    constructor(public payload : boolean){ }
}

export class LoadOnBoardingStepsCompleteAction implements Action{
    type = ActionTypes.LOAD_ONBOARDING_STEPS_COMPLETE;
    constructor(public payload: Onboarding[]){ }
}

export type Actions = LoadOnBoardingStepsAction | LoadOnBoardingStepsCompleteAction;
 