import { TestBed } from '@angular/core/testing';

import { DocumentCollectionsService } from './document-collections.service';

describe('DocumentCollectionsService', () => {
  let service: DocumentCollectionsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DocumentCollectionsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
