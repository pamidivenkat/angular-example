import { CitationDraftsClearAction } from './../../document/citation-drafts-documents/actions/citation-drafts.actions';
import { UsefulDocsClearAction } from './../../document/usefuldocuments-templates/actions/usefuldocs.actions';
import { HandbooksListClearAction } from './../../document/company-documents/actions/handbooks.actions';
import { ContractsClearAction } from './../../document/company-documents/actions/contracts.actions';
import { CompanyDocumentsClearAction } from './../../document/company-documents/actions/company-documents.actions';
import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import * as fromRoot from '../reducers/';
import { Store } from "@ngrx/store";
import { ResetCompanyStateOnCompanyChange } from "../actions/company.actions";
import { isNullOrUndefined } from "util";
import { CompanyLoadAction } from "../../company/actions/company.actions";

@Injectable()
export class RouteParams {
    public Cid: string;
    public Id: string;
    public Example: string;
    constructor(private _router: ActivatedRoute
        , private _store: Store<fromRoot.State>) {
        this._router.params.subscribe(params => {
            this.Id = params['id'];
        });

        this._router.queryParams.subscribe(params => {
            if (this.Cid !== params['cid']) {
                this._store.dispatch(new ResetCompanyStateOnCompanyChange(true));
                this._store.dispatch(new CompanyLoadAction(params['cid']));
                 //the condition could be if the logged in user is group service owner or group frachise service owner 
                this._store.dispatch(new CitationDraftsClearAction());
                this._store.dispatch(new CompanyDocumentsClearAction());
                this._store.dispatch(new ContractsClearAction());
                this._store.dispatch(new HandbooksListClearAction());
                this._store.dispatch(new UsefulDocsClearAction());
            }
            this.Cid = params['cid'];
        });
    }
}