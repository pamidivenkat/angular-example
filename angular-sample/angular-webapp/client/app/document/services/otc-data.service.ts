import { LoadOTCEntities } from '../../shared/actions/lookup.actions';
import { isNullOrUndefined } from 'util';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs/Rx';
import { RestClientService } from '../../shared/data/rest-client.service';
import { Injectable } from '@angular/core';
import * as fromRoot from './../../shared/reducers';

@Injectable()
export class OtcEntityDataService {

    constructor(private _data: RestClientService, private _store: Store<fromRoot.State>) {

    }

    loadOtcEntities() {
        this._store.dispatch(new LoadOTCEntities());
    }

    findOutPrimaryName(target: any): string {
        let strings = ['Title', 'Subject', 'Name', 'FullName', 'DisplayName', 'FileName'];
        for (let key of strings) {
            let value = this._getString(key, target);
            if (!isNullOrUndefined(value))
                return value;
        }
        return null;

    }

    findSpecificFieldName(key: string, target: any): string {
        return this._getString(key, target);
    }


    private _getString(key: string, target: any): string {
        let value = target[key];
        return value;
    }
}