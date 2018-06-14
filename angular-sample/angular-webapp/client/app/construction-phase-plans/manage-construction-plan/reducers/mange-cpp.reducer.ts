import { CommonHelpers } from './../../../shared/helpers/common-helpers';
import { AtlasApiErrorEffects } from '../../../shared/effects/error.effects';
import { Document } from './../../../document/models/document';
import { extractDataTableOptions } from './../../../shared/helpers/extract-helpers';
import { isNullOrUndefined } from 'util';
import { Action } from '@ngrx/store';
import { AeSortModel } from './../../../atlas-elements/common/models/ae-sort-model';
import { ConstructionPhasePlan, CPPAdditionalInfo } from './../../models/construction-phase-plans';
import * as ManageCPPActions from '../actions/manage-cpp.actions';
import { Observable } from 'rxjs/Rx';
import * as Immutable from 'immutable';
import { AtlasApiResponse, AtlasApiRequest } from './../../../shared/models/atlas-api-response';
import { PagingInfo } from './../../../atlas-elements/common/models/ae-paging-info';
import { DataTableOptions } from './../../../atlas-elements/common/models/ae-datatable-options';

export interface ManageCPPState {
    ConstructionPhasePlan: ConstructionPhasePlan;
    HasCPPAdditionalInfoLoaded: boolean;
    CPPAddtionalInfo: CPPAdditionalInfo;
    Id: string;
    IsExample: boolean;
    CPPDocumentAPIRequest: AtlasApiRequest;
    CPPDocumentId: string;
}


const initialState: ManageCPPState = {
    ConstructionPhasePlan: null,
    HasCPPAdditionalInfoLoaded: false,
    CPPAddtionalInfo: null,
    Id: null,
    IsExample: false,
    CPPDocumentAPIRequest: null,
    CPPDocumentId: null
}

export function reducer(state = initialState, action: Action): ManageCPPState {
    switch (action.type) {
        case ManageCPPActions.ActionTypes.LOAD_CPP_BY_ID:
            {
                return Object.assign({}, state, { Id: action.payload.Id, IsExample: action.payload.IsExample });
            }
        case ManageCPPActions.ActionTypes.LOAD_CPP_BY_ID_COMPLETE:
            {
                let modifiedState = Object.assign({}, state, {});
                return Object.assign({}, modifiedState, { ConstructionPhasePlan: action.payload });
            }
        case ManageCPPActions.ActionTypes.LOAD_CPP_CLIENT_DETAILS_ID_COMPLETE:
            {
                let modifiedState = Object.assign({}, state, {});
                modifiedState.CPPAddtionalInfo = action.payload;
                modifiedState.HasCPPAdditionalInfoLoaded = true;
                return modifiedState;
            }
        case ManageCPPActions.ActionTypes.CLEAR_CPP:
            {
                let modifiedState: ManageCPPState;
                let pl = action.payload;
                if (isNullOrUndefined(pl)) {
                    //clear is requestd in add mode so we need to clear straight away...
                    modifiedState = Object.assign({}, initialState, {});
                } else {
                    //payload is requested with some Id
                    if (pl != state.Id) {
                        //when requested id is not matching with that of state id then clear it off..
                        modifiedState = Object.assign({}, initialState, {});
                    } else {
                        //assign existing state  
                        modifiedState = Object.assign({}, state, {});
                    }
                }
                return modifiedState;
            }
        case ManageCPPActions.ActionTypes.ADD_CPP:
            {
                let modifiedState = Object.assign({}, state, {});
                return Object.assign({}, modifiedState, { IsExample: action.payload.IsExample, ConstructionPhasePlan: action.payload });
            }
        case ManageCPPActions.ActionTypes.ADD_CPP_COMPLETE:
            {
                let modifiedState = Object.assign({}, state, {});
                return Object.assign({}, modifiedState, { IsExample: action.payload.IsExample, ConstructionPhasePlan: action.payload, Id: action.payload.Id });
            }
        case ManageCPPActions.ActionTypes.UPDATE_CPP:
            {
                let modifiedState = Object.assign({}, state, {});
                return Object.assign({}, modifiedState, { ConstructionPhasePlan: action.payload });
            }
        case ManageCPPActions.ActionTypes.UPDATE_CPP_COMPLETE:
            {
                let modifiedState = Object.assign({}, state, {});
                return Object.assign({}, modifiedState, { IsExample: action.payload.IsExample, ConstructionPhasePlan: action.payload, Id: action.payload.Id });
            }
        case ManageCPPActions.ActionTypes.ADD_CPP_CLIENT_DETAILS:
            {
                let modifiedState = Object.assign({}, state, {});
                modifiedState.ConstructionPhasePlan.CPPAdditionalInfo = action.payload;                
                return modifiedState;
            }
        case ManageCPPActions.ActionTypes.ADD_CPP_CLIENT_DETAILS_COMPLETE:
            {
                let modifiedState = Object.assign({}, state, {});
                modifiedState.ConstructionPhasePlan.CPPAdditionalInfo = action.payload;
                modifiedState.CPPAddtionalInfo = action.payload;
                return modifiedState;
            }
        case ManageCPPActions.ActionTypes.UPDATE_CPP_CLIENT_DETAILS:
            {
                let modifiedState = Object.assign({}, state, {});
                modifiedState.ConstructionPhasePlan.CPPAdditionalInfo = action.payload;
                 modifiedState.CPPAddtionalInfo = action.payload;
                return modifiedState;
            }
        case ManageCPPActions.ActionTypes.UPDATE_CPP_CLIENT_DETAILS_COMPLETE:
            {
                let modifiedState = Object.assign({}, state, {});
                modifiedState.ConstructionPhasePlan.CPPAdditionalInfo = action.payload;
                return modifiedState;
            }
        case ManageCPPActions.ActionTypes.SAVE_CPP_TO_ATLAS_COMPLETE:
            {
                return Object.assign({}, state, { CPPDocumentId: action.payload.Id });
            }
        default:
            return state;
    }
}

