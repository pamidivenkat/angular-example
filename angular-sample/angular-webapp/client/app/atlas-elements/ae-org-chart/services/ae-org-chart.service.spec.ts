import { TestBed, inject } from '@angular/core/testing';

import { AeOrgChartService } from './ae-org-chart.service';

describe('AeOrgChartService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AeOrgChartService]
    });
  });

  it('should ...', inject([AeOrgChartService], (service: AeOrgChartService) => {
    expect(service).toBeTruthy();
  }));
});
