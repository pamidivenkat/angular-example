import { LoadCompanyEmployeesAction } from './../../manage-departments/actions/manage-departments.actions';
import { Site } from '../models/site.model';
import { AtlasApiRequestWithParams } from '../../../shared/models/atlas-api-response';
import { AeSortModel } from '../../../atlas-elements/common/models/ae-sort-model';
import { PagingInfo } from '../../../atlas-elements/common/models/ae-paging-info';
import { Store } from '@ngrx/store';
import { Injectable, OnInit } from '@angular/core';
import * as fromRoot from '../../../shared/reducers/index';
import {
    RemoveSiteAction,
    SiteAssignmentsLoadAction,
    SitesLoadAction,
    UpdateSiteAction
} from '../actions/sites.actions';

@Injectable()
export class SitesService implements OnInit {

    constructor(private _store: Store<fromRoot.State>) { }

    ngOnInit() { }

    LoadSites(atlasApiRequestWithParams: AtlasApiRequestWithParams) {
        this._store.dispatch(new SitesLoadAction(atlasApiRequestWithParams));
    }

    LoadSiteAssignments() {
        this._store.dispatch(new SiteAssignmentsLoadAction(true));
    }

    RemoveSite(site: Site) {
        this._store.dispatch(new RemoveSiteAction(site));
    }

    UpdateSite(site: Site) {
        this._store.dispatch(new UpdateSiteAction(site));
    }

    LoadAllEmployees(){
         this._store.dispatch(new LoadCompanyEmployeesAction(true));
    }
}