import { extractUserSelectOptionListData } from '../../../shared/helpers/extract-helpers';
import { Store } from '@ngrx/store';
import { Injectable, OnInit } from '@angular/core'
import { Observable, ReplaySubject } from 'rxjs/Rx';
import { RestClientService } from './../../../shared/data/rest-client.service';
import { URLSearchParams } from '@angular/http';
import { UserList } from './../../../shared/models/lookup.models';
import { AeSelectItem } from './../../../atlas-elements/common/models/ae-select-item';

@Injectable()
export class IncidentReportedBySearchService implements OnInit {
    private _users: AeSelectItem<string>[];

    constructor(private _data: RestClientService) {
    }

    ngOnInit() {

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

}