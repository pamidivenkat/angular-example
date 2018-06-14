import { PagingInfo } from '../../atlas-elements/common/models/ae-paging-info';
import { State, getKeyDocumentsData } from './../../shared/reducers/index';
import { Action } from '@ngrx/store';
import { Observable } from 'rxjs/Rx';
import { KeyDocuments } from './../models/key-documents';
import { AtlasApiResponse } from './../../shared/models/atlas-api-response';
import { KeyDocumentsState } from './key-documents-reducer';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { reducer } from './key-documents-reducer';
import { KeyDocumentsLoadAction, KeyDocumentsLoadCompleteAction } from '../actions/key-documents-actions';
import * as fromCombineReducer from '../../shared/reducers/index';


describe('key-documents-reducer', () => {
    let initalState: KeyDocumentsState;
    let sampleResponse: AtlasApiResponse<KeyDocuments>;

    beforeEach(() => {
        sampleResponse = new AtlasApiResponse<KeyDocuments>();
        sampleResponse.Entities = [
            new KeyDocuments('218FF39D-059F-4574-8E0A-08216C08D02F', 'Employee Contract', '3E93ADDB-5572-4A12-AC8D-1D5D47B2241C')
            , new KeyDocuments('218FF39D-059F-4574-8E0A-08216C08D03F', 'Health & Safety Policy', '3E93ADDB-5572-4A12-AC8D-1D5D47B2242C')
            , new KeyDocuments('218FF39D-059F-4574-8E0A-08216C08D04F', 'Employee Handbook', '3E93ADDB-5572-4A12-AC8D-1D5D47B2243C')
            , new KeyDocuments('218FF39D-059F-4574-8E0A-08216C08D05F', 'Your Contract', '3E93ADDB-5572-4A12-AC8D-1D5D47B2244C')
        ]
        sampleResponse.OtherInfo = null;
        sampleResponse.PagingInfo = new PagingInfo(1, 16, 1, 10);
        initalState = {
            isFirstTimeLoad: true,
            loading: false,
            loaded: false,
            data: sampleResponse
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
        const actual = reducer(initalState, { type: '[Key Documents] key Documents Load Complete', payload: sampleResponse }); //player(state, {type: 'INVALID_ACTION', payload: {}});      
        expect(actual.isFirstTimeLoad).toBe(false);
        expect(actual.loaded).toBe(true);
        expect(actual.loading).toBe(false);
    });

    it('should return loading true after first store action KEY_DOCUMENTS_LOAD is despatched', () => {
        const actual = reducer(initalState, { type: '[Key Documents] key Documents Load', payload: sampleResponse }); //player(state, {type: 'INVALID_ACTION', payload: {}});      
        expect(actual.loading).toBe(true);
        expect(actual.loaded).toBe(false);
    });

});
