/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { AtlasLoggerService } from './atlas-logger.service';

describe('AtlasLoggerService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AtlasLoggerService]
    });
  });

  it('should ...', inject([AtlasLoggerService], (service: AtlasLoggerService) => {
    expect(service).toBeTruthy();
  }));
});
