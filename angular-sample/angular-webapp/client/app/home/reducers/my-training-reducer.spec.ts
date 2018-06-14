import { PagingInfo } from '../../atlas-elements/common/models/ae-paging-info';
import { MyTraining } from './../models/my-training';
import { State, getKeyDocumentsData } from './../../shared/reducers/index';
import { Action } from '@ngrx/store';
import { Observable } from 'rxjs/Rx';
import { KeyDocuments } from './../models/key-documents';
import { AtlasApiResponse } from './../../shared/models/atlas-api-response';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { reducer, MyTrainingState } from './my-training-reducer';
import { KeyDocumentsLoadAction, KeyDocumentsLoadCompleteAction } from '../actions/key-documents-actions';
import * as fromCombineReducer from '../../shared/reducers/index';


describe('mytrainings-reducer', () => {
    let initalState: MyTrainingState;
    let sampleResponse: AtlasApiResponse<MyTraining>;

    beforeEach(() => {
        sampleResponse = new AtlasApiResponse<MyTraining>();
        sampleResponse.Entities = [
            new MyTraining({ Id: '218FF39D-059F-4574-8E0A-08216C08D03F', CourseTitle: 'Test course title', ModuleTitle: 'Test module title', PassDate: new Date(), StartDate: new Date(), Status: 1 })
            , new MyTraining({ Id: '218FF39D-059F-4574-8E0A-08216C08D04F', CourseTitle: 'Test course title1', ModuleTitle: 'Test module title1', PassDate: new Date(), StartDate: new Date(), Status: 1 })
            , new MyTraining({ Id: '218FF39D-059F-4574-8E0A-08216C08D05F', CourseTitle: 'Test course title2', ModuleTitle: 'Test module title2', PassDate: new Date(), StartDate: new Date(), Status: 1 })
            , new MyTraining({ Id: '218FF39D-059F-4574-8E0A-08216C08D06F', CourseTitle: 'Test course title3', ModuleTitle: 'Test module title3', PassDate: new Date(), StartDate: new Date(), Status: 1 })
        ]
        sampleResponse.OtherInfo = null;
        //count:number, totalCount:number, pageNumber:number, pageSize:number
        sampleResponse.PagingInfo = new PagingInfo(0, 999, 1, 16);
        initalState = {
            isFirstTimeLoad: true,
            loading: false,
            loaded: false,
            data: sampleResponse,
            myTeamTrainingTasksExist: false
        };

    });

    it('should return the default state', () => {
        const action = {} as any;
        const result = reducer(initalState, action);
        expect(result).toEqual(initalState);
    });

    it('should return current state when no valid actions have been made', () => {
        const actual = reducer(initalState, { type: 'INVALID_ACTION', payload: {} }); //player(state, {type: 'INVALID_ACTION', payload: {}});
        const expected = initalState;
        expect(actual).toBe(expected);
    });

    it('should return isFirstTimeLoad false,loaded to be true, loading to be false after first store action KEY_DOCUMENTS_LOAD_COMPLETE is despatched', () => {
        const actual = reducer(initalState, { type: '[My Trainings] My trainings Load complete', payload: sampleResponse });
        expect(actual.isFirstTimeLoad).toBe(false);
        expect(actual.loaded).toBe(true);
        expect(actual.loading).toBe(false);
    });

    it('should return loading true after first store action KEY_DOCUMENTS_LOAD is despatched', () => {
        const actual = reducer(initalState, { type: '[My Trainings] My trainings Load', payload: sampleResponse });
        expect(actual.loading).toBe(true);
        expect(actual.loaded).toBe(false);
    });

});
