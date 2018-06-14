import { DocumentsState } from '../reducers/document.reducer';
import { Observable } from 'rxjs/Rx';
import {    
    LoadPersonalDocuments,
    LoadSelectedDocument,
    RemoveDocument
} from '../actions/document.actions';
import { Store } from '@ngrx/store';
import { Injectable, OnInit } from '@angular/core';
import * as fromRoot from './../../shared/reducers';
import { Document } from '../models/document';
@Injectable()
export class DocumentService {

    constructor(private _store: Store<fromRoot.State>) {
    }


    loadPersonalDocuments() {
        this._store.dispatch(new LoadPersonalDocuments(true));
    }
    loadSelectedDocument(documentId: string) {
        this._store.dispatch(new LoadSelectedDocument(documentId));
    }
    removeDocument(document: Document) {
        this._store.dispatch(new RemoveDocument(document));
    }
}