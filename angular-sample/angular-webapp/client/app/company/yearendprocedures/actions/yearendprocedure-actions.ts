import { type } from './../../../shared/util';
import { Action } from '@ngrx/store';
import {
    YearEndProcedureModel
    , YearEndProcedureResultModel
} from './../models/yearendprocedure-model';
import { AtlasApiRequestWithParams, AtlasApiResponse } from './../../../shared/models/atlas-api-response';
import { PagingInfo } from './../../../atlas-elements/common/models/ae-paging-info';
import { MyAbsence } from './../../../holiday-absence/models/holiday-absence.model';

export const ActionTypes = {
    LOAD_PENDING_HOLIDAY_ABSENCE_REQUESTS:
    type('[YearEndProcedure] load pending holiday absence requests for year end procedure'),
    LOAD_PENDING_HOLIDAY_ABSENCE_REQUESTS_COMPLETE:
    type('[YearEndProcedure] load pending holiday absence requests for year end procedure complete'),
    UPDATE_PENDING_HOLIDAY_ABSENCE_REQUESTS_PAGINGINFO:
    type('[YearEndProcedure] update pending holiday absence requests paginginfo for year end procedure'),
    UPDATE_PENDING_HOLIDAY_ABSENCE_REQUEST:
    type('[YearEndProcedure] update pending holiday absence request for year end procedure'),
    LOAD_YEAR_END_PROCEDURE_DATA: type('[YearEndProcedure] load year end procedure details'),
    LOAD_YEAR_END_PROCEDURE_DATA_COMPLETE: type('[YearEndProcedure] load year end procedure details complete'),
    LOAD_YEAR_END_PROCEDURE_STATUS: type('[YearEndProcedure] load year end procedure status'),
    LOAD_YEAR_END_PROCEDURE_RESULTS: type('[YearEndProcedure] load year end procedure results'),
    LOAD_YEAR_END_PROCEDURE_RESULTS_COMPLETE: type('[YearEndProcedure] load year end procedure results complete'),
    CLEAR_YEAR_END_PROCEDURE_RESULTS: type('[YearEndProcedure] clear year end procedure results'),
    UPDATE_YEAR_END_PROCEDURE_RESULTS_PAGINGINFO: type('[YearEndProcedure] load year end procedure results paginginfo'),
    UPDATE_YEAR_END_PROCEDURE: type('[YearEndProcedure] update year end procedure'),
    UPDATE_YEAR_END_PROCEDURE_COMPLETE: type('[YearEndProcedure] update year end procedure complete'),
    UPDATE_YEAR_END_PROCEDURE_REVIEW_CONFIRM: type('[YearEndProcedure] update year end procedure review confirm'),
    UPDATE_YEAR_END_PROCEDURE_REVIEW_CONFIRM_COMPLETE: type('[YearEndProcedure] update year end procedure review confirm complete'),
    UPDATE_YEAR_END_PROCEDURE_RESULTS_AUTO_SAVE: type('[YearEndProcedure] update year end procedure results auto save'),
    UPDATE_YEAR_END_PROCEDURE_RESULTS_AUTO_SAVE_COMPLETE:
    type('[YearEndProcedure] update year end procedure results auto save complete'),
    LOAD_EMPLOYEES_WITH_ZERO_ENTITLEMENT: type('[YearEndProcedure] load employees with zero holiday entitlement'),
    LOAD_EMPLOYEES_WITH_ZERO_ENTITLEMENT_COMPLETE: type('[YearEndProcedure] load employees with zero holiday entitlement complete'),
    CLEAR_EMPLOYEE_WITH_ZERO_ENTITLEMENT: type('[YearEndProcedure] clear employees with zero holiday entitlement complete'),
};

export class LoadHolidayAbsenceRequestsAction implements Action {
    type = ActionTypes.LOAD_PENDING_HOLIDAY_ABSENCE_REQUESTS;
    constructor(public payload: AtlasApiRequestWithParams) {
    }
}

export class LoadHolidayAbsenceRequestsCompleteAction implements Action {
    type = ActionTypes.LOAD_PENDING_HOLIDAY_ABSENCE_REQUESTS_COMPLETE;
    constructor(public payload: AtlasApiResponse<MyAbsence>) {
    }
}

