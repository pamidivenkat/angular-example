import { extractUserSelectOptionListData } from '../helpers/extract-helpers';
import { RestClientService } from '../data/rest-client.service';
import { AeSelectItem } from '../../atlas-elements/common/models/ae-select-item';
import { Observable } from 'rxjs/Rx';
import { LoadApplicableDepartmentsAction } from '../actions/user.actions';
import { Store } from '@ngrx/store';
import { Constructor } from 'make-error';
import { Injectable, OnInit } from '@angular/core';
import * as fromRoot from '../../shared/reducers/index';
import { URLSearchParams } from '@angular/http';
import { isNullOrUndefined } from 'util';

@Injectable()
export class UserService implements OnInit {
    private _users: AeSelectItem<string>[];

    // constructor
    constructor(private _store: Store<fromRoot.State>
        , private _data: RestClientService) {

    }
    // End of constructor

    ngOnInit(): void {
    }

    /**
     * to load the applicable department for logged in user.
     * 
     * @memberOf TaskService
     */
    _getDepartmentList() {
        this._store.dispatch(new LoadApplicableDepartmentsAction());
    }

    public getFilteredUserData(query: string): Observable<AeSelectItem<string>[]> {
        let params: URLSearchParams = new URLSearchParams();
        params.set('filterViewByUserNameOrEmail', query);
        params.set('fields', `Id,FirstName,LastName`);
        params.set('pagenumber', `0`);
        params.set('pagesize', `0`);
        params.set('sortField', `FirstName`);
        params.set('direction', `ASC`);
        return this._data.get(`user/getspecificfields`, { search: params })
            .map((res) => {
                this._users = extractUserSelectOptionListData(res);
                return this._users;
            });
    }

    public getFilteredUserDataWithCid(query: string, cid: string): Observable<AeSelectItem<string>[]> {
        let params: URLSearchParams = new URLSearchParams();
        params.set('filterViewByUserNameOrEmail', query);
        params.set('fields', `Id,FirstName,LastName`);
        params.set('pagenumber', `0`);
        params.set('pagesize', `0`);
        params.set('sortField', `FirstName`);
        params.set('direction', `ASC`);
        if (!isNullOrUndefined(cid)) {
            params.set('cid', cid);
        }
        return this._data.get(`user/getspecificfields`, { search: params })
            .map((res) => {
                this._users = extractUserSelectOptionListData(res);
                return this._users;
            });
    }

    public getUsersList(cid: string) {
        let params: URLSearchParams = new URLSearchParams();
        params.set('fields', `Id,FirstName,LastName`);
        params.set('pagenumber', `0`);
        params.set('pagesize', `0`);
        params.set('sortField', `FirstName`);
        params.set('direction', `ASC`);
        if (!isNullOrUndefined(cid)) {
            params.set('cid', cid);
        }
        return this._data.get(`user/getspecificfields`, { search: params })
            .map((res) => {
                this._users = extractUserSelectOptionListData(res);
                return this._users;
            });
    }
}