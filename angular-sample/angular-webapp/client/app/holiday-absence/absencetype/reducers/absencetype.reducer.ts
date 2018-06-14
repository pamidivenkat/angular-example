import { MyAbsence } from '../../models/holiday-absence.model';
import { isNullOrUndefined } from 'util';
import { AeSelectItem } from './../../../atlas-elements/common/models/ae-select-item';
import { AtlasApiRequestWithParams } from './../../../shared/models/atlas-api-response';
import { AtlasApiResponse } from './../../../shared/models/atlas-api-response';
import { Observable } from 'rxjs/Rx';
import { Action } from '@ngrx/store';

import * as absenceTypeActions from './../actions/absencetype.actions';
import { AbsenceType } from './../../../shared/models/company.models';




export interface AbsenceTypeState {

    AbsenceType: String;
    CurrentAbsenceType: AbsenceType;
    IsAbsenceTypeAddUpdateInProgress: boolean;
    AbsenceTypeGetStatus: boolean;

}

const initialState: AbsenceTypeState = {

    AbsenceType: null,
    CurrentAbsenceType: null,
    IsAbsenceTypeAddUpdateInProgress: false,
    AbsenceTypeGetStatus: false,
}

export function reducer(state = initialState, action: Action): AbsenceTypeState {
    switch (action.type) {

        case absenceTypeActions.ActionTypes.ABSENCE_TYPE_ADD:
            {
                return Object.assign({}, state, { IsAbsenceTypeAddUpdateInProgress: true });
            }
        case absenceTypeActions.ActionTypes.ABSENCE_TYPE_ADD_COMPLETE:
            {
                return Object.assign({}, state, { IsAbsenceTypeAddUpdateInProgress: false, CurrentAbsenceType: action.payload });
            }
        case absenceTypeActions.ActionTypes.ABSENCE_TYPE_DETAILS_BY_ID_LOAD:
            {
                return Object.assign({}, state, { AbsenceTypeGetStatus: false, IsAbsenceTypeAddUpdateInProgress: true, CurrentAbsenceType: null });
            }
        case absenceTypeActions.ActionTypes.ABSENCE_TYPE_DETAILS_BY_ID_LOADCOMPLETE:
            {
                return Object.assign({}, state, { AbsenceTypeGetStatus: true, IsAbsenceTypeAddUpdateInProgress: false, CurrentAbsenceType: action.payload });
            }
        case absenceTypeActions.ActionTypes.ABSENCE_TYPE_UPDATE:
            {
                return Object.assign({}, state, { IsAbsenceTypeAddUpdateInProgress: true });
            }
        case absenceTypeActions.ActionTypes.ABSENCE_TYPE_UPDATE_COMPLETE:
            {
                return Object.assign({}, state, { AbsenceTypeGetStatus: false, IsAbsenceTypeAddUpdateInProgress: false, CurrentAbsenceType: null });
            }
        case absenceTypeActions.ActionTypes.ABSENCE_TYPE_REMOVE:
            {
                return Object.assign({}, state, { IsAbsenceTypeAddUpdateInProgress: true });
            }
        case absenceTypeActions.ActionTypes.ABSENCE_TYPE_REMOVE_COMPLETE:
            {
                return Object.assign({}, state, { IsAbsenceTypeAddUpdateInProgress: false, CurrentAbsenceType: action.payload });
            }
        default:
            return state;
    }
}

/*** AbsenceType Listing Start ***/


export function getAbsenceTypeProgressStatus(state$: Observable<AbsenceTypeState>): Observable<boolean> {
    return state$.select(s => s.IsAbsenceTypeAddUpdateInProgress);
}
export function getAbsenceTypeGetStatus(state$: Observable<AbsenceTypeState>): Observable<boolean> {
    return state$.select(s => s.AbsenceTypeGetStatus);
}
/*** AbsenceType Listing End ***/