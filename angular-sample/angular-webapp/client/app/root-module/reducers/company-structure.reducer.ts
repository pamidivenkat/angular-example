import { Action } from "@ngrx/store";
import * as companyStructureActions from '../actions/company-structure.actions';
import { CompanySiteView } from "../models/company-site-view";
import { Observable } from "rxjs/Observable";
import { getCompanyStructure, getSiteStructure } from "../common/extract-helpers";

export interface CompanyStructureState {
    companyStructure: Array<CompanySiteView>;
}

const initialState = {
    companyStructure: null,
}


export function reducer(state = initialState, action: Action): CompanyStructureState {
    switch (action.type) {
        case companyStructureActions.ActionTypes.LOAD_COMPANY_STRUCTURE:
            {
                return Object.assign({}, state, {});
            }
        case companyStructureActions.ActionTypes.LOAD_COMPANY_STRUCTURE_COMPLETE:
            {
                return Object.assign({}, state, { companyStructure: action.payload });
            }
        default:
            return state;
    }
}

export function getcompanyStructureData(state$: Observable<CompanyStructureState>): Observable<Array<CompanySiteView>> {
    return state$.select(s => getCompanyStructure(s.companyStructure));
}

export function getSiteStructureData(state$: Observable<CompanyStructureState>): Observable<Array<CompanySiteView>> {
    return state$.select(s => getSiteStructure(s.companyStructure));
}