import { MockNgModuleResolver } from '@angular/compiler/testing';
import { extractDataTableOptions } from '../../../shared/helpers/extract-helpers';
import { isNullOrUndefined } from 'util';
import { Action } from '@ngrx/store';
import { AeSortModel } from '../../../atlas-elements/common/models/ae-sort-model';
import { TrainingReports } from '../../models/training-reports';
import * as TrainingReportsActions from '../actions/training-report.actions';
import { Observable } from 'rxjs/Rx';
import * as Immutable from 'immutable';
import { AtlasApiRequestWithParams, AtlasApiResponse } from '../../../shared/models/atlas-api-response';
import { PagingInfo } from '../../../atlas-elements/common/models/ae-paging-info';
import { DataTableOptions } from '../../../atlas-elements/common/models/ae-datatable-options';

export interface TrainingReportsState {
    ReportsListLoadingStatus: boolean;
    apiRequestWithParams: AtlasApiRequestWithParams,
    TrainingReportsListTotalCount: number;
    TrainingReportsList: TrainingReports;
    CertificateData: Array<any>;


}
const initialState: TrainingReportsState = {
    ReportsListLoadingStatus: null,
    apiRequestWithParams: null,
    TrainingReportsListTotalCount: null,
    TrainingReportsList: null,
    CertificateData: null

}

export function TrainingReportsreducer(state = initialState, action: Action): TrainingReportsState {
    switch (action.type) {
        case TrainingReportsActions.ActionTypes.TRAINING_REPORTS_LOAD:
            {
                return Object.assign({}, state, { ReportsListLoadingStatus: true, apiRequestWithParams: action.payload });

            }
        case TrainingReportsActions.ActionTypes.TRAINING_REPORTS_LOAD_COMPLETE: {

            let modifiedState = Object.assign({}, state, {});
            if (!isNullOrUndefined(modifiedState.apiRequestWithParams)) {
                if (action.payload.pagingInfo.PageNumber == 1) {
                    modifiedState.TrainingReportsListTotalCount = action.payload.pagingInfo.TotalCount;
                }
            }

            return Object.assign({}, modifiedState, { TrainingReportsList: action.payload.data, ReportsListLoadingStatus: false });

        }
        case TrainingReportsActions.ActionTypes.TRAINING_REPORT_DOWNLOAD:
            {
                return Object.assign({}, state, { CertificateData: null });

            }
        case TrainingReportsActions.ActionTypes.TRAINING_REPORT_DOWNLOAD_COMPLETE: {


            return Object.assign({}, state, { CertificateData: action.payload });

        }
        case TrainingReportsActions.ActionTypes.TRAINING_REPORT_DATA_CLAER: {


            return Object.assign({}, initialState);

        }
        default:
            return state;
    }
}


export function getTrainingReportsList(state$: Observable<TrainingReportsState>): Observable<TrainingReports> {
    return state$.select(s => s && s.TrainingReportsList);
};
export function getTrainingReportsState(state$: Observable<TrainingReportsState>): Observable<TrainingReportsState> {
    return state$.select(s => s);
};
export function getTrainingReportsListDataLoading(state$: Observable<TrainingReportsState>): Observable<boolean> {
    return state$.select(s => !isNullOrUndefined(s) && s.ReportsListLoadingStatus);
};
export function getTrainingReportsTotalRecords(state$: Observable<TrainingReportsState>): Observable<number> {
    return state$.select(s => s && s.TrainingReportsListTotalCount);
}
export function getTrainingReportsListPageInformation(state$: Observable<TrainingReportsState>): Observable<DataTableOptions> {
    return state$.select(state => state && state.apiRequestWithParams && state.apiRequestWithParams.PageNumber && state.apiRequestWithParams.PageSize && new DataTableOptions(state.apiRequestWithParams.PageNumber, state.apiRequestWithParams.PageSize,state.apiRequestWithParams.SortBy.SortField,state.apiRequestWithParams.SortBy.Direction));
}
export function getTrainingReportCertificateInformation(state$: Observable<any>): Observable<any> {
    return state$.select(state => state && state.CertificateData);
}
