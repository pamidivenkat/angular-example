import { Menu } from '../models/menu';
import { Observable } from 'rxjs/Rx';
import { RestClientService } from '../../shared/data/rest-client.service';
import { Http, URLSearchParams } from '@angular/http';
import { Action, Store } from '@ngrx/store';
import { Actions, Effect } from '@ngrx/effects';
import { Injectable } from '@angular/core';
import * as fromRoot from '../../shared/reducers/index';
import * as menuActions from './../actions/menu.actions';

@Injectable()
export class MenuEffects {
    constructor(private _data: RestClientService, private _actions$: Actions, private _store: Store<fromRoot.State>) {

    }
    @Effect()
    menus$: Observable<Action> = this._actions$.ofType(menuActions.ActionTypes.LOAD_MENU)
        .switchMap(() => {
            return this._data.get('menuapi')
        })
        .map((res) => {
            return new menuActions.LoadMenuCompleteAction(res.json() as Menu[]);
        });
    
}