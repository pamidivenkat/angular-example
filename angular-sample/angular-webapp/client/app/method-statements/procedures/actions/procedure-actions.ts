import { Procedure } from './../models/procedure';
import { AtlasApiRequestWithParams, AtlasApiResponse } from './../../../shared/models/atlas-api-response';
import { type } from './../../../shared/util';
import { AeInformationBarItem } from './../../../atlas-elements/common/models/ae-informationbar-item';
import * as Immutable from 'immutable';

export const ActionTypes = {
    LOAD_PROCEDURES: type('[PROCEDURES] Load procedures'),
    LOAD_PROCEDURES_COMPLETE: type('[PROCEDURES] Load procedures complete'),
    LOAD_SELECTED_PROCEDURE: type('[PROCEDURES] Load selected procedure'),
    LOAD_SELECTED_PROCEDURE_COMPLETE: type('[PROCEDURES]  Load selected procedure complete'),
    ADD_PROCEDURE: type('[PROCEDURES] Add procedure'),
    ADD_PROCEDURE_COMPLETE: type('[PROCEDURES]  Add procedure complete'),
    COPY_PROCEDURE: type('[PROCEDURES] Copy procedure'),
    COPY_PROCEDURE_COMPLETE: type('[PROCEDURES] Copy procedure complete'),
    UPDATE_PROCEDURE: type('[PROCEDURES] Update procedure'),
    UPDATE_PROCEDURE_COMPLETE: type('[PROCEDURES]  Update procedure complete'),
    REMOVE_PROCEDURE: type('[PROCEDURES] Remove procedure'),
    REMOVE_PROCEDURE_COMPLETE: type('[PROCEDURES] Remove procedure complete'),
    LOAD_PROCEDURE_BY_ID: type('[PROCEDURES] Load procedure by id'),
    LOAD_PROCEDURE_BY_ID_COMPLETE: type('[PROCEDURES] Load procedure by id complete'),
    LOAD_EXAMPLE_PROCEDURES_TOTALCOUNT: type('[PROCEDURES] Load example procedures total count'),
    LOAD_EXAMPLE_PROCEDURES_TOTALCOUNT_COMPLETE: type('[PROCEDURES] Load example procedures total count complete'),
    LOAD_PROCEDURES_TOTALCOUNT: type('[PROCEDURES] Load procedures total count'),
    LOAD_PROCEDURES_TOTALCOUNT_COMPLETE: type('[PROCEDURES] Load procedures total count complete')
};


export class LoadProceduresAction {
    type = ActionTypes.LOAD_PROCEDURES;
    constructor(public payload: AtlasApiRequestWithParams) {
    }
}

export class LoadProceduresCompleteAction {
    type = ActionTypes.LOAD_PROCEDURES_COMPLETE;
    constructor(public payload: AtlasApiResponse<Procedure>) {
    }
}

export class LoadSelectedProcedureAction {
    type = ActionTypes.LOAD_SELECTED_PROCEDURE;
    constructor(public payload: string) {
    }
}

export class LoadSelectedProcedureCompleteAction {
    type = ActionTypes.LOAD_SELECTED_PROCEDURE_COMPLETE;
    constructor(public payload: Procedure) {
    }
}

export class AddProcedureAction {
    type = ActionTypes.ADD_PROCEDURE;
    constructor(public payload: Procedure) {
    }
}

export class AddProcedureCompleteAction {
    type = ActionTypes.ADD_PROCEDURE_COMPLETE;
    constructor(public payload: Procedure) {
    }
}

export class CopyProcedureAction {
    type = ActionTypes.COPY_PROCEDURE;
    constructor(public payload: Procedure) {
    }
}

export class CopyProcedureCompleteAction {
    type = ActionTypes.COPY_PROCEDURE_COMPLETE;
    constructor(public payload: Procedure) {
    }
}

export class UpdateProcedureAction {
    type = ActionTypes.UPDATE_PROCEDURE;
    constructor(public payload: Procedure) {
    }
}

export class UpdateProcedureCompleteAction {
    type = ActionTypes.UPDATE_PROCEDURE_COMPLETE;
    constructor(public payload: Procedure) {
    }
}

export class RemoveProcedureAction {
    type = ActionTypes.REMOVE_PROCEDURE;
    constructor(public payload: Procedure) {
    }
}

export class RemoveProcedureCompleteAction {
    type = ActionTypes.REMOVE_PROCEDURE_COMPLETE;
    constructor(public payload: boolean) {
    }
}

export class LoadProcedureByIdAction {
    type = ActionTypes.LOAD_PROCEDURE_BY_ID;
    constructor(public payload: Procedure) {
    }
}

export class LoadProcedureByIdCompleteAction {
    type = ActionTypes.LOAD_PROCEDURE_BY_ID_COMPLETE;
    constructor(public payload: Procedure) {
    }
}

export class LoadExampleProceduresTotalCountAction {
    type = ActionTypes.LOAD_EXAMPLE_PROCEDURES_TOTALCOUNT;
    constructor() {
    }
}

export class LoadExampleProceduresTotalCountCompleteAction {
    type = ActionTypes.LOAD_EXAMPLE_PROCEDURES_TOTALCOUNT_COMPLETE;
    constructor(public payload: number) {
    }
}

export class LoadProceduresTotalCountAction {
    type = ActionTypes.LOAD_PROCEDURES_TOTALCOUNT;
    constructor() {
    }
}

export class LoadProceduresTotalCountCompleteAction {
    type = ActionTypes.LOAD_PROCEDURES_TOTALCOUNT_COMPLETE;
    constructor(public payload: number) {
    }
}

export type Actions =
    LoadProceduresAction
    | LoadProceduresCompleteAction
    | LoadSelectedProcedureAction
    | LoadSelectedProcedureCompleteAction
    | AddProcedureAction
    | AddProcedureCompleteAction
    | UpdateProcedureAction
    | UpdateProcedureCompleteAction
    | RemoveProcedureAction
    | RemoveProcedureCompleteAction
    | CopyProcedureAction
    | CopyProcedureCompleteAction
    | LoadProcedureByIdAction
    | LoadProcedureByIdCompleteAction
    | LoadExampleProceduresTotalCountAction
    | LoadExampleProceduresTotalCountCompleteAction
    | LoadProceduresTotalCountAction
    | LoadProceduresTotalCountCompleteAction;
