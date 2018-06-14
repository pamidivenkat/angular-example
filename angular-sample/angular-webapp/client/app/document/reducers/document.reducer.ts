import { extractPersonalDocuments } from '../common/document-extract-helper';
import { AeSelectItem } from '../../atlas-elements/common/models/ae-select-item';
import { DocumentSubCategory } from '../models/DocumentSubCategory';
import { DocumentCategory } from '../models/document-category';
import { NAMED_ENTITIES } from '@angular/compiler/src/ml_parser/tags';
import { Observable } from 'rxjs/Rx';
import { Action } from '@ngrx/store';
import * as DocumentActions from '../actions/document.actions';
import { Document, EntityReference } from '../models/document';
import * as Immutable from 'immutable';

export interface DocumentsState {
    PersonalDocuments: PersonalDocumentsState;
    CurrentDocument: Document;
}

export interface PersonalDocumentsState {
    HasPersonalDocumentsLoaded: boolean;
    Entities: Array<Document>;

}

const initialState: DocumentsState = {
    PersonalDocuments: {
        HasPersonalDocumentsLoaded: false,
        Entities: null
    },
    CurrentDocument: null,
}

export function reducer(state = initialState, action: Action): DocumentsState {
    switch (action.type) {
        case DocumentActions.ActionTypes.LOAD_PERSONAL_DOCUMENTS: {
            return Object.assign({}, state, { PersonalDocuments: Object.assign({ HasPersonalDocumentsLoaded: false }) });
        }
        case DocumentActions.ActionTypes.LOAD_PERSONAL_DOCUMENTS_COMPLETE: {
            return Object.assign({}, state, { PersonalDocuments: Object.assign({ HasPersonalDocumentsLoaded: true, Entities: action.payload }) });
        }
        case DocumentActions.ActionTypes.SELECT_DOCUMENT: {
            return Object.assign({}, state, { CurrentDocument: null });
        }
        case DocumentActions.ActionTypes.SELECT_DOCUMENT_COMPLETE: {
            return Object.assign({}, state, { CurrentDocument: action.payload });
        }
        case DocumentActions.ActionTypes.REMOVE_DOCUMENT: {
            let newEntities = state.PersonalDocuments.Entities.filter(doc => doc.Id != action.payload.Id);
            return Object.assign({}, state, { PersonalDocuments: Object.assign({ Entities: newEntities, HasPersonalDocumentsLoaded: true }) });
        }
        case DocumentActions.ActionTypes.REMOVE_DOCUMENT_COMPLETE: {
            return Object.assign({}, state, { CurrentDocument: null });
        }
        case DocumentActions.ActionTypes.UPDATE_DOCUMENT: {
            return Object.assign({}, state, { CurrentDocument: action.payload });
        }
        default:
            return state;
    }
}

export function getPersonalDocumentsData(state$: Observable<DocumentsState>): Observable<Array<Document>> {
    return state$.select(s => extractPersonalDocuments(s.PersonalDocuments.Entities));
};
export function getHasPersonalDocumentsLoaded(state$: Observable<DocumentsState>): Observable<boolean> {
    return state$.select(s => (s.PersonalDocuments.HasPersonalDocumentsLoaded));
};
