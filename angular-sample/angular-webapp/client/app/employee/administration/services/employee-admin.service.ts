import * as fromRoot from '../../../shared/reducers/index';
import { Observable, ReplaySubject } from 'rxjs/Rx';
import { AtlasApiRequest, AtlasApiResponse, AtlasApiRequestWithParams, AtlasParams } from '../../../shared/models/atlas-api-response';
import { ClaimsHelperService } from '../../../shared/helpers/claims-helper';
import { RestClientService } from '../../../shared/data/rest-client.service';
import { Http, URLSearchParams } from '@angular/http';
import { Action, Store } from '@ngrx/store';
import { Actions, Effect, toPayload } from '@ngrx/effects';
import { Injectable, OnInit } from '@angular/core';
import { MessengerService } from '../../../shared/services/messenger.service';
import { UserEmailCheck } from '../../../employee/administration/models/user-admin-details.model';
import { CheckEmployeeDuplidateEmailAction } from '../../../employee/actions/employee.actions';
import { RouteParams } from '../../../shared/services/route-params';
import { StringHelper } from '../../../shared/helpers/string-helper';
@Injectable()
export class EmployeeAdminService implements OnInit {

    constructor(private _data: RestClientService
        , private _actions$: Actions
        , private _store: Store<fromRoot.State>
        , private _claimsHelper: ClaimsHelperService
        , private _messenger: MessengerService
        , private _routeParams: RouteParams
    ) {

    }
    ngOnInit() {

    }



    /**
     * to validate duplicate email
     * 
     * @memberOf EmployeeAdminService
     */
    _checkForEmployeeDuplicateEmail(email: string): Observable<boolean> {
        let result: Observable<boolean>;
        // this._store.dispatch(new CheckEmployeeDuplidateEmailAction({Email : email}));   
        let params: URLSearchParams = new URLSearchParams;
        params.set('email', email);
        if (!StringHelper.isNullOrUndefinedOrEmpty(this._routeParams.Cid)) {
            params.set('cid', this._routeParams.Cid);
        } else {
            params.set('cid', this._claimsHelper.getCompanyId());
        }
        params.set('temp1', `false`);
        params.set('temp2', `false`);
        params.set('temp3', `false`);
        params.set('temp4', `false`);
        params.set('temp5', `false`);

        return this._data.get(`employee/CheckDuplicateEmployeeEmail`, { search: params }).map((res) => res.json().Success);
    }

    /**
    * to check user name availability
    * 
    * @memberOf EmployeeAdminService
    */
    _checkUserNameAvailability(emailOrUserName: string, hasEmail: boolean): Observable<UserEmailCheck> {

        let params: URLSearchParams = new URLSearchParams;
        if (hasEmail) {
            params.set('email', emailOrUserName);
        } else {
            params.set('userName', emailOrUserName);
            params.set('chekUserName', 'true');
        }
        params.set('id', `00000000-0000-0000-0000-000000000000`);
        if (hasEmail)
            return this._data.get(`user/EmailAvailability`, { search: params }).map((res) => (res.json()));
        else
            return this._data.get(`user/UserNameAvailability`, { search: params }).map((res) => (res.json()));
    }





}