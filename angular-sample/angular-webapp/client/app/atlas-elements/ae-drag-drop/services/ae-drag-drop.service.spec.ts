import { TestBed, inject } from '@angular/core/testing';

import { AeDragDropService } from './ae-drag-drop.service';

describe('AeDragDropService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AeDragDropService]
    });
  });

  it('should ...', inject([AeDragDropService], (service: AeDragDropService) => {
    expect(service).toBeTruthy();
  }));
});
