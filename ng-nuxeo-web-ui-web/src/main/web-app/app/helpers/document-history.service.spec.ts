import { TestBed } from '@angular/core/testing';

import { DocumentHistoryService } from './document-history.service';

describe('DocumentHistoryService', () => {
  let service: DocumentHistoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DocumentHistoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
