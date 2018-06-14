/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { GeneralWorkerService } from './general-worker.service';

describe('GeneralWorkerService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [GeneralWorkerService]
    });
  });

  it('should ...', inject([GeneralWorkerService], (service: GeneralWorkerService) => {
    expect(service).toBeTruthy();
  }));
});
