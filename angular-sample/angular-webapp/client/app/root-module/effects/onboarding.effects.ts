import { Observable } from 'rxjs/Rx';
import { Action, Store } from '@ngrx/store';
import { Actions, Effect } from '@ngrx/effects';
import { RestClientService } from '../../shared/data/rest-client.service';
import { Injectable } from '@angular/core';
import * as fromRoot from '../../shared/reducers/index';
import * as onBoardingActions from '../actions/onboarding.actions';

@Injectable()
export class OnBoardingEffects {
    constructor(private _data: RestClientService, private _actions$: Actions, private _store: Store<fromRoot.State>) {

    }
    @Effect()
    onBoardingStatus$: Observable<Action> = this._actions$.ofType(onBoardingActions.ActionTypes.LOAD_ONBOARDING_STEPS)
    .switchMap((action) => {
        return this._data.get('wizard?status=true');
    })
    .map((res) =>{
        return new onBoardingActions.LoadOnBoardingStepsCompleteAction(res.json());
    });
}

