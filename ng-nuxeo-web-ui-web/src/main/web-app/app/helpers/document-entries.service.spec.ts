import { TestBed } from '@angular/core/testing';

import { DocumentEntriesService } from './document-entries.service';

describe('DocumentEntriesService', () => {
  let service: DocumentEntriesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DocumentEntriesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