export function getCPPId(state$: Observable<ManageCPPState>): Observable<string> {
    return state$.select(s => s && s.Id);
}

export function getCPP(state$: Observable<ManageCPPState>): Observable<ConstructionPhasePlan> {
    return state$.select(s => s && s.ConstructionPhasePlan);
}

export function getCPPAdditionalInfo(state$: Observable<ManageCPPState>): Observable<CPPAdditionalInfo> {
    return state$.select(s => s && s.CPPAddtionalInfo);
}

export function getCPPDocumentsListData(state$: Observable<ManageCPPState>): Observable<Immutable.List<Document>> {
    return state$.select(s => s.CPPAddtionalInfo && Immutable.List<Document>(s.CPPAddtionalInfo.Documents));
}

export function getCPPSupportEvidencePageList(state$: Observable<ManageCPPState>): Observable<Document[]> {
    return state$.select(s =>  s.ConstructionPhasePlan.CPPAdditionalInfo && s.ConstructionPhasePlan.CPPAdditionalInfo.Documents);
}

export function getCPPDocumentsListPagedList(state$: Observable<ManageCPPState>, request: AtlasApiRequest): Observable<Immutable.List<Document>> {
    return state$.select(s =>
        s.CPPAddtionalInfo && Immutable.List<Document>(s.CPPAddtionalInfo.Documents.slice(request.PageNumber - 1, request.PageSize))
    );
}

export function getCPPDocumentsTotalCount(state$: Observable<ManageCPPState>): Observable<number> {
    return state$.select(s => s.CPPAddtionalInfo && s.CPPAddtionalInfo.Documents.length);
}

export function getHasCPPAdditionalInfoLoaded(state$: Observable<ManageCPPState>): Observable<boolean> {
    return state$.select(s => s.HasCPPAdditionalInfoLoaded);
}

export function getCPPDocumentId(state$: Observable<ManageCPPState>): Observable<string> {
    return state$.select(s => s.CPPDocumentId);
}





