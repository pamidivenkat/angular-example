import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import * as fromRoot from '../../../shared/reducers/index';
import { SortDirection } from "../../../atlas-elements/common/models/ae-sort-model";
import { AtlasApiRequest } from "../../../shared/models/atlas-api-response";
import { Observable } from "rxjs/Observable";
import { RestClientService } from "../../../shared/data/rest-client.service";
import { isNullOrUndefined } from "util";
import { ProcedureGroup } from './../../../shared/models/proceduregroup';
import { LoadSelectedPlantandequipmentAction, LoadPlantandequipmentAction } from "./../actions/plantequipment-actions";
import * as plantAndEquipmentActions from '../actions/plantequipment-actions';
import { PlantAndEquipment } from "./../models/plantandequipment";

/**
 * @description
 * @class
 */
@Injectable()
export class PlantandequipmentService {

  constructor(private _store: Store<fromRoot.State>) {
  }

  savePlantEquipmentDetails(plantEquipment: PlantAndEquipment) {
    this._store.dispatch(new plantAndEquipmentActions.AddPlantandequipmentAction(plantEquipment));
  }
  updatePlantEquipmentDetails(plantEquipment: PlantAndEquipment) {
    this._store.dispatch(new plantAndEquipmentActions.UpdatePlantandequipmentAction(plantEquipment));
  }

  loadPlantAndEquipmentList(apiRequest: AtlasApiRequest) {
    this._store.dispatch(new plantAndEquipmentActions.LoadPlantandequipmentAction(apiRequest));
  }
  removePlantEquipment(plantEquipment: PlantAndEquipment) {
    this._store.dispatch(new plantAndEquipmentActions.RemovePlantandequipmentAction(plantEquipment));
  }
  loadPlantAndEquipmentDetails(plantEquipmentId: string) {
    this._store.dispatch(new plantAndEquipmentActions.LoadSelectedPlantandequipmentAction(plantEquipmentId));
  }
}


