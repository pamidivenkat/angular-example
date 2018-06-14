import { RiskAssessmentHazard } from './../models/risk-assessment-hazard';
import { RiskAssessment } from './../models/risk-assessment';
import { ResponseOptions, Response } from '@angular/http';
import { MockStoreProviderFactory } from './../../shared/testing/mocks/mock-store-provider-factory';
import { MockStoreAddUpdateFurtherControls } from './../../shared/testing/mocks/mock-store-addupdate-further-control';
import { TaskActivity } from './../../task/models/task-activity';
import { RiskAssessmentState } from './risk-assessment-reducer';
import { State } from './../../shared/reducers/index';
import { Action } from '@ngrx/store';
import { Observable } from 'rxjs/Rx';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { reducer } from './risk-assessment-reducer';
import { Store } from '@ngrx/store';
import * as fromRoot from './../../shared/reducers/index';
import { AtlasApiRequestWithParams } from '../../shared/models/atlas-api-response';
import { FurtherControlMeasuresMockStoreProvider } from '../../shared/testing/mocks/mock-store-RA-FCM-provider-factory';
import * as Immutable from 'immutable';
import { DataTableOptions } from '../../atlas-elements/common/models/ae-datatable-options';
import { getSelectedHazarads } from '../../risk-assessment/common/extract-helper';

