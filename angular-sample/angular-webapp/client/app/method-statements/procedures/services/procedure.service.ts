import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';

import * as fromRoot from '../../../shared/reducers/index';
import { LoadProceduresAction } from "../../../method-statements/procedures/actions/procedure-actions";
import { SortDirection } from "../../../atlas-elements/common/models/ae-sort-model";
import { AtlasApiRequestWithParams } from "../../../shared/models/atlas-api-response";
import { ProcedureStatus } from "../../../method-statements/procedures/models/procedure-status";
import * as procedureActions from '../../../method-statements/procedures/actions/procedure-actions';
import { Procedure } from './../models/procedure';
import { Observable } from "rxjs/Observable";
import { RestClientService } from "../../../shared/data/rest-client.service";
import { isNullOrUndefined } from "util";
import { ProcedureGroup } from './../../../shared/models/proceduregroup';

@Injectable()
export class ProcedureService {
  private _isExampleProcedure: boolean;

  set isExampleProcedure(val: boolean) {
    this._isExampleProcedure = val;
  }
  get isExampleProcedure(): boolean {
    return this._isExampleProcedure;
  }

  constructor(private _store: Store<fromRoot.State>, private _data: RestClientService) {
  }
  saveProcedureDetails(procedure: Procedure) {
    this._store.dispatch(new procedureActions.AddProcedureAction(procedure));
  }
  updateProcedureDetails(procedure: Procedure) {
    this._store.dispatch(new procedureActions.UpdateProcedureAction(procedure));
  }
  copyProcedureDetails(procedure: Procedure) {
    this._store.dispatch(new procedureActions.CopyProcedureAction(procedure));
  }

  validateProcedureName(name: string): any {
    let params: URLSearchParams = new URLSearchParams;
    return this._data.get(`Procedure`, { search: null }).map((res) => {return res.json()});
    
  //  return false
  }



  private mergeProcedureWithProcedure(procedureOldEntitiy: any, procedureNewEntity: Procedure): Procedure {
    if (!isNullOrUndefined(procedureNewEntity)) {
      procedureOldEntitiy.Name = procedureNewEntity.Name;
      procedureOldEntitiy.Id = ''; // As this is new object to save
    }

    return procedureOldEntitiy;
  }

  ngOnInit() {
  }

  // Private methods

}
