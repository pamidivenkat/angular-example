import {
    GetDocumentPreviousVersion,
    LoadReviewDocument,
    SaveReviewDocument,
    SelectCurrentBlock
} from '../actions/document-review.actions';
import { Store } from '@ngrx/store';
import { Artifact } from '../../models/artifact';
import { Block } from '../../models/block';
import { Subject } from 'rxjs/Rx';
import { Injectable } from '@angular/core';
import * as fromRoot from '../../../shared/reducers/index';
@Injectable()
export class DocumentReviewService {
    constructor(private _store: Store<fromRoot.State>) {

    }

    onCurrentSelectedBlock(block: Block) {
        this._store.dispatch(new SelectCurrentBlock(block));
    }

    saveReviewDocument(artifact: Artifact) {
        this._store.dispatch(new SaveReviewDocument(artifact));
    }

    loadReviewDocument(documentId: string) {
        this._store.dispatch(new LoadReviewDocument(documentId));
    }

    getDocumentPreviousVersion(documentId: string) {
        this._store.dispatch(new GetDocumentPreviousVersion(documentId));
    }

}