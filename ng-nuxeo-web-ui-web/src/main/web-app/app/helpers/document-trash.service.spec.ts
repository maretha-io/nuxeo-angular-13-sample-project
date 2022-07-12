import { TestBed } from '@angular/core/testing';

import { DocumentTrashService } from './document-trash.service';

describe('DocumentTrashService', () => {
  let service: DocumentTrashService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DocumentTrashService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
