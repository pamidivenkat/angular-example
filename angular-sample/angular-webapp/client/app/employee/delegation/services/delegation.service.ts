import { Delegation } from '../models/delegation';
import { AtlasApiResponse } from '../../../shared/models/atlas-api-response';
import { Store } from '@ngrx/store';
import { Injectable, OnInit } from '@angular/core';
import * as fromRoot from '../../../shared/reducers/index';
import { LoadDelegatedUsersListAction,DelegatedUserAddAction,DelegatedUserUpdateAction } from './../actions/delegation.actions';
import { RestClientService } from './../../../shared/data/rest-client.service';
import { Http, URLSearchParams } from '@angular/http';

@Injectable()
export class DelegationService implements OnInit {

  constructor(private _store: Store<fromRoot.State>, private _data: RestClientService) {

  }

  ngOnInit() {

  }
  isDelegationUserAlreadyExists(managerId: string, userId: string) {
    let params: URLSearchParams = new URLSearchParams();
    params.set('fields', 'DeligatedUserId');
    params.set('pageNumber', '0');
    params.set('pageSize', '0');
    params.set('DelegatedUsersByUserId', managerId);
    params.set('cid', userId);
    return this._data.get('HolidayDelegation', { search: params })
      .map((response) => {
                return response.json();
            });
  }

  loadDelegationList(initialRequest) {
    this._store.dispatch(new LoadDelegatedUsersListAction(initialRequest));
  }

  AddDelegation(_delelgation: Delegation) {
        this._store.dispatch(new DelegatedUserAddAction(_delelgation));
    }

    UpdateDelegation(_delelgation: Delegation) {
        this._store.dispatch(new DelegatedUserUpdateAction(_delelgation));
    }


}