import { TestBed, inject } from '@angular/core/testing';

import { YTSearchService } from './ytsearch.service';

describe('YTSearchService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [YTSearchService]
    });
  });

  it('should be created', inject([YTSearchService], (service: YTSearchService) => {
    expect(service).toBeTruthy();
  }));
});
