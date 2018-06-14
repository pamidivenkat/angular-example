import { Action } from '@ngrx/store';
import { type } from './../../shared/util';
import { MethodStatements, UpdateStatusModel, MethodStatement, MethodStatementStat } from './../models/method-statement';
import * as Immutable from 'immutable';
import { AtlasApiResponse, AtlasApiRequest, AtlasApiRequestWithParams } from './../../shared/models/atlas-api-response';

export const ActionTypes = {
    LOAD_METHOD_STATEMENTS_LIST: type('[Method Statements] Load Projects List'),
    LOAD_LIVE_METHOD_STATEMENTS_LIST_COMPLETE: type('[Method Statements] Load Live Projects List Complete'),
    LOAD_PENDING_METHOD_STATEMENTS_LIST_COMPLETE: type('[Method Statements] Load Pending Projects List Complete'),
    LOAD_COMPLETED_METHOD_STATEMENTS_LIST_COMPLETE: type('[Method Statements] Load Completed Projects List Complete'),
    LOAD_ARCHIEVED_METHOD_STATEMENTS_LIST_COMPLETE: type('[Method Statements] Load Archieved Projects List Complete'),
    LOAD_EXAMPLE_METHOD_STATEMENTS_LIST_COMPLETE: type('[Method Statements] Load Example Projects List Complete'),
    LOAD_METHOD_STATEMENTS_FILTERS_CHANGED: type('[Method Statements] Load Filter Changed'),
    LOAD_METHOD_STATEMENTS_STATS: type('[Method Statements] Load Projects Count'),
    LOAD_METHOD_STATEMENTS_STATS_COMPLETE: type('[Method Statements] Load Live Projects Count Complete'),
    LOAD_METHOD_STATEMENTS_TAB_CHANGED: type('[Method Statements] Load Tab Changed'),
    REMOVE_METHOD_STATEMENT: type('[Method Statements]  remove method statement'),
    REMOVE_METHOD_STATEMENT_COMPLETE: type('[Method Statements]  remove method statement complete'),
    UPDATE_STATUS_METHOD_STATEMENT: type('[Method Statements]  update particular status in method statement'),
    UPDATE_STATUS_METHOD_STATEMENT_COMPLETE: type('[Method Statements]  update particular status in method statement complete'),
    COPY_METHOD_STATEMENT: type('[Method Statements] copy method statement'),
    COPY_METHOD_STATEMENT_COMPLETE: type('[Method Statements]  copy method statement complete'),
    CLEAR_METHOD_STATEMENT_STATE: type('[Method Statements]  clear method statement after approve'),
    UPDATE_METHODSTATEMENT: type('[Method Statements]  update method statement'),
}

/** Actions for  Method Statements **/
export class LoadMethodStatementsListAction implements Action {
    type = ActionTypes.LOAD_METHOD_STATEMENTS_LIST;
    constructor(public payload: AtlasApiRequestWithParams) {

    }
}

export class LoadMethodStatementsLiveListCompleteAction implements Action {
    type = ActionTypes.LOAD_LIVE_METHOD_STATEMENTS_LIST_COMPLETE;
    constructor(public payload: AtlasApiResponse<MethodStatements>) {

    }
}

export class LoadMethodStatementsPendingListCompleteAction implements Action {
    type = ActionTypes.LOAD_PENDING_METHOD_STATEMENTS_LIST_COMPLETE;
    constructor(public payload: AtlasApiResponse<MethodStatements>) {
    }
}

export class LoadMethodStatementsCompletedListCompleteAction implements Action {
    type = ActionTypes.LOAD_COMPLETED_METHOD_STATEMENTS_LIST_COMPLETE;
    constructor(public payload: AtlasApiResponse<MethodStatements>) {
    }
}

export class LoadMethodStatementsArchivedListCompleteAction implements Action {
    type = ActionTypes.LOAD_ARCHIEVED_METHOD_STATEMENTS_LIST_COMPLETE;
    constructor(public payload: AtlasApiResponse<MethodStatements>) {
    }
}

