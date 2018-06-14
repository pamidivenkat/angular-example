import { Observable } from 'rxjs/Rx';
import { Action } from '@ngrx/store';
import { Artifact } from '../../models/artifact';
import * as DocumentReviewActions from '../actions/document-review.actions';
import { Document } from '../../models/document';
import { Block } from "../../models/block";

export interface ReviewDocumentState {
    Artifact: Artifact;
    loading: boolean;
    PreviousVersionDocument: Document;
    currentSelectedBlock: Block;
}

const initialReviewDocumentState: ReviewDocumentState = {
    Artifact: null,
    loading: null,
    PreviousVersionDocument: null,
    currentSelectedBlock: null
}

export function ReviewDocumentReducer(state = initialReviewDocumentState, action: Action): ReviewDocumentState {
    switch (action.type) {
        case DocumentReviewActions.ActionTypes.LOAD_REVIEW_DOCUMENT: {
            return Object.assign({}, state, { loading: true });
        }
        case DocumentReviewActions.ActionTypes.LOAD_REVIEW_DOCUMENT_COMPLETE: {
            return Object.assign({}, state, { loading: false, Artifact: action.payload });
        }
        case DocumentReviewActions.ActionTypes.SAVE_REVIEW_DOCUMENT: {
            return Object.assign({}, state, {});
        }
        case DocumentReviewActions.ActionTypes.GET_DOCUMENT_PREVIOUS_VERSION: {
            return Object.assign({}, state, {});
        }
        case DocumentReviewActions.ActionTypes.GET_DOCUMENT_PREVIOUS_VERSION_COMPLETE: {
            return Object.assign({}, state, { loading: false, PreviousVersionDocument: action.payload });
        }
        case DocumentReviewActions.ActionTypes.SELECT_CURRENT_BLOCK: {
            return Object.assign({}, state, { currentSelectedBlock: action.payload });
        }
        default:
            return initialReviewDocumentState;
    }
}

export function getReviewDocument(state$: Observable<ReviewDocumentState>): Observable<Artifact> {
    return state$.select(s => s && s.Artifact);
}

export function getDocumentPreviousVersion(state$: Observable<ReviewDocumentState>): Observable<Document> {
    return state$.select(s => s && s.PreviousVersionDocument);
}

export function getCurrentSelectedBlock(state$: Observable<ReviewDocumentState>): Observable<Block> {
    return state$.select(s => s && s.currentSelectedBlock);
}
