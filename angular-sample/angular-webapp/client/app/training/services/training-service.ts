import { Injectable, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';

import * as fromRoot from '../../shared/reducers/index';
import { LoadTrainingsAction, SetDefaultFiltersAction } from '../actions/training-list.actions';

@Injectable()
export class TrainingService implements OnInit {
    // Private Fields
    // End of Private Fields

    // Public properties
    // End of Public properties

    // constructor
    constructor(private _store: Store<fromRoot.State>) {

    }
    // End of constructor

    ngOnInit() {

    }

    // Private methods

    _loadTrainings() {
        this._store.dispatch(new LoadTrainingsAction(true));
    }

   
    _setDefaultFilters(filters: Map<string, string>) {
        this._store.dispatch(new SetDefaultFiltersAction(filters));
    }

     // End of Private methods

}