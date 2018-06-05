import { TestBed, inject } from '@angular/core/testing';

import { PartylineService } from './partyline.service';

describe('PartylineService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PartylineService]
    });
  });

  it('should be created', inject([PartylineService], (service: PartylineService) => {
    expect(service).toBeTruthy();
  }));
});
