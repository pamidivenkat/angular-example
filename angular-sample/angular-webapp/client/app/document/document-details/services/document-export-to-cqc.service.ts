import { Injectable } from "@angular/core";
import { Store } from '@ngrx/store';

import * as fromRoot from '../../../shared/reducers/index';
import { isNullOrUndefined } from "util";
import { RestClientService } from "../../../shared/data/rest-client.service";
import { Observable } from "rxjs/Rx";
import { URLSearchParams } from '@angular/http';

/**
 * @description
 * @class
 */
@Injectable()
export class DocumentExporttocqcService {

  constructor(private _store: Store<fromRoot.State>, private _data: RestClientService) {
  }

  validCQCReference(ref: string, siteId: string): Observable<boolean> {
    let params: URLSearchParams = new URLSearchParams;
    params.set('siteId', siteId)
    params.set('reference', ref)
    return this._data.get(`CQCCheckReference`, { search: params }).map((res) => {
      return res.json().exists == 'false' ? false : true;
    });
  }
}
