import { AeInformationBarItem } from './../../atlas-elements/common/models/ae-informationbar-item';
import { DocumentsState } from './document.reducer';
import { State, getKeyDocumentsData } from './../../shared/reducers/index';
import { Action } from '@ngrx/store';
import { Observable } from 'rxjs/Rx';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { AeInformationBarItemType } from './../../atlas-elements/common/ae-informationbar-itemtype.enum';
import { reducer } from './document.reducer';
import { MockStoreProviderFactory } from './../../shared/testing/mocks/mock-store-provider-factory';
import { PersonalDocumentsMockStoreProviderFactory } from './../../shared/testing/mocks/personal-doc-mock-store-provider-factory';
import { Document, EntityReference } from './../../document/models/document';
import { Store } from '@ngrx/store';
import * as fromRoot from './../../shared/reducers/index';

describe('Document-reducer', () => {
    let initialState: DocumentsState;
    let sampleResponse: AeInformationBarItem[];
    let personalDocumnetsPayload: Document[] = PersonalDocumentsMockStoreProviderFactory.getPersonalDocuments();
    let store: Store<fromRoot.State>;
    let initialWholeState: fromRoot.State;
    let modifiedState: DocumentsState;


    beforeEach(() => {

        initialState = {
            PersonalDocuments: {
                HasPersonalDocumentsLoaded: false,
                Entities: null
            },
            CurrentDocument: null,
        };

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

    it('should return HasPersonalDocumentsLoaded false after first store action LOAD_PERSONAL_DOCUMENTS is dispatched ', () => {
        const actual = reducer(initialState, { type: '[Document] Load Personal Documents', payload: true });
        expect(actual.PersonalDocuments.HasPersonalDocumentsLoaded).toBe(false);
    });

    it('should return HasPersonalDocumentsLoaded true and store should have data after LOAD_PERSONAL_DOCUMENTS_COMPLETE action was dispatched', () => {
        const actual = reducer(initialState, { type: '[Document] Load Personal Documents Complete', payload: personalDocumnetsPayload });
        expect(actual.PersonalDocuments.HasPersonalDocumentsLoaded).toBe(true);
        expect(actual.PersonalDocuments.Entities).toEqual(personalDocumnetsPayload);
    });

    it('should dispatch SELECT_DOCUMENT action to get the selected document details', () => {
        const actual = reducer(initialState, { type: '[Document] Load Selected Document', payload: personalDocumnetsPayload[0].Id });
        expect(actual.CurrentDocument).toBeNull();
    });

    it('should dispatch SELECT_DOCUMENT_COMPLETE action when loaded selected document', () => {
        const actual = reducer(initialState, { type: '[Document] Load Selected Document Complete', payload: personalDocumnetsPayload[0] });
        expect(actual.CurrentDocument).toEqual(personalDocumnetsPayload[0]);
    });

    it('should dispatch REMOVE_DOCUMENT action to remove selected personal document from list ', () => {
        initialState.PersonalDocuments.Entities = personalDocumnetsPayload;
        const actual = reducer(initialState, { type: '[Document] Remove Document', payload: personalDocumnetsPayload[0] });
        expect(actual.PersonalDocuments.HasPersonalDocumentsLoaded).toBe(true);
        expect(actual.PersonalDocuments.Entities.length).toEqual(personalDocumnetsPayload.length - 1);
    });

    it('should dispatch REMOVE_DOCUMENT_COMPLETE action when the selected document removed from list successfully ', () => {
        const actual = reducer(initialState, { type: '[Document] Remove Document Complete', payload: {} });
        expect(actual.CurrentDocument).toBeNull();
    });

    it('should dispatch UPDATE_DOCUMENT action when updated the selected document', () => {
        const actual = reducer(initialState, { type: '[Document] Update Document', payload: personalDocumnetsPayload[0] });
        expect(actual.CurrentDocument).toEqual(personalDocumnetsPayload[0]);
    });

    describe('reducer functions', () => {
        beforeEach(() => {
            store = MockStoreProviderFactory.createInitialStore();
            store.subscribe(s => { initialWholeState = s; });
            modifiedState = reducer(initialState, { type: '[Document] Load Personal Documents Complete', payload: personalDocumnetsPayload });
            initialWholeState.documentsState = modifiedState;
        });

        it('function should return personal documents list data when getPersonalDocumentsData method was called', () => {
            store.let(fromRoot.getPersonalDocumentsData).subscribe(docsList => {
                expect(docsList).toEqual(modifiedState.PersonalDocuments.Entities);
            });
        });

        it('function should return personal documents list loading status when getHasPersonalDocumentsLoaded method was called', () => {
            store.let(fromRoot.getHasPersonalDocumentsLoadedData).subscribe(docsListStatus => {
                expect(docsListStatus).toEqual(modifiedState.PersonalDocuments.HasPersonalDocumentsLoaded);
            });
        });
    });

});

