import { SortDirection } from '../../../atlas-elements/common/Models/ae-sort-model';
import { AtlasApiRequest } from '../../../shared/models/atlas-api-response';
import { PlantandequipmentService } from "./plantandequipment.service";
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { Store, StoreModule } from "@ngrx/store";
import * as fromRoot from '../../../shared/reducers/index';
import { reducer } from '../../../shared/reducers/index';

describe("PlantandequipmentService", () => {
  let store: Store<fromRoot.State>;
  let service: PlantandequipmentService;
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        StoreModule.provideStore(reducer)
      ],
      providers: [
        PlantandequipmentService
      ]
    });
    service = TestBed.get(PlantandequipmentService);

  });

  it("should be able to create service instance", () => {
    expect(service).toBeDefined();
  });
  
});
