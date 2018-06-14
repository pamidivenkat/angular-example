import { AeInformationBarItem } from '../../atlas-elements/common/models/ae-informationbar-item';
import { Company } from "../models/company";
import { Action } from "@ngrx/store";
import * as companyActions from '../actions/company.actions';
import { Observable } from "rxjs/Observable";

export interface CurrentCompanyState {
    Status: boolean,
    Company: Company
    CompanyInformationItems: AeInformationBarItem[],
}

const initialState = {
    Status: false,
    Company: null,
    CompanyInformationItems: null

}
export function CompanyReducer(state = initialState, action: Action): CurrentCompanyState {
    switch (action.type) {
        case companyActions.ActionTypes.COMPANY_LOAD_DATA:
            {
                return Object.assign({}, state);
            }
        case companyActions.ActionTypes.COMPANY_LOAD_DATA_COMPLETE:
            {
                return Object.assign({}, state, { Company: action.payload });
            }

        case companyActions.ActionTypes.COMPANY_INFORMATION_COMPONENT: {
            return Object.assign({}, state);
        }

        case companyActions.ActionTypes.COMPANY_INFORMATION_COMPONENT_COMPLETE: {
            return Object.assign({}, state, { CompanyInformationItems: action.payload });
        }
        case companyActions.ActionTypes.UPLOAD_COMPANY_LOGO:
            {
                return Object.assign({}, state);
            }
        case companyActions.ActionTypes.UPLOAD_COMPANY_LOGO_COMPLETE:
            {
                return Object.assign({}, state);
            }

        default:
            return state;
    }

}

export function getCurrentCompanyDetails(state$: Observable<CurrentCompanyState>): Observable<Company> {
    return state$.select(s => s.Company);
}

export function getCurrentCompanyInformationComponent(state$: Observable<CurrentCompanyState>): Observable<AeInformationBarItem[]> {
    return state$.select(state => state && state.CompanyInformationItems);
};
