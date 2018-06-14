import { ConstructionPhasePlansLoadAction } from '../actions/construction-phase-plans.actions';
import { ConstructionPhasePlan } from '../models/construction-phase-plans';
import { AtlasApiRequestWithParams, AtlasApiResponse } from '../../shared/models/atlas-api-response';
import { Store } from '@ngrx/store';
import { Injectable, OnInit } from '@angular/core';
import * as fromRoot from '../../shared/reducers/index';


@Injectable()
export class ConstructionPhasePlanService implements OnInit {
    constructor(private _store: Store<fromRoot.State>) {

    }

    ngOnInit() {

    }
    loadConstructionPhasePlans(atlasApiRequestWithParams: AtlasApiRequestWithParams) {
        this._store.dispatch(new ConstructionPhasePlansLoadAction(atlasApiRequestWithParams));
    }

}