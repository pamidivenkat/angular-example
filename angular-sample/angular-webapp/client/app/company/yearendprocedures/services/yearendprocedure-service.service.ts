import { Injectable } from '@angular/core';
import { URLSearchParams } from '@angular/http';
import { RestClientService } from './../../../shared/data/rest-client.service';
import { YearEndProcedureResultModel } from './../models/yearendprocedure-model';
import { isNullOrUndefined } from 'util';
import { StringHelper } from './../../../shared/helpers/string-helper';
import { Observable } from 'rxjs/Rx';
import { Store } from '@ngrx/store';
import * as fromRoot from '../../../shared/reducers/index';
import { ClearEmployeesWithZeroEntitlementAction } from './../actions/yearendprocedure-actions';

@Injectable()
export class YearendprocedureServiceService {

  private _hasValidValue(value: number) {
    if (!isNullOrUndefined(value) &&
      !StringHelper.isNullOrUndefinedOrEmpty(String(value))) {
      let valueAsNumber = parseFloat(value.toString());
      return !isNaN(valueAsNumber) && valueAsNumber >= 0;
    }
    return false;
  }

  getYearEndProcedureStatus(procedureId: string):any {
    let params: URLSearchParams = new URLSearchParams();
    params.set('fields', 'Id,Status');
    return this._data.get(`YearEndProcedure/GetById/${procedureId}`, { search: params })
      .map((res) => res.json())
      .catch((error) => {
        return error;
      });
  }

  autoSaveYearEndProcedureResults(results: Array<YearEndProcedureResultModel>) {
    results = results.filter((item, index) => {
      return this._hasValidValue(item.ReviewedHolidayEntitlement) &&
        this._hasValidValue(item.ReviewedCarryForwardedUnits);
    });

    if (results.length > 0) {
      let params: URLSearchParams = new URLSearchParams();
      params.set('isBulkUpdate', 'true');
      return this._data.post('YearEndProcedureResults/BulkUpdateYEPResults'
        , results
        , { search: params }).map((res) => {
         this._store.dispatch(new ClearEmployeesWithZeroEntitlementAction(true));
         return res.json();
        });
    } else {
      return Observable.of(null);
    }
  }

  constructor(private _data: RestClientService
  , private _store: Store<fromRoot.State>) {
  }
}