export class UpdateHolidayAbsenceRequestsPagingInfoAction implements Action {
    type = ActionTypes.UPDATE_PENDING_HOLIDAY_ABSENCE_REQUESTS_PAGINGINFO;
    constructor(public payload: PagingInfo) {
    }
}

export class UpdatePendingHolidayAbsenceRequestAction implements Action {
    type = ActionTypes.UPDATE_PENDING_HOLIDAY_ABSENCE_REQUEST;
    constructor(public payload: MyAbsence) {
    }
}

export class LoadYearEndProcedureDataAction implements Action {
    type = ActionTypes.LOAD_YEAR_END_PROCEDURE_DATA;
    constructor(public payload: boolean) {
    }
}

export class LoadYearEndProcedureDataCompleteAction implements Action {
    type = ActionTypes.LOAD_YEAR_END_PROCEDURE_DATA_COMPLETE;
    constructor(public payload: YearEndProcedureModel) {
    }
}

export class LoadYearEndProcedureStatusAction implements Action {
    type = ActionTypes.LOAD_YEAR_END_PROCEDURE_STATUS;
    constructor(public payload: string) {
    }
}

export class LoadYearEndProcedureResultsAction implements Action {
    type = ActionTypes.LOAD_YEAR_END_PROCEDURE_RESULTS;
    constructor(public payload: AtlasApiRequestWithParams) {
    }
}

export class LoadYearEndProcedureResultsCompleteAction implements Action {
    type = ActionTypes.LOAD_YEAR_END_PROCEDURE_RESULTS_COMPLETE;
    constructor(public payload: Array<YearEndProcedureResultModel>) {
    }
}

export class ClearYearEndProcedureResultsAction implements Action {
    type = ActionTypes.CLEAR_YEAR_END_PROCEDURE_RESULTS;
    constructor(public payload: boolean) {
    }
}

export class UpdateYearEndProcedureResultsPagingAction implements Action {
    type = ActionTypes.UPDATE_YEAR_END_PROCEDURE_RESULTS_PAGINGINFO;
    constructor(public payload: PagingInfo) {
    }
}

export class UpdateYearEndProcedureAction implements Action {
    type = ActionTypes.UPDATE_YEAR_END_PROCEDURE;
    constructor(public payload: YearEndProcedureModel) {
    }
}

export class UpdateYearEndProcedureCompleteAction implements Action {
    type = ActionTypes.UPDATE_YEAR_END_PROCEDURE_COMPLETE;
    constructor(public payload: YearEndProcedureModel) {
    }
}

export class UpdateYearEndProcedureReviewConfirmAction implements Action {
    type = ActionTypes.UPDATE_YEAR_END_PROCEDURE_REVIEW_CONFIRM;
    constructor(public payload: string) {
    }
}

export class UpdateYearEndProcedureReviewConfirmCompleteAction implements Action {
    type = ActionTypes.UPDATE_YEAR_END_PROCEDURE_REVIEW_CONFIRM_COMPLETE;
    constructor(public payload: YearEndProcedureModel) {
    }
}

export class UpdateYearEndProcedureResultsAction implements Action {
    type = ActionTypes.UPDATE_YEAR_END_PROCEDURE_RESULTS_AUTO_SAVE;
    constructor(public payload: YearEndProcedureResultModel) {
    }
}

export class UpdateYearEndProcedureResultsCompleteAction implements Action {
    type = ActionTypes.UPDATE_YEAR_END_PROCEDURE_RESULTS_AUTO_SAVE_COMPLETE;
    constructor(public payload: YearEndProcedureResultModel) {
    }
}

export class LoadEmployeesWithZeroEntitlementAction implements Action {
    type = ActionTypes.LOAD_EMPLOYEES_WITH_ZERO_ENTITLEMENT;
    constructor(public payload: string) {
    }
}

export class LoadEmployeesWithZeroEntitlementCompleteAction implements Action {
    type = ActionTypes.LOAD_EMPLOYEES_WITH_ZERO_ENTITLEMENT_COMPLETE;
    constructor(public payload: Array<string>) {
    }
}

export class ClearEmployeesWithZeroEntitlementAction implements Action {
    type = ActionTypes.CLEAR_EMPLOYEE_WITH_ZERO_ENTITLEMENT;
    constructor(public payload: boolean) {
    }
}
