import { AtlasApiRequestWithParams } from '../../../shared/models/atlas-api-response';
import { Site } from '../models/site.model';
import { AeSortModel } from '../../../atlas-elements/common/models/ae-sort-model';
import { Actions } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { type } from '../../../shared/util';

export const ActionTypes = {
    SITES_LIST_LOAD: type('[SITES], load list of sites'),
    SITES_LIST_LOAD_COMPLETE: type('[SITES], load list of sites complete'),
    SITE_ASSIGNMENTS_LOAD: type('[SITES], load site assignments'),
    SITE_ASSIGNMENTS_LOAD_COMPLETE: type('[SITES], load site assignments complete'),
    REMOVE_SITE: type('[SITES], remove site'),
    UPDATE_SITE: type('[SITES], upload site'),
    COMPANY_HO_ADDRESS: type('[SITES], load company HO address'),
    COMPANY_HO_ADDRESS_COMPLETE: type('[SITES], load lcompany HO address complete'),
    SITES_BY_ID_LOAD: type('[SITES], load site by id'),
    SITES_BY_ID_LOAD_COMPLETE: type('[SITES], load site by id complete'),
    SITES_SELECTED_SITE_CLEAR: type('[SITES], clear selected site')
}

export class SelectedSiteClear implements Action {
    type = ActionTypes.SITES_SELECTED_SITE_CLEAR;
    constructor(public payload: string) {

    }
}

export class SiteLoadByIdCompleteAction implements Action {
    type = ActionTypes.SITES_BY_ID_LOAD_COMPLETE;
    constructor(public payload: Site) {

    }
}

export class SiteLoadByIdAction implements Action {
    type = ActionTypes.SITES_BY_ID_LOAD;
    constructor(public payload: string) {

    }
}


export class SitesLoadAction implements Action {
    type = ActionTypes.SITES_LIST_LOAD;
    constructor(public payload: AtlasApiRequestWithParams) {

    }
}

export class SitesLoadCompleteAction implements Action {
    type = ActionTypes.SITES_LIST_LOAD_COMPLETE;
    constructor(public payload: any) {

    }
}

export class SiteAssignmentsLoadAction implements Action {
    type = ActionTypes.SITE_ASSIGNMENTS_LOAD;
    constructor(public payload: any) {

    }
}

export class SiteAssignmentsLoadCompleteAction implements Action {
    type = ActionTypes.SITE_ASSIGNMENTS_LOAD_COMPLETE;
    constructor(public payload: any) {

    }
}

export class RemoveSiteAction implements Action {
    type = ActionTypes.REMOVE_SITE;
    constructor(public payload: Site) {
    }
}

export class UpdateSiteAction implements Action {
    type = ActionTypes.UPDATE_SITE;
    constructor(public payload: Site) {
    }
}
export class CompanyHOAddressAction implements Action {
    type = ActionTypes.COMPANY_HO_ADDRESS;
    constructor() {

    }
}
export class CompanyHOAddressCompleteAction implements Action {
    type = ActionTypes.COMPANY_HO_ADDRESS_COMPLETE;
    constructor(public payload: string) {

    }
}

export type Actions = SitesLoadAction
    | SitesLoadCompleteAction
    | SiteAssignmentsLoadAction
    | SiteAssignmentsLoadCompleteAction
    | RemoveSiteAction
    | UpdateSiteAction
    | CompanyHOAddressAction
    | CompanyHOAddressCompleteAction
    | SiteLoadByIdAction
    | SiteLoadByIdCompleteAction
