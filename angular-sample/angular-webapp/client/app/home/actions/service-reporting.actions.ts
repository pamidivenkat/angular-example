import { StatisticsInformation } from '../models/statistics-information';
import { AeInformationBarItem } from '../../atlas-elements/common/models/ae-informationbar-item';
import { Action } from '@ngrx/store';
import { type } from '../../shared/util';
import * as Immutable from 'immutable';

export const ActionTypes = {
    LOAD_SERVICE_REPORTING: type('[Service Reporting] Service reporting'),
    LOAD_SERVICE_REPORTING_COMPLETE: type('[Service Reporting] Service reporting complete')
}

export class ServiceReportingLoadAction implements Action {
    type = ActionTypes.LOAD_SERVICE_REPORTING;
    constructor(public payload: string) {

    }
}


export class ServiceReportingLoadCompleteAction implements Action {
    type = ActionTypes.LOAD_SERVICE_REPORTING_COMPLETE;
    constructor(public payload: Immutable.List<StatisticsInformation<string>>) {

    }
}

