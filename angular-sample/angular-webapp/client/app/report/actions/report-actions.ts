import { AeSortModel } from '../../atlas-elements/common/models/ae-sort-model';
import { AePageChangeEventModel } from '../../atlas-elements/common/models/ae-page-change-event-model';
import { AeInformationBarItem } from '../../atlas-elements/common/models/ae-informationbar-item';
import { Report } from '../models/report';
import { Action } from '@ngrx/store';
import { type } from '../../shared/util';
import * as Immutable from 'immutable';
export const ActionTypes = {
    LOAD_INFORMATION_COMPONENT: type('[Report] Load information components'),
    LOAD_INFORMATION_COMPONENT_COMPLETE: type('[Report] Load information components complete'),
    LOAD_REPORTS: type('[Report] Load report list'),
    LOAD_REPORTS_COMPLETE: type('[Report] Load report list Complete'),
    LOAD_REPORTS_ONPAGECHANGE: type('[Report] Load reports on page change'),
    LOAD_REPORTS_ONSORT: type('[Report] Load reports on sorting'),
    REMOVE_REPORT: type('[Report] remove reports'),
    PUBLISH_REPORT: type('[Report] publish report')
}

export class LoadReportsInformationComponentAction implements Action {
    type = ActionTypes.LOAD_INFORMATION_COMPONENT;
    constructor(public payload: string) {

    }
}

export class LoadReportsInformationComponentCompleteAction implements Action {
    type = ActionTypes.LOAD_INFORMATION_COMPONENT_COMPLETE;
    constructor(public payload: AeInformationBarItem[]) {

    }
}

export class LoadReportsAction implements Action {
    type = ActionTypes.LOAD_REPORTS;
    constructor(public payload: any) {
    }
}

export class LoadReportsCompleteAction implements Action {
    type = ActionTypes.LOAD_REPORTS_COMPLETE;
    constructor(public payload: any) {
    }
}

export class RemoveReport implements Action {
    type = ActionTypes.REMOVE_REPORT;
    constructor(public payload: string) {

    }
}

export class PublishReport implements Action {
    type = ActionTypes.PUBLISH_REPORT;
    constructor(public payload: string) {

    }
}