
import { type } from "../../shared/util";
import { Action } from "@ngrx/store";
import { CompanySiteView } from "../models/company-site-view";

export const ActionTypes = {
    LOAD_COMPANY_STRUCTURE: type('[CompanySiteView] Load company structure'),
    LOAD_COMPANY_STRUCTURE_COMPLETE: type('[CompanySiteView] Load company structure complete')
}

export class LoadCompanyStructureAction implements Action {
    type = ActionTypes.LOAD_COMPANY_STRUCTURE;
    constructor(public payload: boolean) {

    }
}

export class LoadCompanyStructureCompleteAction implements Action {
    type = ActionTypes.LOAD_COMPANY_STRUCTURE_COMPLETE;
    constructor(public payload: Array<CompanySiteView>) {

    }
}


export type Actions = LoadCompanyStructureAction | LoadCompanyStructureCompleteAction;