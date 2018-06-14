import { AtlasApiRequestWithParams, AtlasApiResponse } from '../../../shared/models/atlas-api-response';
import { Action } from '@ngrx/store';
import { type } from '../../../shared/util';
import { AeSortModel } from "../../../atlas-elements/common/models/ae-sort-model";
import { TrainingReports } from '../../models/training-reports';

export const ActionTypes = {
    TRAINING_REPORTS_LOAD: type('[TRAININGREPORTS] load training reports'),
    TRAINING_REPORTS_LOAD_COMPLETE: type('[TRAININGREPORTS] load training reports complete'),
    TRAINING_REPORT_DOWNLOAD: type('[TRAININGREPORTS] download training report'),
    TRAINING_REPORT_DOWNLOAD_COMPLETE: type('[TRAININGREPORTS] download training report complete'),
    TRAINING_REPORT_DATA_CLAER: type('[TRAININGREPORTS] data clear'),
}

export class TrainingReportsLoad implements Action {
    type = ActionTypes.TRAINING_REPORTS_LOAD;
    constructor(public payload: AtlasApiRequestWithParams) {

    }
}

export class TrainingReportsLoadComplete implements Action {
    type = ActionTypes.TRAINING_REPORTS_LOAD_COMPLETE;
    constructor(public payload: any) {

    }
}
export class TrainingReportDownLoadAction implements Action {
    type = ActionTypes.TRAINING_REPORT_DOWNLOAD;
    constructor(public payload: string) {

    }
}
export class TrainingReportDownLoadCompleteAction implements Action {
    type = ActionTypes.TRAINING_REPORT_DOWNLOAD_COMPLETE;
    constructor(public payload: any) {

    }
}

export class TrainingReportDataClearAction implements Action {
    type = ActionTypes.TRAINING_REPORT_DATA_CLAER;
    constructor() {

    }
}