describe('Risk Assesment State', () => {
    let selectedRATask: TaskActivity;
    let hazardData: Array<RiskAssessmentHazard>;
    let currentRiskAssessment: RiskAssessment;
    let initialState: RiskAssessmentState;
    let modifiedState: RiskAssessmentState;
    let DocumentDraftsList: TaskActivity;
    let store: Store<fromRoot.State>;
    let initialWholeState: fromRoot.State;
    let atlasApiParams: AtlasApiRequestWithParams;
    let RAFCMTasks: any;

    beforeEach(() => {
        initialState = {
            loading: false
            , riskAssessmentList: null
            , riskAssessmentTotalCount: null
            , apiRequestWithParams: null
            , currentRiskAssessment: null
            , riskAssessmentInformationItems: null
            , riskAssessmentAddUpdateComplete: false
            , additionalControlsRiskAssessmentsList: null
            , currentRiskAssessmentDocuments: null
            , currentRiskAssessmentDocumentsPagedData: null
            , currentRiskAssessmentSubstances: null
            , currentRiskAssessmentCoshhInventory: null
            , currentRiskAssessmentSubstancesPagingInfo: null
            , currentRiskAssessmentDocumentPagingInfo: null
            , currentRiskAssessmentSubstancesCount: null
            , currentRiskAssessmentDocumentCount: 0
            , riskAssessmentHazardsList: null
            , exampleRiskAssessmentHazardsList: null
            , riskAssessmentRoutesOfExposureList: null
            , filteredRiskAssessmentRoutesOfExposureList: null
            , nameFilter: null
            , siteFilter: null
            , assessmentTypeFilter: null
            , workspaceFilter: null
            , sectorFilter: null
            , HazardsList: null
            , exampleHazardsList: null
            , totalHazardsCount: null
            , totalExampleHazardsCount: 0
            , hazardsLoading: false
            , tasksListTotalCount: null
            , tasksListPagingInfo: null
            , tasksListApiRequest: null
            , selectedRATask: null
            , riskAssessmentName: null
            , riskAssessmentsCountByStatus: null
            , riskAssessmentTypeId: null
            , riskAssessmentDocument: null
            , raChangeStatus: null
            , frequentlyUsedControls: null
            , suggestedControls: null
            , allControlsList: null
            , allControlsCount: 0
            , raHazardCategoryText: null
            , raControlsCategoryText: null
            , allHazardsLoading: false
            , allControlsLoading: false
        };
        selectedRATask = MockStoreAddUpdateFurtherControls.futherControlMeasureData();
        hazardData = MockStoreAddUpdateFurtherControls.getSampleRAdata();
        currentRiskAssessment = MockStoreAddUpdateFurtherControls.RiskAssesmentData();
        atlasApiParams = FurtherControlMeasuresMockStoreProvider.getRAtaskAPIParams();
        RAFCMTasks = FurtherControlMeasuresMockStoreProvider.getRAFurtherControlMeasuresTasks();
    });

    it('should return the default state', () => {
        const action = {} as any;
        const result = reducer(initialState, action);
        expect(result).toEqual(initialState);
    });
    it('should return current state when no valid actions have been made', () => {
        const actual = reducer(initialState, { type: 'INVALID_ACTION', payload: {} });
        const expected = initialState;
        expect(actual).toBe(expected);
    });

    it('it should dispatch LOAD_RISKASSESSMENT_TASK_BY_ID action to load Risk assessment by Id', () => {
        const actual = reducer(initialState, { type: '[RISKASSESSMENT] Load risk assessment task by task id', payload: {} });
        const expected = initialState;
        expect(actual).toEqual(expected);
    });

    it('it should dispatch LOAD_RISKASSESSMENT_TASK_BY_ID_COMPLETE action to load the Risk assessment based Id', () => {
        const actual = reducer(initialState, { type: '[RISKASSESSMENT] Load risk assessment task by task id complete', payload: selectedRATask });
        expect(actual.selectedRATask).toEqual(selectedRATask);
    });

    it('should dispatch LOAD_RISKASSESSMENT_TASKS action to load further control measures task of selected risk assessment', () => {
        const actual = reducer(initialState, { type: '[RISKASSESSMENT] Load risk assessment tasks', payload: atlasApiParams });
        expect(actual.tasksListApiRequest).toEqual(atlasApiParams);
        expect(actual.loading).toBeTruthy();
    });

    it('should dispatch LOAD_RISKASSESSMENT_TASKS_COMPLETE action when loaded further control measures tasks of selected risk assessment', () => {
        initialState.currentRiskAssessment = currentRiskAssessment;
        const actual = reducer(initialState, { type: '[RISKASSESSMENT] Load risk assessment tasks complete', payload: RAFCMTasks });
        expect(actual.currentRiskAssessment.RAFurtherControlMeasuresTasks).toEqual(RAFCMTasks.Entities);
        expect(actual.loading).toBeFalsy();
    });

    it('should dispatch UPDATE_RISKASSESSMENT_TASK action when updating the task details', () => {
        initialState.currentRiskAssessment = currentRiskAssessment;
        const actual = reducer(initialState, { type: '[RISKASSESSMENT] Update risk assessment task', payload: {} });
        expect(actual).toEqual(initialState);
    });

    it('should dispatch UPDATE_RISKASSESSMENT_COMPLETE_TASK action when updated the task details successfully', () => {
        let updatedTasks = RAFCMTasks;
        updatedTasks.Entities[0].Description = "Description provided";
        initialState.currentRiskAssessment = currentRiskAssessment;
        const actual = reducer(initialState, { type: '[RISKASSESSMENT] Update risk assessment complete task', payload: updatedTasks });
        expect(actual.currentRiskAssessment.RAFurtherControlMeasuresTasks).toEqual(updatedTasks.Entities);
    });

    describe('Functions in the Risk Assesments reducer', () => {
        beforeEach(() => {
            store = MockStoreProviderFactory.createInitialStore();
            selectedRATask = MockStoreAddUpdateFurtherControls.futherControlMeasureData();
            hazardData = MockStoreAddUpdateFurtherControls.getSampleRAdata();
            currentRiskAssessment = MockStoreAddUpdateFurtherControls.RiskAssesmentData();
            store.subscribe(s => { initialWholeState = s; });
            modifiedState = reducer(initialState, { type: '[RISKASSESSMENT] Load risk assessment task by task id complete', payload: selectedRATask });
            initialWholeState.riskAssessmentState.selectedRATask = modifiedState.selectedRATask;
            modifiedState = reducer(initialState, { type: '[RISKASSESSMENT] Load risk assessment complete', payload: currentRiskAssessment });
            modifiedState.currentRiskAssessment.RAFurtherControlMeasuresTasks = RAFCMTasks.Entities;
            initialWholeState.riskAssessmentState.currentRiskAssessment = modifiedState.currentRiskAssessment;
        });

        it('function should return RA tasks when getRiskAssessmentTaskById method was called', () => {
            store.let(fromRoot.getRiskAssessmentTaskById).subscribe(res => {
                expect(res).toEqual(selectedRATask);
            });
        });

        it('function should return RA tasks when getRiskAssessmentHazardsData method was called', () => {
            store.let(fromRoot.getRiskAssessmentHazardsData).subscribe(res => {
                expect(res.length).toEqual(currentRiskAssessment.RAHazards.length);
            });
        });

        it('function should return current risk assessment id when getCurrentRiskAssessmentId method was called', () => {
            store.let(fromRoot.getCurrentRiskAssessmentId).subscribe(res => {
                expect(res).toEqual(currentRiskAssessment.Id);
            });
        });

        it('function should return current RA further control measures tasks data when getRiskAssessmentTasksData method was callled', () => {
            store.let(fromRoot.getRiskAssessmentTasksData).subscribe(res => {
                expect(res).toEqual(RAFCMTasks.Entities);
            });
        });

        it('function should return RA tasks list total count when getRiskAssessmentTasksListTotalCount method was called', () => {
            modifiedState.tasksListTotalCount = RAFCMTasks.PagingInfo.TotalCount;
            initialWholeState.riskAssessmentState.tasksListTotalCount = modifiedState.tasksListTotalCount;
            store.let(fromRoot.getRiskAssessmentTasksListTotalCount).subscribe(res => {
                expect(res).toEqual(RAFCMTasks.PagingInfo.TotalCount);
            });
        });

        it('function should return RA task list page information when getRiskAssessmentTasksListPageInformation method was called', () => {
            modifiedState.tasksListApiRequest = atlasApiParams;
            modifiedState.tasksListPagingInfo = RAFCMTasks.PagingInfo;
            initialWholeState.riskAssessmentState.tasksListApiRequest = modifiedState.tasksListApiRequest;
            initialWholeState.riskAssessmentState.tasksListPagingInfo = modifiedState.tasksListPagingInfo;
            let dataTableOptions = new DataTableOptions(modifiedState.tasksListPagingInfo.PageNumber, modifiedState.tasksListPagingInfo.Count, modifiedState.tasksListApiRequest.SortBy.SortField, modifiedState.tasksListApiRequest.SortBy.Direction);
            store.let(fromRoot.getRiskAssessmentTasksListPageInformation).subscribe(res => {
                expect(res).toEqual(dataTableOptions);
            });
        });

        it('fucntion should return RA tasks list loading status when getRiskAssessmentTasksListLoadingStatus method was called', () => {
            modifiedState.loading = false;
            initialWholeState.riskAssessmentState.loading = modifiedState.loading;
            store.let(fromRoot.getRiskAssessmentTasksListLoadingStatus).subscribe(res => {
                expect(res).toBeFalsy();
            });
        });

        it('function should return RA Hazards when getRiskAssessmentHazardsData method was called', () => {
            let RAHazardsData = getSelectedHazarads(currentRiskAssessment);
            store.let(fromRoot.getRiskAssessmentHazardsData).subscribe(res => {
                expect(res).toEqual(RAHazardsData);
            });
        });
    });
});