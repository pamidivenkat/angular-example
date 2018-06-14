import { TestBed, inject } from '@angular/core/testing';

import { LookupServiceService } from './lookup-service.service';

describe('LookupServiceService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LookupServiceService]
    });
  });

  it('should ...', inject([LookupServiceService], (service: LookupServiceService) => {
    expect(service).toBeTruthy();
  }));
});