export class LoadMethodStatementsExampleListCompleteAction implements Action {
    type = ActionTypes.LOAD_EXAMPLE_METHOD_STATEMENTS_LIST_COMPLETE;
    constructor(public payload: AtlasApiResponse<MethodStatements>) {
    }
}

export class LoadMethodStatementsFiltersChangedAction implements Action {
    type = ActionTypes.LOAD_METHOD_STATEMENTS_FILTERS_CHANGED;
    constructor(public payload: AtlasApiRequestWithParams) {
    }
}

export class LoadMethodStatementsTabChangeAction implements Action {
    type = ActionTypes.LOAD_METHOD_STATEMENTS_TAB_CHANGED;
    constructor(public payload: AtlasApiRequestWithParams) {
    }
}

export class LoadMethodStatementsStatsAction implements Action {
    type = ActionTypes.LOAD_METHOD_STATEMENTS_STATS;
    constructor(public payload: boolean) {
    }
}

export class LoadMethodStatementsStatsCompleteAction implements Action {
    type = ActionTypes.LOAD_METHOD_STATEMENTS_STATS_COMPLETE;
    constructor(public payload: Array<MethodStatementStat>) {
    }
}

export class RemoveMethodStatementAction implements Action {
    type = ActionTypes.REMOVE_METHOD_STATEMENT;
    constructor(public payload: { MethodStatements: MethodStatements, AtlasApiRequestWithParams: AtlasApiRequestWithParams }) {

    }
}

export class RemoveMethodStatementCompleteAction implements Action {
    type = ActionTypes.REMOVE_METHOD_STATEMENT_COMPLETE;
    constructor(public payload: boolean) {

    }
}

export class UpdateStatusMethodStatementAction implements Action {
    type = ActionTypes.UPDATE_STATUS_METHOD_STATEMENT;
    constructor(public payload: { UpdateStatusModel: UpdateStatusModel, AtlasApiRequestWithParams: AtlasApiRequestWithParams }) {

    }
}

export class UpdateStatusMethodStatementCompleteAction implements Action {
    type = ActionTypes.UPDATE_STATUS_METHOD_STATEMENT_COMPLETE;
    constructor(public payload: boolean) {
    }
}

export class CopyMethodStatementAction implements Action {
    type = ActionTypes.COPY_METHOD_STATEMENT;
    constructor(public payload: { model: MethodStatement, AtlasApiRequestWithParams: AtlasApiRequestWithParams, copyToDiffCompany: boolean, IsExample: boolean }) {

    }
}

export class CopyMethodStatementCompleteAction implements Action {
    type = ActionTypes.COPY_METHOD_STATEMENT_COMPLETE;
    constructor(public payload: boolean) {
    }
}

export class ClearMethodStatementStateAction implements Action {
    type = ActionTypes.CLEAR_METHOD_STATEMENT_STATE;
    constructor(public payload: boolean) {
    }
}

export class UpdateMethodStatementAction implements Action {
    type = ActionTypes.UPDATE_METHODSTATEMENT;
    constructor(public payload: boolean) {
    }
}

export type Actions = LoadMethodStatementsListAction
    | LoadMethodStatementsLiveListCompleteAction
    | LoadMethodStatementsPendingListCompleteAction
    | LoadMethodStatementsCompletedListCompleteAction
    | LoadMethodStatementsArchivedListCompleteAction
    | LoadMethodStatementsExampleListCompleteAction
    | LoadMethodStatementsFiltersChangedAction
    | LoadMethodStatementsStatsAction
    | LoadMethodStatementsStatsCompleteAction
    | LoadMethodStatementsTabChangeAction
    | RemoveMethodStatementAction
    | RemoveMethodStatementCompleteAction
    | UpdateStatusMethodStatementAction
    | UpdateStatusMethodStatementCompleteAction
    | ClearMethodStatementStateAction
    | UpdateMethodStatementAction;
